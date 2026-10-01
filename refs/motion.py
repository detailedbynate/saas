"""Measure motion events in reference videos and fit easing curves.

For each video: per-frame mean optical-flow magnitude (downscaled), split into
motion events, then for each event compare the normalized cumulative
displacement to standard easing curves.
"""
import cv2, numpy as np, sys, json, glob, os

def flow_series(path, maxdur=40, w=320):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    prev, mags = None, []
    n = 0
    while True:
        ok, f = cap.read()
        if not ok or n > maxdur * fps:
            break
        n += 1
        g = cv2.cvtColor(cv2.resize(f, (w, int(w * f.shape[0] / f.shape[1]))), cv2.COLOR_BGR2GRAY)
        if prev is not None:
            fl = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            m = np.linalg.norm(fl, axis=2)
            mags.append(float(np.percentile(m, 90)))  # moving part, not whole frame
        prev = g
    return fps, np.array(mags)

E = {
    'linear': lambda t: t,
    'inOutSine': lambda t: -(np.cos(np.pi * t) - 1) / 2,
    'inOutCubic': lambda t: np.where(t < .5, 4 * t**3, 1 - (-2 * t + 2)**3 / 2),
    'inOutQuint': lambda t: np.where(t < .5, 16 * t**5, 1 - (-2 * t + 2)**5 / 2),
    'inOutExpo': lambda t: np.where(t < .5, 2**(20 * t - 10) / 2, (2 - 2**(-20 * t + 10)) / 2),
    'outCubic': lambda t: 1 - (1 - t)**3,
    'outQuint': lambda t: 1 - (1 - t)**5,
    'outExpo': lambda t: 1 - 2**(-10 * t),
}

def events(mags, fps, thr_rel=0.25, min_len=0.12):
    s = np.convolve(mags, np.ones(3) / 3, mode='same')
    base = np.percentile(s, 30)
    thr = base + thr_rel * (np.percentile(s, 95) - base)
    on = s > thr
    out, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]:
                j += 1
            # extend to where velocity returns near baseline
            a, b = i, j
            while a > 0 and s[a - 1] > base * 1.1 and s[a - 1] < s[a] + 1e-6: a -= 1
            while b < len(s) and s[b] > base * 1.1 and s[b] < s[b - 1] + 1e-6: b += 1
            if (b - a) / fps >= min_len:
                seg = np.clip(s[a:b] - base, 0, None)
                if seg.sum() > 0:
                    cum = np.cumsum(seg) / seg.sum()
                    t = np.linspace(0, 1, len(cum))
                    errs = {k: float(np.mean((f(t) - cum)**2)) for k, f in E.items()}
                    best = min(errs, key=errs.get)
                    out.append(dict(t0=a / fps, dur=(b - a) / fps, peak=float(np.argmax(seg) / max(len(seg) - 1, 1)), best=best))
            i = max(j, b)
        else:
            i += 1
    return out

if __name__ == '__main__':
    res = {}
    for p in sys.argv[1:]:
        fps, m = flow_series(p)
        ev = events(m, fps)
        name = os.path.basename(p).split('_2')[0]
        res[name] = ev
        durs = [e['dur'] for e in ev]
        peaks = [e['peak'] for e in ev]
        from collections import Counter
        c = Counter(e['best'] for e in ev)
        print(f"{name:16s} fps {fps:5.2f} events {len(ev):3d}  med dur {np.median(durs):.2f}s  med peak-pos {np.median(peaks):.2f}  fits {dict(c.most_common(4))}")
    json.dump(res, open('motion.json', 'w'), indent=1)
