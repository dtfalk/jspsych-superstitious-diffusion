"""
Transform selected_videos folder into jsPsych stimuli structure.

Source: parent/S/vid_NNN.mp4, parent/X/vid_NNN.mp4
Output: output/actual-stimuli/S/S_N.mp4, output/actual-stimuli/X/X_N.mp4, etc.

Usage:
    python prepare-stimuli.py selected_videos assets/stimuli
    python prepare-stimuli.py selected_videos assets/stimuli --num-actual 6 --num-practice 2
    python prepare-stimuli.py selected_videos assets/stimuli --dry-run
"""

import argparse
import os
import random
import re
import shutil
import sys


def get_vid_index(filename):
    """Extract numeric index from vid_042.mp4 -> 42"""
    match = re.match(r"vid_(\d+)\.mp4", filename, re.IGNORECASE)
    return int(match.group(1)) if match else None


def main():
    parser = argparse.ArgumentParser(description="Prepare stimuli for jsPsych experiment")
    parser.add_argument("source", help="Folder containing S/ and X/ subfolders with mp4 files")
    parser.add_argument("output", help="Output folder to create")
    parser.add_argument("--num-actual", type=int, default=100, help="Pairs for actual trials")
    parser.add_argument("--num-practice", type=int, default=10, help="Pairs for practice trials")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    parser.add_argument("--dry-run", action="store_true", help="Print without copying")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    s_path = os.path.join(args.source, "S")
    x_path = os.path.join(args.source, "X")

    if not os.path.isdir(s_path) or not os.path.isdir(x_path):
        print(f"Error: Expected S/ and X/ subfolders in {args.source}")
        sys.exit(1)

    if not args.dry_run and os.path.exists(args.output):
        print(f"Error: Output folder '{args.output}' already exists.")
        sys.exit(1)

    # Get indices from each folder
    s_indices = {get_vid_index(f) for f in os.listdir(s_path) if f.endswith(".mp4")}
    x_indices = {get_vid_index(f) for f in os.listdir(x_path) if f.endswith(".mp4")}
    s_indices.discard(None)
    x_indices.discard(None)

    # Only use complete pairs, randomize order
    pairs = list(s_indices & x_indices)
    random.shuffle(pairs)
    print(f"Complete pairs: {len(pairs)} -> {pairs}")

    total_needed = args.num_actual + args.num_practice
    if len(pairs) < total_needed:
        print(f"Warning: Only {len(pairs)} pairs, need {total_needed}")

    actual_pairs = pairs[:args.num_actual]
    practice_pairs = pairs[args.num_actual:args.num_actual + args.num_practice]

    def copy_pair(idx, dest_type):
        for letter, src_folder in [("S", s_path), ("X", x_path)]:
            src = os.path.join(src_folder, f"vid_{idx:03d}.mp4")
            dest_dir = os.path.join(args.output, dest_type, letter)
            dest = os.path.join(dest_dir, f"{letter}_{idx}.mp4")
            
            if args.dry_run:
                print(f"  {src} -> {dest}")
            else:
                os.makedirs(dest_dir, exist_ok=True)
                shutil.copy2(src, dest)
                print(f"  {src} -> {dest}")

    print(f"\nActual pairs ({len(actual_pairs)}): {actual_pairs}")
    for idx in actual_pairs:
        copy_pair(idx, "actual-stimuli")

    print(f"\nPractice pairs ({len(practice_pairs)}): {practice_pairs}")
    for idx in practice_pairs:
        copy_pair(idx, "practice-stimuli")

    print(f"\nDone. {len(actual_pairs) + len(practice_pairs)} pairs processed.")


if __name__ == "__main__":
    main()
