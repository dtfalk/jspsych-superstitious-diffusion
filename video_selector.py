import os
import sys
import shutil
import cv2
import ctypes
from pathlib import Path
from PIL import Image, ImageTk
import tkinter as tk
from tkinter import messagebox

# Enable per-monitor DPI awareness on Windows so the app scales
# correctly when dragged between monitors with different DPI/resolution.
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)  # PROCESS_PER_MONITOR_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

OUTPUT_DIR_NAME = "selected_videos"
# Thumbnail size and columns are computed dynamically in the app
# based on the current screen dimensions.


def find_paired_videos(parent_folder):
    """Find matching vid_NNN mp4 files in both S and X subfolders."""
    s_folder = os.path.join(parent_folder, "S")
    x_folder = os.path.join(parent_folder, "X")

    if not os.path.isdir(s_folder):
        print(f"ERROR: S subfolder not found at {s_folder}")
        sys.exit(1)
    if not os.path.isdir(x_folder):
        print(f"ERROR: X subfolder not found at {x_folder}")
        sys.exit(1)

    pairs = []
    for i in range(1024):
        vid_name = f"vid_{str(i).zfill(3)}"
        s_path = os.path.join(s_folder, vid_name, f"video_{vid_name}.mp4")
        x_path = os.path.join(x_folder, vid_name, f"video_{vid_name}.mp4")
        if os.path.exists(s_path) and os.path.exists(x_path):
            pairs.append((vid_name, s_path, x_path))

    print(f"DEBUG: Found {len(pairs)} paired videos")
    return pairs


def extract_last_frame(video_path, thumbnail_size=(200, 150)):
    if not os.path.exists(video_path):
        return None

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count <= 0:
        cap.release()
        return None

    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count - 1)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        return None

    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(frame)
    img.thumbnail(thumbnail_size)
    return img


class VideoSelectorApp:
    def __init__(self, root, pairs, parent_folder):
        self.root = root
        self.pairs = pairs  # list of (vid_name, s_path, x_path)
        self.parent_folder = parent_folder
        self.selected = set()  # set of indices into self.pairs
        self.photo_refs = []
        self.pair_frames = {}  # index -> pair outer frame
        self._last_cols = None  # track column count for reflow
        self.lazy_load_buffer = 200  # Number of images to preload above and below the current view
        self.loaded_thumbnails = {}  # Cache for loaded thumbnails
        self.scroll_debounce = None  # Timer for debouncing scroll events
        self.preload_buffer = 100  # Number of images to preload in advance

        root.title("Video Pair Selector (S vs X)")

        # --- Size the window to 90% of the current screen ---
        screen_w = root.winfo_screenwidth()
        screen_h = root.winfo_screenheight()
        win_w = int(screen_w * 0.9)
        win_h = int(screen_h * 0.9)
        x = (screen_w - win_w) // 2
        y = (screen_h - win_h) // 2
        root.geometry(f"{win_w}x{win_h}+{x}+{y}")

        # Compute thumbnail size and columns based on screen width.
        # Each pair shows two thumbnails side-by-side + padding, so
        # pair_width ≈ 2*thumb_w + 40.  We want PAIRS_PER_ROW pairs
        # to fit in win_w.
        self.pairs_per_row = max(1, min(6, win_w // 440))
        thumb_w = max(120, (win_w // self.pairs_per_row - 50) // 2)
        thumb_h = int(thumb_w * 0.75)
        self.thumbnail_size = (thumb_w, thumb_h)
        print(f"DEBUG: screen={screen_w}x{screen_h}  window={win_w}x{win_h}  "
              f"cols={self.pairs_per_row}  thumb={self.thumbnail_size}")

        # --- Top bar ---
        top_bar = tk.Frame(root)
        top_bar.pack(fill="x", pady=5)

        self.counter = tk.Label(top_bar, text="", font=("Arial", 14))
        self.counter.pack(side="left", padx=15)

        submit_btn = tk.Button(top_bar, text="Submit Selection", font=("Arial", 12),
                               command=self.submit, bg="#4CAF50", fg="white",
                               padx=15, pady=4)
        submit_btn.pack(side="right", padx=15)

        # --- Scrollable area ---
        container = tk.Frame(root)
        container.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(container, bg="#1e1e1e")
        self.scrollbar = tk.Scrollbar(container, orient="vertical", command=self.canvas.yview)

        self.scrollable_frame = tk.Frame(self.canvas, bg="#1e1e1e")
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")

        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

        # Reflow grid when the canvas (window) is resized
        self.canvas.bind("<Configure>", self._on_canvas_resize)

        # Configure grid columns
        for col in range(self.pairs_per_row):
            self.scrollable_frame.columnconfigure(col, weight=1)

        print("DEBUG: Loading paired thumbnails...")
        self.load_thumbnails()
        self.update_counter()

    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def _on_canvas_resize(self, event):
        """Clear and redraw the canvas on resize."""
        self.canvas.delete("all")  # Clear the canvas
        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.load_visible_thumbnails()  # Reload visible thumbnails

    def update_counter(self):
        self.counter.config(
            text=f"Selected: {len(self.selected)} / {len(self.pairs)} pairs"
        )

    def toggle(self, idx):
        frame = self.pair_frames[idx]
        if idx in self.selected:
            self.selected.remove(idx)
            frame.config(bg="#1e1e1e", highlightbackground="#444", highlightthickness=2)
        else:
            self.selected.add(idx)
            frame.config(bg="#2e7d32", highlightbackground="#66bb6a", highlightthickness=3)
        self.update_counter()

    def _bind_click(self, widget, idx):
        """Recursively bind click to widget and all children."""
        widget.bind("<Button-1>", lambda e, i=idx: self.toggle(i))
        for child in widget.winfo_children():
            self._bind_click(child, idx)

    def load_visible_thumbnails(self):
        """Load thumbnails for visible pairs and a buffer around them."""
        visible_start = max(0, self.canvas.yview()[0] * len(self.pairs) - self.lazy_load_buffer)
        visible_end = min(len(self.pairs), self.canvas.yview()[1] * len(self.pairs) + self.lazy_load_buffer)

        preload_start = max(0, visible_start - self.preload_buffer)
        preload_end = min(len(self.pairs), visible_end + self.preload_buffer)

        for idx in range(int(preload_start), int(preload_end)):
            if idx not in self.loaded_thumbnails:
                vid_name, s_path, x_path = self.pairs[idx]
                self.loaded_thumbnails[idx] = (
                    extract_last_frame(s_path, self.thumbnail_size),
                    extract_last_frame(x_path, self.thumbnail_size)
                )

        # Remove thumbnails outside the buffer to free memory
        for idx in list(self.loaded_thumbnails.keys()):
            if idx < preload_start or idx > preload_end:
                del self.loaded_thumbnails[idx]

    def _on_canvas_scroll(self, event):
        """Debounced scroll handler to prevent excessive updates."""
        if self.scroll_debounce:
            self.root.after_cancel(self.scroll_debounce)
        self.scroll_debounce = self.root.after(50, lambda: self._perform_scroll(event))

    def _perform_scroll(self, event):
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        self.load_visible_thumbnails()

    def load_thumbnails(self):
        """Initial thumbnail loading for the first visible set."""
        self.load_visible_thumbnails()
        for idx, (vid_name, s_path, x_path) in enumerate(self.pairs):
            if idx in self.loaded_thumbnails:
                s_img, x_img = self.loaded_thumbnails[idx]

                row = idx // self.pairs_per_row
                col = idx % self.pairs_per_row

                # Outer frame for the pair
                pair_frame = tk.Frame(self.scrollable_frame, bd=0, bg="#1e1e1e",
                                          highlightbackground="#444", highlightthickness=2)
                pair_frame.grid(row=row, column=col, padx=6, pady=6, sticky="nsew")
                self.pair_frames[idx] = pair_frame

                # Title label
                title = tk.Label(pair_frame, text=vid_name, font=("Arial", 10, "bold"),
                             bg="#1e1e1e", fg="white")
                title.pack(pady=(4, 2))

                # Side-by-side container
                side_frame = tk.Frame(pair_frame, bg="#1e1e1e")
                side_frame.pack(padx=4, pady=(0, 4))

                # S thumbnail
                s_photo = ImageTk.PhotoImage(s_img)
                self.photo_refs.append(s_photo)
                s_container = tk.Frame(side_frame, bg="#1e1e1e")
                s_container.pack(side="left", padx=2)
                s_lbl = tk.Label(s_container, text="S", font=("Arial", 9, "bold"),
                                 bg="#1e1e1e", fg="#64b5f6")
                s_lbl.pack()
                s_img_lbl = tk.Label(s_container, image=s_photo, bg="#1e1e1e")
                s_img_lbl.pack()

                # X thumbnail
                x_photo = ImageTk.PhotoImage(x_img)
                self.photo_refs.append(x_photo)
                x_container = tk.Frame(side_frame, bg="#1e1e1e")
                x_container.pack(side="left", padx=2)
                x_lbl = tk.Label(x_container, text="X", font=("Arial", 9, "bold"),
                                 bg="#1e1e1e", fg="#ef5350")
                x_lbl.pack()
                x_img_lbl = tk.Label(x_container, image=x_photo, bg="#1e1e1e")
                x_img_lbl.pack()

                # Bind clicks on entire pair frame and all children
                self._bind_click(pair_frame, idx)

                if (idx + 1) % 10 == 0:
                    print(f"DEBUG: Loaded {idx + 1}/{len(self.pairs)} pairs")

        print(f"DEBUG: Total pair widgets: {len(self.pair_frames)}")

    def submit(self):
        if not self.selected:
            messagebox.showinfo("No Selection", "No pairs selected.")
            return

        output_dir = Path.cwd() / OUTPUT_DIR_NAME
        s_out = output_dir / "S"
        x_out = output_dir / "X"
        s_out.mkdir(parents=True, exist_ok=True)
        x_out.mkdir(parents=True, exist_ok=True)

        for idx in sorted(self.selected):
            vid_name, s_path, x_path = self.pairs[idx]

            # Preserve vid_NNN subfolder structure
            s_dest = s_out / vid_name
            x_dest = x_out / vid_name
            s_dest.mkdir(exist_ok=True)
            x_dest.mkdir(exist_ok=True)

            shutil.copy(s_path, s_dest)
            shutil.copy(x_path, x_dest)
            print(f"DEBUG: Copied pair {vid_name}")

        messagebox.showinfo(
            "Done",
            f"Copied {len(self.selected)} pairs to:\n{output_dir}\n\n"
            f"  S videos → {s_out}\n  X videos → {x_out}"
        )
        self.root.quit()


def main():
    print("DEBUG: Script started")

    if len(sys.argv) != 2:
        print("Usage: python video_selector.py <parent_folder>")
        print("  parent_folder should contain S/ and X/ subfolders")
        print("  e.g.: python video_selector.py output/paired_sig0.25_k12.0_cfg8.5/medium")
        sys.exit(1)

    folder = sys.argv[1]
    print(f"DEBUG: Using parent folder: {folder}")

    if not os.path.isdir(folder):
        print("Provided path is not a directory.")
        sys.exit(1)

    pairs = find_paired_videos(folder)

    if not pairs:
        print("No matching video pairs found in S/ and X/ subfolders.")
        sys.exit(1)

    root = tk.Tk()
    app = VideoSelectorApp(root, pairs, folder)
    root.mainloop()


if __name__ == "__main__":
    main()