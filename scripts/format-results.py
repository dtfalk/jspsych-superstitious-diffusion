#!/usr/bin/env python3
"""
Format Cognition.run JSON results:
- Pretty prints JSON
- Drops intermediate screens (spacebar prompts, blank delays)
- Removes empty entries (value == '"')
- Parses ALL stringified JSON fields into proper objects
- Extracts common metadata shared across all trials
- Parses stimulus filenames to extract letter/number
- Keeps BOTH practice and actual video trials
"""

import json
import sys
import re
from pathlib import Path

def is_empty_value(v):
    """Check if value is Cognition.run's empty placeholder."""
    return v == '"' or v == '"\\"' or v == '\\"'

def try_parse_json(value):
    """
    Try to parse a value as JSON if it looks like stringified JSON.
    Returns the parsed value, or the original if not JSON.
    """
    if not isinstance(value, str):
        return value
    
    # Check if it looks like JSON (starts with { or [)
    stripped = value.strip()
    if not stripped:
        return value
    
    if stripped.startswith(('{', '[')):
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            return value
    
    return value

def parse_response_field(response_str):
    """
    Parse the jsPsych response field.
    
    Input: '{"Q0":"Sona"}' or '{"Q0":"Yes, I consent to participate"}'
    Output: "Sona" or "Yes, I consent to participate" (extracts the value)
    """
    if not isinstance(response_str, str):
        return response_str
    
    try:
        parsed = json.loads(response_str)
        if isinstance(parsed, dict):
            # If there's only one key, return just the value
            if len(parsed) == 1:
                return list(parsed.values())[0]
            # Otherwise return the whole dict
            return parsed
        return parsed
    except json.JSONDecodeError:
        return response_str

def parse_stimulus_field(stimulus_str):
    """
    Parse stimulus field.
    
    For video trials: '["vanilla_paths_S_10.mp4"]' -> "vanilla_paths_S_10.mp4"
    For HTML screens: returns None (we'll remove it)
    """
    if not isinstance(stimulus_str, str):
        return stimulus_str
    
    # If it's HTML, return None (we don't want it in output)
    if '<div' in stimulus_str or '<p>' in stimulus_str or '<style>' in stimulus_str:
        return None
    
    # Try to parse as JSON array
    try:
        parsed = json.loads(stimulus_str)
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed[0]  # Return just the filename
        return stimulus_str
    except json.JSONDecodeError:
        return stimulus_str

def extract_stimulus_components(filename):
    """
    Extract condition, letter, number from stimulus filename.
    
    Input: "vanilla_paths_S_10.mp4"
    Output: {"stimulus_condition": "vanilla_paths", "stimulus_letter": "S", "stimulus_number": 10}
    """
    if not filename or not isinstance(filename, str):
        return {}
    
    # Remove path prefix if present
    filename = filename.split('/')[-1]
    
    # Parse: {condition}_{letter}_{number}.mp4
    match = re.match(r'^([a-z_]+)_([SX])_(\d+)\.mp4$', filename, re.IGNORECASE)
    if match:
        return {
            'stimulus_condition': match.group(1),
            'stimulus_letter': match.group(2).upper(),
            'stimulus_number': int(match.group(3))
        }
    
    return {}

def recursively_parse_json_strings(obj):
    """
    Recursively find and parse any stringified JSON within an object.
    """
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            result[key] = recursively_parse_json_strings(value)
        return result
    elif isinstance(obj, list):
        return [recursively_parse_json_strings(item) for item in obj]
    elif isinstance(obj, str):
        return try_parse_json(obj)
    else:
        return obj

def clean_trial(trial: dict) -> dict:
    """
    Clean a trial object:
    - Remove empty entries
    - Parse all stringified JSON fields
    - Handle response, stimulus specially
    """
    cleaned = {}
    
    for key, value in trial.items():
        # Skip empty values
        if is_empty_value(value):
            continue
        
        # Handle special fields
        if key == 'response':
            cleaned[key] = parse_response_field(value)
        elif key == 'stimulus':
            parsed = parse_stimulus_field(value)
            if parsed is not None:  # Skip HTML stimuli
                cleaned[key] = parsed
                # Also extract components for video trials
                components = extract_stimulus_components(parsed)
                cleaned.update(components)
        elif key.endswith('_data'):
            # Parse _data fields (consent_data, practice_trials_data, etc.)
            parsed = try_parse_json(value)
            # Flatten single-key dicts or keep as nested
            cleaned[key] = recursively_parse_json_strings(parsed)
        elif key in ('tellegen_questions', 'tellegen_scores', 'question_order'):
            # Parse array fields
            cleaned[key] = try_parse_json(value)
        else:
            # Regular field - still try to parse in case it's JSON
            cleaned[key] = try_parse_json(value)
    
    return cleaned

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
        # Skip complex types for common extraction
        if isinstance(value, (dict, list)):
            continue
            
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
    
    # Filter out helper screens, keep video trials and important screens
    filtered = []
    for trial in data:
        screen_name = trial.get('screen_name', '')
        trial_type = trial.get('trial_type', '')
        
        # Drop spacebar/ready screens and blank delays
        if 'Video Ready' in screen_name or 'Blank Delay' in screen_name:
            continue
        
        # Drop fixation screens (empty stimulus html-keyboard-response)
        if trial_type == 'html-keyboard-response':
            stimulus = trial.get('stimulus', '')
            if stimulus == '"' or stimulus == '':
                continue
        
        # Clean and parse the trial
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
    
    # Count trial types
    practice_count = sum(1 for t in trials if t.get('trial_type') == 'practice')
    actual_count = sum(1 for t in trials if t.get('trial_type') == 'actual')
    
    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    print(f"Trials: {len(data)} -> {len(trials)} (dropped {len(data) - len(trials)} helper screens)")
    print(f"  Practice trials: {practice_count}")
    print(f"  Actual trials: {actual_count}")
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
