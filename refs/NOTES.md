# Reference study: launch-video style

Source: the 22 launch films collected at <https://notes.apoorv.xyz/launch-videos>
(Pump.fun, Jupiter, Polymarket, Lovable, Omnipair/azatsol, Print, Umbra, Figma, fomo, Hunch, and others).

The videos themselves are third-party and are **not** committed (`refs/src/` is gitignored).
`refs/motion.py` re-runs the measurements; download the clips into `refs/src/` first.

## What was measured

- **Cuts** — ffmpeg scene detection (threshold 0.28) on every clip.
- **Easing** — Farneback optical flow per frame; each burst of motion is isolated and its
  normalised cumulative displacement is fitted against standard easing curves.
- **Frames** — 0.5s contact sheets of the first 24s of each clip.

## Findings

| | References | v2 (before) | v3 (now) |
|---|---|---|---|
| Hard cuts | 7 of 22 have **none**; one continuous camera with morphs and dissolves | 10 whips | 2 hard cuts, both on the beat |
| Motion event length | median 0.5–1.0s | 0.6s | 0.5–1.2s |
| Entrance easing | **easeOutCubic** (most common fit) | expo-out `(0.16,1,0.3,1)` | `(0.33,1,0.68,1)` |
| Camera easing | **easeInOutSine / easeInOutCubic** | hard in-out `(0.76,0,0.24,1)` | inOutSine drifts, inOutCubic moves |
| Expo / quint curves | almost never | everywhere | removed |

### Pacing
- Short films (18–30s) alternate a **~1s centred text beat** with a **2–3s product beat**.
- Text beats build **word by word** and the line **re-centres** as it grows
  (Omnipair "Introducing → the New → Market View", Pump.fun "USDC trading is here").
- One word in a sentence can **swap on the beat** (Pump.fun "Trade [Solana / Jimothy / BNB / anything]").
- Fast statement montages (Jupiter "Fixed terms. No liquidation.") run ~0.5s each and are entered with a hard cut.
- The end card lands the URL and gets out in ~2s.

### Text
- Words resolve **out of blur** (opacity + blur + a small rise), not from behind a mask.
- One accent word per line in a gradient/brand colour.

### Product shots
- UI fills most of the frame; it settles out of a **3D tilt** while resolving from blur (Jupiter, Print).
- Camera keeps **drifting** the whole shot: slow push-ins and lateral pans across card rows (Lovable, Jupiter).
- Large cursor drives the interaction inside the UI.

### Transitions
- **Blur dissolve** with a slight scale — the default.
- **Push through** the outgoing shot on energetic moments.
- Short **slides/rises** (~15–25% of frame) with blur — never a full-frame whip.
- **Light blooms / colour washes** on the music drops (Omnipair, Jupiter arcs).
- Background light fields **move with the edit**.

## How v3 applies it

- `src/components/ui.tsx` — easing constants refit; `Words` (blur-in), `BuildLine` (re-centring build), `SwapWord` (slot swap), `TiltIn` (3D settle with blur).
- `src/components/Shot.tsx` — transitions are now `blur | push | slide | rise | cut`; cuts land exactly on shot boundaries.
- `src/scenes/Layouts.tsx` — `TitleBeat` (1s text beat over a rising light arc) and `Stage` (full-frame product).
- `src/timeline.ts` — every feature is title beat + product beat; all cuts on 0.5s beats; music drops unchanged (6s, 24s, 26s).
- `src/components/Backdrop.tsx` — light pools ease to a new position on each shot; `Bloom` on the drops.

## v4: the client's example (samgrows, a designer-made film and its remake)

Feedback on v3: too fast in places, animations felt rough, and the frame froze between moves.
The example is a side-by-side of a designer's film and a remake; measured on the designer's half
(`refs/continuity.py`, optical flow on the moving region):

| | Example | v3 |
|---|---|---|
| Frames where the image is essentially still | **7%** | 30% |
| Typical speed of the moving region | **1.25** | 0.28 |
| Hard cuts in ~30s | 3 | ~25 beats |

So the example moves *more* of the time, but each idea gets 2–5s. Its camera dollies
continuously across UI, with a caption beside it ("Now choose a reference outlier").

What changed in v4:
- **Camera never parks.** Keys are joined by a Catmull-Rom (cubic Hermite) spline, so the
  camera passes *through* keys instead of easing to a stop on each; past the last key it
  keeps drifting on the end tangent. Every shot also has a slow perpetual push (1.2%/s)
  and a faint float.
- **Fewer, longer shots.** Each feature is one ~5s continuous shot: open close on the caption
  as it writes on, dolly across to the product as it settles out of 3D, keep pushing gently.
  Total length 46s; one hard cut (into the breakdown).
- **Smoother animation.** Entrances ~1.5× longer (0.9s words with 0.11s stagger, 1.7s panel
  tilt), softer blur, 0.9s dissolves. The per-frame directional motion-blur filter was removed:
  it switched on and off with speed and read as stutter.
- Captions and cards keep a slow drift or float after they land.

Result (`refs/continuity.py`): still frames dropped from 30% (v3) to **11%** (example: 7%),
and the longest still stretch from 1.3s to 0.75s.
