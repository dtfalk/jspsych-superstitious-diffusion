const practice_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Practice Examples</h2>
      <p>As a reminder: you will watch a series of short videos that gradually progress from static toward one of two letters, either ${getArticle(CONFIG.targetLetters[0])} <strong>${CONFIG.targetLetters[0]}</strong> or ${getArticle(CONFIG.targetLetters[1])} <strong>${CONFIG.targetLetters[1]}</strong>.</p>
      <p>Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>
      <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>
      <p>You will now complete <strong>${CONFIG.targetLetters.length * CONFIG.practice.nPerCondition}</strong> practice trials so you can get used to the task.</p>
      <p>Press <strong>${CONFIG.continueKey}</strong> to begin the practice trials.</p>
    </div>
  `,
  choices: [`${CONFIG.continueKey}`],
  on_finish: function(data) {
    const end_timestamp = performance.now()
    const start_timestamp = end_timestamp - data.rt
    saveJsonFile('Practice Instructions', {
      time_on_screen: data.rt,
      start_timestamp,
      end_timestamp
    })
  }
}
