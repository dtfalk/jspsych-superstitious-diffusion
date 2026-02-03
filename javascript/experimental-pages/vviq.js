/* Simplified VVIQ questionnaire
 * Source texts adapted from the VVIQ2 (original wording preserved)
 * Converted to a single, simple Likert-style survey for this experiment.
 */

const vviq_prompts = [
  'The exact contour of face, head, shoulders and body.',
  'Characteristic poses of head, attitudes of body etc.',
  'The precise carriage, length of step, etc. in walking.',
  'The different colours worn in some familiar clothes.',

  'The sun rising above the horizon into a hazy sky.',
  'The sky clears and surrounds the sun with blueness.',
  'Clouds. A storm blows up with flashes of lightning.',
  'A rainbow appears.',

  'The overall appearance of the shop from the opposite side of the road.',
  'A window display including colours, shapes and details of individual items for sale.',
  'You are near the entrance. The colour, shape and details of the door.',
  'You enter the shop and go to the counter. The counter assistant serves you.',

  'The contours of the landscape.',
  'The colour and shape of the trees.',
  'The colour and shape of the lake.',
  'A strong wind blows on the trees and on the lake causing waves in the water.',

  'You observe the heavy traffic travelling at maximum speed around your car.',
  'Your car accelerates to overtake the traffic directly in front of you.',
  'A large truck is flashing its headlights directly behind.',
  'You see a broken-down vehicle beside the road. Its lights are flashing.',

  'The overall appearance and color of the water, surf, and sky.',
  'Bathers are swimming and splashing about in the water. Some are playing with a brightly colored beach ball.',
  'An ocean liner crosses the horizon. It leaves a trail of smoke in the blue sky.',
  'A beautiful air balloon appears with four people aboard. The balloon drifts past you.',

  'The overall appearance of the station viewed from in front of the main entrance.',
  'You walk into the station. The color, shape and details of the entrance hall.',
  'You approach the ticket office, go to a vacant counter and purchase your ticket.',
  'You walk to the platform and observe other passengers and the railway lines. A train arrives.',

  'The overall appearance and design of the garden.',
  'The color and shape of the bushes and shrubs.',
  'The color and appearance of the flowers.',
  'Some birds fly down onto the lawn and start pecking for food.'
];

const vviq_scale_labels = [
  'No image at all',
  'Vague and dim',
  'Moderately clear and lively',
  'Clear and reasonably vivid',
  'Perfectly clear and as vivid as real seeing'
];

// Build per-block instruction trials and block surveys (4 items per block)
function mkLikertQuestions(promptsArray) {
  return promptsArray.map(p => ({ prompt: p, labels: vviq_scale_labels }));
}

const vviq_instr_block1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of some relative or friend whom you frequently see (but who is not with you at present) and consider carefully the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block1 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(0, 4))
};

const vviq_instr_block2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of a rising sun. Consider carefully the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block2 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(4, 8))
};

const vviq_instr_block3 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of the front of a shop which you often go to. Consider the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block3 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(8, 12))
};

const vviq_instr_block4 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of a country scene which involves trees, mountains and a lake. Consider the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block4 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(12, 16))
};

const vviq_instr_block5 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of being driven in a fast-moving automobile by a relative or friend along a major highway. Consider the picture that comes into your mind\'s eye.',
  choices: [' ']
};

const vviq_block5 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(16, 20))
};

const vviq_instr_block6 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of a beach by the ocean on a warm summer\'s day. Consider the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block6 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(20, 24))
};

const vviq_instr_block7 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of a railway station. Consider the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block7 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(24, 28))
};

const vviq_instr_block8 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Think of a garden with lawns, bushes, flowers and shrubs. Consider the picture that comes before your mind\'s eye.',
  choices: [' ']
};

const vviq_block8 = {
  type: jsPsychSurveyLikert,
  questions: mkLikertQuestions(vviq_prompts.slice(28, 32))
};

const vviq_trials = [
  vviq_instr_block1, vviq_block1,
  vviq_instr_block2, vviq_block2,
  vviq_instr_block3, vviq_block3,
  vviq_instr_block4, vviq_block4,
  vviq_instr_block5, vviq_block5,
  vviq_instr_block6, vviq_block6,
  vviq_instr_block7, vviq_block7,
  vviq_instr_block8, vviq_block8
];

