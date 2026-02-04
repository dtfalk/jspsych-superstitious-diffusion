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

// ---- Setters and Getters ----

// Sets the subject ID
function setSubjectId(id) {
    subjectId = id
}

// Sets the experimental source
function setExperimentSource(source) {
    experimentSource = source
}


// Helper to determine "a" vs "an" based on pronunciation
function getArticle(str) {
    
    // Cast uppercase
    const upper = str.toString().toUpperCase()
    
    // Letters that start with vowel sounds when pronounced
    const vowelSoundLetters = ['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X']
    
    // Numbers that start with vowel sounds (8, 11, 18, 80, etc.)
    const vowelSoundNumbers = ['8', '11', '18', '80', '800', '8000']

    // Return "an" vs "a" when appropriate
    if (vowelSoundLetters.includes(upper) || vowelSoundNumbers.includes(upper)) {
        return 'an'
    }
    return 'a'
}


// ---- Low-level JSON save helper ----
function saveJsonFile(stepName, payload) {
    console.log('saveJsonFile called:', stepName, 'mode:', CONFIG.dataSaveMode)

    // Exit early if not set to save any data
    if (CONFIG.dataSaveMode === 'none') return

    // Grab subject ID and experimental source
    const subject = subjectId || 'unknown_subject'
    const source = experimentSource || 'unknown_source'

    // Helpful wrapper structuring all data saved
    const wrapper = {
        subjectId: subject,
        experimentSource: source,
        step: stepName,
        data: payload
    }

    // If save mode is page by page, json by json (helpful for dev)
    if (CONFIG.dataSaveMode === 'local') {

        // Grab current timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

        // Sanitize subject ID for filenames and maintain a per-subject
        // counter so repeated uses of the same ID get distinct outputs.
        const safeSubject = String(subject).replace(/[^a-zA-Z0-9_-]/g, '_')
        if (!subjectSaveCounts[safeSubject]) {
            subjectSaveCounts[safeSubject] = 1
        } 
        else {
            subjectSaveCounts[safeSubject] += 1
        }
        const suffix = subjectSaveCounts[safeSubject]

        // Create and save JSON file
        const filename = `results_${safeSubject}_${suffix}_${stepName}_${timestamp}.json`
        const blob = new Blob([JSON.stringify(wrapper, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    // When we save all data as a zip at the end of the experiment 
    else if (CONFIG.dataSaveMode === 'localZip') {
        // Defer creation of the actual zip until the very end; just
        // remember each logical file we want to include.
        const safeSubject = String(subject).replace(/[^a-zA-Z0-9_-]/g, '_')
        const filePathInZip = `results/${safeSubject}/${stepName}.json`
        zipEntries.push({ path: filePathInZip, payload: wrapper })
    } 
    else if (CONFIG.dataSaveMode === 'server') {
        // Placeholder for future server-side upload implementation.
        // Example: fetch('/save', { method: 'POST', body: JSON.stringify(wrapper) })
    }
}


// ---- Video trial aggregation helpers ----

let practiceTrials = []
let actualTrials = []

// Called from the video trial's on_finish for both practice and actual
function recordVideoTrial(data) {

    // Get the path of the stimulus shown and log it
    const stimulusPath = Array.isArray(data.stimulus) ? data.stimulus[0] : (typeof data.stimulus === 'string' ? data.stimulus : null)
    console.log('recordVideoTrial called, Stimulus Path: ', stimulusPath)

    // Extract stimulus number and stimulus type
    // Pathname MUST be {root_directory}/assets/{trial_type}-stimuli/{letter}/{letter}_{stimulus_number}.mp4
    // where...
    // 1) {trial_type} is either "practice" or "actual"
    // 2) {letter} is one of the two letters the subject is searching for
    // E.G .../root_dir/assets/practice-stimuli/r/r_8.mp4
    // E.G .../root_dir/assets/actual-stimuli/s/s_94.mp4
    const parts = stimulusPath.split('/')
    const file = parts[parts.length - 1]
    const fileWithoutExt = file.replace('.mp4', '')
    const stimulusNumber = fileWithoutExt.split('_')[1]
    const stimulusType = parts[parts.length - 2]
    const trialType = parts[parts.length - 3].replace('-stimuli', '')

    // Relevant timestamps
    const spacebarScreenPresentedTimestamp = data.spacebar_screen_presented_timestamp
    const spacebarPressedTimestamp = data.spacebar_pressed_timestamp
    const videoStartTimestamp = data.video_start_timestamp
    const responseTimestamp = data.response_timestamp
    const videoEndTimestamp = typeof window.__jspsych_video_ended === 'number' ? window.__jspsych_video_ended : -1

    // Dervied times
    const preVideoWaitTime = spacebarPressedTimestamp - spacebarScreenPresentedTimestamp
    const videoPresentationLag = videoStartTimestamp - spacebarPressedTimestamp
    const responseTime = responseTimestamp - videoStartTimestamp
    const delayTime = videoEndTimestamp === -1 ? -1: responseTimestamp - videoEndTimestamp
    const totalTime = responseTimestamp - spacebarScreenPresentedTimestamp

    // Recover which selection the subject made
    const responseKey = data.response

    // Recover which trial the subject just completed
    let trialNumber = null;
    if      (trialType === "practice") {trialNumber = practiceTrials.length + 1}
    else if (trialType === "actual")   {trialNumber = actualTrials.length + 1}
    
    // Get block number from data if available
    const blockNumber = data.block_number || null;

    // Outcome labels
    // -------------- 
    // Treat CONFIG.targetLetters[0] as the "target"
    // Treat CONFIG.targetLetters[1] as the "distractor"
    let outcome = null
    const signalLetter = CONFIG.targetLetters[0]
    const isSignal = stimulusType === signalLetter
    const isCorrect = responseKey === stimulusType
    if      ( isSignal &&  isCorrect) outcome = 'true_positive'
    else if ( isSignal && !isCorrect) outcome = 'false_negative'
    else if (!isSignal &&  isCorrect) outcome = 'true_negative'
    else if (!isSignal && !isCorrect) outcome = 'false_positive'

    // Construct JSON with all trial info
    const trialSummary = {
        "Trial Type":                                trialType,
        "Block Number":                              blockNumber,
        "Trial Number":                              trialNumber,
        "Stimulus Number":                           stimulusNumber,
        "Stimulus Character":                        stimulusType,
        "Response Character":                        responseKey,
        "Response Classification":                   outcome,
        "Trial Presented Timestamp":                 spacebarScreenPresentedTimestamp,
        "Begin Stimulus Key Press Timestamp":        videoStartTimestamp,
        "Stimulus Video Started Timestamp":          videoStartTimestamp,
        "Subject Response Timestamp":                responseTimestamp,
        "Stimulus Video Completed Timestamp":        videoEndTimestamp,
        "Pre Stimulus Video Wait Time":              preVideoWaitTime,
        "Time Between Key Press and Video Start":    videoPresentationLag,
        "Response Time":                             responseTime,
        "Time After Video End Before Decision Made": delayTime,
        "Total Trial Time":                          totalTime
    }

    // Push trial data to its respective list
    if (trialType === 'practice')   {practiceTrials.push(trialSummary)} 
    else if (trialType === "actual") {actualTrials.push(trialSummary)}
}


// Saves trials to a JSON
function flushTrials(trialType) {
    
    // Determine whether we are working with actual or practice trials
    let trials = null;
    if (trialType === "practice") {trials = practiceTrials}
    else if (trialType === "actual"){trials = actualTrials}
    
    // Don't save if no trials completed
    if (trials.length === 0) return

    // Otherwise, save trials as JSON
    saveJsonFile(`${trialType[0].toUpperCase() + trialType.slice(1)} Trials`, {trials: trials})
    
    // Empty the trials list to save space
    if (trialType === "practice") {practiceTrials = []}
    else if (trialType === "actual"){actualTrials = []}
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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `results_${safeSubject}_${timestamp}.zip`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
