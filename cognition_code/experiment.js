// =====================================================================
// experiment.js — Main experiment file for Cognition.run
// Paste this into the Task Code editor on Cognition.run
// =====================================================================
//
// EXTERNAL FILES (upload these in order):
//   1. plugin-loader.js   - Loads jsPsych plugins from CDN
//   2. config.js          - Settings and stimulus indices
//   3. data-recording.js  - Trial data recording functions
//   4. stimulus-loader.js - Builds stimulus arrays
//   5. screens.js         - All instruction/info screens
//   6. video-trials.js    - Video trial logic
//   7. questionnaires.js  - Tellegen questionnaire
//   8. dev.js             - [OPTIONAL] Dev mode tools
//
// EXTERNAL CSS:
//   styles.css            - Experiment styling
//
// =====================================================================


// Wait for all jsPsych plugins to load before starting
onAllPluginsLoaded(function() {
  
  // =====================================================================
  // INITIALIZE JSPSYCH
  // =====================================================================
  // NOTE: We assign to global jsPsych (no 'var') so that helper functions
  // in external files (data-recording.js, screens.js, etc.) can access it.
  
  jsPsych = initJsPsych();
  
  
  // =====================================================================
  // LOAD STIMULI
  // =====================================================================
  // Build the arrays of video URLs based on the current condition.
  // This must happen before we build the timeline.
  
  loadStimuli();
  
  
  // =====================================================================
  // CREATE TRIAL OBJECTS
  // =====================================================================
  // These factory functions create all the jsPsych trial objects.
  // They're defined in the external files (screens.js, video-trials.js, etc.)
  
  // Create all instruction/info screens
  var screens = createScreens(jsPsych);
  
  // Create video trial objects
  var videoTrials = createVideoTrials(jsPsych);
  
  // Create Tellegen questionnaire
  var tellegen = createTellegenTrial(jsPsych, saveJsonFile);
  
  
  // =====================================================================
  // BUILD EXPERIMENT TIMELINE
  // =====================================================================
  // The timeline defines the order of all screens and trials.
  // Each item is a jsPsych trial object.
  
  var timeline = [];
  
  // --- Part 1: Setup ---
  timeline.push(screens.subject_source);    // Ask which platform they came from
  timeline.push(screens.id_entry);          // Get their ID
  timeline.push(screens.consent_screen);    // Get consent
  timeline.push(screens.preload_videos);    // Load all videos (shows progress bar)
  
  // --- Part 2: Introduction ---
  timeline.push(screens.experiment_intro);  // Explain the task
  
  // --- Part 3: Practice ---
  timeline.push(screens.practice_intro);    // Introduce practice
  timeline.push(videoTrials.practice_trials); // Practice video trials
  timeline.push(screens.practice_complete); // Say practice is done
  
  // --- Part 4: Actual Trials ---
  timeline.push(screens.actual_intro);       // Introduce actual trials
  timeline.push(videoTrials.actual_trials_block_1); // Block 1
  timeline.push(screens.break_screen);       // Break between blocks
  timeline.push(videoTrials.actual_trials_block_2); // Block 2
  timeline.push(screens.actual_complete);    // Say trials are done
  
  // --- Part 5: Questionnaires ---
  timeline.push(screens.questionnaires_intro);  // Introduce questionnaire
  timeline.push(tellegen);                      // Tellegen Absorption Scale
  
  // --- Part 6: Closing ---
  timeline.push(screens.closing);            // Thank you message
  
  
  // =====================================================================
  // DEV MODE: ADD CONDITION PICKER
  // =====================================================================
  // If dev.js is loaded and DEV_MODE is on, add the condition picker
  // at the start of the timeline.
  
  if (typeof addDevTrialsToTimeline === 'function') {
    addDevTrialsToTimeline(timeline, jsPsych);
  }
  
  
  // =====================================================================
  // RUN THE EXPERIMENT
  // =====================================================================
  
  jsPsych.run(timeline);
  
});
