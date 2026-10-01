/**
 * Shot timing in seconds. Each shot starts where the previous one's transition begins,
 * so neighbours overlap by TRANSITION (0.5s).
 *
 * Structure follows the reference launch films (refs/NOTES.md): every feature is a
 * ~1s centred text beat, then a ~2–2.5s full-frame product beat. The music
 * (scripts/make_audio.py) is 120 BPM, one bar = 2s, and every cut lands on a beat
 * (a multiple of 0.5s). Drops: the reveal (6s) and pricing (26s); breakdown at 24s.
 */
export const FPS = 60;

export const SHOTS = {
  hook: { at: 0, dur: 4 },
  problem: { at: 4, dur: 2 },
  reveal: { at: 6, dur: 2 }, // drop
  researchTitle: { at: 8, dur: 1 },
  research: { at: 9, dur: 2 },
  growthTitle: { at: 11, dur: 1 },
  growth: { at: 12, dur: 2.5 },
  picksTitle: { at: 14.5, dur: 1 },
  picks: { at: 15.5, dur: 2 },
  analyzeTitle: { at: 17.5, dur: 1 },
  analyze: { at: 18.5, dur: 2.5 },
  scriptTitle: { at: 21, dur: 1 },
  script: { at: 22, dur: 2 },
  why: { at: 24, dur: 2 }, // breakdown
  cta: { at: 26, dur: 6 }, // final drop; the URL end card lands at 29.5
} as const;

export const TOTAL_SECONDS = SHOTS.cta.at + SHOTS.cta.dur;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
