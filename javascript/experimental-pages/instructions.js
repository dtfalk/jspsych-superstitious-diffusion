const instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Instructions</h2>
      <p>In this experiment you will watch short videos that gradually resolve toward one of two letters, either a <strong>${STIMULUS_CONFIG.targetLetters[0]}</strong> or an <strong>${STIMULUS_CONFIG.targetLetters[1]}</strong>.</p>
      <p>Your task is to decide which letter is present and press the corresponding key as quickly and accurately as possible.</p>
      <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for am Amazon gift card.</p>
      <p>Please do not attempt to pause or manipulate the videos — just respond when you have decided.</p>
      <p>If you understand and wish to proceed, press <strong>space</strong> to continue.</p>
    </div>
  `,
  choices: [" "]
}
