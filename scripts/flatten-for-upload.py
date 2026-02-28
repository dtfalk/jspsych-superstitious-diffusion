#!/usr/bin/env python3
"""
Flatten stimuli for Cognition.run upload.
Prepends condition name to each file: S_10.mp4 → shared_S_10.mp4

Usage: python scripts/flatten-for-upload.py stimuli/ upload/
"""
import sys
import shutil
from pathlib import Path

def main():
    if len(sys.argv) < 3:
        print("Usage: python flatten-for-upload.py <stimuli_root> <output_dir>")
        print("Example: python flatten-for-upload.py stimuli/ upload/")
        sys.exit(1)
    
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    dst.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for cond_dir in src.iterdir():
        if not cond_dir.is_dir():
            continue
        cond = cond_dir.name  # e.g., "shared_paths"
        
        # Find all .mp4 files recursively
        for mp4 in cond_dir.rglob("*.mp4"):
            # New name: shared_paths_S_10.mp4
            new_name = f"{cond}_{mp4.name}"
            shutil.copy2(mp4, dst / new_name)
            count += 1
    
    print(f"Copied {count} files to {dst}/")
    print(f"Example: {cond}_{mp4.name}")

if __name__ == "__main__":
    main()
