// Central configuration for stimuli and responses so they can be easily tweaked

const CONFIG = {
    
  // Data saving mode options:
  //   'none'      - no saving at all
  //   'local'     - immediate per-step JSON downloads (quite verbose)
  //   'localZip'  - accumulate JSON and download one zip at the end
  //   'show'      - show jsPsych.data.displayData() at the end
  //   'cognition' - cognition.run auto-saves jsPsych data; custom computed
  //                 data is injected into jsPsych's data store
  dataSaveMode: 'cognition',

  // The letters that the stimuli videos resolve toward (used in instructions text)
  targetLetters: ["S", "X"],

  continueKey: "k",

  // Practice stimuli configuration
  practice: {
    // Subfolder name for practice video stimuli (appended to stimuliBaseUrl or used as relative path)
    folder: "practice-stimuli",
    
    // Number of videos per condition (video1.mp4 .. videoN.mp4)
    nPerCondition: 5,
    
    // Starting index for the practice stimuli
    stimulusStartIndex: 100
  },

  // Main (actual) stimuli configuration
  main: {
    // Subfolder name for main video stimuli (appended to stimuliBaseUrl or used as relative path)
    folder: "actual-stimuli",
    
    // Number of videos per condition (video1.mp4 .. videoN.mp4)
    nPerCondition: 5,

  }
};

// Build the relative URL for an obfuscated stimulus video.
// Stimuli are uploaded alongside the experiment on cognition.run.
function getStimulusUrl(hexId) {
  return `assets/stimuli/v/${hexId}.mp4`;
}
