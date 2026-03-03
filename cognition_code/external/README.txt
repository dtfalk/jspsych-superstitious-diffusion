=====================================================================
COGNITION.RUN EXTERNAL FILES
=====================================================================

This folder contains all the JavaScript and CSS files needed to run
the experiment on Cognition.run.


=====================================================================
FILE OVERVIEW
=====================================================================

EXTERNAL JS FILES (upload in this order):

  1. plugin-loader.js     Loads jsPsych plugins from CDN
                          (Must be first - other files depend on it)

  2. config.js            Settings and configuration
                          - DEV_MODE switch
                          - Condition settings
                          - STIMULUS_INDICES (list of video numbers)

  3. data-recording.js    Records trial data
                          - recordVideoTrial() function
                          - Calculates timing metrics
                          - Classifies responses (hit, miss, etc.)

  4. stimulus-loader.js   Builds video URL arrays
                          - loadStimuli() function
                          - Splits trials into two blocks
                          - Handles preload URLs

  5. screens.js           All instruction screens
                          - Consent form
                          - Experiment intro
                          - Practice intro
                          - Break between blocks
                          - Closing screen

  6. video-trials.js      Video trial logic
                          - Practice trial structure
                          - Actual trial structure
                          - Timestamp recording

  7. questionnaires.js    Tellegen Absorption Scale
                          - 34-item questionnaire

  8. dev.js               [OPTIONAL] Development tools
                          - Condition picker screen
                          - Only needed when DEV_MODE = true

EXTERNAL CSS:

  styles.css              All experiment styling


TASK CODE (paste into Cognition.run):

  experiment.js           Main experiment file
                          - Initializes jsPsych
                          - Builds timeline
                          - Runs experiment


=====================================================================
CONFIGURATION (in config.js)
=====================================================================

MASTER SWITCHES:

  DEV_MODE = true         Development mode
                          - Shows condition picker (if enabled)
                          - Limits stimuli for quick testing

  DEV_MODE = false        Production mode
                          - Uses all stimuli
                          - No condition picker

  RANDOMIZE_CONDITION     When true: 50/50 random assignment
                          When false: use FIXED_CONDITION

  FIXED_CONDITION         "shared_paths" or "vanilla_paths"
                          Used when RANDOMIZE_CONDITION = false


TYPICAL SETUPS:

  Testing:
    DEV_MODE = true

  Run one condition only:
    DEV_MODE = false
    RANDOMIZE_CONDITION = false
    FIXED_CONDITION = "shared_paths"

  Full study (random assignment):
    DEV_MODE = false
    RANDOMIZE_CONDITION = true


=====================================================================
VIDEO FILE NAMING
=====================================================================

Videos must be named: {condition}_{letter}_{number}.mp4

Examples:
  shared_paths_S_10.mp4      Shared paths, letter S, stimulus #10
  shared_paths_X_10.mp4      Shared paths, letter X, stimulus #10
  vanilla_paths_S_42.mp4     Vanilla paths, letter S, stimulus #42
  vanilla_paths_X_42.mp4     Vanilla paths, letter X, stimulus #42


=====================================================================
STIMULUS_INDICES (in config.js)
=====================================================================

The STIMULUS_INDICES object lists which video numbers exist:

  var STIMULUS_INDICES = {
    shared_paths: {
      actual: [10, 16, 27, ...],     // Numbers for actual trials
      practice: [20, 85, 152, ...]   // Numbers for practice trials
    },
    vanilla_paths: {
      actual: [10, 16, 27, ...],
      practice: [20, 85, 152, ...]
    }
  };

Generate these indices by running:
  python scripts/generate-indices.py stimuli/


=====================================================================
SETUP STEPS
=====================================================================

1. Generate videos and get index list:
   python scripts/prepare-stimuli.py source_folder output_folder

2. Update STIMULUS_INDICES in config.js with the indices

3. Upload videos to Cognition.run Stimuli section

4. Upload external JS files (in order above)

5. Upload styles.css

6. Paste experiment.js into Task Code editor

7. Test with Preview - check browser console for errors
