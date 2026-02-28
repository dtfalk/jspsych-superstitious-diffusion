// =====================================================================
// questionnaires.js — Questionnaire definitions
// Upload this as External JS #5 in Cognition.run
//
// To add a new questionnaire:
// 1. Define the scale and questions array
// 2. Create the jsPsych trial object
// 3. Export it by adding to QUESTIONNAIRES object at bottom
// 4. Add to timeline in experiment.js
// =====================================================================

// ---------------------------------------------------------------------
// Tellegen Absorption Scale
// ---------------------------------------------------------------------

var TELLEGEN_SCALE = ['0 - Never', '1 - Rarely', '2 - Often', '3 - Always'];

var TELLEGEN_QUESTIONS = [
  { prompt: 'Sometimes I feel and experience things as I did when I was a child.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I can be greatly moved by eloquent or poetic language.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'While watching a movie, a TV show, or a play, I may sometimes become so involved that I forget about myself and my surroundings and experience the story as if it were real and as if I were taking part in it.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'If I stare at a picture and then look away from it, I can sometimes "see" an image of the picture, almost as if I were still looking at it.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Sometimes I feel as if my mind could envelop the whole earth.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I like to watch cloud shapes in the sky.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'If I wish, I can imagine (or daydream) some things so vividly that they hold my attention as a good movie or a story does.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I think I really know what some people mean when they talk about mystical experiences.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I sometimes "step outside" my usual self and experience an entirely different state of being.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Textures such as wool, sand, wood sometimes remind me of colors or music.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Sometimes I experience things as if they were doubly real.', options: TELLEGEN_SCALE, required: true },
  { prompt: "When I listen to music, I can get so caught up in it that I don't notice anything else.", options: TELLEGEN_SCALE, required: true },
  { prompt: 'If I wish, I can imagine that my whole body is so heavy that I could not move it if I wanted to.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I can often somehow sense the presence of another person before I actually see or hear him/her.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'The crackle and flames of a woodfire stimulate my imagination.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'It is sometimes possible for me to be completely immersed in nature or art and to feel as if my whole state of consciousness has somehow been temporarily altered.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Different colors have distinctive and special meanings to me.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I am able to wander off into my own thought while doing a routine task and actually forget that I am doing the task, and then find a few minutes later that I have completed it.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I can sometimes recollect certain past experiences in my life with such clarity and vividness that it is like living them again or almost so.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Things that might seem meaningless to others often make sense to me.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'While acting in a play, I think I would really feel the emotions of the character and "become" him/her for the time being, forgetting both myself and the audience.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'My thoughts often do not occur as words but as visual images.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I often take delight in small things (like the five pointed star shape that appears when you cut an apple across the core or the colors in soap bubbles).', options: TELLEGEN_SCALE, required: true },
  { prompt: 'When listening to organ music or other powerful music I sometimes feel as if I am being lifted into the air.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Sometimes I can change noise into music by the way I listen to it.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Some of my most vivid memories are called up by scents and smells.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Certain pieces of music remind me of pictures or moving patterns of color.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I often know what someone is going to say before he or she says it.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I often have "physical memories"; for example, after I have been swimming I may still feel as if I am in the water.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'The sound of a voice can be so fascinating to me that I can just go on listening to it.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'At times I somehow feel the presence of someone who is not physically there.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'Sometimes thoughts and images come to me without the slightest effort on my part.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I find that different odors have different colors.', options: TELLEGEN_SCALE, required: true },
  { prompt: 'I can be deeply moved by a sunset.', options: TELLEGEN_SCALE, required: true }
];

// Factory function - returns trial object when called (after plugins loaded)
function createTellegenTrial(jsPsych, saveJsonFile) {
  return {
    type: jsPsychSurveyMultiChoice,
    data: { screen_name: "Tellegen Questionnaire" },
    preamble: '<style>' +
      '.jspsych-survey-multi-choice-question { margin-bottom: 2rem; }' +
      '.jspsych-survey-multi-choice-option { display: block; margin: 0.5rem 0; }' +
      '.jspsych-survey-multi-choice-option input { margin-right: 0.5rem; }' +
      '</style>' +
      '<div style="max-width: 56rem; margin: 0 auto; text-align: left;">' +
      '<h1 style="text-align: center; margin-bottom: 1.5rem;">Personal Attitudes and Experiences</h1>' +
      '<p style="margin-bottom: 2rem;">This questionnaire consists of questions about experiences that you may have had in your life. We are interested in how often you have these experiences. It is important, however, that your answers show how often these experiences happen to you when you are not under the influence of alcohol or drugs.</p>' +
      '</div>',
    questions: TELLEGEN_QUESTIONS,
    randomize_question_order: false,
    on_finish: function(data) {
      var end_timestamp = performance.now();
      var start_timestamp = end_timestamp - data.rt;
      var responses = data.response || {};
      var questions_data = TELLEGEN_QUESTIONS.map(function(q, i) {
        return {
          question_number: i + 1,
          question_text: q.prompt,
          response: responses['Q' + i] || null,
          score: responses['Q' + i] ? parseInt(responses['Q' + i][0]) : null
        };
      });

      var tellegen_scores = questions_data.map(function(q) { return q.score; });
      var tellegen_total = tellegen_scores.reduce(function(sum, s) { return sum + (s || 0); }, 0);
      
      try {
        jsPsych.data.getLastTrialData().addToAll({
          tellegen_scores: tellegen_scores,
          tellegen_total: tellegen_total,
          tellegen_questions: questions_data
        });
      } catch (e) {
        console.warn('Could not inject Tellegen data:', e);
      }

      saveJsonFile('Tellegen Responses', {
        start_timestamp: start_timestamp,
        end_timestamp: end_timestamp,
        reaction_time_ms: data.rt,
        questions: questions_data
      });
    }
  };
}

// ---------------------------------------------------------------------
// Add more questionnaires here following same pattern:
// 1. Define SCALE and QUESTIONS arrays
// 2. Create factory function that returns trial object
// 3. Add to QUESTIONNAIRES object below
// ---------------------------------------------------------------------

// Export all questionnaire factories
var QUESTIONNAIRES = {
  tellegen: createTellegenTrial
  // vviq: createVviqTrial,  // add more here
};
