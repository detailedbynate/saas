/**
 * Shot timing in seconds. Each shot starts where the previous one's transition begins,
 * so neighbours overlap by TRANSITION (0.9s).
 *
 * v4 pacing follows the example the client liked: few, long shots (4–5s each) where
 * the camera never stops moving, a caption beside the product rather than a separate
 * title card, and only one hard cut (into the breakdown). The music
 * (scripts/make_audio.py) is 120 BPM, one bar = 2s; the drops land on the logo
 * reveal (8s) and pricing (40s), the breakdown starts at 36s.
 */
export const FPS = 60;

export const SHOTS = {
  hook: { at: 0, dur: 5 },
  problem: { at: 5, dur: 3 },
  reveal: { at: 8, dur: 4 }, // drop
  research: { at: 12, dur: 5 },
  growth: { at: 17, dur: 4.5 },
  picks: { at: 21.5, dur: 4.5 },
  analyze: { at: 26, dur: 5 },
  script: { at: 31, dur: 5 },
  why: { at: 36, dur: 4 }, // breakdown
  cta: { at: 40, dur: 6 }, // final drop; the URL end card lands at 43
} as const;

export const TOTAL_SECONDS = SHOTS.cta.at + SHOTS.cta.dur;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
