/**
 * Shot timing in seconds. Each shot starts where the previous one's whip begins,
 * so neighbours overlap by TRANSITION. The music (scripts/make_audio.py) is 120 BPM,
 * one bar = 2s: the drop lands on the reveal (6s) and the pricing shot (26s).
 */
export const FPS = 60;

export const SHOTS = {
  hook: { at: 0, dur: 4 },
  problem: { at: 4, dur: 2 },
  reveal: { at: 6, dur: 2 }, // drop
  research: { at: 8, dur: 3.5 },
  growth: { at: 11.5, dur: 3 },
  picks: { at: 14.5, dur: 2.5 },
  analyze: { at: 17, dur: 3.5 },
  script: { at: 20.5, dur: 3.5 },
  why: { at: 24, dur: 2 }, // breakdown
  cta: { at: 26, dur: 6 }, // final drop
} as const;

export const TOTAL_SECONDS = SHOTS.cta.at + SHOTS.cta.dur;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
