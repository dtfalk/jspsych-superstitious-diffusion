// Page to get subject's identifier based on experimental source
const id_entry = {
  type: jsPsychSurveyText,
  questions: [
    {
      // Initially set to empty but we inject prompt below based on subject's experimental source
      prompt: "", 
      required: true
    }
  ],
  on_start: trial => {
    
    // Inject prompt based on subject's experimental source
    if (experimentSource === "Prolific") {
      trial.questions[0].prompt = "Please enter your Prolific ID"
    } else if (experimentSource === "Sona") {
      trial.questions[0].prompt = "Please enter your SONA ID"
    } else {
      trial.questions[0].prompt = "Please enter your Email"
    }
  },
  on_finish: function(data) {

    // Set the subject ID as globally accessible variable
    const response = data.response ? Object.values(data.response)[0] : null
    setSubjectId(response)
  }
}