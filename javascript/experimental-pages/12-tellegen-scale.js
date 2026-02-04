const tellegen_questions = [
  { prompt: 'Sometimes I feel and experience things as I did when I was a child.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I can be greatly moved by eloquent or poetic language.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'While watching a movie, a T.V. show, or a play, I may become so involved that I forget about myself and my surroundings and experience the story as if I were taking part in it.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'If I stare at a picture and then look away from it, I can sometimes “see” an image of the picture, almost as if I were looking at it.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Sometimes I feel as if my mind could envelop the whole world.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I like to watch cloud shapes change in the sky.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'If I wish, I can imagine (or daydream) some things so vividly that they hold my attention as a good movie or story does.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I think I really know what some people mean when they talk about mystical experiences.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I sometimes “step outside” my usual self and experience an entirely different state of being.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Textures - such as wool, sand, wood - sometimes remind me of colors or music.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Sometimes I experience things as if they were doubly real.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: "When I listen to music, I can get so caught up in it that I don't notice anything else.", options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'If I wish, I can imagine that my body is so heavy that I could not move it if I wanted to.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I can often somehow sense the presence of another person before I actually see or hear her/him/them.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'The crackle and flames of a wood fire stimulate my imagination.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'It is sometimes possible for me to be completely immersed in nature or in art and to feel as if my whole state of consciousness has somehow been temporarily altered.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Different colors have distinctive and special meaning to me.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I am able to wander off into my own thoughts while doing a routine task, and then find a few minutes later that I have completed it.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I can sometimes recollect certain past experiences in my life with such clarity and vividness that it is like living them again or almost so.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Things that might seem meaningless to others often make sense to me.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'While acting in a play, I think I could really feel the emotions of the character and “become” her/him for the time being, forgetting both myself and the audience.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: "My thoughts often don't occur as words but as visual images.", options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I often take delight in small things (like; the five-pointed star shape that appears when you cut an apple across the core or the colors in soap bubbles).', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'When listening to organ music or other powerful music I sometimes feel as if I am being lifted into the sky.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Sometimes I can change noise into music by the way I listen to it.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Some of my most vivid memories are called up by scents or sounds.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Certain pieces of music remind me of pictures or moving patterns of color.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I often know what someone is going to say before he/she/they says it.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: "I often have 'physical memories'; for example, after I've been swimming, I may feel as if I'm in the water.", options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'The sound of a voice can be so fascinating to me that I can just go on listening to it.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'At times I somehow feel the presence of someone who is not physically there.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'Sometimes thoughts and images come to me without the slightest effort on my part.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I find that different odors have different colors.', options: ['0 - Never', '1', '2', '3 - Always'], required: true },
  { prompt: 'I can be deeply moved by a sunset.', options: ['0 - Never', '1', '2', '3 - Always'], required: true }
];

const tellegen_questionnaire = {
  type: jsPsychSurveyMultiChoice,
  preamble: `
    <style>
      .jspsych-survey-multi-choice-question { margin-bottom: 2rem; }
      .jspsych-survey-multi-choice-option { display: block; margin: 0.5rem 0; }
      .jspsych-survey-multi-choice-option input { margin-right: 0.5rem; }
    </style>
    <div style="max-width: 50rem; margin: 0 auto; text-align: left;">
      <h1 style="text-align: center; margin-bottom: 1.5rem;">Personal Attitudes and Experiences</h1>
      <p style="margin-bottom: 2rem;">This questionnaire consists of questions about experiences that you may have had in your life. We are interested in how often you have these experiences. It is important, however, that your answers show how often these experiences happen to you when you are not under the influence of alcohol or drugs.</p>
    </div>
  `,
  questions: tellegen_questions,
  randomize_question_order: false,
  on_start: function(trial) {
    trial.start_time = performance.now()
  },
  on_finish: function(data) {
    const end_time = performance.now()
    const responses = data.response || {}
    
    const questions_data = tellegen_questions.map((q, i) => ({
      question_number: i + 1,
      question_text: q.prompt,
      response: responses[`Q${i}`] || null,
      score: responses[`Q${i}`] ? parseInt(responses[`Q${i}`][0]) : null
    }))
    
    saveJsonFile('Tellegen Responses', {
      start_timestamp: data.start_time,
      end_timestamp: end_time,
      reaction_time_ms: data.rt,
      questions: questions_data
    })
  }
};

// Instructions are now in the preamble of the questionnaire itself
