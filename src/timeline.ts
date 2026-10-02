/**
 * Scene timing in seconds. The 7.0 s intro (src/film/intro.tsx), then five feature scenes and
 * the end card (src/film/scenes.tsx). Scenes butt up against each other; each hands off in its
 * last 0.25 s and the next starts 0.2 s early.
 */
export const FPS = 60;

const order = [
  ["intro", 7.0], // f0–f419, rebuilt shot for shot from SPEC.md (src/film/intro.tsx)
  ["niche", 7.2], // Niche Finder: search "minecraft" → money, top niches, inside Mods
  ["viral", 3.3], // Viral Videos: four real Shorts with their multipliers
  ["analyze", 6.4], // Analyze Any Video: paste a link → verdict, five tiles, the channel chart
  ["script", 4.8], // Script Writer: a mini script written out
  ["tracked", 3.2], // Track any Channel: Kopee
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
