const timeline = []

timeline.push(
  redirect_trial,
  id_trial,
  // consent screen and branch: if participant does not consent, show thank-you and end
  consent_trial,
  nonconsent_flow,
  instructions,
  examples_intro,
  practice_block,
  start_trial,
  video_block,
  tellegen_instruction,
  tellegen_trial,
  // vviq_trials is an array containing the instruction + 8 likert blocks
  ...vviq_trials,
  closing
)

jsPsych.run(timeline)
