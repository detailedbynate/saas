/**
 * Scene timing in seconds (v9). Nine short scenes, one idea each (src/film): a typed hook,
 * the name reveal, four features, the real dashboard, the tagline and the end card. Scenes butt up against each other; each
 * hands off in its last 0.25s.
 */
export const FPS = 60;

const order = [
  ["hook", 3.9], // "Find trending Shorts" → selected → "Find outliers before they blow up"
  ["intro", 2.7], // Introducing → Outlier
  ["niche", 4.7], // Niche Finder: zoom into the dropdown
  ["viral", 3.3], // Viral Videos: four Shorts with their multipliers
  ["analyze", 5.2], // Analyze Any Video: paste, click, 79×
  ["tracked", 3.4], // Track any Channel: three stat cards
  ["dash", 3.0], // the real dashboard
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
