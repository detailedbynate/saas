/**
 * Scene timing in seconds (v8). Nine short scenes, one idea each, all moving the way the
 * agreed test scene does (src/film/kit.tsx): a prompt, a scan beat, four features, the
 * real dashboard, the tagline and the end card. Scenes butt up against each other; each
 * hands off in its last 0.25s.
 */
export const FPS = 60;

const order = [
  ["prompt", 2.7], // "find breakout Shorts in minecraft"
  ["scan", 1.3], // Scanning millions of Shorts
  ["niche", 3.4], // Niche Finder: collage + views counter
  ["viral", 3.4], // Viral Videos: four Shorts with their multipliers
  ["analyze", 5.4], // Analyze Any Video: paste, click, 79×
  ["tracked", 3.4], // Tracked Channels: three stat cards
  ["dash", 3.4], // the real dashboard
  ["tagline", 2.5], // Stop guessing. Find the outliers.
  ["end", 2.8], // logo + URL
] as const;

export type SceneId = (typeof order)[number][0];

let clock = 0;
export const SHOTS = Object.fromEntries(
  order.map(([id, dur]) => {
    const at = clock;
    clock = Math.round((clock + dur) * 100) / 100;
    return [id, { at, dur }];
  }),
) as Record<SceneId, { at: number; dur: number }>;

export const TOTAL_SECONDS = clock;
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);
