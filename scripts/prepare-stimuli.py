"""
Transform a raw diffusion-output folder into the stimuli folder structure
expected by the jsPsych experiment.

Source structure (e.g. assets/medium):
    <source>/
        S/                      # uppercase letter folder
            metrics/            # ignored
            vid_000/
                deltas/         # ignored
                frames/         # ignored
                meta/           # ignored
                video_vid_000.mp4   # <-- the file we want
            vid_001/
                video_vid_001.mp4
            ...
        X/
            vid_000/
            ...

Target structure (e.g. assets/stimuli):
    <output>/
        actual-stimuli/
            S/
                S_0.mp4
                S_1.mp4
                ...
                S_99.mp4
            X/
                X_0.mp4
                ...
        practice-stimuli/
            S/
                S_100.mp4
                S_101.mp4
                ...
                S_104.mp4
            X/
                X_100.mp4
                ...

Usage:
    python prepare-stimuli.py assets/medium assets/stimuli
    python prepare-stimuli.py assets/medium assets/stimuli --num-actual 100 --num-practice 5
    python prepare-stimuli.py assets/medium assets/stimuli --dry-run
"""

import argparse
import os
import re
import shutil
import sys


def find_mp4(vid_folder_path):
    """Return the path to the first .mp4 file inside a vid_NNN folder."""
    for fname in os.listdir(vid_folder_path):
        if fname.lower().endswith(".mp4"):
            return os.path.join(vid_folder_path, fname)
    return None


def get_vid_index(folder_name):
    """Extract the numeric index from a folder name like 'vid_042'."""
    match = re.match(r"vid_(\d+)", folder_name)
    return int(match.group(1)) if match else None


def main():
    parser = argparse.ArgumentParser(
        description="Transform raw diffusion output into jsPsych stimuli folder structure."
    )
    parser.add_argument(
        "source",
        help="Path to the source folder containing letter subfolders (e.g. assets/medium)",
    )
    parser.add_argument(
        "output",
        help="Path to the output stimuli folder to create (e.g. assets/stimuli)",
    )
    parser.add_argument(
        "--num-actual",
        type=int,
        default=100,
        help="Number of videos per letter allocated to actual-stimuli (default: 100)",
    )
    parser.add_argument(
        "--num-practice",
        type=int,
        default=5,
        help="Number of videos per letter allocated to practice-stimuli (default: 5)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be copied without actually copying files",
    )
    args = parser.parse_args()

    source = args.source
    output = args.output
    num_actual = args.num_actual
    num_practice = args.num_practice
    practice_start_index = num_actual  # practice indices continue from actual

    if not os.path.isdir(source):
        print(f"Error: source folder '{source}' does not exist.")
        sys.exit(1)

    if not args.dry_run and os.path.exists(output):
        print(f"Error: output folder '{output}' already exists. Delete it first.")
        sys.exit(1)

    # Discover letter folders (skip non-directory entries and 'metrics')
    letter_folders = sorted(
        d
        for d in os.listdir(source)
        if os.path.isdir(os.path.join(source, d)) and d.lower() != "metrics"
    )

    if not letter_folders:
        print(f"Error: no letter subfolders found in '{source}'.")
        sys.exit(1)

    print(f"Source:          {source}")
    print(f"Output:          {output}")
    print(f"Letters found:   {', '.join(letter_folders)}")
    print(f"Actual per letter:   {num_actual}  (indices 0–{num_actual - 1})")
    print(
        f"Practice per letter: {num_practice}  (indices {practice_start_index}–{practice_start_index + num_practice - 1})"
    )
    total_needed = num_actual + num_practice
    print(f"Total needed per letter: {total_needed}")
    print()

    copied = 0
    skipped = 0

    for letter_folder in letter_folders:
        letter = letter_folder  # preserve original case
        letter_path = os.path.join(source, letter_folder)

        # Gather and sort vid_NNN subfolders by their numeric index
        vid_entries = []
        for d in os.listdir(letter_path):
            full = os.path.join(letter_path, d)
            if os.path.isdir(full) and d.startswith("vid_"):
                idx = get_vid_index(d)
                if idx is not None:
                    vid_entries.append((idx, full))

        vid_entries.sort(key=lambda x: x[0])

        if len(vid_entries) < total_needed:
            print(
                f"  WARNING: letter '{letter_folder}' has {len(vid_entries)} videos "
                f"but {total_needed} are needed. Will copy what is available."
            )

        for idx, vid_path in vid_entries:
            mp4_path = find_mp4(vid_path)
            if mp4_path is None:
                print(f"  WARNING: no .mp4 found in {vid_path}, skipping.")
                skipped += 1
                continue

            if idx < num_actual:
                # Goes to actual-stimuli
                dest_dir = os.path.join(output, "actual-stimuli", letter)
                dest_file = os.path.join(dest_dir, f"{letter}_{idx}.mp4")
            elif idx < total_needed:
                # Goes to practice-stimuli
                dest_dir = os.path.join(output, "practice-stimuli", letter)
                dest_file = os.path.join(dest_dir, f"{letter}_{idx}.mp4")
            else:
                # Beyond what we need — skip
                skipped += 1
                continue

            if args.dry_run:
                print(f"  [DRY RUN] {mp4_path}  →  {dest_file}")
            else:
                os.makedirs(dest_dir, exist_ok=True)
                shutil.copy2(mp4_path, dest_file)
                print(f"  {mp4_path}  →  {dest_file}")

            copied += 1

    print()
    print(f"Done. {copied} files {'would be ' if args.dry_run else ''}copied, {skipped} skipped.")


if __name__ == "__main__":
    main()
