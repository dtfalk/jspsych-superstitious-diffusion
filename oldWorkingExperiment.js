// =====================================================================
// Cognition.run Task Code — Pure JavaScript (no HTML tags)
// Cognition.run loads this as code.js; jsPsych 7.3 core is provided.
// Plugins are loaded dynamically below before the experiment runs.
// =====================================================================

// --- Inject custom CSS ---
(function() {
  var style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.08rem;
      color: #2c2c2c;
      background: #f8f7f5;
    }
    .jspsych-display-element {
      width: min(94vw, 1100px);
      margin: 4vh auto 8vh;
      padding: 0 4vw 4vh;
      box-sizing: border-box;
    }
    .jspsych-content {
      max-width: 100%;
      margin: 0 auto;
      text-align: center;
    }
    h1, h2, h3 {
      color: #800000;
      font-family: Georgia, 'Times New Roman', serif;
    }
    h2 {
      font-size: 1.6rem;
      border-bottom: 2px solid #800000;
      padding-bottom: 0.5rem;
      display: inline-block;
    }
    p { line-height: 1.75; }
    .jspsych-btn {
      background-color: #800000 !important;
      color: #fff !important;
      border: none !important;
      padding: 10px 28px !important;
      font-size: 1rem !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      font-family: Arial, Helvetica, sans-serif !important;
      transition: background-color 0.2s !important;
    }
    .jspsych-btn:hover {
      background-color: #600000 !important;
    }
    .consent-text {
      text-align: left;
      font-size: 0.95rem;
      line-height: 1.65;
    }
    .consent-text strong { color: #800000; }
    .jspsych-survey-multi-choice-question {
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .jspsych-survey-multi-choice-option label { cursor: pointer; }
    .jspsych-survey-text .jspsych-survey-text-question input[type="text"] {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 1rem;
      font-family: inherit;
    }
    .jspsych-display-element.center-vert {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      padding: 4vh 4vw;
      min-height: calc(100vh - 8vh);
      box-sizing: border-box;
    }
    .jspsych-display-element.center-vert .jspsych-content {
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100%;
    }
    .jspsych-display-element.center-vert .jspsych-content > div {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100%;
    }
    .jspsych-display-element.center-vert video {
      max-width: 100%;
      max-height: 70vh;
      display: block;
      margin: 0 auto 1rem auto;
    }
  `;
  document.head.appendChild(style);
})();

// --- Load plugins from CDN, then run experiment ---
(function() {
  var pluginUrls = [
    'https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3',
    'https://unpkg.com/@jspsych/plugin-survey-multi-choice@1.1.3',
    'https://unpkg.com/@jspsych/plugin-survey-text@1.1.3',
    'https://unpkg.com/@jspsych/plugin-survey-likert@1.1.3',
    'https://unpkg.com/@jspsych/plugin-video-keyboard-response@1.1.3',
    'https://unpkg.com/@jspsych/plugin-preload@1.1.3'
  ];

  var loaded = 0;
  function onPluginLoaded() {
    loaded++;
    if (loaded === pluginUrls.length) {
      runExperiment();
    }
  }

  pluginUrls.forEach(function(url) {
    var script = document.createElement('script');
    script.src = url;
    script.onload = onPluginLoaded;
    script.onerror = function() {
      console.error('Failed to load plugin: ' + url);
      onPluginLoaded();
    };
    document.head.appendChild(script);
  });
})();

function runExperiment() {

// =====================================================================
// Initialize jsPsych
// =====================================================================
var jsPsych = initJsPsych();

// =====================================================================
// helpers.js
// =====================================================================

var subjectId = null;
var experimentSource = null;

function setSubjectId(id) {
  subjectId = id;
  jsPsych.data.addProperties({ subjectId: id });
}

function setExperimentSource(source) {
  experimentSource = source;
  jsPsych.data.addProperties({ experimentSource: source });
}

function getArticle(str) {
  var upper = str.toString().toUpperCase();
  var vowelSoundLetters = ['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X'];
  var vowelSoundNumbers = ['8', '11', '18', '80', '800', '8000'];
  if (vowelSoundLetters.includes(upper) || vowelSoundNumbers.includes(upper)) {
    return 'an';
  }
  return 'a';
}

function saveJsonFile(stepName, payload) {
  try {
    var key = stepName.replace(/\s+/g, '_').toLowerCase() + '_data';
    jsPsych.data.getLastTrialData().addToAll({ [key]: payload });
  } catch(e) {
    console.warn('[cognition] Could not inject step data:', stepName, e);
  }
}

function saveStimulusMap(condition) {
  if (typeof STIMULUS_MAP === 'undefined') {
    console.log('No STIMULUS_MAP found; skipping stimulus map save.');
    return;
  }
  var decodedMap = {};
  Object.keys(STIMULUS_MAP).forEach(function(hexId) {
    var meta = _decodeStimulusMeta(hexId);
    decodedMap[hexId] = {
      obfuscated_filename: hexId + '.mp4',
      original_filename: meta ? meta.letter + '_' + meta.index + '.mp4' : null,
      trial_type: meta ? meta.trialType : null,
      letter: meta ? meta.letter : null,
      index: meta ? meta.index : null,
      encoded: STIMULUS_MAP[hexId]
    };
  });
  saveJsonFile(`Stimulus Map (${condition})`, {
    total_stimuli: Object.keys(STIMULUS_MAP).length,
    mappings: decodedMap
  });
}

var practiceTrials = [];
var actualTrials = [];
var practiceTrialCounter = 0;
var actualTrialCounter = 0;

function recordVideoTrial(data) {
  var stimulusPath = Array.isArray(data.stimulus) ? data.stimulus[0] : (typeof data.stimulus === 'string' ? data.stimulus : null);
  console.log('recordVideoTrial called, Stimulus Path: ', stimulusPath);
  if (!stimulusPath) {
    console.warn('recordVideoTrial: stimulus path is null/undefined, skipping');
    return;
  }

  var stimulusNumber = null;
  var stimulusType = null;
  var trialType = null;
  var obfuscatedFilename = null;
  var originalFilename = null;

  var hexMatch = stimulusPath.match(/([a-f0-9]{16,})\.mp4/i);
  if (hexMatch && typeof _decodeStimulusMeta === 'function') {
    var hexId = hexMatch[1];
    obfuscatedFilename = hexId + '.mp4';
    var meta = _decodeStimulusMeta(hexId);
    if (meta) {
      stimulusNumber = String(meta.index);
      stimulusType = meta.letter;
      trialType = meta.trialType;
      originalFilename = meta.letter + '_' + meta.index + '.mp4';
    }
  }

  if (!trialType) {
    var parts = stimulusPath.split('/');
    var file = parts[parts.length - 1];
    var fileWithoutExt = file.replace(/\.mp4.*$/, '');
    stimulusNumber = fileWithoutExt.split('_')[1];
    stimulusType = parts[parts.length - 2];
    trialType = parts[parts.length - 3].replace('-stimuli', '');
    originalFilename = file;
    obfuscatedFilename = null;
  }

  var spacebarScreenPresentedTimestamp = data.spacebar_screen_presented_timestamp;
  var spacebarPressedTimestamp = data.spacebar_pressed_timestamp;
  var videoStartTimestamp = data.video_start_timestamp;
  var responseTimestamp = data.response_timestamp;
  var videoEndTimestamp = typeof window.__jspsych_video_ended === 'number' ? window.__jspsych_video_ended : -1;

  var preVideoWaitTime = spacebarPressedTimestamp - spacebarScreenPresentedTimestamp;
  var videoPresentationLag = videoStartTimestamp - spacebarPressedTimestamp;
  var responseTime = responseTimestamp - videoStartTimestamp;
  var delayTime = videoEndTimestamp === -1 ? -1 : responseTimestamp - videoEndTimestamp;
  var totalTime = responseTimestamp - spacebarScreenPresentedTimestamp;

  var responseKey = (data.response || '').toUpperCase();

  var trialNumber = null;
  if (trialType === "practice") { practiceTrialCounter++; trialNumber = practiceTrialCounter; }
  else if (trialType === "actual") { actualTrialCounter++; trialNumber = actualTrialCounter; }

  var blockNumber = data.block_number || null;

  var outcome = null;
  var signalLetter = CONFIG.targetLetters[0];
  var isSignal = stimulusType === signalLetter;
  var isCorrect = responseKey.toUpperCase() === stimulusType.toUpperCase();
  if (isSignal && isCorrect) outcome = 'true_positive';
  else if (isSignal && !isCorrect) outcome = 'false_negative';
  else if (!isSignal && isCorrect) outcome = 'true_negative';
  else if (!isSignal && !isCorrect) outcome = 'false_positive';

  var trialSummary = {
    "Trial Type": trialType,
    "Block Number": blockNumber,
    "Trial Number": trialNumber,
    "Stimulus Number": stimulusNumber,
    "Stimulus Character": stimulusType,
    "Original Filename": originalFilename,
    "Obfuscated Filename": obfuscatedFilename,
    "Response Character": responseKey,
    "Response Classification": outcome,
    "Trial Presented Timestamp": spacebarScreenPresentedTimestamp,
    "Begin Stimulus Key Press Timestamp": spacebarPressedTimestamp,
    "Stimulus Video Started Timestamp": videoStartTimestamp,
    "Subject Response Timestamp": responseTimestamp,
    "Stimulus Video Completed Timestamp": videoEndTimestamp,
    "Pre Stimulus Video Wait Time": preVideoWaitTime,
    "Time Between Key Press and Video Start": videoPresentationLag,
    "Response Time": responseTime,
    "Time After Video End Before Decision Made": delayTime,
    "Total Trial Time": totalTime
  };

  try {
    jsPsych.data.getLastTrialData().addToAll(trialSummary);
  } catch (e) {
    console.warn('Could not inject trial summary into jsPsych data:', e);
  }

  if (trialType === 'practice') { practiceTrials.push(trialSummary); }
  else if (trialType === "actual") { actualTrials.push(trialSummary); }
}

function flushTrials(trialType) {
  var trials = null;
  if (trialType === "practice") { trials = practiceTrials; }
  else if (trialType === "actual") { trials = actualTrials; }
  if (trials.length === 0) return;
  saveJsonFile(trialType[0].toUpperCase() + trialType.slice(1) + ' Trials', { trials: trials });
  if (trialType === "practice") { practiceTrials = []; }
  else if (trialType === "actual") { actualTrials = []; }
}

// =====================================================================
// config.js
// =====================================================================

var CONFIG = {
  conditions: {
    conditionA: {
      targetLetters: ["S", "X"],
      practice: {
        folder: "practice-stimuli-conditionA",
        nPerCondition: 5,
        stimulusStartIndex: 100
      },
      main: {
        folder: "actual-stimuli-conditionA",
        nPerCondition: 5
      }
    },
    conditionB: {
      targetLetters: ["A", "B"],
      practice: {
        folder: "practice-stimuli-conditionB",
        nPerCondition: 5,
        stimulusStartIndex: 200
      },
      main: {
        folder: "actual-stimuli-conditionB",
        nPerCondition: 5
      }
    }
  },
  continueKey: "k"
};

function getStimulusUrl(hexId) {
  return hexId + '.mp4';
}

// =====================================================================
// stimulus-map.js
// =====================================================================

var STIMULUS_MAP = {
  "001646f55cc07c71": "YWN0dWFsLFgsODk=",
  "00bfe7c73dd94f59": "cHJhY3RpY2UsUywxMDM=",
  "04d0aeb7e364c413": "YWN0dWFsLFgsODU=",
  "06ee5bec359c375b": "YWN0dWFsLFgsOTc=",
  "078d459637cb9664": "YWN0dWFsLFMsODA=",
  "08336a8c8f0db413": "YWN0dWFsLFgsOTE=",
  "0a5700f3db835ada": "YWN0dWFsLFMsODg=",
  "0b5e76c55429e24e": "YWN0dWFsLFMsODk=",
  "0c40ad996047b330": "YWN0dWFsLFMsNjA=",
  "0cddca99cd978d01": "YWN0dWFsLFMsODI=",
  "0e4500d1c2d8439d": "YWN0dWFsLFMsODE=",
  "0f4f84e4884f1b8b": "YWN0dWFsLFMsNTU=",
  "0fac03a33cc66c2e": "YWN0dWFsLFgsODc=",
  "10448acd420c9c9c": "YWN0dWFsLFMsNzc=",
  "114018d608b21962": "YWN0dWFsLFMsNzQ=",
  "11e9f638bba88b30": "YWN0dWFsLFMsNDI=",
  "126bb9a0d5616ded": "YWN0dWFsLFgsNw==",
  "12b361a23abcd402": "YWN0dWFsLFMsOTA=",
  "134d09876b9aba61": "YWN0dWFsLFgsMTE=",
  "14438e1b6d063306": "YWN0dWFsLFgsMzA=",
  "1577380bc6dfcea2": "YWN0dWFsLFMsMzY=",
  "17a6e47df7ce4003": "YWN0dWFsLFMsMjc=",
  "18b7daae10fad802": "YWN0dWFsLFgsNzY=",
  "19de8f53f75271e2": "YWN0dWFsLFgsODE=",
  "1c5446376b4e52fc": "YWN0dWFsLFMsNTA=",
  "1c8a8ee3d36d8f77": "YWN0dWFsLFMsMA==",
  "1ca07a44c23411bb": "YWN0dWFsLFgsMzc=",
  "1e9323e8fe77a86b": "YWN0dWFsLFMsNzA=",
  "1e9ecd23f3fc7a9b": "YWN0dWFsLFgsMQ==",
  "202667a731426e4e": "YWN0dWFsLFgsODM=",
  "20c0fc728097b29a": "YWN0dWFsLFMsOTY=",
  "2144b179dbc388ee": "YWN0dWFsLFgsNjA=",
  "22fa4225098c62d4": "YWN0dWFsLFgsOQ==",
  "23ba7791dd93a7ed": "YWN0dWFsLFMsODU=",
  "25633f52d0acb908": "cHJhY3RpY2UsWCwxMDE=",
  "2614a5ee638dd146": "YWN0dWFsLFMsNDQ=",
  "28572815fc6cf524": "YWN0dWFsLFgsMTA=",
  "285a526e5f734f46": "YWN0dWFsLFMsMw==",
  "29373c2160a56111": "YWN0dWFsLFgsNjk=",
  "29c21eaa5bcbb7f0": "cHJhY3RpY2UsUywxMDI=",
  "2aff917c786deab7": "YWN0dWFsLFgsNDk=",
  "2b45b593795e70a5": "cHJhY3RpY2UsUywxMDA=",
  "2c844d0e1194dc90": "YWN0dWFsLFMsNzI=",
  "2d087788fee5f4a2": "YWN0dWFsLFMsNzU=",
  "2dd73b9733251c02": "YWN0dWFsLFMsNA==",
  "2eb3090b19810b08": "YWN0dWFsLFgsMzU=",
  "2f1f9c1128f13377": "YWN0dWFsLFMsOTQ=",
  "305656f3e6eff9b3": "YWN0dWFsLFgsNTE=",
  "30ea6313fd05032f": "YWN0dWFsLFMsMTA=",
  "3109b391d8c2d928": "YWN0dWFsLFMsNDY=",
  "346b0c7151304345": "YWN0dWFsLFMsNQ==",
  "35f5588d9889c7a1": "YWN0dWFsLFgsNTQ=",
  "3643f2d236d564dc": "YWN0dWFsLFgsNjQ=",
  "37d18ef5ae7f4a96": "YWN0dWFsLFgsNzc=",
  "381c5a91302ebcf9": "YWN0dWFsLFMsODQ=",
  "388a96d560751620": "YWN0dWFsLFgsNjY=",
  "38c73d8bb6482c96": "YWN0dWFsLFMsNDA=",
  "3a94d0d194ead1ca": "YWN0dWFsLFgsNzU=",
  "3b2f75d78591e061": "YWN0dWFsLFMsNDk=",
  "3f3c83a412e10834": "YWN0dWFsLFMsNjI=",
  "424681512206714b": "YWN0dWFsLFgsMjg=",
  "434235c4b916b599": "YWN0dWFsLFgsNTY=",
  "452c158df819ff62": "YWN0dWFsLFgsMjE=",
  "463ba928cf6570cc": "YWN0dWFsLFMsNTM=",
  "46ecc536813ff326": "YWN0dWFsLFgsMjk=",
  "484021d3d665d2c6": "YWN0dWFsLFgsNA==",
  "4add3977a3e7f8da": "YWN0dWFsLFMsMTE=",
  "4ee705e91a42cf44": "YWN0dWFsLFgsMTQ=",
  "500cd07a36937b9a": "YWN0dWFsLFgsMjc=",
  "5082ed3070e4994a": "YWN0dWFsLFMsNzE=",
  "5136368b6a95839a": "YWN0dWFsLFgsMzM=",
  "522a26e630a6411c": "YWN0dWFsLFgsODg=",
  "5292aa26f461e970": "YWN0dWFsLFgsODA=",
  "52babbd196227368": "YWN0dWFsLFgsNzQ=",
  "543260068044be68": "YWN0dWFsLFMsMzM=",
  "567d31bf75678d17": "YWN0dWFsLFgsMzY=",
  "568c4b24a38902c3": "YWN0dWFsLFMsMjg=",
  "5732999cba52144a": "YWN0dWFsLFgsMjM=",
  "57364cb84b41bb65": "YWN0dWFsLFgsNDE=",
  "577143a8b9d866f5": "YWN0dWFsLFMsNDE=",
  "58951b49c539354a": "YWN0dWFsLFgsNTc=",
  "58cfc542d560530a": "YWN0dWFsLFMsMzU=",
  "5ae0ff4b9cfd3e57": "YWN0dWFsLFgsNzI=",
  "5b0111eb9f5ae27f": "YWN0dWFsLFgsNjM=",
  "5fcfbb321eacd1b0": "YWN0dWFsLFMsNjk=",
  "631f5652d55f6e61": "YWN0dWFsLFMsNTg=",
  "6567732ec622d440": "YWN0dWFsLFMsOTM=",
  "6591de1b1053f12c": "YWN0dWFsLFMsNTY=",
  "65cc3c8ff63ca558": "YWN0dWFsLFMsNTE=",
  "66ddc1963f05b7c1": "YWN0dWFsLFMsMjI=",
  "6914958e21ac5002": "YWN0dWFsLFMsMjM=",
  "6c5afb45167803f1": "YWN0dWFsLFMsNjg=",
  "705823e1b9bdc81d": "YWN0dWFsLFgsMzk=",
  "713dc2d3a58e98ef": "YWN0dWFsLFMsOTE=",
  "7243b0039222a0eb": "YWN0dWFsLFMsMTI=",
  "745daf86e7cfc796": "YWN0dWFsLFgsMTg=",
  "74aa2e6a315abf40": "YWN0dWFsLFgsOTM=",
  "77934b91a9bc8b60": "YWN0dWFsLFMsNjU=",
  "79163c2c90013fca": "YWN0dWFsLFgsNTA=",
  "7a23d7d22ab88453": "YWN0dWFsLFMsOTk=",
  "7b271ab540f44855": "YWN0dWFsLFMsMjk=",
  "7bf79921339c9e4c": "YWN0dWFsLFgsNDM=",
  "7df2171e810159b1": "YWN0dWFsLFgsMTU=",
  "801370b541f7c904": "YWN0dWFsLFgsNDg=",
  "813d959966ac9dbd": "YWN0dWFsLFgsMjQ=",
  "8293f9f4e56d89ed": "YWN0dWFsLFgsOTU=",
  "85e828b381b17772": "YWN0dWFsLFMsODc=",
  "86a0a83be7fef33f": "YWN0dWFsLFMsNDc=",
  "8713964660e6d83b": "YWN0dWFsLFMsOTc=",
  "87c4923c002e7bb6": "YWN0dWFsLFgsNDA=",
  "88c5766c1204cad9": "YWN0dWFsLFgsMzE=",
  "89aaba2d4548f24f": "cHJhY3RpY2UsWCwxMDA=",
  "89e8dd5f59ea5155": "YWN0dWFsLFgsMg==",
  "8a4cdebfeb6f4598": "YWN0dWFsLFMsNzg=",
  "8a9337b922f226e1": "YWN0dWFsLFgsMTY=",
  "8d421d5a49222fb9": "YWN0dWFsLFMsOTI=",
  "8d559a611e0d1f43": "YWN0dWFsLFgsNzg=",
  "8f3027eae18962e9": "cHJhY3RpY2UsUywxMDE=",
  "9292a03ccab68a9d": "YWN0dWFsLFMsNjE=",
  "9294f70a84a7d55e": "YWN0dWFsLFMsNTc=",
  "9303be20f04ed8b8": "YWN0dWFsLFMsMjU=",
  "9315978cdb1b47c0": "YWN0dWFsLFgsOTI=",
  "93ee104497e72ffa": "YWN0dWFsLFgsNQ==",
  "958de9b7a30e8d4c": "YWN0dWFsLFMsMjE=",
  "95c4193305fc7f3a": "YWN0dWFsLFMsMTc=",
  "967ded6b46a7aa3a": "YWN0dWFsLFgsMTk=",
  "973724a19eddadee": "YWN0dWFsLFgsNTI=",
  "9a83b448f09b2bec": "YWN0dWFsLFMsMzI=",
  "9b61f8bedb1077f9": "YWN0dWFsLFgsMjI=",
  "9e22040905c9915d": "YWN0dWFsLFgsNzE=",
  "a10839eecef415ea": "YWN0dWFsLFgsOTY=",
  "a210f0433d7cec48": "YWN0dWFsLFgsMjY=",
  "a2dd3c10c7ab7cd6": "YWN0dWFsLFgsNDQ=",
  "a34204bd460f7a6e": "YWN0dWFsLFgsODI=",
  "a3dc5190a343ad47": "YWN0dWFsLFgsODY=",
  "a769de5649ce2e90": "YWN0dWFsLFgsMTc=",
  "a7fcbadd1ecb7171": "YWN0dWFsLFMsMjA=",
  "a8203424aee6a17f": "YWN0dWFsLFMsODY=",
  "acd729eb0c67a684": "YWN0dWFsLFMsNjQ=",
  "adc6b5147ce7699a": "YWN0dWFsLFMsNTQ=",
  "ae122674ec46f992": "YWN0dWFsLFgsNDY=",
  "ae5b8c68ea6ce8c0": "YWN0dWFsLFgsOTk=",
  "ae8c2b7373cf9114": "YWN0dWFsLFMsMTQ=",
  "afa726b7b8bae34b": "YWN0dWFsLFgsNDU=",
  "b068af7637af9f72": "YWN0dWFsLFMsNjM=",
  "b0d107e8b5a28782": "YWN0dWFsLFMsMTU=",
  "b4a00c5d33fd765b": "YWN0dWFsLFMsMjQ=",
  "b6ab3df5608846bf": "YWN0dWFsLFMsMTM=",
  "b76d1f5f234bd6e1": "YWN0dWFsLFgsMjA=",
  "b8dea1dc0c0dca09": "YWN0dWFsLFMsNzM=",
  "b95dafb214084fe7": "YWN0dWFsLFMsNTI=",
  "bb3192228cebe183": "YWN0dWFsLFMsOTU=",
  "bbb435e7eeebba02": "YWN0dWFsLFMsNjc=",
  "bbc499a0657ed1cd": "YWN0dWFsLFgsNjE=",
  "bcc386fb90373849": "YWN0dWFsLFgsNTU=",
  "bd8ba3e680320407": "YWN0dWFsLFgsNDc=",
  "be1ab37c1692c670": "YWN0dWFsLFgsNg==",
  "be9767c5cfd03a6b": "YWN0dWFsLFgsODQ=",
  "bf0571c757ba702c": "YWN0dWFsLFMsMzg=",
  "bfe1b526a85bcfcc": "YWN0dWFsLFMsOA==",
  "c18e3f6d29ca56f5": "YWN0dWFsLFMsMzk=",
  "c267011abb31d5b4": "YWN0dWFsLFgsMzQ=",
  "c3bad042c721d2b1": "YWN0dWFsLFgsNzA=",
  "c4e79ca602c8cfe8": "YWN0dWFsLFgsNjI=",
  "c587fc9f690ef6e9": "YWN0dWFsLFMsNDg=",
  "c8e31eee37098077": "YWN0dWFsLFgsOTQ=",
  "ca223002fa224c77": "YWN0dWFsLFMsMzE=",
  "cc469e6967a9169e": "YWN0dWFsLFgsNjg=",
  "cd5386a6d800f085": "cHJhY3RpY2UsWCwxMDM=",
  "cda2bd87bac6f9d8": "YWN0dWFsLFMsOTg=",
  "cdf0a8ac9d4c3069": "cHJhY3RpY2UsWCwxMDQ=",
  "cf01f1310d3b7dc2": "YWN0dWFsLFgsNjU=",
  "d44de7851f27c9e3": "YWN0dWFsLFMsMTY=",
  "d47cd25fd97e5e6d": "YWN0dWFsLFgsNzM=",
  "d4c889ee5223fb36": "YWN0dWFsLFMsNDM=",
  "d5adc9d45680a32a": "YWN0dWFsLFgsNjc=",
  "d5ca1b55059aa29f": "YWN0dWFsLFMsMzQ=",
  "d7ac5d74e3165c19": "YWN0dWFsLFMsMzc=",
  "d8354daac1fe14ed": "YWN0dWFsLFgsOTA=",
  "d88352fc51587032": "YWN0dWFsLFMsODM=",
  "d8a70b44bfefefaa": "YWN0dWFsLFMsOQ==",
  "d9cf7a84cc36c1f5": "cHJhY3RpY2UsUywxMDQ=",
  "da38e3e42390fdcd": "YWN0dWFsLFgsMzg=",
  "dcad4d4332557d8e": "YWN0dWFsLFMsMzA=",
  "de1a8354e50a5aae": "YWN0dWFsLFMsNzY=",
  "de1c4388f1313d5c": "YWN0dWFsLFMsNzk=",
  "decea53d8a62cda8": "YWN0dWFsLFMsMTk=",
  "df281bde1ecfa529": "YWN0dWFsLFMsNjY=",
  "df351c093ce2a7dd": "YWN0dWFsLFMsNw==",
  "dfc47fcb06056524": "YWN0dWFsLFMsNTk=",
  "e0b31205279702b6": "YWN0dWFsLFgsNTM=",
  "e290c631ac47d6eb": "YWN0dWFsLFMsNg==",
  "e4558369811b2b40": "YWN0dWFsLFgsMzI=",
  "e4f852cdf9bc1261": "YWN0dWFsLFgsMTM=",
  "e667deea4ad1a187": "cHJhY3RpY2UsWCwxMDI=",
  "e861a595a1005a27": "YWN0dWFsLFgsMTI=",
  "e87b96a2644693bc": "YWN0dWFsLFgsOTg=",
  "e885f179501a2c17": "YWN0dWFsLFgsMw==",
  "e8d1290025537556": "YWN0dWFsLFgsMA==",
  "ea7db3a430b717f9": "YWN0dWFsLFgsMjU=",
  "ec17d7b9f039c9da": "YWN0dWFsLFgsNzk=",
  "ec486e5056270cdb": "YWN0dWFsLFgsNTk=",
  "efac4f70c40b6698": "YWN0dWFsLFMsNDU=",
  "f47fb81980bcc8fa": "YWN0dWFsLFgsOA==",
  "f89917fa992a4604": "YWN0dWFsLFMsMQ==",
  "fa32d5212e55438c": "YWN0dWFsLFgsNDI=",
  "fddf87ed091bc172": "YWN0dWFsLFMsMTg=",
  "fe1bbe88cdaf81da": "YWN0dWFsLFMsMg==",
  "fed89847a428e3e9": "YWN0dWFsLFgsNTg="
};

function _decodeStimulusMeta(hash) {
  var encoded = STIMULUS_MAP[hash];
  if (!encoded) return null;
  var parts = atob(encoded).split(',');
  return { trialType: parts[0], letter: parts[1], index: parseInt(parts[2]) };
}

var UCHICAGO_HEADER = '<div style="text-align:center; margin-bottom:1.8rem; padding-bottom:1.2rem; border-bottom:2px solid #800000;">' +
  '<img src="https://upload.wikimedia.org/wikipedia/en/7/79/University_of_Chicago_shield.svg" alt="University of Chicago" style="height:55px; margin-bottom:0.5rem; display:block; margin-left:auto; margin-right:auto;" onerror="this.style.display=\'none\'">' +
  '<div style="font-family:Georgia,serif; font-size:0.85rem; color:#800000; letter-spacing:0.12em; font-weight:bold;">THE UNIVERSITY OF CHICAGO</div>' +
  '<div style="font-size:0.72rem; color:#767676; margin-top:0.25rem; font-family:Arial,sans-serif; text-transform:uppercase; letter-spacing:0.08em;">Department of Psychology</div>' +
  '</div>';

// =====================================================================
// 1-subject-source.js
// =====================================================================

var subject_source = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: '<div style="text-align:center;">Which platform redirected you to this study?</div>',
      options: ["Prolific", "Sona", "Other"],
      required: true
    }
  ],
  on_finish: function(data) {
    var response = data.response ? Object.values(data.response)[0] : null;
    setExperimentSource(response);
  }
};

// =====================================================================
// 2-id-entry.js
// =====================================================================

var id_entry = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "",
      required: true
    }
  ],
  on_start: function(trial) {
    if (experimentSource === "Prolific") {
      trial.questions[0].prompt = "Please enter your Prolific ID";
    } else if (experimentSource === "Sona") {
      trial.questions[0].prompt = "Please enter your SONA ID";
    } else {
      trial.questions[0].prompt = "Please enter your Email";
    }
  },
  on_finish: function(data) {
    var response = data.response ? Object.values(data.response)[0] : null;
    setSubjectId(response);
  }
};

// =====================================================================
// 3-consent-screen.js
// =====================================================================

var consent_description_prolific = '<div class="consent-text">' +
  '<p><strong>Study Number:</strong> IRB24-1770<br>' +
  '<strong>Study Title:</strong> Superstitious Perception<br>' +
  '<strong>Researcher(s):</strong> Shannon Heald</p>' +
  '<p><strong>Description:</strong> We are researchers at the University of Chicago doing a research study about the limits of human perception. You will be asked to engage with different types of stimuli (such as images and sounds) and indicate whether or not you believe a particular target is present within them. You will also be asked to fill out a couple of questionnaires.</p>' +
  '<p>Depending on your performance, we may reach out to you for follow up studies. If we reach out to you again, your participation is entirely voluntary, and you will be compensated for any further experiments in which you are a participant.</p>' +
  '<p>Participation should take approximately 30 minutes.<br>' +
  'Your participation is voluntary.</p>' +
  '<p><strong>Incentives:</strong> You will be compensated with entry into a raffle for a $50 Amazon gift card for your participation in this study. You will also be entered into a raffle for a 50 dollar Amazon gift card. Your performance on the study will influence your chances of winning the raffle. The better you do, the higher your chances are to win the giftcard.</p>' +
  '<p><strong>Risks and Benefits:</strong> Your participation in this study does not involve any risk to you beyond that of everyday life. Risks for this task are minimal and include boredom, minor fatigue, and the possibility of a breach of confidentiality.</p>' +
  '<p>Taking part in this research study may not benefit you personally beyond learning about psychological research, but we may learn new things that could help others and contribute to the field of psychology.</p>' +
  '<p><strong>Confidentiality:</strong> Any identifiable data or information collected by this study will never be shared outside the research team.</p>' +
  '<p>De-identified information from this study may be used for future research studies or shared with other researchers for future research without your additional informed consent.</p>' +
  '<p>We may also upload your data (in both aggregate and individual form) to public data repositories.</p>' +
  '<p>Your study data will be handled as confidentially as possible. If results of this study are published or presented, your individual name will not be used.</p>' +
  '<p>If you decide to withdraw from this study, any data already collected will be destroyed.</p>' +
  '<p><strong>Contacts &amp; Questions:</strong> If you have questions or concerns about the study, you can contact Jean Matelski Boulware at (312)860-9260 or at matelskiboulware@uchicago.edu.</p>' +
  '<p>If you have any questions about your rights as a participant in this research, feel you have been harmed, or wish to discuss other study-related concerns with someone who is not part of the research team, you can contact the University of Chicago Social &amp; Behavioral Sciences Institutional Review Board (IRB) Office by phone at (773) 702-2915, or by email at sbs-irb@uchicago.edu.</p>' +
  '<p>Please read the statement above and select whether you consent to participate.</p>' +
  '</div>';

var consent_description_sona = '<div class="consent-text">' +
  '<p><strong>Study Number:</strong> IRB24-1770<br>' +
  '<strong>Study Title:</strong> Superstitious Perception<br>' +
  '<strong>Researcher(s):</strong> Shannon Heald</p>' +
  '<p><strong>Description:</strong> We are researchers at the University of Chicago doing a research study about the limits of human perception. You will be asked to engage with different types of stimuli (such as images and sounds) and indicate whether or not you believe a particular target is present within them. You will also be asked to fill out a couple of questionnaires.</p>' +
  '<p>Depending on your performance, we may reach out to you for follow up studies. If we reach out to you again, your participation is entirely voluntary, and you will be compensated for any further experiments in which you are a participant.</p>' +
  '<p>Participation should take approximately 30 minutes.<br>' +
  'Your participation is voluntary.</p>' +
  '<p><strong>Incentives:</strong> You will be compensated 1 SONA credit for your participation in this study. You will also be entered into a raffle for a 50 dollar Amazon gift card. Your performance on the study will influence your chances of winning the raffle. The better you do, the higher your chances are to win the giftcard.</p>' +
  '<p><strong>Risks and Benefits:</strong> Your participation in this study does not involve any risk to you beyond that of everyday life. Risks for this task are minimal and include boredom, minor fatigue, and the possibility of a breach of confidentiality.</p>' +
  '<p>Taking part in this research study may not benefit you personally beyond learning about psychological research, but we may learn new things that could help others and contribute to the field of psychology.</p>' +
  '<p><strong>Confidentiality:</strong> Any identifiable data or information collected by this study will never be shared outside the research team.</p>' +
  '<p>De-identified information from this study may be used for future research studies or shared with other researchers for future research without your additional informed consent.</p>' +
  '<p>We may also upload your data (in both aggregate and individual form) to public data repositories.</p>' +
  '<p>Your study data will be handled as confidentially as possible. If results of this study are published or presented, your individual name will not be used.</p>' +
  '<p>If you decide to withdraw from this study, any data already collected will be destroyed.</p>' +
  '<p><strong>Contacts &amp; Questions:</strong> If you have questions or concerns about the study, you can contact Jean Matelski Boulware at (312)860-9260 or at matelskiboulware@uchicago.edu.</p>' +
  '<p>If you have any questions about your rights as a participant in this research, feel you have been harmed, or wish to discuss other study-related concerns with someone who is not part of the research team, you can contact the University of Chicago Social &amp; Behavioral Sciences Institutional Review Board (IRB) Office by phone at (773) 702-2915, or by email at sbs-irb@uchicago.edu.</p>' +
  '<p>Please read the statement above and select whether you consent to participate.</p>' +
  '</div>';

var consent_description_other = '<div class="consent-text">' +
  '<p><strong>Study Number:</strong> IRB24-1770<br>' +
  '<strong>Study Title:</strong> Superstitious Perception<br>' +
  '<strong>Researcher(s):</strong> Shannon Heald</p>' +
  '<p><strong>Description:</strong> We are researchers at the University of Chicago doing a research study about the limits of human perception. You will be asked to engage with different types of stimuli (such as images and sounds) and indicate whether or not you believe a particular target is present within them. You will also be asked to fill out a couple of questionnaires.</p>' +
  '<p>Depending on your performance, we may reach out to you for follow up studies. If we reach out to you again, your participation is entirely voluntary, and you will be compensated for any further experiments in which you are a participant.</p>' +
  '<p>Participation should take approximately 30 minutes.<br>' +
  'Your participation is voluntary.</p>' +
  '<p><strong>Incentives:</strong> You will be compensated with entry into a raffle for a $50 Amazon gift card for your participation in this study. You will also be entered into a raffle for a 50 dollar Amazon gift card. Your performance on the study will influence your chances of winning the raffle. The better you do, the higher your chances are to win the giftcard.</p>' +
  '<p><strong>Risks and Benefits:</strong> Your participation in this study does not involve any risk to you beyond that of everyday life. Risks for this task are minimal and include boredom, minor fatigue, and the possibility of a breach of confidentiality.</p>' +
  '<p>Taking part in this research study may not benefit you personally beyond learning about psychological research, but we may learn new things that could help others and contribute to the field of psychology.</p>' +
  '<p><strong>Confidentiality:</strong> Any identifiable data or information collected by this study will never be shared outside the research team.</p>' +
  '<p>De-identified information from this study may be used for future research studies or shared with other researchers for future research without your additional informed consent.</p>' +
  '<p>We may also upload your data (in both aggregate and individual form) to public data repositories.</p>' +
  '<p>Your study data will be handled as confidentially as possible. If results of this study are published or presented, your individual name will not be used.</p>' +
  '<p>If you decide to withdraw from this study, any data already collected will be destroyed.</p>' +
  '<p><strong>Contacts &amp; Questions:</strong> If you have questions or concerns about the study, you can contact Jean Matelski Boulware at (312)860-9260 or at matelskiboulware@uchicago.edu.</p>' +
  '<p>If you have any questions about your rights as a participant in this research, feel you have been harmed, or wish to discuss other study-related concerns with someone who is not part of the research team, you can contact the University of Chicago Social &amp; Behavioral Sciences Institutional Review Board (IRB) Office by phone at (773) 702-2915, or by email at sbs-irb@uchicago.edu.</p>' +
  '<p>Please read the statement above and select whether you consent to participate.</p>' +
  '<p>Note: If you choose not to consent, then your data will not be stored and will be destroyed immediately.</p>' +
  '</div>';

var consent_screen = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "",
      options: [
        'I consent to participate in this study',
        'I do NOT consent to participate in this study'
      ],
      required: true
    }
  ],
  button_label: 'Submit',
  on_start: function() {
    if (experimentSource == "Prolific") { consent_screen.questions[0].prompt = UCHICAGO_HEADER + consent_description_prolific; }
    else if (experimentSource == "Sona") { consent_screen.questions[0].prompt = UCHICAGO_HEADER + consent_description_sona; }
    else { consent_screen.questions[0].prompt = UCHICAGO_HEADER + consent_description_other; }
  },
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var response = data.response ? Object.values(data.response)[0] : null;
    var consented = response === 'I consent to participate in this study';
    if (consented) {
      saveJsonFile('Consent Screen', {
        consent: consented,
        consent_timestamp: end_timestamp,
      });
    }
  }
};

var nonconsent_screen = {
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:center;"><h2>Non Consent Screen</h2><p>Thank you for considering our experiment. Please close this tab to exit the experiment.</p></div>',
      choices: [' '],
      on_finish: function() {
        jsPsych.endExperiment('Participant did not consent.');
      }
    }
  ],
  conditional_function: function() {
    var last = jsPsych.data.get().last(1).values()[0];
    var response = last.response ? Object.values(last.response)[0] : null;
    return response === 'I do NOT consent to participate in this study';
  }
};

// =====================================================================
// 4-experiment-intro.js
// =====================================================================

var experiment_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Instructions</h2>' +
    '<p>In this experiment you will watch a series of short videos that gradually progress from static toward one of two letters, either ' + getArticle(CONFIG.targetLetters[0]) + ' <strong>' + CONFIG.targetLetters[0] + '</strong> or ' + getArticle(CONFIG.targetLetters[1]) + ' <strong>' + CONFIG.targetLetters[1] + '</strong>.</p>' +
    '<p>Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>' +
    '<p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>' +
    '<p>Press <strong>space</strong> to continue.</p>' +
    '</div>',
  choices: [" "],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Experiment Introduction', {
      time_on_screen: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
  }
};

// =====================================================================
// 5-practice-intro.js
// =====================================================================

var practice_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="max-width:50rem; margin:0 auto; text-align:left;">' +
    '<h2>Practice Examples</h2>' +
    '<p>As a reminder: you will watch a series of short videos that gradually progress from static toward one of two letters, either ' + getArticle(CONFIG.targetLetters[0]) + ' <strong>' + CONFIG.targetLetters[0] + '</strong> or ' + getArticle(CONFIG.targetLetters[1]) + ' <strong>' + CONFIG.targetLetters[1] + '</strong>.</p>' +
    '<p>Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>' +
    '<p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>' +
    '<p>You will now complete <strong>' + (CONFIG.targetLetters.length * CONFIG.practice.nPerCondition) + '</strong> practice trials so you can get used to the task.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to begin the practice trials.</p>' +
    '</div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Practice Instructions', {
      time_on_screen: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
  }
};

// =====================================================================
// 6-practice-trials.js
// =====================================================================

var _practiceTrialTimestamps = {};

var practice_stimuli = [];
if (typeof STIMULUS_MAP !== 'undefined') {
  Object.keys(STIMULUS_MAP).forEach(function(hexId) {
    var meta = _decodeStimulusMeta(hexId);
    if (meta && meta.trialType === 'practice') {
      practice_stimuli.push({
        stimulus: [getStimulusUrl(hexId)],
        _hexId: hexId
      });
    }
  });
} else {
  CONFIG.targetLetters.forEach(function(condition) {
    for (var i = CONFIG.practice.stimulusStartIndex; i < CONFIG.practice.stimulusStartIndex + CONFIG.practice.nPerCondition; i++) {
      practice_stimuli.push({
        stimulus: [condition + '_' + String(i) + '.mp4']
      });
    }
  });
}

var practice_video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position:fixed; top:0; left:0; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; background:#f8f7f5;">' +
    '<div style="background:#fff; padding:2rem 3rem; border-radius:8px; border:1px solid #e0ddd8; box-shadow:0 2px 12px rgba(0,0,0,0.06); text-align:center;">' +
    '<p style="font-size:1.3rem; margin:0; color:#444;">Press <strong style="color:#800000;">space</strong> to start the video</p>' +
    '</div></div>',
  choices: [" "],
  on_start: function() {
    _practiceTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: function() {
    _practiceTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

var practice_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: function() { return jsPsych.timelineVariable("stimulus"); },
  prompt: '<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>',
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: function() {
    window.__jspsych_video_ended = null;
    _practiceTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_load: function() {
    var vid = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
    if (vid) { vid.addEventListener('ended', function() { window.__jspsych_video_ended = performance.now(); }); }
  },
  on_finish: function(data) {
    _practiceTrialTimestamps.response_timestamp = performance.now();
    data.spacebar_screen_presented_timestamp = _practiceTrialTimestamps.spacebar_screen_presented_timestamp;
    data.spacebar_pressed_timestamp = _practiceTrialTimestamps.spacebar_pressed_timestamp;
    data.video_start_timestamp = _practiceTrialTimestamps.video_start_timestamp;
    data.response_timestamp = _practiceTrialTimestamps.response_timestamp;
    recordVideoTrial(data);
  }
};

var practice_blank_delay = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '',
  choices: "NO_KEYS",
  trial_duration: 1500
};

var practice_trials = {
  timeline: [practice_video_ready, practice_blank_delay, practice_video_trial],
  timeline_variables: practice_stimuli,
  randomize_order: true,
  data: { trial_type: "practice", block_number: null }
};

// =====================================================================
// 7-practice-complete.js
// =====================================================================

var practice_trials_complete_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
    '<div style="max-width:50rem; width:92%; text-align:left;">' +
    '<h2>Practice Complete</h2>' +
    '<p>You have completed the practice trials.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p>' +
    '</div></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Practice Complete', {
      time_on_screen: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
    flushTrials('practice');
  }
};

// =====================================================================
// 8-actual-intro.js
// =====================================================================

var actual_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
    '<div style="max-width:50rem; width:92%; text-align:left;">' +
    '<h2>Main Task</h2>' +
    '<p>You will now begin the main portion of the task.</p>' +
    '<p>As a reminder: you will watch a series of short videos that gradually progress from static toward one of two letters, either ' + getArticle(CONFIG.targetLetters[0]) + ' <strong>' + CONFIG.targetLetters[0] + '</strong> or ' + getArticle(CONFIG.targetLetters[1]) + ' <strong>' + CONFIG.targetLetters[1] + '</strong>. Your task is to identify which letter the video is progressing towards and press the corresponding key as quickly as possible.</p>' +
    '<p>The main task consists of two blocks of trials with a short break between them.</p>' +
    '<p>Faster correct responses improve your performance score; performance influences your odds to win a raffle for an Amazon gift card.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to begin.</p>' +
    '</div></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Actual Trials Introduction', {
      time_on_screen: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
  }
};

// =====================================================================
// 9-actual-trials.js
// =====================================================================

var _actualTrialTimestamps = {};

var actual_stimuli = [];
var actual_stimuli_block_1 = [];
var actual_stimuli_block_2 = [];

if (typeof STIMULUS_MAP !== 'undefined') {
  var byLetter = {};
  Object.keys(STIMULUS_MAP).forEach(function(hexId) {
    var meta = _decodeStimulusMeta(hexId);
    if (meta && meta.trialType === 'actual') {
      if (!byLetter[meta.letter]) byLetter[meta.letter] = [];
      byLetter[meta.letter].push({
        stimulus: [getStimulusUrl(hexId)],
        _hexId: hexId
      });
    }
  });

  var block1 = [];
  var block2 = [];
  Object.keys(byLetter).forEach(function(letter) {
    var items = byLetter[letter];
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = items[i]; items[i] = items[j]; items[j] = temp;
    }
    items = items.slice(0, CONFIG.main.nPerCondition);
    var half = Math.ceil(items.length / 2);
    block1.push.apply(block1, items.slice(0, half));
    block2.push.apply(block2, items.slice(half));
  });

  actual_stimuli = block1.concat(block2);
  actual_stimuli_block_1 = block1;
  actual_stimuli_block_2 = block2;

} else {
  var _byLetter = {};
  CONFIG.targetLetters.forEach(function(condition) {
    _byLetter[condition] = [];
    for (var i = 0; i < CONFIG.main.nPerCondition; i++) {
      _byLetter[condition].push({
        stimulus: [condition + '_' + String(i) + '.mp4']
      });
    }
  });

  var _block1 = [];
  var _block2 = [];
  Object.keys(_byLetter).forEach(function(letter) {
    var items = _byLetter[letter];
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = items[i]; items[i] = items[j]; items[j] = temp;
    }
    var half = Math.ceil(items.length / 2);
    _block1.push.apply(_block1, items.slice(0, half));
    _block2.push.apply(_block2, items.slice(half));
  });

  actual_stimuli = _block1.concat(_block2);
  actual_stimuli_block_1 = _block1;
  actual_stimuli_block_2 = _block2;
}

var actual_video_ready = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position:fixed; top:0; left:0; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; background:#f8f7f5;">' +
    '<div style="background:#fff; padding:2rem 3rem; border-radius:8px; border:1px solid #e0ddd8; box-shadow:0 2px 12px rgba(0,0,0,0.06); text-align:center;">' +
    '<p style="font-size:1.3rem; margin:0; color:#444;">Press <strong style="color:#800000;">space</strong> to start the video</p>' +
    '</div></div>',
  choices: [" "],
  on_start: function() {
    _actualTrialTimestamps.spacebar_screen_presented_timestamp = performance.now();
  },
  on_finish: function() {
    _actualTrialTimestamps.spacebar_pressed_timestamp = performance.now();
  }
};

var actual_video_trial = {
  type: jsPsychVideoKeyboardResponse,
  stimulus: function() { return jsPsych.timelineVariable("stimulus"); },
  prompt: '<style>#jspsych-video-keyboard-response-stimulus { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }</style>',
  width: 500,
  height: 500,
  choices: CONFIG.targetLetters,
  trial_ends_after_video: false,
  response_ends_trial: true,
  on_start: function() {
    window.__jspsych_video_ended = null;
    _actualTrialTimestamps.video_start_timestamp = performance.now();
  },
  on_load: function() {
    var vid = document.querySelector('#jspsych-video-keyboard-response-stimulus video');
    if (vid) { vid.addEventListener('ended', function() { window.__jspsych_video_ended = performance.now(); }); }
  },
  on_finish: function(data) {
    _actualTrialTimestamps.response_timestamp = performance.now();
    data.spacebar_screen_presented_timestamp = _actualTrialTimestamps.spacebar_screen_presented_timestamp;
    data.spacebar_pressed_timestamp = _actualTrialTimestamps.spacebar_pressed_timestamp;
    data.video_start_timestamp = _actualTrialTimestamps.video_start_timestamp;
    data.response_timestamp = _actualTrialTimestamps.response_timestamp;
    recordVideoTrial(data);
  }
};

var actual_blank_delay = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '',
  choices: "NO_KEYS",
  trial_duration: 1500
};

var actual_trials_block_1 = {
  timeline: [actual_video_ready, actual_blank_delay, actual_video_trial],
  timeline_variables: actual_stimuli_block_1,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 1 }
};

var actual_trials_block_2 = {
  timeline: [actual_video_ready, actual_blank_delay, actual_video_trial],
  timeline_variables: actual_stimuli_block_2,
  randomize_order: true,
  data: { trial_type: "actual", block_number: 2 }
};

var actual_break = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
    '<div style="max-width:50rem; width:92%; text-align:left;">' +
    '<h2>Break</h2>' +
    '<p>You have completed the first block of trials.</p>' +
    '<p>Take a short break if you like, then press <strong>' + CONFIG.continueKey + '</strong> to continue to the next block.</p>' +
    '</div></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Break Screen', {
      reaction_time_ms: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
    flushTrials('actual');
  }
};

// =====================================================================
// 10-actual-complete.js
// =====================================================================

var actual_trials_complete_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
    '<div style="max-width:50rem; width:92%; text-align:left;">' +
    '<h2>Trials Complete</h2>' +
    '<p>You have completed the main portion of the experiment.</p>' +
    '<p>Press <strong>' + CONFIG.continueKey + '</strong> to continue.</p>' +
    '</div></div>',
  choices: [CONFIG.continueKey],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Actual Trials Complete', {
      time_on_screen: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
    flushTrials('actual');
  }
};

// =====================================================================
// 11-questionnaires-intro.js
// =====================================================================

var questionnaires_intro_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
    '<div style="max-width:50rem; width:92%; text-align:left;">' +
    '<h2>Questionnaires</h2>' +
    '<p>You will now respond to some questionnaires.</p>' +
    '<p>Press <strong>spacebar</strong> to continue.</p>' +
    '</div></div>',
  choices: [" "],
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveJsonFile('Questionnaires Intro Screen', {
      time_on_screen: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
  }
};

// =====================================================================
// 12-tellegen-scale.js
// =====================================================================

var tellegen_scale = ['0 - Never', '1 - Rarely', '2 - Often', '3 - Always'];

var tellegen_questions = [
  { prompt: 'Sometimes I feel and experience things as I did when I was a child.', options: tellegen_scale, required: true },
  { prompt: 'I can be greatly moved by eloquent or poetic language.', options: tellegen_scale, required: true },
  { prompt: 'While watching a movie, a TV show, or a play, I may sometimes become so involved that I forget about myself and my surroundings and experience the story as if it were real and as if I were taking part in it.', options: tellegen_scale, required: true },
  { prompt: 'If I stare at a picture and then look away from it, I can sometimes "see" an image of the picture, almost as if I were still looking at it.', options: tellegen_scale, required: true },
  { prompt: 'Sometimes I feel as if my mind could envelop the whole earth.', options: tellegen_scale, required: true },
  { prompt: 'I like to watch cloud shapes in the sky.', options: tellegen_scale, required: true },
  { prompt: 'If I wish, I can imagine (or daydream) some things so vividly that they hold my attention as a good movie or a story does.', options: tellegen_scale, required: true },
  { prompt: 'I think I really know what some people mean when they talk about mystical experiences.', options: tellegen_scale, required: true },
  { prompt: 'I sometimes "step outside" my usual self and experience an entirely different state of being.', options: tellegen_scale, required: true },
  { prompt: 'Textures such as wool, sand, wood sometimes remind me of colors or music.', options: tellegen_scale, required: true },
  { prompt: 'Sometimes I experience things as if they were doubly real.', options: tellegen_scale, required: true },
  { prompt: "When I listen to music, I can get so caught up in it that I don't notice anything else.", options: tellegen_scale, required: true },
  { prompt: 'If I wish, I can imagine that my whole body is so heavy that I could not move it if I wanted to.', options: tellegen_scale, required: true },
  { prompt: 'I can often somehow sense the presence of another person before I actually see or hear him/her.', options: tellegen_scale, required: true },
  { prompt: 'The crackle and flames of a woodfire stimulate my imagination.', options: tellegen_scale, required: true },
  { prompt: 'It is sometimes possible for me to be completely immersed in nature or art and to feel as if my whole state of consciousness has somehow been temporarily altered.', options: tellegen_scale, required: true },
  { prompt: 'Different colors have distinctive and special meanings to me.', options: tellegen_scale, required: true },
  { prompt: 'I am able to wander off into my own thought while doing a routine task and actually forget that I am doing the task, and then find a few minutes later that I have completed it.', options: tellegen_scale, required: true },
  { prompt: 'I can sometimes recollect certain past experiences in my life with such clarity and vividness that it is like living them again or almost so.', options: tellegen_scale, required: true },
  { prompt: 'Things that might seem meaningless to others often make sense to me.', options: tellegen_scale, required: true },
  { prompt: 'While acting in a play, I think I would really feel the emotions of the character and "become" him/her for the time being, forgetting both myself and the audience.', options: tellegen_scale, required: true },
  { prompt: 'My thoughts often do not occur as words but as visual images.', options: tellegen_scale, required: true },
  { prompt: 'I often take delight in small things (like the five pointed star shape that appears when you cut an apple across the core or the colors in soap bubbles).', options: tellegen_scale, required: true },
  { prompt: 'When listening to organ music or other powerful music I sometimes feel as if I am being lifted into the air.', options: tellegen_scale, required: true },
  { prompt: 'Sometimes I can change noise into music by the way I listen to it.', options: tellegen_scale, required: true },
  { prompt: 'Some of my most vivid memories are called up by scents and smells.', options: tellegen_scale, required: true },
  { prompt: 'Certain pieces of music remind me of pictures or moving patterns of color.', options: tellegen_scale, required: true },
  { prompt: 'I often know what someone is going to say before he or she says it.', options: tellegen_scale, required: true },
  { prompt: 'I often have "physical memories"; for example, after I have been swimming I may still feel as if I am in the water.', options: tellegen_scale, required: true },
  { prompt: 'The sound of a voice can be so fascinating to me that I can just go on listening to it.', options: tellegen_scale, required: true },
  { prompt: 'At times I somehow feel the presence of someone who is not physically there.', options: tellegen_scale, required: true },
  { prompt: 'Sometimes thoughts and images come to me without the slightest effort on my part.', options: tellegen_scale, required: true },
  { prompt: 'I find that different odors have different colors.', options: tellegen_scale, required: true },
  { prompt: 'I can be deeply moved by a sunset.', options: tellegen_scale, required: true }
];

var tellegen_questionnaire = {
  type: jsPsychSurveyMultiChoice,
  preamble: '<style>' +
    '.jspsych-survey-multi-choice-question { margin-bottom: 2rem; }' +
    '.jspsych-survey-multi-choice-option { display: block; margin: 0.5rem 0; }' +
    '.jspsych-survey-multi-choice-option input { margin-right: 0.5rem; }' +
    '</style>' +
    '<div style="max-width: 56rem; margin: 0 auto; text-align: left;">' +
    '<h1 style="text-align: center; margin-bottom: 1.5rem;">Personal Attitudes and Experiences</h1>' +
    '<p style="margin-bottom: 2rem;">This questionnaire consists of questions about experiences that you may have had in your life. We are interested in how often you have these experiences. It is important, however, that your answers show how often these experiences happen to you when you are not under the influence of alcohol or drugs.</p>' +
    '</div>',
  questions: tellegen_questions,
  randomize_question_order: false,
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    var responses = data.response || {};
    var questions_data = tellegen_questions.map(function(q, i) {
      return {
        question_number: i + 1,
        question_text: q.prompt,
        response: responses['Q' + i] || null,
        score: responses['Q' + i] ? parseInt(responses['Q' + i][0]) : null
      };
    });

    var tellegen_scores = questions_data.map(function(q) { return q.score; });
    var tellegen_total = tellegen_scores.reduce(function(sum, s) { return sum + (s || 0); }, 0);
    try {
      jsPsych.data.getLastTrialData().addToAll({
        tellegen_scores: tellegen_scores,
        tellegen_total: tellegen_total,
        tellegen_questions: questions_data
      });
    } catch (e) {
      console.warn('Could not inject Tellegen data into jsPsych store:', e);
    }

    saveJsonFile('Tellegen Responses', {
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp,
      reaction_time_ms: data.rt,
      questions: questions_data
    });
  }
};

// =====================================================================
// 13-closing-screen.js
// =====================================================================

var closing_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="text-align:center; max-width:44rem; margin:0 auto;">' + UCHICAGO_HEADER +
    '<h2 style="border:none; display:block; margin-top:1.5rem;">Thank You</h2>' +
    '<p style="font-size:1.05rem; margin-top:1rem;">Thank you for your participation in this study.</p>' +
    '<p style="color:#767676; font-size:0.9rem; margin-top:0.5rem;">Your responses have been recorded and will contribute to our research on human perception.</p>' +
    '<p style="margin-top:2rem;">Press any key to finish.</p></div>',
  on_finish: function(data) {
    var end_timestamp = performance.now();
    var start_timestamp = end_timestamp - data.rt;
    saveStimulusMap();
    saveJsonFile('Closing Screen', {
      reaction_time_ms: data.rt,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    });
    flushTrials('practice');
    flushTrials('actual');
  }
};

// =====================================================================
// timeline.js — Build and run
// =====================================================================

var all_video_urls = [];
practice_stimuli.forEach(function(s) {
  if (s.stimulus) all_video_urls = all_video_urls.concat(s.stimulus);
});
actual_stimuli.forEach(function(s) {
  if (s.stimulus) all_video_urls = all_video_urls.concat(s.stimulus);
});

var preload_videos = {
  type: jsPsychPreload,
  video: all_video_urls,
  show_progress_bar: true,
  message: '<div style="text-align:center; margin-top:3rem;">' +
    '<p style="font-size:1.3rem; color:#800000; font-family:Georgia,serif;">Loading experiment videos\u2026</p>' +
    '<p style="font-size:0.95rem; color:#767676;">This may take a moment.</p></div>'
};

var timeline = [];

timeline.push(
  subject_source,
  id_entry,
  consent_screen,
  nonconsent_screen,
  preload_videos,
  experiment_intro_screen,
  practice_intro_screen,
  practice_trials,
  practice_trials_complete_screen,
  actual_intro_screen,
  actual_trials_block_1,
  actual_break,
  actual_trials_block_2,
  actual_trials_complete_screen,
  questionnaires_intro_screen,
  tellegen_questionnaire,
  closing_screen
);

jsPsych.run(timeline);

} // end runExperiment