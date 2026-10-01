"""Measure how smooth motion is, frame by frame.

For a clip (or a frame range of one), estimates the global shift between consecutive
frames with sub-pixel phase correlation, then reports:
  - stair%:  share of frames where the picture did not move although its neighbours did
             (pixel-snapping "staircase" motion: the classic jitter on slow pans)
  - jerk:    median |change in speed| / median speed (lower is smoother)
  - spikes:  frames whose speed jumps more than 3x the local median (pops, stutters)

    python3 refs/smooth.py clip.mp4 [start_s end_s] [x y w h]
"""
import sys
import cv2
import numpy as np


def shifts(path, t0=0.0, t1=None, roi=None):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(t0 * fps))
    n = int(((t1 or 1e9) - t0) * fps)
    prev, out = None, []
    win = None
    for _ in range(n):
        ok, f = cap.read()
        if not ok:
            break
        if roi:
            x, y, w, h = roi
            f = f[y : y + h, x : x + w]
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)
        if win is None:
            win = cv2.createHanningWindow((g.shape[1], g.shape[0]), cv2.CV_32F)
        if prev is not None:
            (dx, dy), _ = cv2.phaseCorrelate(prev, g, win)
            out.append((dx, dy))
        prev = g
    return fps, np.array(out)


def report(name, s):
    sp = np.hypot(s[:, 0], s[:, 1])
    med = np.median(sp)
    # A "stair" frame: nearly no movement while the neighbours average real movement.
    stair = 0
    for i in range(1, len(sp) - 1):
        local = (sp[i - 1] + sp[i + 1]) / 2
        if local > 0.08 and sp[i] < 0.25 * local:
            stair += 1
    d = np.abs(np.diff(sp))
    jerk = np.median(d) / max(med, 1e-3)
    spikes = int(np.sum(sp > 3 * np.maximum(med, 0.05) + 3 * np.median(d)))
    print(f"{name:34s} frames {len(sp):4d}  median speed {med:6.3f}px  stair {100 * stair / max(1, len(sp) - 2):5.1f}%  jerk {jerk:5.2f}  spikes {spikes}")


if __name__ == "__main__":
    a = sys.argv[1:]
    path = a[0]
    t0 = float(a[1]) if len(a) > 2 else 0.0
    t1 = float(a[2]) if len(a) > 2 else None
    roi = tuple(int(v) for v in a[3:7]) if len(a) >= 7 else None
    fps, s = shifts(path, t0, t1, roi)
    report(path.split("/")[-1] + (f" {t0}-{t1}s" if t1 else ""), s)
    if "--dump" in a:
        print(" ".join(f"{v:.2f}" for v in np.hypot(s[:, 0], s[:, 1])))
