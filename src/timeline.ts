/** Scene timing in frames at 30fps. The music (scripts/make_audio.py) is built on the same grid: 120 BPM, one bar = 60 frames. */
export const FPS = 30;

export const SCENES = {
  hook: { from: 0, duration: 180 },
  problem: { from: 180, duration: 120 },
  reveal: { from: 300, duration: 120 }, // music drop
  research: { from: 420, duration: 180 },
  growth: { from: 600, duration: 180 },
  picks: { from: 780, duration: 150 },
  analyze: { from: 930, duration: 180 },
  script: { from: 1110, duration: 150 },
  why: { from: 1260, duration: 120 }, // breakdown
  cta: { from: 1380, duration: 210 }, // final drop
} as const;

export const TOTAL_FRAMES = SCENES.cta.from + SCENES.cta.duration;
