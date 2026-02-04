let video_stimuli = [];

// Build main (actual) stimuli list from central configuration.
// jsPsych v8 expects "stimulus" to be an array of video sources,
// so we store the array directly in the timeline variables.
CONFIG.targetLetters.forEach(condition => {
  for (let i = 0; i <= CONFIG.main.nPerCondition; i++) {
    video_stimuli.push({
      stimulus: [
        `${CONFIG.main.folder}/${condition}/${condition}_${String(i)}.mp4`
        // `${CONFIG.main.folder}/${condition}/${condition}_${String(i).padStart(3, "0")}.mp4`
      ]
    });
  }
});

const video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  css_classes: ["center-vert"],
  stimulus: () => {
    const stimArr = jsPsych.timelineVariable("stimulus");
    const src = Array.isArray(stimArr) ? stimArr[0] : stimArr;
    return `
      <div style="max-width:40rem; margin:0 auto; text-align:center;">
        <video src="${src}" style="max-width:100%;" muted></video>
        <p>Press <strong>space</strong> to start the video.</p>
      </div>
    `;
  },
  choices: [" "],
  on_start: data => {
    data.screen_presented_time = performance.now();
    data.trial_role = "video_ready";
    // Ensure the outer display element uses the centering helper
    const el = document.querySelector('.jspsych-display-element');
    if (el && !el.classList.contains('center-vert')) el.classList.add('center-vert');
  },
  on_finish: data => {
    data.response_time_absolute = performance.now();
    data.trial_role = "video_ready";
    const el = document.querySelector('.jspsych-display-element');
    if (el && el.classList.contains('center-vert')) el.classList.remove('center-vert');
  }
};

const video_trial = {
  type: jsPsychVideoKeyboardResponse,
  css_classes: ["center-vert"],
  stimulus: jsPsych.timelineVariable("stimulus"),
  choices: CONFIG.targetLetters,
  // End the trial as soon as the participant presses one of the
  // target keys, rather than waiting for the video to finish.
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: data => {
    const t = performance.now();
    data.video_start_timestamp = t;
    data.trial_role = "video_play";
    const el = document.querySelector('.jspsych-display-element');
    if (el && !el.classList.contains('center-vert')) el.classList.add('center-vert');
  },
  on_finish: data => {
    const t = performance.now();
    data.selection_timestamp = t;
    const el = document.querySelector('.jspsych-display-element');
    if (el && el.classList.contains('center-vert')) el.classList.remove('center-vert');
  }
};

// Split actual trials into two blocks with a break in between.
const midpoint = Math.ceil(video_stimuli.length / 2);
const video_stimuli_block1 = video_stimuli.slice(0, midpoint);
const video_stimuli_block2 = video_stimuli.slice(midpoint);

const actual_block1 = {
  timeline: [video_ready, video_trial],
  timeline_variables: video_stimuli_block1,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 1 }
};

const actual_block2 = {
  timeline: [video_ready, video_trial],
  timeline_variables: video_stimuli_block2,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 2 }
};

const actual_break = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Break</h2>
      <p>You have completed the first block of trials.</p>
      <p>Take a short break if you like, then press <strong>space</strong> to continue to the next block.</p>
    </div>
  `,
  choices: [" "],
  on_start: data => {
    data.screen_presented_time = performance.now();
  },
  on_finish: data => {
    const t = performance.now();
    data.response_time_absolute = t;
    data.reaction_time_ms = t - data.screen_presented_time;
  }
};
