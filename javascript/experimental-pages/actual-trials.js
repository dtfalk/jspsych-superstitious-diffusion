const video_stimuli = [];

// Build main (actual) stimuli list from central configuration
STIMULUS_CONFIG.main.conditions.forEach(condition => {
  for (let i = 1; i <= STIMULUS_CONFIG.main.nPerCondition; i++) {
    video_stimuli.push({
      file: `${STIMULUS_CONFIG.main.folder}/${condition}/video${i}.mp4`
    });
  }
});

const video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: () => jsPsych.timelineVariable("file"),
  choices: STIMULUS_CONFIG.responseKeys,
  trial_ends_after_video: true,
  on_start: data => {
    data.screen_presented_time = performance.now()
  },
  on_finish: data => {
    data.response_time_absolute = performance.now()
  }
}

const video_block = {
  timeline: [video_trial],
  timeline_variables: video_stimuli,
  randomize_order: true
}
