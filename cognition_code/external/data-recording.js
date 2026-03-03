// =====================================================================
// data-recording.js — Records trial data for analysis
// =====================================================================
//
// This file handles:
//   - Recording each video trial's response and timing data
//   - Classifying responses as correct/incorrect (for d-prime analysis)
//   - Saving data to jsPsych's data store
//
// =====================================================================

// =====================================================================
// STORAGE FOR TRIAL DATA
// =====================================================================
// These arrays collect trial summaries during the experiment.
// They get saved to cognition.run at the end of each phase.

var practiceTrials = [];      // Stores all practice trial results
var actualTrials = [];        // Stores all actual trial results
var practiceTrialCounter = 0; // Counts practice trials (for numbering)
var actualTrialCounter = 0;   // Counts actual trials (for numbering)


// =====================================================================
// HELPER: SAVE DATA TO JSPSYCH
// =====================================================================
// Adds a data payload to the current trial's jsPsych data.
// This ensures data gets saved when Cognition.run collects results.

function saveJsonFile(stepName, payload) {
  // Create a key name from the step name (e.g., "Consent" -> "consent_data")
  var key = stepName.replace(/\s+/g, '_').toLowerCase() + '_data';
  
  try {
    jsPsych.data.getLastTrialData().addToAll({ [key]: payload });
  } catch(e) {
    console.warn('Could not save data for:', stepName);
  }
}


// =====================================================================
// HELPER: PARSE FILENAME TO GET STIMULUS INFO
// =====================================================================
// Our video filenames follow a fixed format:
//   {condition}_{letter}_{number}.mp4
//
// Examples:
//   shared_paths_S_10.mp4  -> condition="shared_paths", letter="S", number="10"
//   vanilla_paths_X_42.mp4 -> condition="vanilla_paths", letter="X", number="42"
//
// This function extracts those parts from a filename.

function parseFilename(filename) {
  // Remove any path prefix to get just the filename
  var parts = filename.split('/');
  var file = parts[parts.length - 1];
  
  // Split by underscore: ["shared", "paths", "S", "10.mp4"]
  // or: ["vanilla", "paths", "X", "42.mp4"]
  var pieces = file.split('_');
  
  // The format is always: condition_condition_letter_number.mp4
  // So the letter is the second-to-last piece
  // And the number is the last piece (minus the .mp4)
  
  if (pieces.length < 4) {
    // Unexpected format - return nulls but keep big picture filenames
    return { condition: null, letter: null, number: null, filename: file };
  }
  
  // Condition is everything except the last two pieces
  // e.g., ["shared", "paths"] joined = "shared_paths"
  var conditionParts = pieces.slice(0, pieces.length - 2);
  var condition = conditionParts.join('_');
  
  // Letter is second-to-last (e.g., "S" or "X")
  var letter = pieces[pieces.length - 2].toUpperCase();
  
  // Number is last piece minus ".mp4"
  var numberWithExt = pieces[pieces.length - 1];
  var number = numberWithExt.replace('.mp4', '');
  
  return {
    condition: condition,
    letter: letter,
    number: number,
    filename: file
  };
}


// =====================================================================
// MAIN FUNCTION: RECORD A VIDEO TRIAL
// =====================================================================
// Called after each video trial (practice or actual) to record:
//   - What stimulus was shown
//   - What the participant responded
//   - Whether they were correct
//   - Timing information
//
// The "data" parameter comes from jsPsych's on_finish callback.

function recordVideoTrial(data) {
  
  // -----------------------------------------------------------------
  // STEP 1: Get the video filename that was shown
  // -----------------------------------------------------------------
  // jsPsych stores the stimulus as an array (or sometimes a string)
  
  var stimulusPath;
  if (Array.isArray(data.stimulus)) {
    stimulusPath = data.stimulus[0];
  } else if (typeof data.stimulus === 'string') {
    stimulusPath = data.stimulus;
  } else {
    console.warn('Could not find stimulus path in trial data');
    return;
  }
  
  // Remove the path prefix (if any) that was added by stimulus-loader
  if (typeof STIMULUS_PATH_PREFIX !== 'undefined') {
    stimulusPath = stimulusPath.replace(STIMULUS_PATH_PREFIX, '');
  }
  
  // -----------------------------------------------------------------
  // STEP 2: Parse the filename to get stimulus info
  // -----------------------------------------------------------------
  
  var stimInfo = parseFilename(stimulusPath);
  var stimulusLetter = stimInfo.letter;  // "S" or "X"
  var stimulusNumber = stimInfo.number;  // e.g., "10"
  var filename = stimInfo.filename;
  
  // -----------------------------------------------------------------
  // STEP 3: Get the participant's response
  // -----------------------------------------------------------------
  
  var responseKey = (data.response || '').toUpperCase();  // "S" or "X"
  var trialType = data.trial_type || 'unknown';           // "practice" or "actual"
  var blockNumber = data.block_number || null;            // 1, 2, or null for practice
  
  // -----------------------------------------------------------------
  // STEP 4: Count this trial
  // -----------------------------------------------------------------
  
  var trialNumber;
  if (trialType === 'practice') {
    practiceTrialCounter++;
    trialNumber = practiceTrialCounter;
  } else if (trialType === 'actual') {
    actualTrialCounter++;
    trialNumber = actualTrialCounter;
  } else {
    trialNumber = null;
  }
  
  // -----------------------------------------------------------------
  // STEP 5: Calculate timing metrics
  // -----------------------------------------------------------------
  // These timestamps were recorded during the trial
  
  var trialPresentedTime = data.spacebar_screen_presented_timestamp;
  var spacebarPressedTime = data.spacebar_pressed_timestamp;
  var videoStartedTime = data.video_start_timestamp;
  var responseTime = data.response_timestamp;
  var videoEndedTime = (typeof window.__jspsych_video_ended === 'number') 
                       ? window.__jspsych_video_ended 
                       : -1;  // -1 means video hadn't ended yet
  
  // Calculate derived timing values
  var preVideoWait = spacebarPressedTime - trialPresentedTime;
  var videoLag = videoStartedTime - spacebarPressedTime;
  var reactionTime = responseTime - videoStartedTime;
  var postVideoDelay = (videoEndedTime === -1) ? -1 : (responseTime - videoEndedTime);
  var totalTrialTime = responseTime - trialPresentedTime;
  
  // -----------------------------------------------------------------
  // STEP 6: Classify the response (for d-prime scoring)
  // -----------------------------------------------------------------
  // In signal detection:
  //   - One letter is the "signal" (the first target letter, usually "S")
  //   - The other letter is "noise" (usually "X")
  //
  // Response outcomes:
  //   - true_positive:  Signal shown, participant said signal (hit)
  //   - false_negative: Signal shown, participant said noise (miss)
  //   - true_negative:  Noise shown, participant said noise (correct rejection)
  //   - false_positive: Noise shown, participant said signal (false alarm)
  
  var signalLetter = CONFIG.targetLetters[0];  // First letter is the signal
  var isSignalTrial = (stimulusLetter === signalLetter);
  var isCorrect = (responseKey === stimulusLetter);
  
  var responseOutcome;
  if (isSignalTrial && isCorrect) {
    responseOutcome = 'true_positive';   // Hit
  } else if (isSignalTrial && !isCorrect) {
    responseOutcome = 'false_negative';  // Miss
  } else if (!isSignalTrial && isCorrect) {
    responseOutcome = 'true_negative';   // Correct rejection
  } else {
    responseOutcome = 'false_positive';  // False alarm
  }
  
  // -----------------------------------------------------------------
  // STEP 7: Build the trial summary object
  // -----------------------------------------------------------------
  
  var trialSummary = {
    "Trial Type": trialType,
    "Block Number": blockNumber,
    "Trial Number": trialNumber,
    "Stimulus Number": stimulusNumber,
    "Stimulus Character": stimulusLetter,
    "Filename": filename,
    "Response Character": responseKey,
    "Response Classification": responseOutcome,
    "Trial Presented Timestamp": trialPresentedTime,
    "Begin Stimulus Key Press Timestamp": spacebarPressedTime,
    "Stimulus Video Started Timestamp": videoStartedTime,
    "Subject Response Timestamp": responseTime,
    "Stimulus Video Completed Timestamp": videoEndedTime,
    "Pre Stimulus Video Wait Time": preVideoWait,
    "Time Between Key Press and Video Start": videoLag,
    "Response Time": reactionTime,
    "Time After Video End Before Decision Made": postVideoDelay,
    "Total Trial Time": totalTrialTime
  };
  
  // -----------------------------------------------------------------
  // STEP 8: Save the trial data
  // -----------------------------------------------------------------
  
  // Add to jsPsych's data store (so Cognition.run saves it)
  try {
    jsPsych.data.getLastTrialData().addToAll(trialSummary);
  } catch (e) {
    console.warn('Could not add trial data to jsPsych');
  }
  
  // Add to our local arrays (for end-of-phase summary)
  if (trialType === 'practice') {
    practiceTrials.push(trialSummary);
  } else if (trialType === 'actual') {
    actualTrials.push(trialSummary);
  }
}


// =====================================================================
// HELPER: FLUSH TRIALS TO JSPSYCH DATA
// =====================================================================
// Called at the end of practice and actual phases to save
// all collected trials as a single JSON object.

function flushTrials(trialType) {
  var trials;
  
  if (trialType === 'practice') {
    trials = practiceTrials;
  } else if (trialType === 'actual') {
    trials = actualTrials;
  } else {
    return;
  }
  
  // Don't save if there are no trials
  if (!trials || trials.length === 0) {
    return;
  }
  
  // Save the trials array as a JSON object
  var label = trialType.charAt(0).toUpperCase() + trialType.slice(1) + ' Trials';
  saveJsonFile(label, { trials: trials });
  
  // Clear the array for the next phase
  if (trialType === 'practice') {
    practiceTrials = [];
  } else if (trialType === 'actual') {
    actualTrials = [];
  }
}


// =====================================================================
// HELPER: GET ARTICLE ("a" vs "an")
// =====================================================================
// Returns "a" or "an" depending on how the letter sounds when spoken.
// Used for instruction text like "an S" vs "a T".

function getArticle(letterOrNumber) {
  var upper = String(letterOrNumber).toUpperCase();
  
  // Letters that sound like they start with a vowel
  var vowelSoundLetters = ['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X'];
  
  // Numbers that sound like they start with a vowel
  var vowelSoundNumbers = ['8', '11', '18', '80', '800', '8000'];
  
  if (vowelSoundLetters.includes(upper) || vowelSoundNumbers.includes(upper)) {
    return 'an';
  }
  return 'a';
}


console.log('[data-recording.js] Loaded successfully');
