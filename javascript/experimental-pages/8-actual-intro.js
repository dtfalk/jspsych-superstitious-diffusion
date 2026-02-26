const actual_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width:40rem; text-align:left;">
        <h2>Main Task</h2>
        <p>You will now begin the main portion of the task.</p>
        <p>As a reminder: you will watch a series of short videos that gradually progress from static toward one of two letters, either ${getArticle(CONFIG.targetLetters[0])} <strong>${CONFIG.targetLetters[0]}</strong> or ${getArticle(CONFIG.targetLetters[1])} <strong>${CONFIG.targetLetters[1]}</strong>. Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>
        <p>The main task consists of two blocks of trials with a short break between them.</p>
        <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>
        <p>Press <strong>${CONFIG.continueKey}</strong> to begin.</p>
      </div>
    </div>
  `,
  choices: [`${CONFIG.continueKey}`],
  on_finish: function(data) {
    const end_timestamp = performance.now()
    const start_timestamp = end_timestamp - data.rt
    saveJsonFile('Actual Trials Introduction', {
      time_on_screen: data.rt,
      start_timestamp,
      end_timestamp
    })
  }
}
