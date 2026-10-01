# Outlier launch video

A 53-second 16:9 (1920×1080, 30fps) launch video for [Outlier](https://www.useoutlier.online), built in code with [Remotion](https://www.remotion.dev).

The latest render is at `out/outlier-launch.mp4`.

## Edit it

```bash
npm install
npm run studio      # live preview with a timeline scrubber
npm run render      # writes out/outlier-launch.mp4
```

In a Claude Code cloud session, point Remotion at the preinstalled Chromium:
`REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render`

- `src/timeline.ts`: when each scene starts and how long it runs
- `src/scenes/`: one file per scene (copy, numbers, layout)
- `src/theme.ts`: brand colors and fonts, matching the app
- `src/Video.tsx`: scene order and the list of sound effects and their timings

## Audio

All music and sound effects are synthesized from scratch by `scripts/make_audio.py` (numpy/scipy), so they're original and free to use anywhere. Regenerate with `npm run audio`.

The music is 120 BPM, so one bar is 60 frames. The drops land on the logo reveal (frame 300) and the pricing scene (frame 1380). If you change scene timings, update `DROP`, `BREAK` and `FINAL` in the script to match.

To use a library track instead, replace `public/audio/music.wav`.
