"""Extract the camera move from a clip: per-frame zoom and pan.

Tracks features between consecutive frames and fits a similarity transform, then
reports, per window, the zoom rate (% per second) and pan speed (px per second at
1080p). Used to copy the *feel* of a reference's camera, not its content.

    python3 refs/camera.py clip.mp4 [window_s]
"""
import sys
import cv2
import numpy as np


def track(path, crop_top=False):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    prev, out = None, []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        if crop_top:
            f = f[: f.shape[0] // 2]
        s = 960 / f.shape[1]
        g = cv2.cvtColor(cv2.resize(f, (960, int(f.shape[0] * s))), cv2.COLOR_BGR2GRAY)
        if prev is not None:
            p0 = cv2.goodFeaturesToTrack(prev, 300, 0.01, 12)
            z, dx, dy, ok2 = 1.0, 0.0, 0.0, False
            if p0 is not None and len(p0) >= 12:
                p1, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, p0, None, winSize=(21, 21), maxLevel=3)
                a, b = p0[st == 1], p1[st == 1]
                if len(a) >= 12:
                    m, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=1.5)
                    if m is not None and inl is not None and inl.sum() >= 10:
                        z = float(np.hypot(m[0, 0], m[1, 0]))
                        # translation of the frame centre, in 1080p pixels
                        c = np.array([480, g.shape[0] / 2])
                        d = m[:, :2] @ c + m[:, 2] - c
                        dx, dy, ok2 = float(d[0]) * 2, float(d[1]) * 2, True
            out.append((z, dx, dy, ok2))
        prev = g
    return fps, out


if __name__ == "__main__":
    arg = sys.argv[1]
    path, _, mode = arg.partition(":")
    win = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    fps, tr = track(path, crop_top=(mode == "top"))
    n = int(win * fps)
    print(f"{path.split('/')[-1]}  ({fps:.0f}fps, {win}s windows)   zoom %/s   pan px/s   tracked")
    for i in range(0, len(tr) - n + 1, n):
        seg = [t for t in tr[i : i + n] if t[3]]
        if len(seg) < n * 0.4:
            print(f"  {i / fps:5.1f}s   (cut / too little to track)")
            continue
        lz = np.median([np.log(t[0]) for t in seg]) * fps * 100
        px = np.median([t[1] for t in seg]) * fps
        py = np.median([t[2] for t in seg]) * fps
        print(f"  {i / fps:5.1f}s   {lz:+7.1f}   {px:+7.0f},{py:+6.0f}   {100 * len(seg) / n:3.0f}%")
