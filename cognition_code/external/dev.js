// =====================================================================
// dev.js — Development-only utilities and trials
// Only needed when DEV_MODE = true in config.js
// =====================================================================

console.log('[dev.js] Loading development utilities...');

// =====================================================================
// Debug Logging Helper
// =====================================================================

/**
 * Log a debug message only when in dev mode
 * @param {string} tag - Label for the log (e.g., '[picker]')
 * @param {...any} args - Values to log
 */
function devLog(tag, ...args) {
  if (typeof CONFIG !== 'undefined' && CONFIG.isDev) {
    console.log('[DEV ' + tag + ']', ...args);
  }
}

// =====================================================================
// Condition Picker Trial
// =====================================================================

/**
 * Creates the condition picker trial for dev mode
 * @param {object} jsPsych - The jsPsych instance
 * @returns {object} jsPsych trial object
 */
function createConditionPicker(jsPsych) {
  return {
    type: jsPsychSurveyMultiChoice,
    data: { screen_name: "Condition Picker" },
    preamble: '<div style="background:#ffffcc; border:0.125rem solid #cc9900; padding:1rem; margin-bottom:1rem; border-radius:0.25rem;">' +
      '<strong>⚠️ DEVELOPMENT MODE</strong></div>',
    questions: [{
      prompt: '<div style="text-align:left; font-size:1.2rem;"><strong><center>Select Condition to Test</center></strong><br><br>',
      options: [
        "<strong>Complicated Generation Scheme</strong> - stimuli decomposed into shared and non-shared components",
        "<strong>Simple Generation Scheme</strong> - stimuli generated via conditional diffusion guidance parameter only"
      ],
      required: true
    }],
    on_finish: function(data) {
      devLog('picker', 'on_finish fired. data.response =', JSON.stringify(data.response));
      var answer = data.response ? Object.values(data.response)[0] : null;
      devLog('picker', 'raw answer string:', answer);

      if (answer && answer.includes("Complicated")) {
        CONFIG.condition = "shared_paths";
      } else {
        CONFIG.condition = "vanilla_paths";
      }

      devLog('picker', 'CONFIG.condition set to:', CONFIG.condition);
      CONFIG.conditionNumber = CONFIG.condition === "shared_paths" ? 1 : 2;

      jsPsych.data.addProperties({
        condition: CONFIG.condition,
        conditionNumber: CONFIG.conditionNumber
      });

      devLog('picker', 'Calling loadStimuli()...');
      loadStimuli();
      devLog('picker', 'loadStimuli() returned.');
      devLog('picker', 'practice_stimuli.length:', practice_stimuli.length);
      devLog('picker', 'actual_stimuli_block_1.length:', actual_stimuli_block_1.length);
      devLog('picker', 'actual_stimuli_block_2.length:', actual_stimuli_block_2.length);
      console.log('DEV: Selected condition:', CONFIG.condition);
    }
  };
}

// =====================================================================
// Timeline Helper
// =====================================================================

/**
 * Adds dev-mode trials to the beginning of the timeline if enabled
 * @param {array} timeline - The jsPsych timeline array
 * @param {object} jsPsych - The jsPsych instance
 */
function addDevTrialsToTimeline(timeline, jsPsych) {
  if (typeof CONFIG !== 'undefined' && CONFIG.showConditionPicker) {
    var conditionPicker = createConditionPicker(jsPsych);
    timeline.unshift(conditionPicker);
    devLog('timeline', 'Added condition picker to timeline');
  }
}

console.log('[dev.js] Development utilities loaded.');
