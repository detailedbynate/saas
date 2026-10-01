"""Compare continuity of motion: how often the frame is frozen, and how jerky motion is.

freeze%  = share of frames whose global motion is below 0.15 px/frame (at 320px wide)
jerk     = median |change in speed| relative to median speed (lower = smoother)
"""
import cv2, numpy as np, sys

def series(path, crop_top=False, w=320):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    prev, sp = None, []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        if crop_top:
            f = f[: f.shape[0] // 2]
        g = cv2.cvtColor(cv2.resize(f, (w, int(w * f.shape[0] / f.shape[1]))), cv2.COLOR_BGR2GRAY)
        if prev is not None:
            fl = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            sp.append(float(np.percentile(np.linalg.norm(fl, axis=2), 95)) * (30 / fps))  # normalise to px per 1/30s
        prev = g
    return fps, np.array(sp)

for arg in sys.argv[1:]:
    path, _, mode = arg.partition(":")
    fps, s = series(path, crop_top=(mode == "top"))
    frozen = (s < 0.08).mean() * 100
    # longest frozen run, seconds
    run = best = 0
    for v in s < 0.08:
        run = run + 1 if v else 0
        best = max(best, run)
    d = np.abs(np.diff(s))
    jerk = np.median(d) / max(np.median(s), 1e-3)
    print(f"{path.split('/')[-1]:28s} {mode or 'full':4s} freeze {frozen:5.1f}%  longest freeze {best / fps:4.2f}s  median speed {np.median(s):.2f}  jerk {jerk:.2f}")
