/**
 * Scene timing in seconds (v9). Nine short scenes, one idea each (src/film): a typed hook,
 * the name reveal, four features, the real dashboard, the tagline and the end card. Scenes butt up against each other; each
 * hands off in its last 0.25s.
 */
export const FPS = 60;

const order = [
  ["hook", 3.5], // a wall of Shorts; "Find trending Shorts" → selected → "Find outliers / before they blow up."
  ["intro", 2.9], // Introducing → Outlier → what it is
  ["niche", 7.2], // Niche Finder: search "minecraft" → money, top niches, inside Mods
  ["viral", 3.3], // Viral Videos: four real Shorts with their multipliers
  ["analyze", 5.0], // Analyze Any Video: paste, click, 62×
  ["script", 4.2], // Script Writer (Soon)
  ["tracked", 3.2], // Track any Channel: Kopee
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
