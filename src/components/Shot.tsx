import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IN_OUT, clamp } from "./ui";

/** How long a transition takes; neighbouring shots overlap by this much. Long and soft on purpose. */
export const TRANSITION = 0.9;

/**
 * Transitions:
 * - blur:  dissolve through a soft blur with a slight scale (the default)
 * - push:  the camera keeps travelling into the outgoing shot as the next one settles in
 * - slide: a short lateral glide with blur
 * - rise:  the next shot glides up from below
 * - cut:   a hard cut, placed on a beat
 */
export type Move = "blur" | "push" | "slide" | "rise" | "cut";

/** Camera keyframe: at `t` seconds, look at point (x, y) of the 1920×1080 layout with zoom `z`. */
export type Key = { t: number; x?: number; y?: number; z?: number; r?: number };

const W = 1920;
const H = 1080;

interface Pose {
  x: number; // screen-space offset, px
  y: number;
  s: number; // scale
  r: number; // rotation, deg
  o: number; // opacity
  b: number; // blur, px
}

type Pt = { t: number; x: number; y: number; lz: number; r: number };

/**
 * Camera keys → position on a smooth curve. Keys are joined with a cubic Hermite
 * spline whose tangents come from the neighbouring keys (Catmull-Rom), so the
 * camera glides *through* each key instead of easing to a stop on it. Velocity
 * is continuous for the whole shot — the frame never parks.
 */
function camera(keys: Key[], t: number) {
  const pts: Pt[] = keys.map((k, i) => {
    const prev = keys.slice(0, i + 1).reverse();
    const pick = (f: "x" | "y" | "z" | "r", d: number) => prev.find((p) => p[f] !== undefined)?.[f] ?? d;
    return { t: k.t, x: pick("x", W / 2), y: pick("y", H / 2), lz: Math.log(pick("z", 1)), r: pick("r", 0) };
  });
  if (pts.length === 0) return { x: W / 2, y: H / 2, z: 1, r: 0 };
  if (pts.length === 1) return { x: pts[0].x, y: pts[0].y, z: Math.exp(pts[0].lz), r: pts[0].r };

  const F = ["x", "y", "lz", "r"] as const;
  const tangent = (i: number) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dt = b.t - a.t || 1;
    return Object.fromEntries(F.map((f) => [f, (b[f] - a[f]) / dt])) as Record<(typeof F)[number], number>;
  };

  // Past either end, keep drifting along the end tangent so the shot never parks.
  if (t <= pts[0].t || t >= pts[pts.length - 1].t) {
    const i = t <= pts[0].t ? 0 : pts.length - 1;
    const m = tangent(i);
    const d = t - pts[i].t;
    return { x: pts[i].x + m.x * d, y: pts[i].y + m.y * d, z: Math.exp(pts[i].lz + m.lz * d), r: pts[i].r + m.r * d };
  }

  let i = 0;
  while (t > pts[i + 1].t) i++;
  const a = pts[i];
  const b = pts[i + 1];
  const h = b.t - a.t;
  const u = (t - a.t) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
  const h10 = u ** 3 - 2 * u ** 2 + u;
  const h01 = -2 * u ** 3 + 3 * u ** 2;
  const h11 = u ** 3 - u ** 2;
  const ma = tangent(i);
  const mb = tangent(i + 1);
  const v = (f: (typeof F)[number]) => h00 * a[f] + h10 * h * ma[f] + h01 * b[f] + h11 * h * mb[f];
  return { x: v("x"), y: v("y"), z: Math.exp(v("lz")), r: v("r") };
}

/** What a transition adds on top of the camera. p: 0 = gone, 1 = settled. dir 1 = entering, -1 = leaving. */
function transition(move: Move, p: number, dir: 1 | -1): Pose {
  const q = 1 - p;
  const enter = dir === 1;
  const fade = enter ? Math.min(1, p * 1.25) : Math.min(1, p * 1.4);
  switch (move) {
    case "blur":
      return { x: 0, y: 0, s: enter ? 1 - 0.04 * q : 1 + 0.05 * q, r: 0, o: fade, b: q * 16 };
    case "push":
      return { x: 0, y: 0, s: enter ? 1 - 0.1 * q : 1 + 0.45 * q * q, r: 0, o: fade, b: q * (enter ? 12 : 18) };
    case "slide":
      return { x: (enter ? 1 : -1) * q * 220, y: 0, s: 1, r: 0, o: fade, b: q * 10 };
    case "rise":
      return { x: 0, y: (enter ? 1 : -1) * q * 180, s: 1, r: 0, o: fade, b: q * 10 };
    case "cut":
      return { x: 0, y: 0, s: 1, r: 0, o: p > 0 ? 1 : 0, b: 0 };
  }
}

function pose(t: number, duration: number, keys: Key[], enter: Move, exit: Move): Pose {
  const cam = camera(keys, t);
  // A slow (1.2%/s), ever-present push and a faint float under every camera move, like a dolly that never stops.
  const creep = 1 + 0.012 * t;
  const fx = Math.sin(t * 0.5 + 0.7) * 9;
  const fy = Math.sin(t * 0.37 + 2.1) * 6;
  const inP = enter === "cut" ? (t >= 0 ? 1 : 0) : interpolate(t, [0, TRANSITION], [0, 1], { ...clamp, easing: IN_OUT });
  // A cut lands exactly on the shot boundary, which the timeline keeps on a beat.
  const outP = exit === "cut" ? (t < duration ? 1 : 0) : interpolate(t, [duration, duration + TRANSITION], [1, 0], { ...clamp, easing: IN_OUT });
  const a = transition(enter, inP, 1);
  const b = transition(exit, outP, -1);
  const z = cam.z * creep;
  return {
    x: a.x + b.x + (W / 2 - cam.x) * z + fx,
    y: a.y + b.y + (H / 2 - cam.y) * z + fy,
    s: a.s * b.s * z,
    r: cam.r,
    o: a.o * b.o,
    b: a.b + b.b,
  };
}

/**
 * One shot of the film. Children are laid out on a 1920×1080 stage; the camera
 * glides over it on a spline, and entries/exits use the transitions above.
 * The Sequence holding a Shot should run `duration + TRANSITION` seconds.
 */
export function Shot({ duration, children, keys = [], enter = "blur", exit = "blur" }: { id?: string; duration: number; children: ReactNode; keys?: Key[]; enter?: Move; exit?: Move }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const now = pose(t, duration, keys, enter, exit);
  if (now.o <= 0.001) return null;

  return (
    <AbsoluteFill style={{ opacity: now.o }}>
      <AbsoluteFill
        style={{
          transform: `translate3d(${now.x}px, ${now.y}px, 0) scale(${now.s}) rotate(${now.r}deg)`,
          transformOrigin: "50% 50%",
          // Clip to the stage so blur never rasterizes off-screen content.
          overflow: "hidden",
          filter: now.b > 0.05 ? `blur(${now.b.toFixed(2)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
