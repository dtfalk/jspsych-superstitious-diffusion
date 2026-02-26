# Deployment Guide: Cognition.run

## Overview

This experiment runs on [cognition.run](https://www.cognition.run/) using **jsPsych 7.3**. Cognition.run provides jsPsych core, CSS, and all standard plugins automatically — no CDN links needed.

Video stimuli are uploaded directly to cognition.run alongside the experiment code. Filenames are **obfuscated** (random hex IDs like `a3f7b901c2e41d8f.mp4`) so participants cannot identify conditions.

Data is saved automatically by cognition.run when each participant finishes. Custom computed data (trial summaries, response classifications, questionnaire scores) is injected into jsPsych's data store during the experiment so it is captured alongside the standard trial data.

---

## Step 0: Obfuscate Stimulus Filenames

Before deploying, run the obfuscation script to rename all video files to random hex strings.

```powershell
# From the project root
.\scripts\obfuscate-stimuli.ps1
```

This does two things:
1. **Copies** every `.mp4` from `assets/stimuli/{actual,practice}-stimuli/` into a flat `assets/stimuli/v/` folder with randomised 16-character hex filenames
2. **Generates** `javascript/stimulus-map.js` — a lookup table mapping hex IDs to base64-encoded metadata (trial type, letter, index)

> **Re-run this script** whenever you add, remove, or rename stimulus files.

---

## Step 1: Deploy to Cognition.run

### Option A: GitHub Actions (recommended)

1. Add your Cognition Personal Access Token as a repo secret named `PERSONAL_ACCESS_TOKEN`
2. Add `.github/workflows/cognition-github-actions.yml`:

```yaml
on: [push]

jobs:
  cognition-deploy:
    runs-on: ubuntu-latest
    name: Deploy experiment to Cognition
    steps:
      - uses: actions/checkout@v3
      - uses: javidalpe/cognition-deploy-action@v1.2.0
        id: deploy
        with:
          personal-access-token: ${{secrets.PERSONAL_ACCESS_TOKEN}}
          jspsych-version: "7.3"
      - run: echo "The public link to the task is ${{ steps.deploy.outputs.link }}"
```

3. Push to trigger deployment. The action uploads all experiment files (HTML, JS, CSS, stimuli).

### Option B: Manual Upload

1. Log in to [cognition.run](https://www.cognition.run/)
2. Create a **New Task**
3. In the code editor, paste the contents of your JS files or use the upload feature
4. Upload stimuli files from `assets/stimuli/v/`
5. Set jsPsych version to **7.3** in task settings

---

## Step 2: Verify

1. Click **Run** to test the experiment
2. Open browser DevTools (F12) → Console to check for errors
3. Verify:
   - Videos load correctly
   - Data saves at each step (check console for `saveJsonFile called:` messages)
   - Blocks are balanced (each block has half of each letter)
4. Complete a test run, then check **Results** in cognition.run dashboard

---

## Data Format

Cognition.run automatically saves all jsPsych trial data (CSV/JSON/SQL export available). Each video trial includes these injected custom fields:

| Field | Description |
|-------|-------------|
| Trial Type | `practice` or `actual` |
| Block Number | `1`, `2`, or `null` (practice) |
| Trial Number | Sequential within type |
| Stimulus Number | Original stimulus index |
| Stimulus Character | Target letter (`S` or `X`) |
| Original Filename | Real filename (e.g., `S_42.mp4`) |
| Obfuscated Filename | Hex filename shown to participant |
| Response Character | Key pressed |
| Response Classification | `true_positive`, `false_negative`, `true_negative`, `false_positive` |
| Timing fields | Various timestamps and derived durations |

Tellegen questionnaire trials include `tellegen_scores` (array of 34 numeric scores) and `tellegen_total`.

---

## Switching to Local Development

In `javascript/config.js`, change:

```javascript
dataSaveMode: 'localZip',  // or 'local', 'show', 'none'
```

For local testing, you can open `index.html` directly, but you'll need to add jsPsych script tags back temporarily or serve via a local web server.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Experiment doesn't start | Ensure jsPsych version is set to 7.3 in cognition.run task settings |
| Videos don't load (404) | Verify stimuli files are uploaded to cognition.run and paths match `assets/stimuli/v/` |
| `STIMULUS_MAP` not defined | Ensure `stimulus-map.js` was generated and uploaded |
| Data missing custom fields | Check browser console for `Could not inject trial summary` warnings |
| Plugins not found | Cognition.run provides standard plugins; verify task is set to jsPsych 7.3 |
