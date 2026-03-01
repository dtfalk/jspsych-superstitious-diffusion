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

console.log('===== [stimulus-loader.js LOADED] =====');
console.log('[SCRIPT LOAD] STIMULUS_PATH_PREFIX =', JSON.stringify(STIMULUS_PATH_PREFIX), '(length:', STIMULUS_PATH_PREFIX.length, ')');
console.log('[SCRIPT LOAD] CONFIG exists?', typeof CONFIG !== "undefined");
if (typeof CONFIG !== "undefined") {
  console.log('[SCRIPT LOAD] CONFIG.condition at load time         :', CONFIG.condition, '(type:', typeof CONFIG.condition, ')');
  console.log('[SCRIPT LOAD] CONFIG.conditionNumber at load time   :', CONFIG.conditionNumber);
  console.log('[SCRIPT LOAD] CONFIG.isDev                          :', CONFIG.isDev);
  console.log('[SCRIPT LOAD] CONFIG.showConditionPicker            :', CONFIG.showConditionPicker);
  console.log('[SCRIPT LOAD] CONFIG.practiceLimit                  :', CONFIG.practiceLimit);
  console.log('[SCRIPT LOAD] CONFIG.actualLimit                    :', CONFIG.actualLimit);
  console.log('[SCRIPT LOAD] CONFIG.targetLetters                  :', CONFIG.targetLetters);
}
console.log('[SCRIPT LOAD] STIMULUS_INDICES exists?', typeof STIMULUS_INDICES !== "undefined");
if (typeof STIMULUS_INDICES !== "undefined") {
  console.log('[SCRIPT LOAD] STIMULUS_INDICES keys:', Object.keys(STIMULUS_INDICES));
}

// Storage for built stimulus arrays
var practice_stimuli = [];
var actual_stimuli = [];
var actual_stimuli_block_1 = [];
var actual_stimuli_block_2 = [];

console.log('[SCRIPT LOAD] stimulus arrays initialized (all empty)');

// Fisher-Yates shuffle (local to this module)
function shuffleArray(array) {
  console.log('[shuffleArray] CALLED. INPUT array.length:', array.length, 'INPUT array:', JSON.stringify(array));
  var arr = array.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
  }
  console.log('[shuffleArray] OUTPUT array.length:', arr.length, 'OUTPUT array:', JSON.stringify(arr));
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
  console.log('[PATH BUILD] ---');
  console.log('[PATH BUILD] condition   :', condition, '  (type:', typeof condition, ')');
  console.log('[PATH BUILD] trialType   :', trialType);
  console.log('[PATH BUILD] letter      :', letter);
  console.log('[PATH BUILD] index       :', index);
  console.log('[PATH BUILD] PREFIX      :', JSON.stringify(STIMULUS_PATH_PREFIX), '  (length:', STIMULUS_PATH_PREFIX.length, ')');
  var filename = condition + '_' + letter + '_' + index + '.mp4';
  var fullPath = STIMULUS_PATH_PREFIX + filename;
  console.log('[PATH BUILD] filename    :', filename);
  console.log('[PATH BUILD] FULL PATH   :', fullPath);
  return fullPath;
}

/**
 * Load stimuli for the current condition from STIMULUS_INDICES
 * Must be called after CONFIG.condition is set
 */
function loadStimuli() {
  console.log('[LOAD STIMULI] ===== loadStimuli() CALLED =====');
  console.log('[LOAD STIMULI] CONFIG.condition            :', CONFIG.condition, '  (type:', typeof CONFIG.condition, ')');
  console.log('[LOAD STIMULI] STIMULUS_INDICES type       :', typeof STIMULUS_INDICES);
  console.log('[LOAD STIMULI] STIMULUS_INDICES keys       :', Object.keys(STIMULUS_INDICES));

  var condition = CONFIG.condition;
  var indices = STIMULUS_INDICES[condition];

  console.log('[LOAD STIMULI] looked up STIMULUS_INDICES["' + condition + '"] =', indices ? '(found, actual:' + indices.actual.length + ' practice:' + indices.practice.length + ')' : 'UNDEFINED/NULL');
  
  if (!indices) {
    console.error('[LOAD STIMULI] ERROR: No stimulus indices found for condition: ' + condition);
    console.error('[LOAD STIMULI] Available keys:', Object.keys(STIMULUS_INDICES));
    return;
  }
  
  console.log('[LOAD STIMULI] CONFIG.practiceLimit        :', CONFIG.practiceLimit);
  console.log('[LOAD STIMULI] CONFIG.actualLimit          :', CONFIG.actualLimit);

  // DEV: Apply limits if set
  var practiceIndices = indices.practice;
  var actualIndices = indices.actual;
  if (CONFIG.practiceLimit > 0) {
    practiceIndices = practiceIndices.slice(0, CONFIG.practiceLimit);
  }
  if (CONFIG.actualLimit > 0) {
    actualIndices = actualIndices.slice(0, CONFIG.actualLimit);
  }

  console.log('[LOAD STIMULI] practiceIndices after limit :', practiceIndices);
  console.log('[LOAD STIMULI] actualIndices after limit   :', actualIndices);
  console.log('[LOAD STIMULI] CONFIG.targetLetters        :', CONFIG.targetLetters);
  
  // IMPORTANT: Clear arrays by mutating (not reassigning) to preserve references
  practice_stimuli.length = 0;
  
  // Build practice stimuli
  console.log('[LOAD STIMULI] Building practice stimuli...');
  practiceIndices.forEach(function(idx) {
    CONFIG.targetLetters.forEach(function(letter) {
      var entry = {
        stimulus: [buildStimulusPath(condition, 'practice', letter, idx)],
        _letter: letter,
        _index: idx,
        _trialType: 'practice',
        _condition: condition
      };
      console.log('[LOAD STIMULI] practice entry:', JSON.stringify(entry));
      practice_stimuli.push(entry);
    });
  });
  
  // Build actual stimuli with block splitting
  buildActualStimuliWithBlockSplit(condition, actualIndices);
  
  console.log('[LOAD STIMULI] ===== loadStimuli() DONE =====');
  console.log('[LOAD STIMULI] practice_stimuli.length     :', practice_stimuli.length);
  console.log('[LOAD STIMULI] actual_stimuli_block_1.length:', actual_stimuli_block_1.length);
  console.log('[LOAD STIMULI] actual_stimuli_block_2.length:', actual_stimuli_block_2.length);
  if (practice_stimuli.length > 0) {
    console.log('[LOAD STIMULI] FIRST practice_stimuli entry :', JSON.stringify(practice_stimuli[0]));
  }
  // legacy console logs kept for compatibility
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
  console.log('[buildActualSplit] CALLED.');
  console.log('[buildActualSplit] INPUT condition   :', condition, '(type:', typeof condition, ')');
  console.log('[buildActualSplit] INPUT pairIndices :', JSON.stringify(pairIndices), '(length:', pairIndices.length, ')');

  // IMPORTANT: Clear by mutating to preserve references for dev mode condition picker
  actual_stimuli_block_1.length = 0;
  actual_stimuli_block_2.length = 0;
  console.log('[buildActualSplit] Cleared block_1 and block_2 arrays.');

  // Shuffle pair indices for randomization
  console.log('[buildActualSplit] Shuffling pairIndices...');
  var shuffledIndices = shuffleArray(pairIndices);
  console.log('[buildActualSplit] INTERMEDIATE shuffledIndices:', JSON.stringify(shuffledIndices));

  // For each pair, randomly decide: S→Block1 + X→Block2, OR S→Block2 + X→Block1
  shuffledIndices.forEach(function(idx, i) {
    console.log('[buildActualSplit] Processing pair', i, '— index:', idx);

    var sPath = buildStimulusPath(condition, 'actual', 'S', idx);
    var xPath = buildStimulusPath(condition, 'actual', 'X', idx);
    console.log('[buildActualSplit]   S path:', sPath);
    console.log('[buildActualSplit]   X path:', xPath);

    var sStim = { stimulus: [sPath], _letter: 'S', _index: idx, _trialType: 'actual', _condition: condition };
    var xStim = { stimulus: [xPath], _letter: 'X', _index: idx, _trialType: 'actual', _condition: condition };

    var coinFlip = Math.random();
    console.log('[buildActualSplit]   coinFlip:', coinFlip, '— S goes to block', coinFlip < 0.5 ? 1 : 2);

    if (coinFlip < 0.5) {
      sStim._block = 1; xStim._block = 2;
      actual_stimuli_block_1.push(sStim);
      actual_stimuli_block_2.push(xStim);
      console.log('[buildActualSplit]   PUSHED S →block1, X →block2');
    } else {
      xStim._block = 1; sStim._block = 2;
      actual_stimuli_block_1.push(xStim);
      actual_stimuli_block_2.push(sStim);
      console.log('[buildActualSplit]   PUSHED X →block1, S →block2');
    }
  });

  // Combined array for preloading - must also mutate to preserve reference
  actual_stimuli.length = 0;
  actual_stimuli_block_1.forEach(function(s) { actual_stimuli.push(s); });
  actual_stimuli_block_2.forEach(function(s) { actual_stimuli.push(s); });

  console.log('[buildActualSplit] OUTPUT actual_stimuli_block_1.length:', actual_stimuli_block_1.length);
  console.log('[buildActualSplit] OUTPUT actual_stimuli_block_2.length:', actual_stimuli_block_2.length);
  console.log('[buildActualSplit] OUTPUT actual_stimuli.length (combined):', actual_stimuli.length);
  if (actual_stimuli_block_1.length > 0) {
    console.log('[buildActualSplit] FIRST block_1 entry:', JSON.stringify(actual_stimuli_block_1[0]));
    console.log('[buildActualSplit] LAST  block_1 entry:', JSON.stringify(actual_stimuli_block_1[actual_stimuli_block_1.length - 1]));
  }
}

/**
 * Get all video URLs for preloading
 * @returns {string[]} Array of video URLs
 */
function getAllVideoUrls() {
  console.log('[getAllVideoUrls] called. CONFIG.condition at this moment:', typeof CONFIG !== "undefined" ? CONFIG.condition : 'CONFIG UNDEFINED');
  console.log('[getAllVideoUrls] practice_stimuli.length:', practice_stimuli.length);
  console.log('[getAllVideoUrls] actual_stimuli.length:', actual_stimuli.length);
  var urls = [];
  practice_stimuli.forEach(function(s) {
    if (s.stimulus) urls = urls.concat(s.stimulus);
  });
  actual_stimuli.forEach(function(s) {
    if (s.stimulus) urls = urls.concat(s.stimulus);
  });
  console.log('[getAllVideoUrls] total URLs returned:', urls.length);
  if (urls.length > 0) {
    console.log('[getAllVideoUrls] FIRST url:', urls[0]);
    console.log('[getAllVideoUrls] LAST url:', urls[urls.length - 1]);
  } else {
    console.error('[getAllVideoUrls] WARNING: returning 0 URLs — arrays empty when preload asked for them!');
  }
  return urls;
}
