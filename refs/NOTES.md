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

## v5: 25s, 1:1 on the Algrow launch film

Reference: `refs/src/algrow.mp4` (34.8s, 1080p60, silent). Structure, layouts and camera
mapped scene for scene; Outlier's features, copy, logo and violet replace Algrow's.
No Algrow footage, text or branding is used.

| Algrow | t | Outlier v5 | t |
|---|---|---|---|
| Glowing prompt bar, typed question, 3D arrow presses send | 0–2.65 | same, "find breakout Shorts channels in minecraft" | 0–2.5 |
| "Scanning and analyzing content" over fluid blobs | 2.65–3.55 | "Scanning millions of Shorts" | 2.5–3.5 |
| Niche Finding: thumbnail collage left, eye + view counter right | 3.55–6.7 | Outlier Finder, +38M | 3.5–6.5 |
| AI Video Generator: title, request card, collage pops out | 6.7–10 | Daily Picks | 6.5–9.5 |
| AI Voice Generator: glowing card, type, click, spinner, collapses to player | 10–16 | Video Analyzer, collapses to the 79× score bar | 9.5–13.5 |
| AI Video Automation: 3D-tilted URL + script boxes, Analyse, spinner, 3 cards fan out | 16–22.2 | Channel Tracker | 13.5–17 |
| AI Image Generation: prompt, drag a reference in, send, spinner, 3 results | 22.2–28.7 | Script Writer | 17–20.5 |
| Caption Remover: title left, vertical before/after wipe | 28.7–34.8 | Outlier Score: views (before) vs 79× (after) | 20.5–23.5 |
| — (no end card) | | Logo + useoutlier.online | 23.5–25 |

Motion measured on the reference (`motion.py`, `continuity.py`): 9.8% still frames, longest
still 0.67s, camera mostly constant-speed drift with ease-out entrances.

## v6: original 33s cut with real footage

Brief: not a copy of any reference; super smooth; 30–35s; use the client's uploads; apply the
full set of finishing techniques. Second reference studied for *story shape* only:
MotionTimeFrame's LernGlow promo (problem → turn → logo forms → product zooms → big stat →
tagline → CTA; 37.7s, median motion event 0.83s).

Footage (in `public/footage/`):
- `app.mp4` + `app-*.png`: the client's screen recording of Outlier, cropped to the app
  (browser tabs and address bar removed).
- `short-a/b/c`, `hoops-1/2/3`: 6s vertical cuts of the Shorts and basketball clips the client
  supplied. These are other creators' and the NBA's footage: fine as placeholders, but clear
  the rights (or swap in owned/licensed clips) before running this as a paid ad.

Story: "Going viral isn't luck." → one Short → speed-ramp back to a wall of them →
"A few break out." (405×, 151×, 137× light up) → logo on the drop → Niche Finder (real
typing, results, money, viral competitors) → opportunity score → 405× · "In any niche." →
dashboard in 3D with live Shorts lifting off it → "Stop guessing. Find the outliers." → CTA.

Techniques:
1. Motion-matched transitions: outgoing shot accelerates away in the first half of the
   overlap, incoming arrives in the second half at the same speed and direction (whips,
   zoom-throughs), with directional blur.
2. Speed ramps: camera keys marked `ramp` ease hard in and out (easeInOutQuint); the rest
   glide through on a spline.
3. Springs with overshoot for pops, badges, callouts and the logo; follow-through staggers.
4. Depth: blurred foreground cards crossing the lens, niche pills orbiting with depth-of-field,
   live cards lifting off the 3D-tilted dashboard, drifting dust.
5. Per-letter kinetic type: letters rise out of a mask on springs while tracking tightens.
6. Finishing pass: film grain that changes every frame, vignette, a light grade, sparks on
   hits, shockwave rings, WebGL light leaks (final render).
7. True motion blur via `<HtmlInCanvasMotionBlur>` (final render, 8 samples).
8. Sound: every move has a whoosh into it and a hit on it; new sub-hit, shimmer and riser
   layers; music re-timed (drop 8s, breakdown 26.5s, final hit 29.5s).

### v6.1: why the first draft looked rough, and the fix

Measured on the client's draft with `refs/smooth.py` (sub-pixel frame-to-frame shift):
footage moved a steady 2.1px per frame, but every piece of text moved ~0.4px per frame and
then jumped a full pixel every fourth frame. Causes and fixes:

- **Text stutter on pans and zooms.** Letters and callouts used `translate3d`, which made each
  one its own compositing layer that Chrome re-rasterised in steps as the camera scaled.
  Now: only 2D transforms inside shots, and non-tilted shots are drawn with a 2D transform
  plus a 0.03° rotation (no layer, no pixel snapping). Result: text moves by sub-pixels every
  frame with no jumps. Rule: no `translate3d` or `will-change` inside a `<Shot>`.
- **Bouncing callouts.** Springs overshot left-right as they landed. Now a single ease-out glide.
- **Busy letters.** Per-letter rotation and animated letter-spacing (which re-flowed the line
  every frame) removed; letters only rise out of the mask.
- **Abrupt camera.** Speed ramps softened (quint → gentler curve) and lengthened to ~0.85s;
  transitions lengthened to 0.6s; the dashboard tilt settles fully flat.
- Counters use tabular digits so centred numbers don't shimmy.
- **Whip transitions rebuilt as pushes.** The first version ran the two shots one after the
  other (leaving two empty frames between them) under a ~90px blur that turned the incoming
  app into vertical streaks. Now both shots travel together edge to edge on one eased move
  with light blur, and the app arrives wide before the camera pushes in on the search bar.

## v7: simpler scenes, the references' camera

Feedback on v6: smoother, but too detailed. Brief: list the features simply and move the way
the Algrow and LernGlow films move.

Camera measured with `refs/camera.py` (feature tracking → zoom %/s and pan px/s per second):
- Both films reveal each scene on a quick **zoom-out of 20–35%/s** lasting about a second.
- Then they **hold or push very slowly**: 0–5%/s, and LernGlow's end card sits at +1.6%/s.
- Push-ins of +25%/s appear on a few payoff moments (Algrow's collage and card).
- No whips. Scenes dissolve through blur or punch through on a zoom.

v7 applies exactly that: every scene uses `settle()` (arrive ~22% wide, ease to rest in 1.2s,
then +2%/s), dissolves between scenes, a zoom-through out of the logo and into the dashboard,
and a +1.6%/s push on the end card. Elements resolve out of blur on one long ease-out; text
leaves on a sideways smear. Nothing bounces.

Scenes (one idea each): "Going viral / isn't luck." → one Short becomes many →
"A few break out." → orbs gather into the logo (drop) → Niche Finder (search → opportunity
score) → Viral Videos (collage + view count) → Analyze Video (link → 79× score) →
Tracked Channels (three cards) → "In any niche" (floating tags) → the dashboard settling out
of a 3D tilt → "Less guessing. More outliers." → logo + URL.

The app recording is used once (the dashboard). The v6 walkthrough scenes are in git history.

### v7.1: glide curve, transform-only motion, matte glass

Client-supplied rules, applied with one exception:

- **AE_GRAPH_GLIDE** `Easing.bezier(0.16, 1, 0.3, 1)` is defined in `ui.tsx` and used for
  every entrance; the scene-arrival camera uses it too (`glide: true` keys), so each scene
  starts mid-move and decelerates on a long tail. Measured on a title: 0.73px/frame easing
  down to ~0.1px/frame with no step larger than 0.16px.
- **Transform and opacity only.** Every animated `left/top/width/height` was converted
  (scattered cards, orbs, the search pill, the analyze-card collapse, fanned cards, niche
  tags, chart bars, dust, backdrop shards, the cursor). All `interpolate` calls clamp.
- **Matte glass.** Stage `#0b0f19`; surfaces use `GLASS` in `kit.tsx` (`rgba(11,15,25,0.72)`,
  1px `rgba(255,255,255,0.08)` border, 16px radius, `backdrop-filter: blur(12px)`); 12px
  radius on small controls; `letter-spacing: -0.02em`; glows toned down to a faint ring.
- **Not applied: `translate3d` / `scale3d`.** That is advice for live browser playback.
  Remotion renders frame by frame, and v6.1 measured `translate3d` as the cause of the text
  stutter (per-letter layers re-rasterised in steps under zoom). Transforms stay 2D.

## v8: the whole film in the agreed test-scene style (28s)

Process: one scene ("Analyze Any Video") was matched frame by frame to Algrow's "Ai Voice
Generator" moment and tuned with the client until approved; that motion was then applied
everywhere (`src/film/kit.tsx`, `src/film/scenes.tsx`).

The approved moves:
- Words resolve one at a time from a long blur (position on `AE_GRAPH_GLIDE` over 1.3s, blur
  clearing on its own slower curve over 1.0s), sliding in from down-right.
- Every entrance is on the graph curve and lasts 1.0–1.5s.
- The next thing enters while the last is still landing (card at +0.63s after the title);
  motion never comes to rest.
- Cards rise from below tilted back (44° → 5°) and push the title up.
- The camera push starts while the card settles and never stops; a 1.5%/s drift runs from frame 0.
- Scenes hand off with a 0.25s fade/blur while still pushing in; the next scene starts 0.2s early.

Scenes: prompt → scanning → Niche Finder → Viral Videos → Analyze Any Video → Tracked
Channels → dashboard (real screenshot) → tagline → end card.

Motion blur: `SmoothMotionBlur` (`src/components/blur.tsx`), 120° shutter. Do not use
`<HtmlInCanvasMotionBlur>`: its captured samples render faint semi-transparent glows brighter
and hard-edged (worse with each sample). Glows are gradients (`GlowRect`), not wide box-shadows.
