=====================================================================
COGNITION.RUN EXTERNAL FILES — DEVELOPMENT VERSION
=====================================================================

This is the DEVELOPMENT version for testing.
Condition can be set manually or via an on-screen picker.

DEV SETTINGS (in config.js):
  DEV_CONDITION = "shared_paths"   or "vanilla_paths"
  SHOW_CONDITION_PICKER = true     or false

If SHOW_CONDITION_PICKER is true, a screen appears at the start
letting you choose which condition folder to test:
  shared_paths → stimuli/shared_paths/
  vanilla_paths → stimuli/vanilla_paths/

UPLOAD ORDER (External JS files must be loaded in this order):
1. plugin-loader.js  - Loads jsPsych plugins from unpkg CDN
2. config.js         - DEV settings, STIMULUS_INDICES
3. stimulus-loader.js - loadStimuli(), block splitting logic
4. questionnaires.js  - Tellegen scale, createTellegenTrial factory

EXTERNAL CSS:
1. styles.css        - All experiment styling

TASK CODE:
- experiment-refactored.js (paste into Cognition Task Code editor)

=====================================================================
STIMULI FILES
=====================================================================

Cognition.run file limits (check your plan):
- Free:        100 files, 2MB each
- Individual:  500 files, 100MB each
- Teams:       10,000 files, 250MB each

File naming: S_42.mp4, X_42.mp4

If you hit limits, consider external hosting (Vimeo, etc.)

STIMULUS_PATH_PREFIX in stimulus-loader.js:
- Set to '' for flat filenames
- Set to 'stimuli/' if files show with that prefix
- Test one file first, check browser console for 404s

=====================================================================
SETUP STEPS
=====================================================================

1. Run prepare-stimuli.py:
   python scripts/prepare-stimuli.py --seed 42 source_folder output_folder
   
2. Copy printed indices into config.js STIMULUS_INDICES

3. Upload stimulus videos (S_*.mp4, X_*.mp4) to Cognition Stimuli

4. Upload external JS/CSS files in order above

5. Paste experiment-refactored.js into Task Code

6. Test with preview - check console for errors