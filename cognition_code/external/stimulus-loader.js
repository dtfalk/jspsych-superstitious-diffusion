// =====================================================================
// stimulus-loader.js — Builds the lists of video stimuli
// =====================================================================
//
// This file:
//   - Builds the arrays of video URLs for practice and actual trials
//   - Splits actual trials into two balanced blocks
//   - Ensures paired stimuli (S and X from same seed) go to different blocks
//
// IMPORTANT: This file must be loaded after config.js because it uses
// CONFIG.condition to know which condition's videos to load.
//
// =====================================================================


// =====================================================================
// CONFIGURATION
// =====================================================================

// Path prefix for video files (usually empty on Cognition.run)
// If videos are in a subfolder, set this to "subfolder/"
var STIMULUS_PATH_PREFIX = '';


// =====================================================================
// STIMULUS ARRAYS
// =====================================================================
// These arrays will be filled by loadStimuli() function.
// They are used by the video trials to show videos to participants.

var practice_stimuli = [];        // Practice videos
var actual_stimuli = [];          // All actual videos (for preloading)
var actual_stimuli_block_1 = [];  // First block of actual trials
var actual_stimuli_block_2 = [];  // Second block of actual trials


// =====================================================================
// HELPER: BUILD VIDEO PATH
// =====================================================================
// Creates the full URL/path for a video file.
//
// Our video files are named like: shared_paths_S_10.mp4
//   - condition: "shared_paths" or "vanilla_paths"
//   - letter: "S" or "X"
//   - number: the stimulus index (e.g., 10)

function buildVideoPath(condition, letter, number) {
  // Build filename: e.g., "shared_paths_S_10.mp4"
  var filename = condition + '_' + letter + '_' + number + '.mp4';
  
  // Add prefix if configured
  return STIMULUS_PATH_PREFIX + filename;
}


// =====================================================================
// HELPER: SHUFFLE ARRAY
// =====================================================================
// Randomly reorders an array using Fisher-Yates algorithm.
// Used to randomize the order of stimulus presentation.

function shuffleArray(array) {
  // Make a copy so we don't modify the original
  var shuffled = array.slice();
  
  // Fisher-Yates shuffle
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    // Swap elements
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  
  return shuffled;
}


// =====================================================================
// MAIN FUNCTION: LOAD STIMULI
// =====================================================================
// Builds the stimulus arrays based on the current condition.
// Must be called after CONFIG.condition is set.

function loadStimuli() {
  
  // Get the current condition from config
  var condition = CONFIG.condition;  // "shared_paths" or "vanilla_paths"
  
  // Get the list of stimulus indices for this condition
  var indices = STIMULUS_INDICES[condition];
  
  if (!indices) {
    console.error('No stimulus indices found for condition:', condition);
    return;
  }
  
  // -----------------------------------------------------------------
  // Apply limits (for dev mode testing)
  // -----------------------------------------------------------------
  // In dev mode, we might only want to show a few stimuli for quick testing
  
  var practiceIndices = indices.practice;
  var actualIndices = indices.actual;
  
  // If there's a practice limit, only use the first N
  if (CONFIG.practiceLimit > 0) {
    practiceIndices = practiceIndices.slice(0, CONFIG.practiceLimit);
  }
  
  // If there's an actual limit, only use the first N
  if (CONFIG.actualLimit > 0) {
    actualIndices = actualIndices.slice(0, CONFIG.actualLimit);
  }
  
  // -----------------------------------------------------------------
  // Build practice stimuli
  // -----------------------------------------------------------------
  // For each practice index, create entries for both S and X videos
  
  // Clear the array (important for dev mode condition picker)
  practice_stimuli.length = 0;
  
  for (var i = 0; i < practiceIndices.length; i++) {
    var idx = practiceIndices[i];
    
    // Add the S video
    practice_stimuli.push({
      stimulus: [buildVideoPath(condition, 'S', idx)],
      _letter: 'S',
      _index: idx,
      _trialType: 'practice',
      _condition: condition
    });
    
    // Add the X video
    practice_stimuli.push({
      stimulus: [buildVideoPath(condition, 'X', idx)],
      _letter: 'X',
      _index: idx,
      _trialType: 'practice',
      _condition: condition
    });
  }
  
  // -----------------------------------------------------------------
  // Build actual stimuli with block splitting
  // -----------------------------------------------------------------
  // For each actual index, we have an S video and an X video.
  // We randomly assign one to block 1 and one to block 2.
  // This ensures each block has a mix of S and X stimuli.
  
  // Clear the arrays
  actual_stimuli_block_1.length = 0;
  actual_stimuli_block_2.length = 0;
  actual_stimuli.length = 0;
  
  // Shuffle the indices to randomize which pairs come first
  var shuffledIndices = shuffleArray(actualIndices);
  
  for (var i = 0; i < shuffledIndices.length; i++) {
    var idx = shuffledIndices[i];
    
    // Create the S stimulus entry
    var sStimulus = {
      stimulus: [buildVideoPath(condition, 'S', idx)],
      _letter: 'S',
      _index: idx,
      _trialType: 'actual',
      _condition: condition
    };
    
    // Create the X stimulus entry
    var xStimulus = {
      stimulus: [buildVideoPath(condition, 'X', idx)],
      _letter: 'X',
      _index: idx,
      _trialType: 'actual',
      _condition: condition
    };
    
    // Randomly decide which goes to block 1 vs block 2
    // This ensures ~50% S and ~50% X in each block
    if (Math.random() < 0.5) {
      // S to block 1, X to block 2
      sStimulus._block = 1;
      xStimulus._block = 2;
      actual_stimuli_block_1.push(sStimulus);
      actual_stimuli_block_2.push(xStimulus);
    } else {
      // X to block 1, S to block 2
      xStimulus._block = 1;
      sStimulus._block = 2;
      actual_stimuli_block_1.push(xStimulus);
      actual_stimuli_block_2.push(sStimulus);
    }
  }
  
  // Build combined array for preloading
  for (var i = 0; i < actual_stimuli_block_1.length; i++) {
    actual_stimuli.push(actual_stimuli_block_1[i]);
  }
  for (var i = 0; i < actual_stimuli_block_2.length; i++) {
    actual_stimuli.push(actual_stimuli_block_2[i]);
  }
  
  // Log summary
  console.log('Loaded stimuli for condition:', condition);
  console.log('  Practice stimuli:', practice_stimuli.length);
  console.log('  Block 1 stimuli:', actual_stimuli_block_1.length);
  console.log('  Block 2 stimuli:', actual_stimuli_block_2.length);
}


// =====================================================================
// HELPER: GET ALL VIDEO URLS FOR PRELOADING
// =====================================================================
// Returns an array of all video URLs that need to be preloaded.
// Called by the preload screen to load videos before trials start.

function getAllVideoUrls() {
  var urls = [];
  
  // Add practice video URLs
  for (var i = 0; i < practice_stimuli.length; i++) {
    var stim = practice_stimuli[i];
    if (stim.stimulus && stim.stimulus.length > 0) {
      urls.push(stim.stimulus[0]);
    }
  }
  
  // Add actual video URLs
  for (var i = 0; i < actual_stimuli.length; i++) {
    var stim = actual_stimuli[i];
    if (stim.stimulus && stim.stimulus.length > 0) {
      urls.push(stim.stimulus[0]);
    }
  }
  
  return urls;
}


console.log('[stimulus-loader.js] Loaded successfully');
