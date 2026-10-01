/**
 * Shot timing in seconds (v7). Simple scenes, one idea each: a hook, the problem,
 * the logo on the music drop, four features, "in any niche", the dashboard, the
 * tagline and the end card.
 *
 * Shots are centred on their boundaries: each Sequence starts LEAD (0.3s) early and
 * transitions straddle the boundary. Music (scripts/make_audio.py) is 120 BPM; the drop
 * lands on the logo (8s), the breakdown on the tagline (28s), the last hit on the end card (30.5s).
 */
export const FPS = 60;

export const SHOTS = {
  hook: { at: 0, dur: 3 }, // "Going viral / isn't luck."
  multiply: { at: 3, dur: 3 }, // one Short becomes many
  turn: { at: 6, dur: 4 }, // "A few break out." → orbs gather → logo at 8s
  niche: { at: 10, dur: 3 }, // Niche Finder
  viral: { at: 13, dur: 3 }, // Viral Videos
  analyze: { at: 16, dur: 3.5 }, // Analyze Video
  tracked: { at: 19.5, dur: 3 }, // Tracked Channels
  any: { at: 22.5, dur: 2.5 }, // In any niche
  dash: { at: 25, dur: 3 }, // the dashboard
  tagline: { at: 28, dur: 2.5 }, // Less guessing. More outliers.
  end: { at: 30.5, dur: 3 }, // logo + URL
} as const;

export const TOTAL_SECONDS = SHOTS.end.at + SHOTS.end.dur;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
