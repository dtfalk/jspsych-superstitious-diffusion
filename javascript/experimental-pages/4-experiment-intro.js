const experiment_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Instructions</h2>
      <p>In this experiment you will watch a series of short videos that gradually progress from static toward one of two letters, either ${getArticle(CONFIG.targetLetters[0])} <strong>${CONFIG.targetLetters[0]}</strong> or ${getArticle(CONFIG.targetLetters[1])} <strong>${CONFIG.targetLetters[1]}</strong>.</p>
      <p>Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>
      <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>
      <p>Press <strong>space</strong> to continue.</p>
    </div>
  `,
  choices: [" "],
  on_start: function(trial) {
    trial.start_time = performance.now()
  },
  on_finish: function(data) {
    const end_timestamp = performance.now()
    const start_timestamp = end_timestamp - data.rt
    saveJsonFile('Experiment Introduction', {
      time_on_screen: data.rt,
      start_timestamp,
      end_timestamp
    })
  }
}
