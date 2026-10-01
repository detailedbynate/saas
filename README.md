# Outlier launch video

A 33.5-second 16:9 (1920×1080, 60fps) launch video for [Outlier](https://www.useoutlier.online), built in code with [Remotion](https://www.remotion.dev). It uses a real screen recording of the app and real Shorts clips (`public/footage/`).

- `out/outlier-launch-draft.mp4`: draft render (no motion blur or light leaks)
- `out/outlier-launch.mp4`: the final, once rendered with `npm run render:final`
- `out/outlier-launch-v5-algrow.mp4`: the earlier 25s cut

## Render the final on your PC (Windows)

1. Install [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com/download/win).
2. In PowerShell:

```powershell
git clone -b claude/saas-video-creation-a3xbzg https://github.com/detailedbynate/saas.git
cd saas
npm install
npm run render:final
```

The video lands in `out\outlier-launch.mp4`. `render:final` turns on true motion blur (8 sub-frames per frame), the light leaks and your GPU (`--gl=angle`). Each frame is drawn 8 times, so expect roughly 20–40 minutes on a 6-core PC.

- `npm run render`: a fast draft without motion blur or light leaks
- `npm run studio`: live preview with a timeline scrubber
- To change blur strength, edit `props/final.json` (`motionBlur`: 0 = off, 4 = lighter and faster, 8 = default, 16 = smoothest)

## Edit it

- `src/timeline.ts`: when each shot starts and how long it runs, in seconds
- `src/scenes/Film.tsx`: all eleven scenes (hook, Shorts multiplying, logo, four features, any niche, dashboard, tagline, end card)
- `src/components/Shot.tsx`: the camera (spline moves, speed ramps, 3D tilt) and the motion-matched transitions (whips, zoom-throughs, blur, cut)
- `src/components/fx.tsx`: springs, per-letter text, footage cards, the app window, callouts, dust, sparks, light leaks, film grain
- `src/components/kit.tsx`, `ui.tsx`: shared parts (hand cursor, logo, counters, easing)
- `src/Video.tsx`: scene order, the grade, and the sound-effect list
- `refs/NOTES.md`: the reference-video studies behind each version

The npm scripts pass `--gl=angle` to use the GPU. To use more of the processor, add `-- --concurrency=8` (each thread needs roughly 1–1.5 GB of RAM). In a Claude Code cloud session there is no GPU: run `npx remotion render OutlierLaunch out/draft.mp4 --props=./props/draft.json` without a `--gl` flag (`swangle` is about 4× slower).

## Skills and packages for higher-quality animation

Remotion's official Agent Skills are installed in `.agents/skills/` (linked into `.claude/skills/`), so Claude Code
follows Remotion's own rules for timing, transitions, text, effects, 3D and audio when editing this project.
Update them with `npx skills add remotion-dev/skills`.

Installed and ready to use (not all are used by the current cut yet):

- `@remotion/motion-blur`: true camera motion blur from blended sub-frames
- `@remotion/transitions`, `@remotion/effects`, `@remotion/light-leaks`: tested transitions, effects and light-leak overlays
- `@remotion/three` + `three`, `@react-three/fiber`, `@react-three/drei`: real 3D objects with lighting
- `@remotion/lottie` + `lottie-web`: designer-made Lottie animations
- `@remotion/paths`, `@remotion/noise`, `@remotion/animation-utils`, `@remotion/layout-utils`, `@remotion/rough-notation`: path drawing, organic motion, text fitting, hand-drawn highlights
- `@remotion/media`, `@remotion/media-utils`, `@remotion/google-fonts`: video/audio handling and fonts

## Audio

All music and sound effects are synthesized from scratch by `scripts/make_audio.py` (numpy/scipy), so they're original and free to use anywhere. Regenerate with `npm run audio`.

The music is 120 BPM, so one bar is 2 seconds, and every cut lands on a beat (a multiple of 0.5s). The drop lands on the logo (8s), the breakdown on the tagline (28s) and the final hit on the end card (30.5s). If you change shot timings, update `DROP`, `BREAK`, `FINAL` and `END` in the script to match.

To use a library track instead, replace `public/audio/music.wav`.
