import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SHOTS } from "../timeline";
import { DRIFT, clamp } from "./ui";

type Glow = { x: number; y: number; s: number; a: number };

/**
 * Where the two big light pools sit for each shot. The backdrop eases between
 * these over each transition, so the light moves with the edit the way the
 * gradient fields do in the Jupiter, Omnipair and Print films.
 */
const MOODS: Record<keyof typeof SHOTS, [Glow, Glow]> = {
  hook: [{ x: 50, y: 40, s: 55, a: 0.26 }, { x: 80, y: 85, s: 40, a: 0.12 }],
  problem: [{ x: 30, y: 30, s: 45, a: 0.16 }, { x: 75, y: 80, s: 40, a: 0.1 }],
  reveal: [{ x: 50, y: 45, s: 70, a: 0.4 }, { x: 50, y: 100, s: 60, a: 0.22 }],
  researchTitle: [{ x: 50, y: 95, s: 60, a: 0.3 }, { x: 15, y: 20, s: 35, a: 0.1 }],
  research: [{ x: 30, y: 35, s: 55, a: 0.24 }, { x: 85, y: 85, s: 45, a: 0.14 }],
  growthTitle: [{ x: 50, y: 0, s: 60, a: 0.3 }, { x: 85, y: 90, s: 35, a: 0.1 }],
  growth: [{ x: 70, y: 35, s: 55, a: 0.26 }, { x: 15, y: 85, s: 45, a: 0.14 }],
  picksTitle: [{ x: 50, y: 95, s: 60, a: 0.3 }, { x: 85, y: 15, s: 35, a: 0.1 }],
  picks: [{ x: 50, y: 30, s: 75, a: 0.24 }, { x: 50, y: 100, s: 60, a: 0.16 }],
  analyzeTitle: [{ x: 50, y: 0, s: 60, a: 0.3 }, { x: 15, y: 90, s: 35, a: 0.1 }],
  analyze: [{ x: 35, y: 55, s: 55, a: 0.26 }, { x: 85, y: 20, s: 40, a: 0.14 }],
  scriptTitle: [{ x: 50, y: 95, s: 60, a: 0.3 }, { x: 85, y: 15, s: 35, a: 0.1 }],
  script: [{ x: 65, y: 40, s: 55, a: 0.24 }, { x: 20, y: 80, s: 45, a: 0.12 }],
  why: [{ x: 50, y: 50, s: 45, a: 0.18 }, { x: 50, y: 50, s: 80, a: 0.08 }],
  cta: [{ x: 50, y: 42, s: 70, a: 0.34 }, { x: 50, y: 105, s: 70, a: 0.24 }],
};

const ORDER = Object.keys(SHOTS) as (keyof typeof SHOTS)[];

function mix(a: Glow, b: Glow, p: number): Glow {
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, s: a.s + (b.s - a.s) * p, a: a.a + (b.a - a.a) * p };
}

/** Black stage with two soft violet light pools that drift between shots, a faint grid, and a vignette. */
export function Backdrop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Find the current shot and how far into the next one's transition we are.
  let i = 0;
  while (i < ORDER.length - 1 && t >= SHOTS[ORDER[i + 1]].at) i++;
  const cur = MOODS[ORDER[i]];
  const next = MOODS[ORDER[Math.min(i + 1, ORDER.length - 1)]];
  const s = SHOTS[ORDER[i]];
  const p = interpolate(t, [s.at + s.dur - 0.2, s.at + s.dur + 0.5], [0, 1], { ...clamp, easing: DRIFT });
  const g1 = mix(cur[0], next[0], i === ORDER.length - 1 ? 0 : p);
  const g2 = mix(cur[1], next[1], i === ORDER.length - 1 ? 0 : p);
  // A slow breathing wobble keeps the light alive between moves.
  const wob = Math.sin(t * 0.9) * 2;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${g1.s}% ${g1.s * 0.9}% at ${g1.x + wob}% ${g1.y}%, rgba(139,92,246,${g1.a}), transparent 72%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${g2.s}% ${g2.s * 0.8}% at ${g2.x - wob}% ${g2.y}%, rgba(99,102,241,${g2.a}), transparent 70%)` }} />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `${-t * 12}px ${-t * 6}px`,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
    </AbsoluteFill>
  );
}

/**
 * A bloom of light that swells through the frame and falls away, used on the
 * music drops (Omnipair's colour wash, Jupiter's arc flares). Peaks at `at`.
 */
export function Bloom({ at, strength = 1 }: { at: number; strength?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const up = interpolate(t, [at - 0.3, at], [0, 1], { ...clamp, easing: DRIFT });
  const down = interpolate(t, [at, at + 0.7], [1, 0], { ...clamp, easing: DRIFT });
  const k = Math.min(up, down) * strength;
  if (k <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        background: `radial-gradient(ellipse ${60 + 40 * k}% ${50 + 40 * k}% at 50% 55%, rgba(196,181,253,${0.55 * k}), rgba(139,92,246,${0.35 * k}) 45%, transparent 80%)`,
      }}
    />
  );
}
