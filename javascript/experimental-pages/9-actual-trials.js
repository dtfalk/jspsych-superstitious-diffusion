// Global to pass timestamps between video_ready and video_trial
let _actualTrialTimestamps = {};

// Build main (actual) stimuli list from central configuration
let actual_stimuli = [];
CONFIG.targetLetters.forEach(condition => {
  for (let i = 0; i <= CONFIG.main.nPerCondition; i++) {
    actual_stimuli.push({
      stimulus: [
        `${CONFIG.main.folder}/${condition}/${condition}_${String(i)}.mp4`
      ]
    });
  }
});

const actual_video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <p style="font-size: 1.5rem;">Press <strong>space</strong> to start the video.</p>
    </div>
  `,
  choices: [" "],
  on_start: () => {
    _actualTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: () => {
    _actualTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

const actual_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: () => jsPsych.evaluateTimelineVariable("stimulus"),
  prompt: `<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>`,
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: () => {
    _actualTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_finish: data => {
    _actualTrialTimestamps.response_timestamp = performance.now();
    console.log('[TRIAL on_finish] data.stimulus:', data.stimulus);
    console.log('[TRIAL on_finish] data.response:', data.response);
    console.log('[TRIAL on_finish] all data keys:', Object.keys(data));
    // Copy all timestamps to data
    data.spacebar_screen_presented_timestamp = _actualTrialTimestamps.spacebar_screen_presented_timestamp;
    data.spacebar_pressed_timestamp = _actualTrialTimestamps.spacebar_pressed_timestamp;
    data.video_start_timestamp = _actualTrialTimestamps.video_start_timestamp;
    data.response_timestamp = _actualTrialTimestamps.response_timestamp;
    console.log('[BEFORE] data.stimulus:', data.stimulus, 'type:', typeof data.stimulus, 'isArray:', Array.isArray(data.stimulus));
    recordVideoTrial(data);
  }
};

// Split actual trials into two blocks with a break in between
const midpoint = Math.ceil(actual_stimuli.length / 2);
const actual_stimuli_block_1 = actual_stimuli.slice(0, midpoint);
const actual_stimuli_block_2 = actual_stimuli.slice(midpoint);

const actual_trials_block_1 = {
  timeline: [actual_video_ready, actual_video_trial],
  timeline_variables: actual_stimuli_block_1,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 1 }
};

const actual_trials_block_2 = {
  timeline: [actual_video_ready, actual_video_trial],
  timeline_variables: actual_stimuli_block_2,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 2 }
};

const actual_break = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width:40rem; text-align:left;">
        <h2>Break</h2>
        <p>You have completed the first block of trials.</p>
        <p>Take a short break if you like, then press <strong>${CONFIG.continueKey}</strong> to continue to the next block.</p>
      </div>
    </div>
  `,
  choices: [`${CONFIG.continueKey}`],
  on_start: data => {
    data.screen_presented_time = performance.now();
  },
  on_finish: data => {
    const t = performance.now();
    data.reaction_time_ms = t - data.screen_presented_time;
    
    saveJsonFile('Break Screen', {
      reaction_time_ms: data.reaction_time_ms,
      start_timestamp: data.screen_presented_time,
      end_timestamp: t
    })
    
    flushTrials('actual')
  }
};