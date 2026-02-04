// Central configuration for stimuli and responses so they can be easily tweaked

const CONFIG = {
    
  // Data saving mode options:
  //   'none'     - no saving at all
  //   'local'    - immediate per-step JSON downloads (quite verbose)
  //   'localZip' - accumulate JSON and download one zip at the end
  //   'show'     - show jsPsych.data.displayData() at the end
  //   'server'   - POST to a backend you provide (Node/Python/etc.)
  dataSaveMode: 'local',

  // The letters that the stimuli videos resolve toward (used in instructions text)
  targetLetters: ["r", "s"],

  // Practice stimuli configuration
  practice: {
    // Base folder for practice video stimuli
    folder: "assets/stimuli/practice-stimuli",
    
    // Number of videos per condition (video1.mp4 .. videoN.mp4)
    nPerCondition: 5,
    
    // Starting index for the practice stimuli
    stimulusStartIndex: 100
  },

  // Main (actual) stimuli configuration
  main: {
    // Base folder for main video stimuli
    folder: "assets/stimuli/actual-stimuli",
    
    // Number of videos per condition (video1.mp4 .. videoN.mp4)
    nPerCondition: 5,

  }
};
