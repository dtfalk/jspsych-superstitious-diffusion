// Central configuration for stimuli and responses so they can be easily tweaked

const STIMULUS_CONFIG = {
  // The letters that the stimuli resolve toward (used in instructions text)
  targetLetters: ["j", "k"],

  // Keyboard keys participants use to respond (used in video trials)
  responseKeys: ["j", "k"],

  // Practice stimuli configuration
  practice: {
    // Base folder for practice video stimuli
    folder: "assets/stimuli/practice-stimuli",
    // Subfolders / conditions within the base folder (e.g., "s" and "r")
    conditions: ["s", "r"],
    // Number of videos per condition (video1.mp4 .. videoN.mp4)
    nPerCondition: 5
  },

  // Main (actual) stimuli configuration
  main: {
    // Base folder for main video stimuli
    folder: "assets/stimuli/actual-stimuli",
    // Subfolders / conditions within the base folder
    conditions: ["s", "r"],
    // Number of videos per condition (video1.mp4 .. videoN.mp4)
    nPerCondition: 5
  }
};
