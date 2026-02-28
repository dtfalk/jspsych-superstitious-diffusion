// =====================================================================
// Cognition.run Task Code
// =====================================================================
// This is the main experiment code. External files must be loaded first:
//   1. plugin-loader.js - loads jsPsych plugins from CDN
//   2. config.js - CONFIG, UCHICAGO_HEADER, STIMULUS_INDICES
//   3. stimulus-loader.js - loadStimuli, stimulus arrays
//   4. questionnaires.js - createTellegenTrial
// =====================================================================

// Wait for all plugins to load before running
onAllPluginsLoaded(function() {

// =====================================================================
// Initialize jsPsych
// =====================================================================
var jsPsych = initJsPsych();

// =====================================================================
// State and Helper Functions
// =====================================================================

var subjectId = null;
var experimentSource = null;

function setSubjectId(id) {
  subjectId = id;
  jsPsych.data.addProperties({ subjectId: id });
}

function setExperimentSource(source) {
  experimentSource = source;
  jsPsych.data.addProperties({ experimentSource: source });
}

function getArticle(str) {
  var upper = str.toString().toUpperCase();
  var vowelSoundLetters = ['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X'];
  var vowelSoundNumbers = ['8', '11', '18', '80', '800', '8000'];
  if (vowelSoundLetters.includes(upper) || vowelSoundNumbers.includes(upper)) {
    return 'an';
  }
  return 'a';
}

function saveJsonFile(stepName, payload) {
  try {
    var key = stepName.replace(/\s+/g, '_').toLowerCase() + '_data';
    jsPsych.data.getLastTrialData().addToAll({ [key]: payload });
  } catch(e) {
    console.warn('[cognition] Could not inject step data:', stepName, e);
  }
}

// =====================================================================
// Trial Recording
// =====================================================================

var practiceTrials = [];
var actualTrials = [];
var practiceTrialCounter = 0;
var actualTrialCounter = 0;

function recordVideoTrial(data) {
  var stimulusPath = Array.isArray(data.stimulus) ? data.stimulus[0] : 
                     (typeof data.stimulus === 'string' ? data.stimulus : null);
  
  if (!stimulusPath) {
    console.warn('recordVideoTrial: stimulus path is null/undefined, skipping');
    return;
  }

  // Extract info from filename (e.g., "shared_paths_S_10.mp4")
  var parts = stimulusPath.replace(STIMULUS_PATH_PREFIX, '').split('/');
  var file = parts[parts.length - 1];
  // Match: {condition}_{letter}_{index}.mp4
  var fileMatch = file.match(/([a-z_]+)_([SX])_(\d+)\.mp4/i);
  
  var stimulusCondition = fileMatch ? fileMatch[1] : null;
  var stimulusType = fileMatch ? fileMatch[2].toUpperCase() : null;
  var stimulusNumber = fileMatch ? fileMatch[3] : null;
  var trialType = data.trial_type || 'unknown';

  // Get timestamps
  var spacebarScreenPresentedTimestamp = data.spacebar_screen_presented_timestamp;
  var spacebarPressedTimestamp = data.spacebar_pressed_timestamp;
  var videoStartTimestamp = data.video_start_timestamp;
  var responseTimestamp = data.response_timestamp;
  var videoEndTimestamp = typeof window.__jspsych_video_ended === 'number' ? 
                          window.__jspsych_video_ended : -1;

  // Calculate timing metrics
  var preVideoWaitTime = spacebarPressedTimestamp - spacebarScreenPresentedTimestamp;
  var videoPresentationLag = videoStartTimestamp - spacebarPressedTimestamp;
  var responseTime = responseTimestamp - videoStartTimestamp;
  var delayTime = videoEndTimestamp === -1 ? -1 : responseTimestamp - videoEndTimestamp;
  var totalTime = responseTimestamp - spacebarScreenPresentedTimestamp;

  var responseKey = (data.response || '').toUpperCase();

  // Track trial number
  var trialNumber = null;
  if (trialType === "practice") { 
    practiceTrialCounter++; 
    trialNumber = practiceTrialCounter; 
  } else if (trialType === "actual") { 
    actualTrialCounter++; 
    trialNumber = actualTrialCounter; 
  }

  var blockNumber = data.block_number || null;

  // Calculate response outcome
  var outcome = null;
  var signalLetter = CONFIG.targetLetters[0];
  var isSignal = stimulusType === signalLetter;
  var isCorrect = responseKey === stimulusType;
  
  if (isSignal && isCorrect) outcome = 'true_positive';
  else if (isSignal && !isCorrect) outcome = 'false_negative';
  else if (!isSignal && isCorrect) outcome = 'true_negative';
  else if (!isSignal && !isCorrect) outcome = 'false_positive';

  var trialSummary = {
    "Trial Type": trialType,
    "Block Number": blockNumber,
    "Trial Number": trialNumber,
    "Stimulus Number": stimulusNumber,
    "Stimulus Character": stimulusType,
    "Filename": file,
    "Response Character": responseKey,
    "Response Classification": outcome,
    "Trial Presented Timestamp": spacebarScreenPresentedTimestamp,
    "Begin Stimulus Key Press Timestamp": spacebarPressedTimestamp,
    "Stimulus Video Started Timestamp": videoStartTimestamp,
    "Subject Response Timestamp": responseTimestamp,
    "Stimulus Video Completed Timestamp": videoEndTimestamp,
    "Pre Stimulus Video Wait Time": preVideoWaitTime,
    "Time Between Key Press and Video Start": videoPresentationLag,
    "Response Time": responseTime,
    "Time After Video End Before Decision Made": delayTime,
    "Total Trial Time": totalTime
  };

  try {
    jsPsych.data.getLastTrialData().addToAll(trialSummary);
  } catch (e) {
    console.warn('Could not inject trial summary into jsPsych data:', e);
  }

  if (trialType === 'practice') { practiceTrials.push(trialSummary); }
  else if (trialType === "actual") { actualTrials.push(trialSummary); }
}

function flushTrials(trialType) {
  var trials = trialType === "practice" ? practiceTrials : actualTrials;
  if (!trials || trials.length === 0) return;
  
  saveJsonFile(trialType[0].toUpperCase() + trialType.slice(1) + ' Trials', { trials: trials });
  
  if (trialType === "practice") { practiceTrials = []; }
  else if (trialType === "actual") { actualTrials = []; }
}

// =====================================================================
// DEV: Condition Picker (only shown if SHOW_CONDITION_PICKER is true)
// =====================================================================

var condition_picker = {
  type: jsPsychSurveyMultiChoice,
  data: { screen_name: "Condition Picker" },
  preamble: '<div style="background:#ffffcc; border:2px solid #cc9900; padding:1rem; margin-bottom:1rem; border-radius:4px;">' +
    '<strong>⚠️ DEVELOPMENT MODE</strong></div>',
  questions: [{
    prompt: '<div style="text-align:center; font-size:1.2rem;"><strong>Select Condition to Test</strong><br><br>' +
      'This determines which stimulus folder is used:<br>' +
      '<code>stimuli/{condition}/actual-stimuli/</code><br>' +
      '<code>stimuli/{condition}/practice-stimuli/</code></div>',
    options: ["shared_paths", "vanilla_paths"],
    required: true
  }],
  on_finish: function(data) {
    var selected = data.response ? Object.values(data.response)[0] : "shared_paths";
    CONFIG.condition = selected;
    CONFIG.conditionNumber = selected === "shared_paths" ? 1 : 2;
    jsPsych.data.addProperties({ condition: selected, conditionNumber: CONFIG.conditionNumber });
    console.log('DEV: Selected condition:', selected);
    
    // Load stimuli after condition is selected
    loadStimuli();
  }
};

// If not showing picker, loadStimuli uses DEV_CONDITION directly
// (it was already called in the preload section above)
if (!CONFIG.showConditionPicker) {
  // Already loaded above - no need to reload
}

// =====================================================================
// 1. Subject Source
// =====================================================================

var subject_source = {
  type: jsPsychSurveyMultiChoice,
  data: { screen_name: "Subject Source" },
  questions: [{
    prompt: '<div style="text-align:center;">Which platform redirected you to this study?</div>',
    options: ["Prolific", "Sona", "Other"],
    required: true
  }],
  on_finish: function(data) {
    var response = data.response ? Object.values(data.response)[0] : null;
    setExperimentSource(response);
  }
};

// =====================================================================
// 2. ID Entry
// =====================================================================

var id_entry = {
  type: jsPsychSurveyText,
  data: { screen_name: "ID Entry" },
  questions: [{ prompt: "", required: true }],
  on_start: function(trial) {
    if (experimentSource === "Prolific") {
      trial.questions[0].prompt = "Please enter your Prolific ID";
    } else if (experimentSource === "Sona") {
      trial.questions[0].prompt = "Please enter your SONA ID";
    } else {
      trial.questions[0].prompt = "Please enter your Email";
    }
  },
  on_finish: function(data) {
    var response = data.response ? Object.values(data.response)[0] : null;
    setSubjectId(response);
  }
};

// =====================================================================
// 3. Consent Screen
// =====================================================================

var consent_description = '<div class="consent-text">' +
  '<p><strong>Study Number:</strong> IRB24-1770<br>' +
  '<strong>Study Title:</strong> Superstitious Perception<br>' +
  '<strong>Researcher(s):</strong> Shannon Heald</p>' +
  '<p><strong>Description:</strong> We are researchers at the University of Chicago doing a research study about the limits of human perception. You will be asked to engage with different types of stimuli (such as images and sounds) and indicate whether or not you believe a particular target is present within them. You will also be asked to fill out a couple of questionnaires.</p>' +
  '<p>Depending on your performance, we may reach out to you for follow up studies. If we reach out to you again, your participation is entirely voluntary, and you will be compensated for any further experiments in which you are a participant.</p>' +
  '<p>Participation should take approximately 30 minutes.<br>Your participation is voluntary.</p>' +
  '<p><strong>Risks and Benefits:</strong> Your participation in this study does not involve any risk to you beyond that of everyday life.</p>' +
  '<p>Taking part in this research study may not benefit you personally beyond learning about psychological research, but we may learn new things that could help others.</p>' +
  '<p><strong>Confidentiality:</strong> De-identified information from this study may be used for future research without your additional informed consent.</p>' +
  '</div>';

var consent_screen = {
  type: jsPsychSurveyMultiChoice,
  data: { screen_name: "Consent" },
  preamble: '<div style="text-align:center; max-width:56rem; margin:0 auto;">' + 
    UCHICAGO_HEADER +
    '<h2>Consent to Participate in Research</h2>' + 
    consent_description + 
    '</div>',
  questions: [{
    prompt: '<div style="text-align:center; font-weight:bold; margin-top:2rem;">Do you consent to participate in this study?</div>',
    options: ["Yes, I consent to participate", "No, I do not consent"],
    required: true
  }],
  on_finish: function(data) {
    var response = data.response ? Object.values(data.response)[0] : null;
    if (response !== "Yes, I consent to participate") {
      jsPsych.endExperiment('Thank you for considering participation in this study.');
    }
    saveJsonFile('Consent', { consented: true });
  }
};

// =====================================================================
// 4. Experiment Introduction
// =====================================================================

var letter1 = CONFIG.targetLetters[0];
var letter2 = CONFIG.targetLetters[1];
var article1 = getArticle(letter1);
var article2 = getArticle(letter2);

var experiment_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Experiment Intro" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>About This Experiment</h2>' +
    '<p>In this experiment you will watch short video clips. Each video will contain either ' + article1 + ' <strong>' + letter1 + '</strong> or ' + article2 + ' <strong>' + letter2 + '</strong> that emerges and then dissolves.</p>' +
    '<p>Your task is to identify which letter appeared by pressing the corresponding key on your keyboard.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    saveJsonFile('Experiment Intro', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 5. Practice Introduction
// =====================================================================

var practice_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Practice Intro" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Practice Trials</h2>' +
    '<p>You will now complete several practice trials to familiarize yourself with the task.</p>' +
    '<p>Watch each video carefully and press <strong>' + letter1 + '</strong> or <strong>' + letter2 + '</strong> to indicate which letter you saw.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to start the practice trials.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    saveJsonFile('Practice Intro', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 6. Practice Trials
// =====================================================================

var _practiceTrialTimestamps = {};

var practice_video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Practice Video Ready" },
  stimulus: '<div style="position:fixed; top:0; left:0; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center;">' +
    '<div style="text-align:center;"><p style="font-size:1.3rem;">Press <strong>space</strong> to start the video</p></div></div>',
  choices: [" "],
  on_start: function() {
    _practiceTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: function() {
    _practiceTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

var practice_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: function() { return jsPsych.timelineVariable("stimulus"); },
  prompt: '<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>',
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: function() {
    window.__jspsych_video_ended = null;
    _practiceTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_load: function() {
    var vid = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
    if (vid) { vid.addEventListener('ended', function() { window.__jspsych_video_ended = performance.now(); }); }
  },
  on_finish: function(data) {
    _practiceTrialTimestamps.response_timestamp = performance.now();
    data.spacebar_screen_presented_timestamp = _practiceTrialTimestamps.spacebar_screen_presented_timestamp;
    data.spacebar_pressed_timestamp = _practiceTrialTimestamps.spacebar_pressed_timestamp;
    data.video_start_timestamp = _practiceTrialTimestamps.video_start_timestamp;
    data.response_timestamp = _practiceTrialTimestamps.response_timestamp;
    data.trial_type = 'practice';
    data.screen_name = 'Practice Video Trial';
    recordVideoTrial(data);
  }
};

var practice_blank_delay = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Practice Blank Delay" },
  stimulus: '',
  choices: "NO_KEYS",
  trial_duration: 1500
};

var practice_trials = {
  timeline: [practice_video_ready, practice_blank_delay, practice_video_trial],
  timeline_variables: practice_stimuli,
  randomize_order: true,
  data: { trial_type: "practice" }
};

// =====================================================================
// 7. Practice Complete
// =====================================================================

var practice_complete_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Practice Complete" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Practice Complete</h2>' +
    '<p>Great job! You have completed the practice trials.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue to the main experiment.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    flushTrials('practice');
    saveJsonFile('Practice Complete', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 8. Actual Trials Introduction
// =====================================================================

var actual_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Actual Intro" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Main Experiment</h2>' +
    '<p>You will now begin the main experiment. This consists of two blocks of trials with a short break in between.</p>' +
    '<p>Remember: watch each video carefully and press <strong>' + letter1 + '</strong> or <strong>' + letter2 + '</strong> to indicate which letter you saw.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to begin.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    saveJsonFile('Actual Intro', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 9. Actual Trials
// =====================================================================

var _actualTrialTimestamps = {};

var actual_video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Actual Video Ready" },
  stimulus: '<div style="position:fixed; top:0; left:0; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center;">' +
    '<div style="text-align:center;"><p style="font-size:1.3rem;">Press <strong>space</strong> to start the video</p></div></div>',
  choices: [" "],
  on_start: function() {
    _actualTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: function() {
    _actualTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

var actual_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: function() { return jsPsych.timelineVariable("stimulus"); },
  prompt: '<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>',
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: function() {
    window.__jspsych_video_ended = null;
    _actualTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_load: function() {
    var vid = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
    if (vid) { vid.addEventListener('ended', function() { window.__jspsych_video_ended = performance.now(); }); }
  },
  on_finish: function(data) {
    _actualTrialTimestamps.response_timestamp = performance.now();
    data.spacebar_screen_presented_timestamp = _actualTrialTimestamps.spacebar_screen_presented_timestamp;
    data.spacebar_pressed_timestamp = _actualTrialTimestamps.spacebar_pressed_timestamp;
    data.video_start_timestamp = _actualTrialTimestamps.video_start_timestamp;
    data.response_timestamp = _actualTrialTimestamps.response_timestamp;
    data.trial_type = 'actual';
    data.screen_name = 'Actual Video Trial';
    recordVideoTrial(data);
  }
};

var actual_blank_delay = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Actual Blank Delay" },
  stimulus: '',
  choices: "NO_KEYS",
  trial_duration: 1500
};

var actual_trials_block_1 = {
  timeline: [actual_video_ready, actual_blank_delay, actual_video_trial],
  timeline_variables: actual_stimuli_block_1,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 1 }
};

var actual_trials_block_2 = {
  timeline: [actual_video_ready, actual_blank_delay, actual_video_trial],
  timeline_variables: actual_stimuli_block_2,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 2 }
};

// =====================================================================
// Break Screen
// =====================================================================

var actual_break = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Break" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Break</h2>' +
    '<p>You have completed the first block of trials.</p>' +
    '<p>Take a short break if you like, then press <strong>' + CONFIG.continueKey + '</strong> to continue.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    saveJsonFile('Break Screen', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 10. Actual Trials Complete
// =====================================================================

var actual_complete_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Actual Complete" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Experiment Complete</h2>' +
    '<p>You have completed all video trials.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue to a brief questionnaire.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    flushTrials('actual');
    saveJsonFile('Actual Complete', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 11. Questionnaires Introduction
// =====================================================================

var questionnaires_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Questionnaires Intro" },
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Questionnaires</h2>' +
    '<p>You will now be asked to fill out a brief questionnaire about your personal experiences.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    saveJsonFile('Questionnaires Intro', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// 12. Tellegen Absorption Scale
// =====================================================================

var tellegen_questionnaire = createTellegenTrial(jsPsych, saveJsonFile);

// =====================================================================
// 13. Closing Screen
// =====================================================================

var closing_screen = {
  type: jsPsychHtmlKeyboardResponse,
  data: { screen_name: "Closing" },
  stimulus: '<div style="text-align:center; max-width:44rem; margin:0 auto;">' + 
    UCHICAGO_HEADER +
    '<h2>Thank You</h2>' +
    '<p>Thank you for your participation in this study.</p>' +
    '<p style="color:#767676;">Your responses have been recorded.</p>' +
    '<p style="margin-top:2rem;">Press any key to finish.</p></div>',
  on_finish: function(data) {
    saveJsonFile('Closing Screen', { reaction_time_ms: data.rt });
  }
};

// =====================================================================
// Preload Videos  
// =====================================================================

// For DEV: We always call loadStimuli() immediately (with DEV_CONDITION)
// If picker is used, it will reload with the selected condition after
// But for preload, we need URLs NOW - so load with default first
loadStimuli();

var all_video_urls = getAllVideoUrls();

var preload_videos = {
  type: jsPsychPreload,
  data: { screen_name: "Preload" },
  video: all_video_urls,
  show_progress_bar: true,
  message: '<div style="text-align:center; margin-top:3rem;">' +
    '<p style="font-size:1.3rem; color:#800000;">Loading experiment videos...</p>' +
    '<p style="font-size:0.95rem; color:#767676;">This may take a moment.</p></div>'
};

// =====================================================================
// Build and Run Timeline
// =====================================================================

var timeline = [];

// DEV MODE: Add condition picker at start if enabled
if (CONFIG.showConditionPicker) {
  timeline.push(condition_picker);
}

// Add all other trials
timeline.push(
  subject_source,
  id_entry,
  consent_screen,
  preload_videos,
  experiment_intro_screen,
  practice_intro_screen,
  practice_trials,
  practice_complete_screen,
  actual_intro_screen,
  actual_trials_block_1,
  actual_break,
  actual_trials_block_2,
  actual_complete_screen,
  questionnaires_intro_screen,
  tellegen_questionnaire,
  closing_screen
);

jsPsych.run(timeline);

}); // end onAllPluginsLoaded
