const redirect_trial = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: `
        <div style=text-align:center;">
          Which platform redirected you to this study?
        </div>
      `,
      options: ["Prolific", "Sona", "Other"],
      required: true
    }
  ],
  on_finish: data => {
    
    // Extract subject's experimental source and set as globally accessible variable
    const response = data.response ? Object.values(data.response)[0] : null
    setExperimentSource(response)
  }
}