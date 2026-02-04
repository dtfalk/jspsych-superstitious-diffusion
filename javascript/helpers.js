// Global state for experiment metadata
let subjectId = null
let experimentSource = null

// Track how many times we've saved data for a given subject ID
// within this browser session so we can generate distinct filenames
// when the same subject identifier is reused.
const subjectSaveCounts = {}

// When using "zip"-style local saving, we accumulate JSON payloads
// here and build a single downloadable archive at the end.
const zipEntries = []

// Get current high-resolution timestamp
function now() {
  return performance.now()
}

// ---- Metadata setters ----

function setSubjectId(id) {
  subjectId = id
}

function setExperimentSource(source) {
  experimentSource = source
}

// Helper to determine "a" vs "an" based on pronunciation
function getArticle(str) {
  const upper = str.toString().toUpperCase()
  // Letters that start with vowel sounds when pronounced
  const vowelSoundLetters = ['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X']
  // Numbers that start with vowel sounds (8, 11, 18, 80, etc.)
  const vowelSoundNumbers = ['8', '11', '18', '80', '800', '8000']
  
  if (vowelSoundLetters.includes(upper) || vowelSoundNumbers.includes(upper)) {
    return 'an'
  }
  return 'a'
}

// ---- Low-level JSON save helper ----

function saveJsonFile(stepName, payload) {
  if (CONFIG.dataSaveMode === 'none') return

  const subject = subjectId || 'unknown_subject'
  const source = experimentSource || 'unknown_source'

  const wrapper = {
    subjectId: subject,
    experimentSource: source,
    step: stepName,
    data: payload
  }

  if (CONFIG.dataSaveMode === 'local') {
    const ts = new Date().toISOString().replace(/[:.]/g, '-')

    // Sanitize subject ID for filenames and maintain a per-subject
    // counter so repeated uses of the same ID get distinct outputs.
    const safeSubject = String(subject).replace(/[^a-zA-Z0-9_-]/g, '_')
    if (!subjectSaveCounts[safeSubject]) {
      subjectSaveCounts[safeSubject] = 1
    } else {
      subjectSaveCounts[safeSubject] += 1
    }
    const suffix = subjectSaveCounts[safeSubject]

    const filename = `results_${safeSubject}_${suffix}_${stepName}_${ts}.json`
    const blob = new Blob([JSON.stringify(wrapper, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } else if (CONFIG.dataSaveMode === 'localZip') {
    // Defer creation of the actual zip until the very end; just
    // remember each logical file we want to include.
    const safeSubject = String(subject).replace(/[^a-zA-Z0-9_-]/g, '_')
    const filePathInZip = `results/${safeSubject}/${stepName}.json`
    zipEntries.push({ path: filePathInZip, payload: wrapper })
  } else if (CONFIG.dataSaveMode === 'server') {
    // Placeholder for future server-side upload implementation.
    // Example: fetch('/save', { method: 'POST', body: JSON.stringify(wrapper) })
  }
}

// ---- Video trial aggregation helpers ----

let practiceTrials = []
let actualTrials = []

// Called from the video trial's on_finish for both practice and actual
function recordVideoTrial(data) {
  const stimulusPath = Array.isArray(data.stimulus) ? data.stimulus[0] : null
  let stimulusNumber = null
  let stimulusType = null

  if (stimulusPath) {
    const parts = stimulusPath.split('/')
    const file = parts[parts.length - 1] || '' // e.g., r_003.mp4
    stimulusNumber = file.replace('.mp4', '')
    stimulusType = parts[parts.length - 2] || null // folder name (e.g., 'r' or 's')
  }

  const screenPresented = data.screen_presented_time || now()
  const responseTs = data.response_time_absolute || now()
  const videoStartTs = screenPresented // for this setup, video starts with the screen
  const videoEndTs = typeof window.__jspsych_video_ended === 'number' ? window.__jspsych_video_ended : -1

  const rtVideo = typeof data.rt === 'number' ? data.rt : responseTs - videoStartTs
  const totalTime = responseTs - screenPresented

  const responseKey = data.response

  // Outcome labels: treat CONFIG.targetLetters[0] as the
  // "signal present" condition and targetLetters[1] as "signal absent".
  let outcome = null
  if (typeof stimulusType === 'string' && typeof responseKey === 'string') {
    const signalLetter = CONFIG.targetLetters[0]
    const isSignal = stimulusType === signalLetter
    const isCorrect = responseKey === stimulusType

    if (isSignal && isCorrect) outcome = 'true_positive'
    else if (isSignal && !isCorrect) outcome = 'false_negative'
    else if (!isSignal && isCorrect) outcome = 'true_negative'
    else if (!isSignal && !isCorrect) outcome = 'false_positive'
  }

  const trialSummary = {
    screen_presented_timestamp: screenPresented,
    video_start_timestamp: videoStartTs,
    selection_timestamp: responseTs,
    reaction_time_ms: rtVideo,
    total_time_on_trial_ms: totalTime,
    video_end_timestamp: videoEndTs,
    stimulus_number: stimulusNumber,
    stimulus_type: stimulusType,
    response_key: responseKey,
    outcome,
    trial_type: data.trial_type || null,
    block_number: data.block_number || null
  }

  if (data.trial_type === 'practice') {
    practiceTrials.push(trialSummary)
  } else if (data.trial_type === 'actual') {
    actualTrials.push(trialSummary)
  }
}

function flushPracticeTrials() {
  if (practiceTrials.length === 0) return
  saveJsonFile('practice_trials', { trials: practiceTrials })
  practiceTrials = []
}

function flushActualTrials(blockNumber) {
  if (actualTrials.length === 0) return
  saveJsonFile(`actual_trials_block${blockNumber || 1}`, {
    block_number: blockNumber || 1,
    trials: actualTrials
  })
  actualTrials = []
}

// Build and download a zip file containing all accumulated
// JSON payloads when CONFIG.dataSaveMode === 'localZip'. This is
// meant to be called once at the very end of the experiment.
async function downloadZipIfNeeded() {
  if (CONFIG.dataSaveMode !== 'localZip') return
  if (!zipEntries.length) return
  if (typeof JSZip === 'undefined') {
    console.warn('JSZip library not loaded; cannot build zip archive.')
    return
  }

  const zip = new JSZip()
  zipEntries.forEach(entry => {
    zip.file(entry.path, JSON.stringify(entry.payload, null, 2))
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  const subject = subjectId || 'unknown_subject'
  const safeSubject = String(subject).replace(/[^a-zA-Z0-9_-]/g, '_')
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `results_${safeSubject}_${ts}.zip`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
