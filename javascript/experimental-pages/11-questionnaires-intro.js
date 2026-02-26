const questionnaires_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width:40rem; text-align:left;">
        <h2>Questionnaires</h2>
        <p>You will now respond to some questionnaires.</p>
        <p>Press <strong>spacebar</strong> to continue.</p>
      </div>
    </div>
  `,
  choices: [" "],
  on_finish: function(data) {
    const end_timestamp = performance.now()
    const start_timestamp = end_timestamp - data.rt
    saveJsonFile('Questionnaires Intro Screen', {
      time_on_screen: data.rt,
      start_timestamp,
      end_timestamp
    })
  }
};
