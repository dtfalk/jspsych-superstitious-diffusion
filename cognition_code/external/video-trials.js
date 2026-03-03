// =====================================================================
// video-trials.js — Video trial logic for practice and actual trials
// =====================================================================
//
// This file contains:
//   - The video trial structure (ready screen -> blank -> video)
//   - Timestamp recording for timing analysis
//   - Trial wrapper that loops through stimuli
//
// The trial flow for each video is:
//   1. "Press space to start" screen
//   2. 1.5 second blank screen
//   3. Video plays, participant presses S or X to respond
//
// =====================================================================


/**
 * Creates all video trial objects for the experiment.
 * 
 * @param {object} jsPsych - The jsPsych instance
 * @returns {object} Object containing practice and actual trial objects
 */
function createVideoTrials(jsPsych) {
  
  // =====================================================================
  // TIMESTAMP STORAGE
  // =====================================================================
  // We track timestamps at each phase of the trial so we can calculate
  // timing metrics later (reaction time, etc.)
  
  var practiceTimestamps = {};
  var actualTimestamps = {};
  
  
  // =====================================================================
  // PRACTICE TRIALS
  // =====================================================================
  
  // -----------------------------------------------------------------
  // Practice: "Press space to start" screen
  // -----------------------------------------------------------------
  // This screen waits for the participant to press space before
  // showing each video. This gives them control over pacing.
  
  var practice_video_ready = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Practice Video Ready" },
    stimulus: '<div style="position:fixed; top:0; left:0; width:100vw; height:100vh; ' +
              'display:flex; align-items:center; justify-content:center;">' +
      '<div style="text-align:center;">' +
      '<p style="font-size:1.3rem;">Press <strong>space</strong> to start the video</p>' +
      '</div></div>',
    choices: [" "],  // Only spacebar works
    on_start: function() {
      // Record when this screen appeared
      practiceTimestamps.spacebar_screen_presented_timestamp = performance.now();
    },
    on_finish: function() {
      // Record when they pressed space
      practiceTimestamps.spacebar_pressed_timestamp = performance.now();
    }
  };
  
  // -----------------------------------------------------------------
  // Practice: Blank delay screen
  // -----------------------------------------------------------------
  // A 1.5 second blank screen between pressing space and video start.
  // This standardizes the timing and prevents anticipatory responses.
  
  var practice_blank_delay = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Practice Blank Delay" },
    stimulus: '',           // Empty screen
    choices: "NO_KEYS",     // Can't skip this
    trial_duration: 1500    // 1.5 seconds
  };
  
  // -----------------------------------------------------------------
  // Practice: Video trial
  // -----------------------------------------------------------------
  // Shows the video and waits for S or X response.
  
  var practice_video_trial = {
    type: jsPsychVideoKeyboardResponse,
    
    // Get the video URL from the current timeline variable
    stimulus: function() {
      return jsPsych.timelineVariable('stimulus');
    },
    
    // CSS to center the video on screen
    prompt: '<style>#jspsych-video-keyboard-response-stimulus { ' +
            'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
            '}</style>',
    
    width: 500,
    height: 500,
    
    // Only S and X keys are valid responses
    choices: CONFIG.targetLetters,
    
    // Don't automatically end when video finishes - wait for response
    trial_ends_after_video: false,
    response_ends_trial: true,
    
    on_start: function() {
      // Clear the video-ended timestamp from any previous trial
      window.__jspsych_video_ended = null;
      
      // Record when the video started
      practiceTimestamps.video_start_timestamp = performance.now();
    },
    
    on_load: function() {
      // Set up listener to record when video ends
      var video = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
      if (video) {
        video.addEventListener('ended', function() {
          window.__jspsych_video_ended = performance.now();
        });
      }
    },
    
    on_finish: function(data) {
      // Record response time
      practiceTimestamps.response_timestamp = performance.now();
      
      // Add all timestamps to the trial data
      data.spacebar_screen_presented_timestamp = practiceTimestamps.spacebar_screen_presented_timestamp;
      data.spacebar_pressed_timestamp = practiceTimestamps.spacebar_pressed_timestamp;
      data.video_start_timestamp = practiceTimestamps.video_start_timestamp;
      data.response_timestamp = practiceTimestamps.response_timestamp;
      
      // Mark this as a practice trial
      data.trial_type = 'practice';
      data.screen_name = 'Practice Video Trial';
      
      // Record the trial data
      recordVideoTrial(data);
    }
  };
  
  // -----------------------------------------------------------------
  // Practice: Combined trial timeline
  // -----------------------------------------------------------------
  // This wraps the three parts together and loops through all practice stimuli
  
  var practice_trials = {
    timeline: [practice_video_ready, practice_blank_delay, practice_video_trial],
    timeline_variables: practice_stimuli,  // Array from stimulus-loader.js
    randomize_order: true,                 // Show videos in random order
    data: { trial_type: "practice" }
  };
  
  
  // =====================================================================
  // ACTUAL TRIALS
  // =====================================================================
  // Same structure as practice, but uses actual_stimuli arrays
  
  // -----------------------------------------------------------------
  // Actual: "Press space to start" screen
  // -----------------------------------------------------------------
  
  var actual_video_ready = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Actual Video Ready" },
    stimulus: '<div style="position:fixed; top:0; left:0; width:100vw; height:100vh; ' +
              'display:flex; align-items:center; justify-content:center;">' +
      '<div style="text-align:center;">' +
      '<p style="font-size:1.3rem;">Press <strong>space</strong> to start the video</p>' +
      '</div></div>',
    choices: [" "],
    on_start: function() {
      actualTimestamps.spacebar_screen_presented_timestamp = performance.now();
    },
    on_finish: function() {
      actualTimestamps.spacebar_pressed_timestamp = performance.now();
    }
  };
  
  // -----------------------------------------------------------------
  // Actual: Blank delay screen
  // -----------------------------------------------------------------
  
  var actual_blank_delay = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Actual Blank Delay" },
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 1500
  };
  
  // -----------------------------------------------------------------
  // Actual: Video trial
  // -----------------------------------------------------------------
  
  var actual_video_trial = {
    type: jsPsychVideoKeyboardResponse,
    
    stimulus: function() {
      return jsPsych.timelineVariable('stimulus');
    },
    
    prompt: '<style>#jspsych-video-keyboard-response-stimulus { ' +
            'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
            '}</style>',
    
    width: 500,
    height: 500,
    choices: CONFIG.targetLetters,
    trial_ends_after_video: false,
    response_ends_trial: true,
    
    on_start: function() {
      window.__jspsych_video_ended = null;
      actualTimestamps.video_start_timestamp = performance.now();
    },
    
    on_load: function() {
      var video = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
      if (video) {
        video.addEventListener('ended', function() {
          window.__jspsych_video_ended = performance.now();
        });
      }
    },
    
    on_finish: function(data) {
      actualTimestamps.response_timestamp = performance.now();
      
      data.spacebar_screen_presented_timestamp = actualTimestamps.spacebar_screen_presented_timestamp;
      data.spacebar_pressed_timestamp = actualTimestamps.spacebar_pressed_timestamp;
      data.video_start_timestamp = actualTimestamps.video_start_timestamp;
      data.response_timestamp = actualTimestamps.response_timestamp;
      
      data.trial_type = 'actual';
      data.screen_name = 'Actual Video Trial';
      
      recordVideoTrial(data);
    }
  };
  
  // -----------------------------------------------------------------
  // Actual: Block 1 trials
  // -----------------------------------------------------------------
  // First half of the actual stimuli
  
  var actual_trials_block_1 = {
    timeline: [actual_video_ready, actual_blank_delay, actual_video_trial],
    timeline_variables: actual_stimuli_block_1,
    randomize_order: true,
    data: { trial_type: "actual", block_number: 1 }
  };
  
  // -----------------------------------------------------------------
  // Actual: Block 2 trials  
  // -----------------------------------------------------------------
  // Second half of the actual stimuli
  
  var actual_trials_block_2 = {
    timeline: [actual_video_ready, actual_blank_delay, actual_video_trial],
    timeline_variables: actual_stimuli_block_2,
    randomize_order: true,
    data: { trial_type: "actual", block_number: 2 }
  };
  
  
  // =====================================================================
  // Return all trial objects
  // =====================================================================
  
  return {
    practice_trials: practice_trials,
    actual_trials_block_1: actual_trials_block_1,
    actual_trials_block_2: actual_trials_block_2
  };
}


console.log('[video-trials.js] Loaded successfully');
