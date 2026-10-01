/**
 * Shot timing in seconds (v6). An original 33s story: the problem, the turn, the
 * logo on the music drop, the real product in three beats, a big stat, the
 * dashboard, the tagline and the call to action.
 *
 * Shots are centred on their boundaries: each Sequence starts LEAD (0.25s) early and
 * transitions straddle the boundary, so every boundary below is where the cut "lands".
 * Music (scripts/make_audio.py) is 120 BPM, one bar = 2s; all boundaries are on half-beats.
 * Drop on the logo (8s), breakdown on the tagline (26.5s), final hit on the CTA (29.5s).
 */
export const FPS = 60;

export const SHOTS = {
  hook: { at: 0, dur: 3 }, // "Going viral isn't luck."
  wall: { at: 3, dur: 5 }, // one Short → a wall of them → a few break out
  logo: { at: 8, dur: 1.5 }, // drop
  finder: { at: 9.5, dur: 6 }, // Niche Finder: type, research, money, competitors
  score: { at: 15.5, dur: 4 }, // opportunity score, stats, real Shorts
  stat: { at: 19.5, dur: 3 }, // 405× · any niche
  dash: { at: 22.5, dur: 4 }, // dashboard: Niche Pulse, channels heating up
  tagline: { at: 26.5, dur: 3 }, // breakdown
  cta: { at: 29.5, dur: 3.5 }, // final hit
} as const;

export const TOTAL_SECONDS = SHOTS.cta.at + SHOTS.cta.dur;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
