// =====================================================================
// screens.js — All instruction and information screens
// =====================================================================
//
// This file contains all the "static" screens that display text:
//   - Subject source question
//   - ID entry
//   - Consent form
//   - Experiment introduction
//   - Practice introduction
//   - Practice complete
//   - Actual trials introduction
//   - Break between blocks
//   - Actual trials complete
//   - Questionnaires introduction
//   - Closing screen
//
// =====================================================================


// =====================================================================
// CONSENT TEXT
// =====================================================================
// The consent form text displayed to participants.
// Incentive text is inserted dynamically based on their recruitment source.

var CONSENT_TEXT = '<div class="consent-text">' +
  '<p><strong>Study Number:</strong> IRB24-1770<br>' +
  '<strong>Study Title:</strong> Superstitious Perception<br>' +
  '<strong>Researcher(s):</strong> Shannon Heald</p>' +
  
  '<p><strong>Description:</strong> We are researchers at the University of Chicago ' +
  'doing a research study about the limits of human perception. You will be asked ' +
  'to engage with different types of stimuli (such as images and sounds) and ' +
  'indicate whether or not you believe a particular target is present within them. ' +
  'You will also be asked to fill out a couple of questionnaires.</p>' +
  
  '<p>Participation should take approximately 30 minutes.<br>' +
  'Your participation is voluntary.</p>' +
  
  '<p><strong>Incentives:</strong></p>' +  // Placeholder - filled in dynamically
  
  '<p><strong>Risks and Benefits:</strong> Your participation in this study does ' +
  'not involve any risk to you beyond that of everyday life. Taking part in this ' +
  'research study may not benefit you personally beyond learning about psychological ' +
  'research, but we may learn new things that could help others.</p>' +
  
  '<p><strong>Confidentiality:</strong> Any identifiable data or information ' +
  'collected by this study will never be shared outside the research team. ' +
  'De-identified information from this study may be used for future research ' +
  'studies or shared with other researchers for future research without your ' +
  'additional informed consent. We may also upload your data (in both aggregate ' +
  'and individual form) to public data repositories. Your study data will be ' +
  'handled as confidentially as possible. If results of this study are published ' +
  'or presented, your individual name will not be used. If you decide to withdraw ' +
  'from this study, any data already collected will be destroyed.</p>' +
  
  '<p><strong>Contacts and Questions:</strong> If you have questions or concerns ' +
  'about the study, you can contact Jean Matelski Boulware at (312) 860-9260 or ' +
  'at matelskiboulware@uchicago.edu. If you have any questions about your rights ' +
  'as a participant in this research, feel you have been harmed, or wish to discuss ' +
  'other study-related concerns with someone who is not part of the research team, ' +
  'you can contact the University of Chicago Social & Behavioral Sciences ' +
  'Institutional Review Board (IRB) Office by phone at (773) 702-2915, or by ' +
  'email at sbs-irb@uchicago.edu.</p>' +
  '</div>';

// Different incentive descriptions for different recruitment sources
var INCENTIVES = {
  sona: 'You will be compensated 0.5 SONA credits for your participation in this ' +
        'study. You will also be entered into a raffle for a $50 Amazon gift card. ' +
        'Your performance on the study will influence your chances of winning the ' +
        'raffle. The better you do, the higher your chances are to win the gift card.',
  
  prolific: 'You will be entered into a raffle for a $50 Amazon gift card. Your ' +
            'performance on the study will influence your chances of winning the raffle.',
  
  other: 'You will be entered into a raffle for a $50 Amazon gift card. Your ' +
         'performance on the study will influence your chances of winning the raffle. ' +
         'The better you do, the higher your chances are to win the gift card.'
};


// =====================================================================
// SCREEN FACTORY FUNCTIONS
// =====================================================================
// These functions create the jsPsych trial objects for each screen.
// They need access to jsPsych and CONFIG, so they're created inside
// the experiment's main function.


/**
 * Creates all the instruction/info screens for the experiment.
 * 
 * @param {object} jsPsych - The jsPsych instance
 * @returns {object} Object containing all screen trial objects
 */
function createScreens(jsPsych) {
  
  // -----------------------------------------------------------------
  // Helper variables for instruction text
  // -----------------------------------------------------------------
  
  var letter1 = CONFIG.targetLetters[0];  // Usually "S"
  var letter2 = CONFIG.targetLetters[1];  // Usually "X"
  var article1 = getArticle(letter1);     // "an" for S
  var article2 = getArticle(letter2);     // "an" for X
  
  // -----------------------------------------------------------------
  // Storage for participant info
  // -----------------------------------------------------------------
  
  var subjectId = null;
  var experimentSource = null;
  
  // Helper functions to set participant info
  function setSubjectId(id) {
    subjectId = id;
    jsPsych.data.addProperties({ subjectId: id });
  }
  
  function setExperimentSource(source) {
    experimentSource = source;
    jsPsych.data.addProperties({ experimentSource: source });
  }
  
  // -----------------------------------------------------------------
  // 1. SUBJECT SOURCE SCREEN
  // -----------------------------------------------------------------
  // Asks which platform the participant came from (Prolific, Sona, etc.)
  
  var subject_source = {
    type: jsPsychSurveyMultiChoice,
    data: { screen_name: "Subject Source" },
    questions: [{
      prompt: '<div style="text-align:center;">' +
              '<strong>Which platform redirected you to this study?</strong></div>',
      options: ["Prolific", "Sona", "Other"],
      required: true
    }],
    on_finish: function(data) {
      // Get the selected option
      var response = data.response ? Object.values(data.response)[0] : null;
      setExperimentSource(response);
    }
  };
  
  // -----------------------------------------------------------------
  // 2. ID ENTRY SCREEN
  // -----------------------------------------------------------------
  // Asks for participant ID (changes based on their source)
  
  var id_entry = {
    type: jsPsychSurveyText,
    data: { screen_name: "ID Entry" },
    questions: [{ prompt: "", required: true }],
    on_start: function(trial) {
      // Set the prompt based on where they came from
      if (experimentSource === "Prolific") {
        trial.questions[0].prompt = "Please enter your Prolific ID";
      } else if (experimentSource === "Sona") {
        trial.questions[0].prompt = "Please enter your SONA ID";
      } else {
        trial.questions[0].prompt = "Please enter your Email";
      }
    },
    on_finish: function(data) {
      var response = data.response ? Object.values(data.response)[0] : null;
      setSubjectId(response);
    }
  };
  
  // -----------------------------------------------------------------
  // 3. CONSENT SCREEN
  // -----------------------------------------------------------------
  // Shows the IRB consent form and asks for agreement
  
  var consent_screen = {
    type: jsPsychSurveyMultiChoice,
    data: { screen_name: "Consent" },
    preamble: '',  // Set dynamically in on_start
    questions: [{
      prompt: '<div style="text-align:center; font-weight:bold; margin-top:2rem;">' +
              'Do you consent to participate in this study?</div>',
      options: ["Yes, I consent to participate", "No, I do not consent"],
      required: true
    }],
    on_start: function(trial) {
      // Choose incentive text based on source
      var incentiveText;
      if (experimentSource && experimentSource.toLowerCase() === 'sona') {
        incentiveText = INCENTIVES.sona;
      } else if (experimentSource && experimentSource.toLowerCase() === 'prolific') {
        incentiveText = INCENTIVES.prolific;
      } else {
        incentiveText = INCENTIVES.other;
      }
      
      // Insert incentive text into consent form
      var consentWithIncentive = CONSENT_TEXT.replace(
        '<p><strong>Incentives:</strong></p>',
        '<p><strong>Incentives:</strong> ' + incentiveText + '</p>'
      );
      
      // Build the full preamble with header
      trial.preamble = '<div style="text-align:center; max-width:56rem; margin:0 auto;">' +
        UCHICAGO_HEADER +
        '<h2>Consent to Participate in Research</h2>' +
        consentWithIncentive +
        '</div>';
    },
    on_finish: function(data) {
      var response = data.response ? Object.values(data.response)[0] : null;
      
      // If they don't consent, end immediately without saving data
      if (response !== "Yes, I consent to participate") {
        jsPsych.endExperiment(
          '<div style="text-align:center; max-width:44rem; margin:0 auto;">' +
          UCHICAGO_HEADER +
          '<h2>Thank You</h2>' +
          '<p>Thank you for considering participation in this study.</p>' +
          '<p style="margin-top:2rem; font-weight:bold;">You may now close this tab.</p>' +
          '</div>'
        );
        return;  // Don't save any data for non-consent
      }
      
      saveJsonFile('Consent', { consented: true });
    }
  };
  
  // -----------------------------------------------------------------
  // 4. EXPERIMENT INTRODUCTION
  // -----------------------------------------------------------------
  // Explains the task to the participant
  
  var experiment_intro = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Experiment Intro" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>About This Experiment</h2>' +
      
      '<p>In this experiment you will see a series of short videos. Each video ' +
      'starts as a white noise image. As each video progresses, it will develop ' +
      'into either ' + article1 + ' <strong>' + letter1 + '</strong> or ' + 
      article2 + ' <strong>' + letter2 + '</strong>.</p>' +
      
      '<p>Your task is to identify which letter the video is progressing towards.</p>' +
      
      '<p>Press the <strong>' + letter1 + '</strong> key if you believe the video ' +
      'is progressing towards ' + article1 + ' <strong>' + letter1 + '</strong>.</p>' +
      
      '<p>Press the <strong>' + letter2 + '</strong> key if you believe the video ' +
      'is progressing towards ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
      
      '<p>Your performance depends on both accuracy and speed. You will only be ' +
      'rewarded for correct responses, so try to respond as accurately as possible. ' +
      'If you respond correctly, then faster responses result in a higher score. Remember, ' +
      'your performance influences your chances to win the raffle.</p>' +
      
      '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      saveJsonFile('Experiment Intro', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 5. PRACTICE INTRODUCTION
  // -----------------------------------------------------------------
  // Introduces the practice phase
  
  var practice_intro = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Practice Intro" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>Practice Trials</h2>' +
      
      '<p>You will now complete several practice trials to familiarize yourself ' +
      'with the task.</p>' +
      
      '<p>In these practice trials you will see a series of short videos. Each ' +
      'video starts as a white noise image. As each video progresses, it will ' +
      'develop into either ' + article1 + ' <strong>' + letter1 + '</strong> or ' + 
      article2 + ' <strong>' + letter2 + '</strong>.</p>' +
      
      '<p>Your task is to identify which letter the video is progressing towards.</p>' +
      
      '<p>Press the <strong>' + letter1 + '</strong> key if you believe the video ' +
      'is progressing towards ' + article1 + ' <strong>' + letter1 + '</strong>.</p>' +
      
      '<p>Press the <strong>' + letter2 + '</strong> key if you believe the video ' +
      'is progressing towards ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
      
      '<p>Your performance depends on both accuracy and speed. You will only be ' +
      'rewarded for correct responses, so try to respond as accurately as possible. ' +
      'If you respond correctly, then faster responses result in a higher score.</p>' +
      
      '<p>Press <strong>' + CONFIG.continueKey + '</strong> to start the practice trials.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      saveJsonFile('Practice Intro', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 6. PRACTICE COMPLETE
  // -----------------------------------------------------------------
  // Shown after practice trials are done
  
  var practice_complete = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Practice Complete" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>Practice Complete</h2>' +
      '<p>Great job! You have completed the practice trials.</p>' +
      '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue to the main experiment.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      flushTrials('practice');
      saveJsonFile('Practice Complete', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 7. ACTUAL TRIALS INTRODUCTION
  // -----------------------------------------------------------------
  // Introduces the main experiment
  
  var actual_intro = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Actual Intro" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>Main Experiment</h2>' +
      
      '<p>You will now begin the main experiment. This consists of two blocks of ' +
      'trials with a short break in between.</p>' +
      
      '<p>As a reminder, each video starts as a white noise image. As each video ' +
      'progresses, it will develop into either ' + article1 + ' <strong>' + 
      letter1 + '</strong> or ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
      
      '<p>Your task is to identify which letter the video is progressing towards.</p>' +
      
      '<p>Press the <strong>' + letter1 + '</strong> key if you believe the video ' +
      'is progressing towards ' + article1 + ' <strong>' + letter1 + '</strong>.</p>' +
      
      '<p>Press the <strong>' + letter2 + '</strong> key if you believe the video ' +
      'is progressing towards ' + article2 + ' <strong>' + letter2 + '</strong>.</p>' +
      
      '<p>Your performance depends on both accuracy and speed. You will only be ' +
      'rewarded for correct responses, so try to respond as accurately as possible. ' +
      'If you respond correctly, then faster responses result in a higher score. Remember, ' +
      'your performance influences your chances to win the raffle.</p>' +
      
      '<p>Press <strong>' + CONFIG.continueKey + '</strong> to begin.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      saveJsonFile('Actual Intro', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 8. BREAK BETWEEN BLOCKS
  // -----------------------------------------------------------------
  // Short break between block 1 and block 2
  
  var break_screen = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Break" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>Break</h2>' +
      '<p>You have completed the first block of trials.</p>' +
      '<p>Take a short break if you like, then press <strong>' + 
      CONFIG.continueKey + '</strong> to continue.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      saveJsonFile('Break Screen', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 9. ACTUAL TRIALS COMPLETE
  // -----------------------------------------------------------------
  // Shown after all video trials are done
  
  var actual_complete = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Actual Complete" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>Trials Complete</h2>' +
      '<p>You have completed all video trials.</p>' +
      '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      flushTrials('actual');
      saveJsonFile('Actual Complete', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 10. QUESTIONNAIRES INTRODUCTION
  // -----------------------------------------------------------------
  
  var questionnaires_intro = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Questionnaires Intro" },
    stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
      '<h2>Questionnaires</h2>' +
      '<p>You will now be asked to fill out a brief questionnaire about your ' +
      'personal experiences.</p>' +
      '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p>' +
      '</div>',
    choices: [CONFIG.continueKey],
    on_finish: function(data) {
      saveJsonFile('Questionnaires Intro', { reaction_time_ms: data.rt });
    }
  };
  
  // -----------------------------------------------------------------
  // 11. CLOSING SCREEN
  // -----------------------------------------------------------------
  // Thank you message at the end
  
  var closing = {
    type: jsPsychHtmlKeyboardResponse,
    data: { screen_name: "Closing" },
    stimulus: '<div style="text-align:center; max-width:44rem; margin:0 auto;">' + 
      UCHICAGO_HEADER +
      '<h2>Questionnaires Complete</h2>' +
      '<p style="margin-top:2rem;">Press any key to continue.</p>' +
      '</div>',
    on_finish: function(data) {
      // Save the closing screen data
      saveJsonFile('Closing Screen', { reaction_time_ms: data.rt });
      
      // End experiment with final message
      // Cognition.run saves all data when endExperiment is called
      jsPsych.endExperiment(
        '<div style="text-align:center; max-width:44rem; margin:0 auto;">' +
        UCHICAGO_HEADER +
        '<h2>Experiment Complete</h2>' +
        '<p>Thank you for your participation in this study.</p>' +
        '<p style="color:#767676;">Your responses have been saved.</p>' +
        '<p style="margin-top:2rem; font-weight:bold;">You may now close this tab.</p>' +
        '</div>'
      );
    }
  };
  
  // -----------------------------------------------------------------
  // 12. VIDEO PRELOAD SCREEN
  // -----------------------------------------------------------------
  // Shows progress bar while videos are loading
  
  var preload_videos = {
    type: jsPsychPreload,
    data: { screen_name: "Preload" },
    video: function() {
      return getAllVideoUrls();
    },
    show_progress_bar: true,
    message: '<div style="text-align:center; margin-top:3rem;">' +
      '<p style="font-size:1.3rem; color:#800000;">Loading experimental stimuli...</p>' +
      '<p style="font-size:0.95rem; color:#767676;">This may take a moment.</p>' +
      '</div>'
  };
  
  // -----------------------------------------------------------------
  // Return all screens as an object
  // -----------------------------------------------------------------
  
  return {
    subject_source: subject_source,
    id_entry: id_entry,
    consent_screen: consent_screen,
    experiment_intro: experiment_intro,
    practice_intro: practice_intro,
    practice_complete: practice_complete,
    actual_intro: actual_intro,
    break_screen: break_screen,
    actual_complete: actual_complete,
    questionnaires_intro: questionnaires_intro,
    closing: closing,
    preload_videos: preload_videos
  };
}


console.log('[screens.js] Loaded successfully');
