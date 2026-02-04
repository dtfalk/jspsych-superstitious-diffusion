const id_trial = {
  type: jsPsychSurveyText,
  questions: [
    {
      // Initially set to empty but we inject prompt below based on subject's experimental source
      prompt: "", 
      required: true
    }
  ],
  on_start: trial => {
    
    // Grab subject's experimental source
    const src = experimentSource

    // Inject prompt based on experimental source
    if (src === "Prolific") {
      trial.questions[0].prompt = "Please enter your Prolific ID"
    } else if (src === "Sona") {
      trial.questions[0].prompt = "Please enter your SONA ID"
    } else {
      trial.questions[0].prompt = "Please enter your email"
    }
  }
}