// =====================================================================
// stimulus-loader.js — Build stimulus arrays for Cognition.run
// Upload this as External JS #4 in Cognition.run (after config.js)
//
// Cognition.run serves uploaded stimuli files. The path format depends
// on how you upload - likely flat filenames or with a 'stimuli/' prefix.
// 
// Paired stimuli (S_N and X_N from same seed) go to opposite blocks.
// Each block has ~50% S and ~50% X stimuli.
// =====================================================================

// -----------------------------------------------------------------------
// STIMULUS PATH CONFIGURATION
// -----------------------------------------------------------------------
// Cognition.run may serve files as:
//   - Just filename: "S_42.mp4" 
//   - With prefix: "stimuli/S_42.mp4"
//   - Full path: "folder/subfolder/S_42.mp4" (if supported)
//
// Adjust this prefix based on how Cognition.run exposes your uploads.
// Test with one file first, check browser console for 404s.
// -----------------------------------------------------------------------
var STIMULUS_PATH_PREFIX = '';  // e.g., '' or 'stimuli/' or 'videos/'

// Storage for built stimulus arrays
var practice_stimuli = [];
var actual_stimuli = [];
var actual_stimuli_block_1 = [];
var actual_stimuli_block_2 = [];

// Fisher-Yates shuffle (local to this module)
function shuffleArray(array) {
  var arr = array.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
  }
  return arr;
}

/**
 * Build stimulus filename for Cognition.run
 * 
 * Files are flattened with condition prefix:
 *   shared_paths_S_10.mp4, vanilla_paths_X_42.mp4
 * 
 * @param {string} condition - "shared_paths" or "vanilla_paths"
 * @param {string} trialType - "actual" or "practice" (metadata only)
 * @param {string} letter - "S" or "X"
 * @param {number} index - stimulus index
 * @returns {string} Path to stimulus video for Cognition.run
 */
function buildStimulusPath(condition, trialType, letter, index) {
  // Flattened filename with condition prefix: shared_paths_S_10.mp4
  var filename = condition + '_' + letter + '_' + index + '.mp4';
  return STIMULUS_PATH_PREFIX + filename;
}

/**
 * Load stimuli for the current condition from STIMULUS_INDICES
 * Must be called after CONFIG.condition is set
 */
function loadStimuli() {
  var condition = CONFIG.condition;
  var indices = STIMULUS_INDICES[condition];
  
  if (!indices) {
    console.error('No stimulus indices found for condition: ' + condition);
    return;
  }
  
  // DEV: Apply limits if set
  var practiceIndices = indices.practice;
  var actualIndices = indices.actual;
  if (CONFIG.practiceLimit > 0) {
    practiceIndices = practiceIndices.slice(0, CONFIG.practiceLimit);
  }
  if (CONFIG.actualLimit > 0) {
    actualIndices = actualIndices.slice(0, CONFIG.actualLimit);
  }
  
  // IMPORTANT: Clear arrays by mutating (not reassigning) to preserve references
  // This is critical for dev mode where trial objects are created before loadStimuli() runs
  practice_stimuli.length = 0;
  
  // Build practice stimuli - include metadata for data analysis
  practiceIndices.forEach(function(idx) {
    CONFIG.targetLetters.forEach(function(letter) {
      practice_stimuli.push({
        stimulus: [buildStimulusPath(condition, 'practice', letter, idx)],
        _letter: letter,
        _index: idx,
        _trialType: 'practice',
        _condition: condition
      });
    });
  });
  
  // Build actual stimuli with block splitting
  buildActualStimuliWithBlockSplit(condition, actualIndices);
  
  console.log('Loaded stimuli for condition: ' + condition);
  console.log('Practice stimuli: ' + practice_stimuli.length);
  console.log('Block 1 stimuli: ' + actual_stimuli_block_1.length);
  console.log('Block 2 stimuli: ' + actual_stimuli_block_2.length);
}

/**
 * Build actual stimuli and split into two blocks
 * Paired stimuli (S_N and X_N) always go to opposite blocks
 * Each block ends up with ~50% S and ~50% X
 * 
 * @param {string} condition - "shared_paths" or "vanilla_paths"
 * @param {number[]} pairIndices - array of stimulus pair indices
 */
function buildActualStimuliWithBlockSplit(condition, pairIndices) {
  // IMPORTANT: Clear by mutating to preserve references for dev mode condition picker
  actual_stimuli_block_1.length = 0;
  actual_stimuli_block_2.length = 0;
  
  // Shuffle pair indices for randomization
  var shuffledIndices = shuffleArray(pairIndices);
  
  // For each pair, randomly decide: S→Block1 + X→Block2, OR S→Block2 + X→Block1
  shuffledIndices.forEach(function(idx) {
    var sStim = {
      stimulus: [buildStimulusPath(condition, 'actual', 'S', idx)],
      _letter: 'S',
      _index: idx,
      _trialType: 'actual',
      _condition: condition
    };
    var xStim = {
      stimulus: [buildStimulusPath(condition, 'actual', 'X', idx)],
      _letter: 'X',
      _index: idx,
      _trialType: 'actual',
      _condition: condition
    };
    
    // Coin flip for block assignment
    // _block is added when pushed so we know which block it ended up in
    if (Math.random() < 0.5) {
      sStim._block = 1;
      xStim._block = 2;
      actual_stimuli_block_1.push(sStim);
      actual_stimuli_block_2.push(xStim);
    } else {
      xStim._block = 1;
      sStim._block = 2;
      actual_stimuli_block_1.push(xStim);
      actual_stimuli_block_2.push(sStim);
    }
  });
  
  // Combined array for preloading - must also mutate to preserve reference
  actual_stimuli.length = 0;
  actual_stimuli_block_1.forEach(function(s) { actual_stimuli.push(s); });
  actual_stimuli_block_2.forEach(function(s) { actual_stimuli.push(s); });
}

/**
 * Get all video URLs for preloading
 * @returns {string[]} Array of video URLs
 */
function getAllVideoUrls() {
  var urls = [];
  practice_stimuli.forEach(function(s) {
    if (s.stimulus) urls = urls.concat(s.stimulus);
  });
  actual_stimuli.forEach(function(s) {
    if (s.stimulus) urls = urls.concat(s.stimulus);
  });
  return urls;
}
