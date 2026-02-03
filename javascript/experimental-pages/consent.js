/* Consent screen for the experiment
   Single-screen consent: subject must select consent to continue.
   If subject selects non-consent, they see a thank-you screen and the
   experiment ends. */

const consent_description = `
<div class="consent-text">
  <p>Study Number: IRB24-1770<br>
  Study Title: Superstitious Perception<br>
  Researcher(s): Shannon Heald</p>

  <p>Description: We are researchers at the University of Chicago doing a research study about the limits of human perception. You will be asked to engage with different types of stimuli (such as images and sounds) and indicate whether or not you believe a particular target is present within them. You will also be asked to fill out a couple of questionnaires.</p>

  <p>Depending on your performance, we may reach out to you for follow up studies. If we reach out to you again, your participation is entirely voluntary, and you will be compensated for any further experiments in which you are a participant.</p>

  <p>Participation should take approximately 45-90 minutes.<br>
  Your participation is voluntary.</p>

  <p>Incentives: You will be compensated {number_of_sona_credits} SONA Credits for your participation in this study. You will also be entered into a raffle for a 50 dollar Amazon gift card. Your performance on the study will influence your chances of winning the raffle. The better you do, the higher your chances are to win the giftcard.</p>

  <p>Risks and Benefits: Your participation in this study does not involve any risk to you beyond that of everyday life.
  Risks for this task are minimal and include boredom, minor fatigue, and the possibility of a breach of confidentiality.</p>

  <p>Taking part in this research study may not benefit you personally beyond learning about psychological research, but we may learn new things that could help others and contribute to the field of psychology.</p>

  <p>Confidentiality: Any identifiable data or information collected by this study will never be shared outside the research team.</p>

  <p>De-identified information from this study may be used for future research studies or shared with other researchers for future research without your additional informed consent.</p>

  <p>We may also upload your data (in both aggregate and individual form) to public data repositories.</p>

  <p>Your study data will be handled as confidentially as possible. If results of this study are published or presented, your individual name will not be used.</p>

  <p>If you decide to withdraw from this study, any data already collected will be destroyed.</p>

  <p>Contacts & Questions: If you have questions or concerns about the study, you can contact Jean Matelski Boulware at (312)860-9260 or at matelskiboulware@uchicago.edu.</p>

  <p>If you have any questions about your rights as a participant in this research, feel you have been harmed, or wish to discuss other study-related concerns with someone who is not part of the research team, you can contact the University of Chicago Social & Behavioral Sciences Institutional Review Board (IRB) Office by phone at (773) 702-2915, or by email at sbs-irb@uchicago.edu.</p>

  <p>Please read the statement above and select whether you consent to participate.</p>
</div>
`;

const consent_trial = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: consent_description,
      options: [
        'I consent to participate in this study',
        'I do NOT consent to participate in this study'
      ],
      required: true
    }
  ],
  button_label: 'Submit'
};

const nonconsent_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="max-width:40rem; margin:0 auto; text-align:center;"><h2>Thank you</h2><p>Thank you for considering participation. Please close this tab to exit the experiment.</p></div>',
  choices: [' ']
};

// Conditional flow for non-consent: show thank-you then end experiment
const nonconsent_flow = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<div style="max-width:40rem; margin:0 auto; text-align:center;"><h2>Thank you</h2><p>Thank you for considering participation. Please close this tab to exit the experiment.</p></div>',
      choices: [' '],
      on_finish: function() {
        jsPsych.endExperiment('Participant did not consent.');
      }
    }
  ],
  conditional_function: function() {
    const last = jsPsych.data.get().last(1).values()[0];
    if (!last) return false;

    let val = null;

    // jsPsych v8 stores survey responses in data.response (object)
    if (last.response) {
      val = Object.values(last.response)[0];
    } else if (last.responses) {
      // fallback if responses is stored as a JSON string
      try {
        const parsed = JSON.parse(last.responses);
        val = Object.values(parsed)[0];
      } catch (e) {
        return false;
      }
    }

    return val === 'I do NOT consent to participate in this study';
  }
};
