# Outlier launch video

A 25-second 16:9 (1920×1080, 60fps) launch video for [Outlier](https://www.useoutlier.online), built in code with [Remotion](https://www.remotion.dev).

The latest render is at `out/outlier-launch.mp4`.

## Edit it

```bash
npm install
npm run studio      # live preview with a timeline scrubber
npm run render      # writes out/outlier-launch.mp4
```

In a Claude Code cloud session, point Remotion at the preinstalled Chromium:
`REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render`

- `src/timeline.ts`: when each shot starts and how long it runs, in seconds
- `src/components/Shot.tsx`: the camera (keyframes with 3D pitch/yaw joined by a smooth spline, plus a slow perpetual push so the frame never parks) and the transitions (blur, push, slide, rise, cut)
- `src/components/kit.tsx`: glowing cards, Shorts thumbnails, spinner, hand cursor, two-tone feature titles
- `src/components/ui.tsx`: the easing curves and text/element animations (blur-in words, re-centring build lines, word swaps, 3D tilt-ins)
- `src/scenes/Open.tsx` / `src/scenes/Beats.tsx`: the prompt and scan beats, then the six feature beats and the end card
- `refs/NOTES.md`: the reference-video studies, including the scene-for-scene map to the Algrow film this cut follows
- `src/scenes/`: the shots (copy, numbers, layout, camera moves)
- `src/theme.ts`: brand colors and fonts, matching the app
- `src/Video.tsx`: scene order and the list of sound effects and their timings

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

The music is 120 BPM, so one bar is 2 seconds, and every cut lands on a beat (a multiple of 0.5s). The drop lands on the first feature (3.5s), right after the scan beat, and the last chord on the end card. If you change shot timings, update `DROP`, `BREAK`, `FINAL` and `END` in the script to match.

To use a library track instead, replace `public/audio/music.wav`.
