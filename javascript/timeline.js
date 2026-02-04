const timeline = []

timeline.push(
  subject_source,
  id_entry,
  consent_screen,
  nonconsent_screen,
  experiment_intro_screen,
  practice_intro_screen,
  practice_trials,
  practice_trials_complete_screen,
  actual_intro_screen,
  actual_trials_block_1,
  actual_break,
  actual_trials_block_2,
  actual_trials_complete_screen,
  questionnaires_intro_screen,
  tellegen_questionnaire,
  closing_screen
)

jsPsych.run(timeline)
