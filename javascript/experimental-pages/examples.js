const examples_intro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Practice Examples</h2>
      <p>As a reminder: you will watch short videos that gradually resolve toward one of two letters, either a <strong>${STIMULUS_CONFIG.targetLetters[0]}</strong> or an <strong>${STIMULUS_CONFIG.targetLetters[1]}</strong>.</p>
      <p>Your task is to decide which letter is present and press the corresponding key as quickly and accurately as possible.</p>
      <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>
      <p>Please do not attempt to pause or manipulate the videos — just respond when you have decided.</p>
      <p>You will now complete <strong>${STIMULUS_CONFIG.practice.conditions.length * STIMULUS_CONFIG.practice.nPerCondition}</strong> practice trials so you can get used to the task.</p>
      <p>Press <strong>space</strong> to begin the practice trials.</p>
    </div>
  `,
  choices: [" "]
}

// Build practice stimuli list from central configuration
const practice_stimuli = [];

STIMULUS_CONFIG.practice.conditions.forEach(condition => {
  for (let i = 1; i <= STIMULUS_CONFIG.practice.nPerCondition; i++) {
    practice_stimuli.push({
      file: `${STIMULUS_CONFIG.practice.folder}/${condition}/video${i}.mp4`
    });
  }
});

const practice_block = {
  timeline: [video_trial],
  timeline_variables: practice_stimuli,
  randomize_order: true
}
