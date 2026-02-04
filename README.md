# Configuration Guide

The experiment configuration is managed in `javascript/config.js`.

## Quick Reference

### Data Saving
**`dataSaveMode`**: Controls how experiment data is saved
- `'local'` - Downloads JSON file after each step (verbose)
- `'localZip'` - Bundles all JSON files into a single ZIP at end (recommended)
- `'server'` - POST data to your backend endpoint
- `'show'` - Display data in browser (debugging only)
- `'none'` - No saving

### Task Parameters
**`targetLetters`**: Array of two letters used in stimuli (e.g., `["r", "s"]`)

**`continueKey`**: Keyboard key for advancing between screens (default: `"z"`)

### Stimuli Configuration

**`practice`**: Practice trial settings
- `folder`: Path to practice video files
- `nPerCondition`: Number of videos per target letter
- `stimulusStartIndex`: Starting number for practice stimulus naming (e.g., 100 → s_100.mp4, r_100.mp4)

**`main`**: Main task settings
- `folder`: Path to actual trial video files
- `nPerCondition`: Number of videos per target letter

## Example

```javascript
const CONFIG = {
  dataSaveMode: 'localZip',
  targetLetters: ["r", "s"],
  continueKey: "z",
  practice: {
    folder: "assets/stimuli/practice-stimuli",
    nPerCondition: 5,
    stimulusStartIndex: 100
  },
  main: {
    folder: "assets/stimuli/actual-stimuli",
    nPerCondition: 5
  }
};
```

## File Naming Convention

Videos must follow the pattern: `{letter}_{number}.mp4`
- Practice: `s_100.mp4`, `s_101.mp4`, ... `r_100.mp4`, `r_101.mp4`
- Main: `s_1.mp4`, `s_2.mp4`, ... `r_1.mp4`, `r_2.mp4`
