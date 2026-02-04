const tellegen_questions = [
  { prompt: 'Sometimes I feel and experience things as I did when I was a child.', options: ['True', 'False'], required: true },
  { prompt: 'I can be greatly moved by eloquent or poetic language.', options: ['True', 'False'], required: true },
  { prompt: 'While watching a movie, a T.V. show, or a play, I may become so involved that I forget about myself and my surroundings and experience the story as if I were taking part in it.', options: ['True', 'False'], required: true },
  { prompt: 'If I stare at a picture and then look away from it, I can sometimes “see” an image of the picture, almost as if I were looking at it.', options: ['True', 'False'] },
  { prompt: 'Sometimes I feel as if my mind could envelop the whole world.', options: ['True', 'False'] },
  { prompt: 'I like to watch cloud shapes change in the sky.', options: ['True', 'False'] },
  { prompt: 'If I wish, I can imagine (or daydream) some things so vividly that they hold my attention as a good movie or story does.', options: ['True', 'False'] },
  { prompt: 'I think I really know what some people mean when they talk about mystical experiences.', options: ['True', 'False'] },
  { prompt: 'I sometimes “step outside” my usual self and experience an entirely different state of being.', options: ['True', 'False'] },
  { prompt: 'Textures - such as wool, sand, wood - sometimes remind me of colors or music.', options: ['True', 'False'] },
  { prompt: 'Sometimes I experience things as if they were doubly real.', options: ['True', 'False'] },
  { prompt: "When I listen to music, I can get so caught up in it that I don't notice anything else.", options: ['True', 'False'] },
  { prompt: 'If I wish, I can imagine that my body is so heavy that I could not move it if I wanted to.', options: ['True', 'False'] },
  { prompt: 'I can often somehow sense the presence of another person before I actually see or hear her/him/them.', options: ['True', 'False'] },
  { prompt: 'The crackle and flames of a wood fire stimulate my imagination.', options: ['True', 'False'] },
  { prompt: 'It is sometimes possible for me to be completely immersed in nature or in art and to feel as if my whole state of consciousness has somehow been temporarily altered.', options: ['True', 'False'] },
  { prompt: 'Different colors have distinctive and special meaning to me.', options: ['True', 'False'] },
  { prompt: 'I am able to wander off into my own thoughts while doing a routine task, and then find a few minutes later that I have completed it.', options: ['True', 'False'] },
  { prompt: 'I can sometimes recollect certain past experiences in my life with such clarity and vividness that it is like living them again or almost so.', options: ['True', 'False'] },
  { prompt: 'Things that might seem meaningless to others often make sense to me.', options: ['True', 'False'] },
  { prompt: 'While acting in a play, I think I could really feel the emotions of the character and “become” her/him for the time being, forgetting both myself and the audience.', options: ['True', 'False'] },
  { prompt: "My thoughts often don't occur as words but as visual images.", options: ['True', 'False'] },
  { prompt: 'I often take delight in small things (like; the five-pointed star shape that appears when you cut an apple across the core or the colors in soap bubbles).', options: ['True', 'False'] },
  { prompt: 'When listening to organ music or other powerful music I sometimes feel as if I am being lifted into the sky.', options: ['True', 'False'] },
  { prompt: 'Sometimes I can change noise into music by the way I listen to it.', options: ['True', 'False'] },
  { prompt: 'Some of my most vivid memories are called up by scents or sounds.', options: ['True', 'False'] },
  { prompt: 'Certain pieces of music remind me of pictures or moving patterns of color.', options: ['True', 'False'] },
  { prompt: 'I often know what someone is going to say before he/she/they says it.', options: ['True', 'False'] },
  { prompt: "I often have 'physical memories'; for example, after I've been swimming, I may feel as if I'm in the water.", options: ['True', 'False'] },
  { prompt: 'The sound of a voice can be so fascinating to me that I can just go on listening to it.', options: ['True', 'False'] },
  { prompt: 'At times I somehow feel the presence of someone who is not physically there.', options: ['True', 'False'] },
  { prompt: 'Sometimes thoughts and images come to me without the slightest effort on my part.', options: ['True', 'False'] },
  { prompt: 'I find that different odors have different colors.', options: ['True', 'False'] },
  { prompt: 'I can be deeply moved by a sunset.', options: ['True', 'False'], required: true }
];

const tellegen_trial = {
  type: jsPsychSurveyMultiChoice,
  questions: tellegen_questions,
  randomize_question_order: false
};

// Intro text for Tellegen (from user). You can edit this string
// to adjust the instructions that appear immediately before the
// questionnaire.
const telleganScaleText = `
Please respond True or False to the following questions.

Take your time and answer every item.

Press the spacebar to begin.
`;

const tellegen_instruction = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: telleganScaleText,
  choices: [" "]
};

// tellegen_instruction then tellegen_trial will be pushed into the timeline
