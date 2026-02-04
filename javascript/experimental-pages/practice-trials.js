const examples_intro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Practice Examples</h2>
      <p>As a reminder: you will watch a series of short videos that gradually progress from static toward one of two letters, either ${getArticle(CONFIG.targetLetters[0])} <strong>${CONFIG.targetLetters[0]}</strong> or ${getArticle(CONFIG.targetLetters[1])} <strong>${CONFIG.targetLetters[1]}</strong>.</p>
      <p>Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>
      <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>
      <p>You will now complete <strong>${CONFIG.targetLetters.length * CONFIG.practice.nPerCondition}</strong> practice trials so you can get used to the task.</p>
      <p>Press <strong>space</strong> to begin the practice trials.</p>
    </div>
  `,
  choices: [" "]
}

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

const practice_block = {
  timeline: [video_ready, video_trial],
  timeline_variables: practice_stimuli,
  randomize_order: true,
  data: { trial_type: "practice", block_number: null }
}
