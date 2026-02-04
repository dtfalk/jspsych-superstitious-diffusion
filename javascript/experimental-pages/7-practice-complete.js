const practice_trials_complete_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width:40rem; text-align:left;">
        <h2>Practice Complete</h2>
        <p>You have completed the practice trials.</p>
        <p>Press <strong>${CONFIG.continueKey}</strong> to continue.</p>
      </div>
    </div>
  `,
  choices: [`${CONFIG.continueKey}`],
  on_finish: function(data) {
    const end_timestamp = performance.now()
    const start_timestamp = end_timestamp - data.rt
    saveJsonFile('Practice Complete', {
      time_on_screen: data.rt,
      start_timestamp,
      end_timestamp
    })
    flushTrials('practice')
  }
}
