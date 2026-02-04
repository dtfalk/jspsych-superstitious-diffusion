// Global to pass timestamps between practice_video_ready and practice_video_trial
let _practiceTrialTimestamps = {};

// Build practice stimuli list using the same "stimulus"-in-variables pattern
let practice_stimuli = [];
CONFIG.targetLetters.forEach(condition => {
  for (let i = CONFIG.practice.stimulusStartIndex; i < CONFIG.practice.stimulusStartIndex + CONFIG.practice.nPerCondition; i++) {
    practice_stimuli.push({
      stimulus: [
        `${CONFIG.practice.folder}/${condition}/${condition}_${String(i)}.mp4`
      ]
    });
  }
});

const practice_video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <p style="font-size: 1.5rem;">Press <strong>space</strong> to start the video.</p>
    </div>
  `,
  choices: [" "],
  on_start: () => {
    _practiceTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: () => {
    _practiceTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

const practice_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: () => jsPsych.evaluateTimelineVariable("stimulus"),
  prompt: `<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>`,
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: () => {
    _practiceTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_finish: data => {
    _practiceTrialTimestamps.response_timestamp = performance.now();
    data.spacebar_screen_presented_timestamp = _practiceTrialTimestamps.spacebar_screen_presented_timestamp;
    data.spacebar_pressed_timestamp = _practiceTrialTimestamps.spacebar_pressed_timestamp;
    data.video_start_timestamp = _practiceTrialTimestamps.video_start_timestamp;
    data.response_timestamp = _practiceTrialTimestamps.response_timestamp;
    console.log('[BEFORE] data.stimulus:', data.stimulus, 'type:', typeof data.stimulus, 'isArray:', Array.isArray(data.stimulus));
    recordVideoTrial(data);
  }
};

const practice_trials = {
  timeline: [practice_video_ready, practice_video_trial],
  timeline_variables: practice_stimuli,
  randomize_order: true,
  data: {trial_type: "practice", block_number: null}
}
