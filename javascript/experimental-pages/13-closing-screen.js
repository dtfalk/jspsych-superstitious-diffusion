const closing_screen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Thank you for participating.</p><p>Press any key to finish.</p>",
  on_start: function(trial) {
    trial.start_time = performance.now()
  },
  on_finish: async function(data) {
    const end_time = performance.now()
    
    // Save the stimulus map so it's always in the results for review
    saveStimulusMap()

    saveJsonFile('Closing Screen', {
      reaction_time_ms: data.rt,
      start_timestamp: data.start_time,
      end_timestamp: end_time
    })
    
    if (CONFIG.dataSaveMode === 'show') {
      jsPsych.data.displayData()
    } else if (CONFIG.dataSaveMode === 'cognition') {
      // On cognition.run, all jsPsych data (including injected custom
      // fields) is saved automatically when the experiment finishes.
      flushTrials('practice')
      flushTrials('actual')
    } else {
      // Flush any remaining trials
      flushTrials('practice')
      flushTrials('actual')

      if (CONFIG.dataSaveMode === 'localZip') {
        // Bundle all accumulated JSON payloads into a single
        // downloadable zip archive per participant.
        await downloadZipIfNeeded()
      }
    }
  }
}
