const closing = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Thank you for participating.</p><p>Press any key to finish.</p>",
  on_finish: () => {
    if (CONFIG.dataSaveMode === 'show') {
      jsPsych.data.displayData()
    } else if (CONFIG.dataSaveMode === 'localZip') {
      // Bundle all accumulated JSON payloads into a single
      // downloadable zip archive per participant.
      downloadZipIfNeeded()
    }
  }
}
