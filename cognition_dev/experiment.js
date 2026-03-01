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
  console.log('[recordVideoTrial] CALLED.');
  console.log('[recordVideoTrial] INPUT data.stimulus          :', JSON.stringify(data.stimulus));
  console.log('[recordVideoTrial] INPUT data.trial_type        :', data.trial_type);
  console.log('[recordVideoTrial] INPUT data.response          :', data.response);
  console.log('[recordVideoTrial] INPUT data.block_number      :', data.block_number);

  var stimulusPath = Array.isArray(data.stimulus) ? data.stimulus[0] : 
                     (typeof data.stimulus === 'string' ? data.stimulus : null);
  console.log('[recordVideoTrial] INTERMEDIATE stimulusPath    :', stimulusPath);
  
  if (!stimulusPath) {
    console.warn('[recordVideoTrial] stimulus path is null/undefined — data.stimulus was:', JSON.stringify(data.stimulus), '— skipping');
    return;
  }

  // Extract info from filename (e.g., "shared_paths_S_10.mp4")
  var strippedPath = stimulusPath.replace(STIMULUS_PATH_PREFIX, '');
  console.log('[recordVideoTrial] INTERMEDIATE strippedPath (after removing PREFIX "' + STIMULUS_PATH_PREFIX + '") :', strippedPath);
  var parts = strippedPath.split('/');
  var file = parts[parts.length - 1];
  // Match: {condition}_{letter}_{index}.mp4
  var fileMatch = file.match(/([a-z_]+)_([SX])_(\d+)\.mp4/i);
  console.log('[recordVideoTrial] INTERMEDIATE file            :', file);
  console.log('[recordVideoTrial] INTERMEDIATE fileMatch       :', fileMatch ? JSON.stringify(fileMatch.slice(0,4)) : 'NO MATCH — regex failed!');
  
  var stimulusCondition = fileMatch ? fileMatch[1] : null;
  var stimulusType = fileMatch ? fileMatch[2].toUpperCase() : null;
  var stimulusNumber = fileMatch ? fileMatch[3] : null;
  var trialType = data.trial_type || 'unknown';

  console.log('[recordVideoTrial] INTERMEDIATE stimulusCondition:', stimulusCondition);
  console.log('[recordVideoTrial] INTERMEDIATE stimulusType     :', stimulusType);
  console.log('[recordVideoTrial] INTERMEDIATE stimulusNumber   :', stimulusNumber);
  console.log('[recordVideoTrial] INTERMEDIATE trialType        :', trialType);

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
  console.log('[recordVideoTrial] INTERMEDIATE signalLetter     :', signalLetter, ' stimulusType:', stimulusType, ' isSignal:', isSignal);
  console.log('[recordVideoTrial] INTERMEDIATE responseKey      :', responseKey, ' isCorrect:', isCorrect);
  
  if (isSignal && isCorrect) outcome = 'true_positive';
  else if (isSignal && !isCorrect) outcome = 'false_negative';
  else if (!isSignal && isCorrect) outcome = 'true_negative';
  else if (!isSignal && !isCorrect) outcome = 'false_positive';
  console.log('[recordVideoTrial] INTERMEDIATE outcome          :', outcome);

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
  console.log('[recordVideoTrial] OUTPUT trialSummary:', JSON.stringify(trialSummary));

  try {
    jsPsych.data.getLastTrialData().addToAll(trialSummary);
  } catch (e) {
    console.warn('[recordVideoTrial] Could not inject trial summary into jsPsych data:', e);
  }

  if (trialType === 'practice') { practiceTrials.push(trialSummary); }
  else if (trialType === "actual") { actualTrials.push(trialSummary); }
  console.log('[recordVideoTrial] DONE. practiceTrials.length:', practiceTrials.length, ' actualTrials.length:', actualTrials.length);
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
  preamble: '<div style="background:#ffffcc; border:0.125rem solid #cc9900; padding:1rem; margin-bottom:1rem; border-radius:0.25rem;">' +
    '<strong>⚠️ DEVELOPMENT MODE</strong></div>',
  questions: [{
    prompt: '<div style="text-align:left; font-size:1.2rem;"><strong><center>Select Condition to Test</center></strong><br><br>',
    options: ["<strong>Complicated Generation Scheme</strong> - stimuli decomposed into shared and non-shared components", "<strong>Simple Generation Scheme</strong> - stimuli generated via conditional diffusion guidance parameter only"],
    required: true
  }],
  on_finish: function(data) {
  console.log('[DEBUG picker] on_finish fired. data.response =', JSON.stringify(data.response));
  var answer = data.response ? Object.values(data.response)[0] : null;
  console.log('[DEBUG picker] raw answer string:', answer);
  console.log('[DEBUG picker] answer.includes("Complicated") =', answer ? answer.includes('Complicated') : 'N/A (null answer)');

  if (answer && answer.includes("Complicated")) {
    CONFIG.condition = "shared_paths";
  } else {
    CONFIG.condition = "vanilla_paths";
  }

  console.log('[DEBUG picker] CONFIG.condition set to:', CONFIG.condition);
  console.log('[DEBUG picker] STIMULUS_INDICES keys:', Object.keys(STIMULUS_INDICES));
  console.log('[DEBUG picker] STIMULUS_INDICES["' + CONFIG.condition + '"] exists?', !!STIMULUS_INDICES[CONFIG.condition]);
  if (STIMULUS_INDICES[CONFIG.condition]) {
    console.log('[DEBUG picker] actual indices count:', STIMULUS_INDICES[CONFIG.condition].actual.length, '  practice indices count:', STIMULUS_INDICES[CONFIG.condition].practice.length);
  }

  CONFIG.conditionNumber = CONFIG.condition === "shared_paths" ? 1 : 2;

  jsPsych.data.addProperties({
    condition: CONFIG.condition,
    conditionNumber: CONFIG.conditionNumber
  });

  console.log('[DEBUG picker] Calling loadStimuli()...');
  loadStimuli();
  console.log('[DEBUG picker] loadStimuli() returned.');
  console.log('[DEBUG picker] practice_stimuli.length AFTER loadStimuli:', practice_stimuli.length);
  console.log('[DEBUG picker] actual_stimuli_block_1.length AFTER loadStimuli:', actual_stimuli_block_1.length);
  console.log('[DEBUG picker] actual_stimuli_block_2.length AFTER loadStimuli:', actual_stimuli_block_2.length);
  if (practice_stimuli.length > 0) {
    console.log('[DEBUG picker] practice_stimuli[0]:', JSON.stringify(practice_stimuli[0]));
  }
  console.log('DEV: Selected condition:', CONFIG.condition);
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
    prompt: '<div style="text-align:center;"><strong>Which platform redirected you to this study?</strong></div>',
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
const sona_incentive = 'You will be compensated 0.5 SONA credits for your participation in this study. You will also be entered into a raffle for a $50 Amazon gift card. Your performance on the study will influence your chances of winning the raffle. The better you do, the higher your chances are to win the gift card.';
const prolific_incentive = 'You will be entered into a raffle for a $50 Amazon gift card. Your performance on the study will influence your chances of winning the raffle.';
const other_incentive = 'You will be entered into a raffle for a $50 Amazon gift card. Your performance on the study will influence your chances of winning the raffle. The better you do, the higher your chances are to win the gift card.';
var consent_description = '<div class="consent-text">' +
  '<p><strong>Study Number:</strong> IRB24-1770<br>' +
  '<strong>Study Title:</strong> Superstitious Perception<br>' +
  '<strong>Researcher(s):</strong> Shannon Heald</p>' +
  '<p><strong>Description:</strong> We are researchers at the University of Chicago doing a research study about the limits of human perception. You will be asked to engage with different types of stimuli (such as images and sounds) and indicate whether or not you believe a particular target is present within them. You will also be asked to fill out a couple of questionnaires.</p>' +
  '<p>Participation should take approximately 30 minutes.<br>Your participation is voluntary.</p>' +
  '<p><strong>Incentives:</strong></p>' +
  '<p><strong>Risks and Benefits:</strong> Your participation in this study does not involve any risk to you beyond that of everyday life. Taking part in this research study may not benefit you personally beyond learning about psychological research, but we may learn new things that could help others.</p>' +
  '<p><strong>Confidentiality:</strong> Any identifiable data or information collected by this study will never be shared outside the research team. De-identified information from this study may be used for future research studies or shared with other researchers for future research without your additional informed consent. We may also upload your data (in both aggregate and individual form) to public data repositories. Your study data will be handled as confidentially as possible. If results of this study are published or presented, your individual name will not be used. If you decide to withdraw from this study, any data already collected will be destroyed.</p>' +
  '<p><strong>Contacts and Questions:</strong> If you have questions or concerns about the study, you can contact Jean Matelski Boulware at (312) 860-9260 or at matelskiboulware@uchicago.edu. If you have any questions about your rights as a participant in this research, feel you have been harmed, or wish to discuss other study-related concerns with someone who is not part of the research team, you can contact the University of Chicago Social & Behavioral Sciences Institutional Review Board (IRB) Office by phone at (773) 702-2915, or by email at sbs-irb@uchicago.edu.</p>' +
  '</div>';

var consent_screen = {
  type: jsPsychSurveyMultiChoice,
  data: { screen_name: "Consent" },
  preamble: '<div style="text-align:center; max-width:56rem; margin:0 auto;">' + UCHICAGO_HEADER + '<h2>Consent to Participate in Research</h2>' + consent_description + '</div>',
  on_start: function(trial) {
    var incentiveText = other_incentive;
    if (typeof experimentSource === 'string') {
      var src = experimentSource.toLowerCase();
      if (src === 'sona') incentiveText = sona_incentive;
      else if (src === 'prolific') incentiveText = prolific_incentive;
      else incentiveText = other_incentive;
    }

    // Inject the selected incentive text into the consent description placeholder
    var preambleHtml = '<div style="text-align:center; max-width:56rem; margin:0 auto;">' +
      UCHICAGO_HEADER +
      '<h2>Consent to Participate in Research</h2>' +
      consent_description.replace('<p><strong>Incentives:</strong></p>', '<p><strong>Incentives:</strong> ' + incentiveText + '</p>') +
      '</div>';

    trial.preamble = preambleHtml;
  },
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
    '<p>In this experiment you will see a series of short videos. Each video starts as a white noise image. As each video progresses, it will develop into either ' + article1 + ' <strong>' + letter1 + '</strong> or ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
    '<p>Your task is to identify which letter the video is progressing towards.</p>'+
    '<p>Press the <strong>' + letter1 + '</strong> key if you believe that the video is progressing towards ' + article1 + ' <strong>' + letter1 + '</strong>.' +
    '<p>Press the <strong>' + letter2 + '</strong> key if you believe that the video is progressing towards ' + article2 + ' <strong>' + letter2 + '</strong>.' +
    '<p>Your performance depends on both accuracy and speed. You will only be rewarded for correct responses, so try to respond as accurately as possible. When you are correct, faster responses count as better performance. Remember, your performance influences your chances to win the raffle.</p>' +
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
    '<p>In these practice trials you will see a series of short videos. Each video starts as a white noise image. As each video progresses, it will develop into either ' + article1 + ' <strong>' + letter1 + '</strong> or ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
    '<p>Your task is to identify which letter the video is progressing towards.</p>'+
    '<p>Press the <strong>' + letter1 + '</strong> key if you believe that the video is progressing towards ' + article1 + ' <strong>' + letter1 + '</strong>.' +
    '<p>Press the <strong>' + letter2 + '</strong> key if you believe that the video is progressing towards ' + article2 + ' <strong>' + letter2 + '</strong>.' +
    '<p>Your performance depends on both accuracy and speed. You will only be rewarded for correct responses, so try to respond as accurately as possible. When you are correct, faster responses count as better performance. Remember, your performance influences your chances to win the raffle.</p>' +
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
    console.log('[practice_video_ready] on_start. practice_stimuli.length:', practice_stimuli.length, ' CONFIG.condition:', CONFIG.condition);
    if (practice_stimuli.length > 0) {
      console.log('[practice_video_ready] on_start. practice_stimuli[0]:', JSON.stringify(practice_stimuli[0]));
    } else {
      console.error('[practice_video_ready] on_start. WARNING: practice_stimuli is EMPTY here!');
    }
    _practiceTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: function() {
    console.log('[practice_video_ready] on_finish (spacebar pressed). About to show blank delay then video.');
    console.log('[practice_video_ready] on_finish. practice_stimuli.length:', practice_stimuli.length);
    _practiceTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

var practice_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: function() {
    var tv;
    try {
      tv = jsPsych.timelineVariable('stimulus');
    } catch(e) {
      console.error('[DEBUG practice_video] timelineVariable("stimulus") THREW:', e.message);
      console.error('[DEBUG practice_video] practice_stimuli.length at throw time:', practice_stimuli.length);
      return [];
    }
    console.log('[DEBUG practice_video] timelineVariable("stimulus") =', JSON.stringify(tv));
    if (!tv) {
      console.error('[DEBUG practice_video] timelineVariable returned undefined/null! practice_stimuli.length:', practice_stimuli.length);
    }
    return tv;
  },
  prompt: '<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>',
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: function() {
    console.log('[DEBUG practice_video] on_start fired. practice_stimuli.length:', practice_stimuli.length);
    window.__jspsych_video_ended = null;
    _practiceTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_load: function() {
    var vid = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
    console.log('[DEBUG practice_video] on_load. video element found:', !!vid);
    if (vid) {
      console.log('[DEBUG practice_video] video.src:', vid.src || vid.currentSrc || '(empty)');
      vid.addEventListener('ended', function() { window.__jspsych_video_ended = performance.now(); });
    }
  },
  on_finish: function(data) {
    console.log('[DEBUG practice_video] on_finish. stimulus:', JSON.stringify(data.stimulus));
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
  trial_duration: 1500,
  on_start: function() {
    console.log('[DEBUG blank_delay] practice_blank_delay on_start. practice_stimuli.length:', practice_stimuli.length);
  },
  on_finish: function() {
    console.log('[DEBUG blank_delay] practice_blank_delay on_finish (about to enter video trial). practice_stimuli.length:', practice_stimuli.length);
    if (practice_stimuli.length > 0) {
      console.log('[DEBUG blank_delay] practice_stimuli[0].stimulus:', JSON.stringify(practice_stimuli[0].stimulus));
    } else {
      console.error('[DEBUG blank_delay] EMPTY! No stimuli available as blank delay ends!');
    }
  }
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
    '<p>As a reminder, each video starts as a white noise image. As each video progresses, it will develop into either ' + article1 + ' <strong>' + letter1 + '</strong> or ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
    '<p>Your task is to identify which letter the video is progressing towards.</p>'+
    '<p>Press the <strong>' + letter1 + '</strong> key if you believe that the video is progressing towards ' + article1 + ' <strong>' + letter1 + '</strong>.' +
    '<p>Press the <strong>' + letter2 + '</strong> key if you believe that the video is progressing towards ' + article2 + ' <strong>' + letter2 + '</strong>.' +
    '<p>Your performance depends on both accuracy and speed. You will only be rewarded for correct responses, so try to respond as accurately as possible. When you are correct, faster responses count as better performance. Remember, your performance influences your chances to win the raffle.</p>' +
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
    console.log('[actual_video_ready] on_start. actual_stimuli_block_1.length:', actual_stimuli_block_1.length, ' CONFIG.condition:', CONFIG.condition);
    if (actual_stimuli_block_1.length > 0) {
      console.log('[actual_video_ready] on_start. actual_stimuli_block_1[0]:', JSON.stringify(actual_stimuli_block_1[0]));
    } else {
      console.error('[actual_video_ready] on_start. WARNING: actual_stimuli_block_1 is EMPTY here!');
    }
    _actualTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: function() {
    console.log('[actual_video_ready] on_finish (spacebar pressed). About to show blank delay then video.');
    _actualTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

var actual_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: function() {
    var tv;
    try {
      tv = jsPsych.timelineVariable('stimulus');
    } catch(e) {
      console.error('[DEBUG actual_video] timelineVariable("stimulus") THREW:', e.message);
      return [];
    }
    console.log('[DEBUG actual_video] timelineVariable("stimulus") =', JSON.stringify(tv));
    if (!tv) console.error('[DEBUG actual_video] timelineVariable returned undefined/null!');
    return tv;
  },
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

var preload_videos = {
  type: jsPsychPreload,
  data: { screen_name: "Preload" },
  video: function() {
    console.log('[DEBUG preload] video() function called. CONFIG.condition RIGHT NOW:', CONFIG.condition);
    console.log('[DEBUG preload] practice_stimuli.length RIGHT NOW:', practice_stimuli.length);
    console.log('[DEBUG preload] actual_stimuli.length RIGHT NOW:', actual_stimuli.length);
    var urls = getAllVideoUrls();
    console.log('[DEBUG preload] getAllVideoUrls() returned', urls.length, 'urls');
    return urls;
  },
  on_start: function() {
    console.log('[DEBUG preload] on_start. CONFIG.condition:', CONFIG.condition);
    console.log('[DEBUG preload] on_start. practice_stimuli.length:', practice_stimuli.length);
    console.log('[DEBUG preload] on_start. actual_stimuli.length:', actual_stimuli.length);
  },
  show_progress_bar: true,
  message: '<div style="text-align:center; margin-top:3rem;">' +
    '<p style="font-size:1.3rem; color:#800000;">Loading experimental stimuli...</p>' +
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

// IMPORTANT: Populate stimulus arrays NOW before jsPsych.run() snapshots timeline_variables.
// jsPsych 7 reads timeline_variables.length at run() time.
// The condition picker will call loadStimuli() again with the selected condition,
// mutating the arrays in-place — which is safe because stimulus-loader.js uses
// .length=0 + .push() (not reassignment), so the references stay valid.
console.log('[DEBUG pre-run] Calling loadStimuli() with DEV_CONDITION (' + CONFIG.condition + ') before jsPsych.run()...');
loadStimuli();
console.log('[DEBUG pre-run] practice_stimuli.length:', practice_stimuli.length, ' block1:', actual_stimuli_block_1.length, ' block2:', actual_stimuli_block_2.length);

console.log('===== [DEBUG run] ABOUT TO CALL jsPsych.run() =====');
console.log('[DEBUG run] CONFIG.condition RIGHT NOW              :', CONFIG.condition);
console.log('[DEBUG run] CONFIG.conditionNumber RIGHT NOW        :', CONFIG.conditionNumber);
console.log('[DEBUG run] CONFIG.showConditionPicker              :', CONFIG.showConditionPicker);
console.log('[DEBUG run] practice_stimuli.length at run()        :', practice_stimuli.length);
console.log('[DEBUG run] actual_stimuli_block_1.length at run()  :', actual_stimuli_block_1.length);
console.log('[DEBUG run] actual_stimuli_block_2.length at run()  :', actual_stimuli_block_2.length);
console.log('[DEBUG run] Timeline length:', timeline.length, 'items:', timeline.map(function(t) { return (t.data && t.data.screen_name) || '(no screen_name)'; }));

jsPsych.run(timeline);

console.log('[DEBUG run] jsPsych.run() returned (synchronous return, experiment is now running)');

}); // end onAllPluginsLoaded
