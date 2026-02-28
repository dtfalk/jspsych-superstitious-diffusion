import os
import sys
import shutil
import cv2
import ctypes
from pathlib import Path
from PIL import Image, ImageTk
import tkinter as tk
from tkinter import messagebox

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

OUTPUT_STIMULI_DIR = "selected_videos_stimuli"
OUTPUT_FULL_DIR = "selected_videos_full"


def find_paired_videos(parent_folder):
    s_folder = os.path.join(parent_folder, "S")
    x_folder = os.path.join(parent_folder, "X")

    pairs = []
    for i in range(1024):
        vid_name = f"vid_{str(i).zfill(3)}"
        s_vid_folder = os.path.join(s_folder, vid_name)
        x_vid_folder = os.path.join(x_folder, vid_name)
        s_path = os.path.join(s_vid_folder, f"video_{vid_name}.mp4")
        x_path = os.path.join(x_vid_folder, f"video_{vid_name}.mp4")
        if os.path.exists(s_path) and os.path.exists(x_path):
            pairs.append((vid_name, s_path, x_path, s_vid_folder, x_vid_folder))

    return pairs


def extract_last_frame(video_path, thumbnail_size):
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
        self.pairs = pairs
        self.parent_folder = parent_folder
        self.selected = set()

        self.photo_refs = []
        self.items = {}
        self.padding = 20

        root.title("Video Pair Selector (S vs X)")

        screen_w = root.winfo_screenwidth()
        screen_h = root.winfo_screenheight()
        win_w = int(screen_w * 0.9)
        win_h = int(screen_h * 0.9)
        root.geometry(f"{win_w}x{win_h}")

        self.initial_pairs_per_row = max(1, min(6, win_w // 440))
        thumb_w = max(120, (win_w // self.initial_pairs_per_row - 50) // 2)
        thumb_h = int(thumb_w * 0.75)
        self.thumbnail_size = (thumb_w, thumb_h)

        self.box_w = self.thumbnail_size[0] * 2 + 40
        self.box_h = self.thumbnail_size[1] + 60

        top_bar = tk.Frame(root)
        top_bar.pack(fill="x")

        self.counter = tk.Label(top_bar, text="", font=("Arial", 14))
        self.counter.pack(side="left", padx=15)

        submit_btn = tk.Button(
            top_bar,
            text="Submit Selection",
            command=self.submit,
            bg="#4CAF50",
            fg="white",
        )
        submit_btn.pack(side="right", padx=15)

        container = tk.Frame(root)
        container.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(container, bg="#1e1e1e")
        scrollbar = tk.Scrollbar(container, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=scrollbar.set)

        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.canvas.bind("<MouseWheel>", self._on_mousewheel)
        self.canvas.bind("<Configure>", self._on_resize)

        self.draw_all()
        self.update_counter()
        self.root.after(0, self.relayout)

    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def _compute_pairs_per_row(self):
        cw = self.canvas.winfo_width()
        if cw <= 1:
            return 1
        n = (cw - self.padding) // (self.box_w + self.padding)
        return max(1, int(n))

    def _on_resize(self, event):
        self.root.after(50, self.relayout)

    def draw_all(self):
        for idx, (vid_name, s_path, x_path, _, _) in enumerate(self.pairs):
            s_img = extract_last_frame(s_path, self.thumbnail_size)
            x_img = extract_last_frame(x_path, self.thumbnail_size)
            if s_img is None or x_img is None:
                continue

            s_photo = ImageTk.PhotoImage(s_img)
            x_photo = ImageTk.PhotoImage(x_img)
            self.photo_refs.append(s_photo)
            self.photo_refs.append(x_photo)

            rect = self.canvas.create_rectangle(0, 0, 0, 0, outline="#444", width=3)
            title = self.canvas.create_text(0, 0, text=vid_name, fill="white", font=("Arial", 10, "bold"))
            s_img_item = self.canvas.create_image(0, 0, image=s_photo)
            x_img_item = self.canvas.create_image(0, 0, image=x_photo)

            for item in (rect, title, s_img_item, x_img_item):
                self.canvas.tag_bind(item, "<Button-1>", lambda e, i=idx: self.toggle(i))

            self.items[idx] = (rect, title, s_img_item, x_img_item)

    def relayout(self):
        pairs_per_row = self._compute_pairs_per_row()
        display_index = 0

        for idx in sorted(self.items.keys()):
            row = display_index // pairs_per_row
            col = display_index % pairs_per_row
            display_index += 1

            x0 = self.padding + col * (self.box_w + self.padding)
            y0 = self.padding + row * (self.box_h + self.padding)

            rect, title, s_img_item, x_img_item = self.items[idx]

            self.canvas.coords(rect, x0, y0, x0 + self.box_w, y0 + self.box_h)
            self.canvas.coords(title, x0 + self.box_w // 2, y0 + 15)

            self.canvas.coords(
                s_img_item,
                x0 + 20 + self.thumbnail_size[0] // 2,
                y0 + 40 + self.thumbnail_size[1] // 2,
            )

            self.canvas.coords(
                x_img_item,
                x0 + 40 + self.thumbnail_size[0] + self.thumbnail_size[0] // 2,
                y0 + 40 + self.thumbnail_size[1] // 2,
            )

        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def toggle(self, idx):
        rect = self.items[idx][0]
        if idx in self.selected:
            self.selected.remove(idx)
            self.canvas.itemconfig(rect, outline="#444")
        else:
            self.selected.add(idx)
            self.canvas.itemconfig(rect, outline="#66bb6a")
        self.update_counter()

    def update_counter(self):
        self.counter.config(text=f"Selected: {len(self.selected)} / {len(self.pairs)} pairs")

    def submit(self):
        if not self.selected:
            messagebox.showinfo("No Selection", "No pairs selected.")
            return

        stimuli_dir = Path.cwd() / OUTPUT_STIMULI_DIR
        full_dir = Path.cwd() / OUTPUT_FULL_DIR

        s_stimuli = stimuli_dir / "S"
        x_stimuli = stimuli_dir / "X"
        s_stimuli.mkdir(parents=True, exist_ok=True)
        x_stimuli.mkdir(parents=True, exist_ok=True)

        s_full = full_dir / "S"
        x_full = full_dir / "X"
        s_full.mkdir(parents=True, exist_ok=True)
        x_full.mkdir(parents=True, exist_ok=True)

        for idx in sorted(self.selected):
            vid_name, s_path, x_path, s_src_folder, x_src_folder = self.pairs[idx]

            shutil.copy(s_path, s_stimuli / f"{vid_name}.mp4")
            shutil.copy(x_path, x_stimuli / f"{vid_name}.mp4")

            s_full_dest = s_full / vid_name
            x_full_dest = x_full / vid_name

            if s_full_dest.exists():
                shutil.rmtree(s_full_dest)
            if x_full_dest.exists():
                shutil.rmtree(x_full_dest)

            shutil.copytree(s_src_folder, s_full_dest)
            shutil.copytree(x_src_folder, x_full_dest)

        messagebox.showinfo(
            "Done",
            f"Copied {len(self.selected)} pairs to:\n\n"
            f"Stimuli (mp4 only):\n  {stimuli_dir}\n\n"
            f"Full (with meta):\n  {full_dir}"
        )
        self.root.quit()


def main():
    if len(sys.argv) != 2:
        print("Usage: python video_selector.py <parent_folder>")
        sys.exit(1)

    folder = sys.argv[1]
    pairs = find_paired_videos(folder)

    root = tk.Tk()
    app = VideoSelectorApp(root, pairs, folder)
    root.mainloop()


if __name__ == "__main__":
    main()