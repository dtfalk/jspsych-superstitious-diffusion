# Cognition.run Experiment Files

This folder contains all the JavaScript and CSS files needed to run the **Superstitious Perception** experiment on [Cognition.run](https://cognition.run).

---

## Table of Contents

- [File Overview](#file-overview)
- [Configuration](#configuration)
- [Video File Naming](#video-file-naming)
- [STIMULUS_INDICES](#stimulus_indices)
- [Setup Steps](#setup-steps)
- [Data Handling](#data-handling)

---

## File Overview

### External JS Files (upload in this order)

| # | File | Description |
|---|------|-------------|
| 1 | `plugin-loader.js` | Loads jsPsych plugins from CDN. **Must be first** — other files depend on it. |
| 2 | `config.js` | Settings and configuration: `DEV_MODE` switch, condition settings, `STIMULUS_INDICES` |
| 3 | `data-recording.js` | Records trial data: `recordVideoTrial()`, timing metrics, response classification |
| 4 | `stimulus-loader.js` | Builds video URL arrays: `loadStimuli()`, splits trials into blocks, handles preload URLs |
| 5 | `screens.js` | All instruction screens: consent, intros, practice, breaks, closing |
| 6 | `video-trials.js` | Video trial logic: practice/actual trial structure, timestamp recording |
| 7 | `questionnaires.js` | Tellegen Absorption Scale (34 items) |
| 8 | `dev.js` | **[OPTIONAL]** Development tools: condition picker. Only needed when `DEV_MODE = true` |

### External CSS

| File | Description |
|------|-------------|
| `styles.css` | All experiment styling |

### Task Code

| File | Description |
|------|-------------|
| `experiment.js` | Main experiment file — paste into Cognition.run Task Code editor. Initializes jsPsych, builds timeline, runs experiment. |

---

## Configuration

All configuration is in `config.js`.

### Master Switches

| Variable | Values | Description |
|----------|--------|-------------|
| `DEV_MODE` | `true` / `false` | `true` = dev mode (shows condition picker if enabled). `false` = production mode. |
| `RANDOMIZE_CONDITION` | `true` / `false` | `true` = 50/50 random assignment. `false` = use `FIXED_CONDITION`. |
| `FIXED_CONDITION` | `"shared_paths"` / `"vanilla_paths"` | Which condition to use when `RANDOMIZE_CONDITION = false`. |

### Stimulus Limits

These work in **both dev and prod mode** — useful for testing the full experiment flow quickly.

| Variable | Values | Description |
|----------|--------|-------------|
| `ACTUAL_LIMIT` | `0` = all, or a number | Number of actual stimulus pairs to use (e.g., `5` = 10 videos) |
| `PRACTICE_LIMIT` | `0` = all, or a number | Number of practice stimulus pairs to use (e.g., `3` = 6 videos) |

### Dev-Only Settings

These only apply when `DEV_MODE = true`:

| Variable | Description |
|----------|-------------|
| `DEV_CONDITION` | Which condition to test (only used if `SHOW_CONDITION_PICKER = false`) |
| `SHOW_CONDITION_PICKER` | `true` = show picker at start, `false` = use `DEV_CONDITION` automatically |

### Typical Setups

#### Quick Testing (limited stimuli, with picker)

```javascript
DEV_MODE = true
SHOW_CONDITION_PICKER = true
ACTUAL_LIMIT = 5
PRACTICE_LIMIT = 3
```

#### Test Full Experiment Flow

```javascript
DEV_MODE = false
ACTUAL_LIMIT = 5
PRACTICE_LIMIT = 3
```

#### Run One Condition Only (full stimuli)

```javascript
DEV_MODE = false
RANDOMIZE_CONDITION = false
FIXED_CONDITION = "shared_paths"
ACTUAL_LIMIT = 0
PRACTICE_LIMIT = 0
```

#### Full Study (random assignment)

```javascript
DEV_MODE = false
RANDOMIZE_CONDITION = true
ACTUAL_LIMIT = 0
PRACTICE_LIMIT = 0
```

---

## Video File Naming

Videos must follow this naming convention:

```
{condition}_{letter}_{number}.mp4
```

### Examples

| Filename | Condition | Letter | Stimulus # |
|----------|-----------|--------|------------|
| `shared_paths_S_10.mp4` | shared_paths | S | 10 |
| `shared_paths_X_10.mp4` | shared_paths | X | 10 |
| `vanilla_paths_S_42.mp4` | vanilla_paths | S | 42 |
| `vanilla_paths_X_42.mp4` | vanilla_paths | X | 42 |

---

## STIMULUS_INDICES

The `STIMULUS_INDICES` object in `config.js` lists which video numbers exist:

```javascript
var STIMULUS_INDICES = {
  shared_paths: {
    actual: [10, 16, 27, ...],     // Numbers for actual trials
    practice: [20, 85, 152, ...]   // Numbers for practice trials
  },
  vanilla_paths: {
    actual: [10, 16, 27, ...],
    practice: [20, 85, 152, ...]
  }
};
```

### Generating Indices

Run this command to generate the indices from your stimuli folder:

```bash
python scripts/generate-indices.py stimuli/
```

---

## Setup Steps

1. **Generate videos** and get index list:
   ```bash
   python scripts/prepare-stimuli.py source_folder output_folder
   ```

2. **Update `STIMULUS_INDICES`** in `config.js` with the generated indices

3. **Upload videos** to Cognition.run Stimuli section

4. **Upload external JS files** (in order listed above)

5. **Upload `styles.css`**

6. **Paste `experiment.js`** into Task Code editor

7. **Test with Preview** — check browser console for errors

---

## Data Handling

### Consent Flow

| Participant Response | What Happens |
|---------------------|--------------|
| **Consents** | Experiment continues normally. All trial data is saved. At the end, they see "Your responses have been saved" and are told they may close the tab. |
| **Does NOT consent** | Experiment ends immediately. **No data is saved.** They see "Thank you for considering participation" and are told they may close the tab. |

### Data Saving

- Data is saved throughout the experiment via `saveJsonFile()`
- This adds data to jsPsych's data store
- Cognition.run automatically saves all data when the experiment ends
- The closing screen ensures all data is saved before telling participants they can close

---

## Project Structure

```
cognition_code/
├── README.md              ← You are here
├── experiment.js          ← Task Code (paste into Cognition.run)
└── external/
    ├── plugin-loader.js   ← External JS #1
    ├── config.js          ← External JS #2
    ├── data-recording.js  ← External JS #3
    ├── stimulus-loader.js ← External JS #4
    ├── screens.js         ← External JS #5
    ├── video-trials.js    ← External JS #6
    ├── questionnaires.js  ← External JS #7
    ├── dev.js             ← External JS #8 (optional)
    ├── styles.css         ← External CSS
    └── README.txt         ← Original plain-text readme
```
