#!/usr/bin/env python3
"""
Format Cognition.run JSON results:
- Pretty prints JSON
- Drops practice trials
- Removes empty entries (value == '"')
- Extracts common metadata shared across all trials
- Keeps only actual trial data
"""

import json
import sys
from pathlib import Path

def is_empty_value(v):
    """Check if value is Cognition.run's empty placeholder."""
    return v == '"' or v == '"\\"' or v == '\\"'

def clean_trial(trial: dict) -> dict:
    """Remove empty entries from a trial object."""
    return {k: v for k, v in trial.items() if not is_empty_value(v)}

def extract_common_metadata(trials: list) -> tuple:
    """
    Find key-value pairs that are identical across ALL trials.
    Returns (metadata_dict, cleaned_trials_list).
    """
    if not trials:
        return {}, trials
    
    # Find keys that exist in ALL trials with the SAME value
    common_keys = {}
    first_trial = trials[0]
    
    for key, value in first_trial.items():
        # Check if this key-value pair is identical in all trials
        is_common = True
        for trial in trials[1:]:
            if key not in trial or trial[key] != value:
                is_common = False
                break
        
        if is_common:
            common_keys[key] = value
    
    # Remove common keys from each trial
    cleaned_trials = []
    for trial in trials:
        cleaned = {k: v for k, v in trial.items() if k not in common_keys}
        cleaned_trials.append(cleaned)
    
    return common_keys, cleaned_trials

def format_results(input_path: Path):
    """Format a results JSON file."""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Filter out practice trials and helper screens
    filtered = []
    for trial in data:
        trial_type = trial.get('trial_type', '')
        
        # Keep actual trials, questionnaires, and summary screens
        # Drop: practice trials, spacebar screens, fixation screens
        if trial_type == 'practice':
            continue
        if trial_type == 'html-keyboard-response':
            # Keep intro screens (have stimulus text) but drop spacebar prompts
            stimulus = trial.get('stimulus', '')
            if 'Press <strong>space</strong> to start' in stimulus:
                continue
            # Drop fixation screens (empty stimulus)
            if stimulus == '"' or stimulus == '':
                continue
        
        # Clean empty values from this trial
        cleaned = clean_trial(trial)
        filtered.append(cleaned)
    
    # Extract common metadata
    metadata, trials = extract_common_metadata(filtered)
    
    # Create output structure with metadata first
    output_data = {
        "metadata": metadata,
        "trials": trials
    }
    
    # Write pretty-printed output
    output_path = input_path.with_stem(input_path.stem + '_formatted')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    print(f"Trials: {len(data)} -> {len(trials)} (dropped {len(data) - len(trials)})")
    print(f"Metadata fields extracted: {len(metadata)}")
    
    return output_path

def main():
    # Default to all JSON files in results folder
    results_dir = Path(__file__).parent.parent / 'results'
    
    if len(sys.argv) > 1:
        # Process specific file
        input_path = Path(sys.argv[1])
        format_results(input_path)
    else:
        # Process all non-formatted JSON files in results
        json_files = [f for f in results_dir.glob('*.json') if '_formatted' not in f.stem]
        if not json_files:
            print(f"No JSON files found in {results_dir}")
            return
        
        for json_file in json_files:
            print(f"\n{'='*50}")
            format_results(json_file)

if __name__ == '__main__':
    main()
