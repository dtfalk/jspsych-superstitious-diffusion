#!/usr/bin/env python3
"""
Generate stimulus-indices.js from folder contents.
Run after prepare-stimuli.py.

Usage: python scripts/generate-indices.py stimuli/
"""
import sys
import re
from pathlib import Path

def get_indices(folder):
    """Extract numeric indices from S_*.mp4 files in folder/S/"""
    s_folder = folder / "S"
    if not s_folder.exists():
        return []
    indices = []
    for f in s_folder.glob("S_*.mp4"):
        m = re.match(r"S_(\d+)\.mp4", f.name)
        if m:
            indices.append(int(m.group(1)))
    return sorted(indices)

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-indices.py <stimuli_root>")
        sys.exit(1)
    
    root = Path(sys.argv[1])
    
    # Find all condition folders (e.g., shared_paths, vanilla_paths)
    conditions = {}
    for cond_dir in root.iterdir():
        if not cond_dir.is_dir():
            continue
        cond_name = cond_dir.name
        
        actual = cond_dir / "actual-stimuli"
        practice = cond_dir / "practice-stimuli"
        
        conditions[cond_name] = {
            "actual": get_indices(actual) if actual.exists() else [],
            "practice": get_indices(practice) if practice.exists() else []
        }
    
    # Output JS
    print("var STIMULUS_INDICES = {")
    for i, (cond, data) in enumerate(conditions.items()):
        comma = "," if i < len(conditions) - 1 else ""
        print(f'  {cond}: {{')
        print(f'    actual: {data["actual"]},')
        print(f'    practice: {data["practice"]}')
        print(f'  }}{comma}')
    print("};")

if __name__ == "__main__":
    main()
