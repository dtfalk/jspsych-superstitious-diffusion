const start_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="max-width:40rem; margin:0 auto; text-align:left;">
      <h2>Practice Complete</h2>
      <p>You have completed the practice trials.</p>
      <p>Remember: each video will gradually resolve toward either a <strong>k</strong> or an <strong>s</strong>.</p>
      <p>Decide which letter is present and press the corresponding key as quickly and accurately as you can.</p>
      <p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>
      <p>Please do not try to pause or manipulate the videos — just respond when you have decided.</p>
      <p>Press <strong>f</strong> to begin the actual experiment.</p>
    </div>
  `,
  choices: ["f"]
}
