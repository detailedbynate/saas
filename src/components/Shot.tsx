import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IN_OUT, clamp } from "./ui";

/** How long a transition takes; neighbouring shots overlap by this much. */
export const TRANSITION = 0.5;

/**
 * Transitions:
 * - blur:  dissolve through a soft blur with a slight scale (the default)
 * - push:  the camera keeps travelling into the outgoing shot as the next one settles in
 * - slide: a short lateral glide with blur
 * - rise:  the next shot glides up from below
 * - cut:   a hard cut, placed on a beat
 */
export type Move = "blur" | "push" | "slide" | "rise" | "cut";

/**
 * Camera keyframe: at `t` seconds, look at point (x, y) of the 1920×1080 stage with zoom `z`,
 * roll `r`, and 3D pitch `rx` / yaw `ry` (degrees) — the stage swings in perspective like
 * the cards in the reference film.
 */
export type Key = { t: number; x?: number; y?: number; z?: number; r?: number; rx?: number; ry?: number };

const W = 1920;
const H = 1080;
const F = ["x", "y", "lz", "r", "rx", "ry"] as const;
type Field = (typeof F)[number];
type Pt = { t: number } & Record<Field, number>;

interface Pose {
  x: number;
  y: number;
  s: number;
  r: number;
  rx: number;
  ry: number;
  o: number;
  b: number;
}

/**
 * Camera keys → a smooth curve. Keys are joined with a Catmull-Rom (cubic Hermite)
 * spline, so the camera glides *through* each key instead of stopping on it, and
 * past either end it keeps drifting along the end tangent. The frame never parks.
 */
function camera(keys: Key[], t: number): Record<Field, number> {
  const pts: Pt[] = keys.map((k, i) => {
    const prev = keys.slice(0, i + 1).reverse();
    const pick = (f: keyof Key, d: number) => (prev.find((p) => p[f] !== undefined)?.[f] as number | undefined) ?? d;
    return { t: k.t, x: pick("x", W / 2), y: pick("y", H / 2), lz: Math.log(pick("z", 1)), r: pick("r", 0), rx: pick("rx", 0), ry: pick("ry", 0) };
  });
  const rest = { x: W / 2, y: H / 2, lz: 0, r: 0, rx: 0, ry: 0 };
  if (pts.length === 0) return rest;
  if (pts.length === 1) return pts[0];

  const tangent = (i: number) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dt = b.t - a.t || 1;
    return Object.fromEntries(F.map((f) => [f, (b[f] - a[f]) / dt])) as Record<Field, number>;
  };

  if (t <= pts[0].t || t >= pts[pts.length - 1].t) {
    const i = t <= pts[0].t ? 0 : pts.length - 1;
    const m = tangent(i);
    const d = t - pts[i].t;
    return Object.fromEntries(F.map((f) => [f, pts[i][f] + m[f] * d])) as Record<Field, number>;
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
  return Object.fromEntries(F.map((f) => [f, h00 * a[f] + h10 * h * ma[f] + h01 * b[f] + h11 * h * mb[f]])) as Record<Field, number>;
}

/** What a transition adds on top of the camera. p: 0 = gone, 1 = settled. dir 1 = entering, -1 = leaving. */
function transition(move: Move, p: number, dir: 1 | -1) {
  const q = 1 - p;
  const enter = dir === 1;
  const fade = enter ? Math.min(1, p * 1.3) : Math.min(1, p * 1.5);
  switch (move) {
    case "blur":
      return { x: 0, y: 0, s: enter ? 1 - 0.05 * q : 1 + 0.06 * q, o: fade, b: q * 18 };
    case "push":
      return { x: 0, y: 0, s: enter ? 1 - 0.12 * q : 1 + 0.5 * q * q, o: fade, b: q * (enter ? 12 : 20) };
    case "slide":
      return { x: (enter ? 1 : -1) * q * 260, y: 0, s: 1, o: fade, b: q * 12 };
    case "rise":
      return { x: 0, y: (enter ? 1 : -1) * q * 200, s: 1, o: fade, b: q * 12 };
    case "cut":
      return { x: 0, y: 0, s: 1, o: p > 0 ? 1 : 0, b: 0 };
  }
}

function pose(t: number, duration: number, keys: Key[], enter: Move, exit: Move): Pose {
  const cam = camera(keys, t);
  // A slow, ever-present push and a faint float under every camera move.
  const creep = 1 + 0.012 * t;
  const fx = Math.sin(t * 0.5 + 0.7) * 8;
  const fy = Math.sin(t * 0.37 + 2.1) * 5;
  const inP = enter === "cut" ? (t >= 0 ? 1 : 0) : interpolate(t, [0, TRANSITION], [0, 1], { ...clamp, easing: IN_OUT });
  // A cut lands exactly on the shot boundary.
  const outP = exit === "cut" ? (t < duration ? 1 : 0) : interpolate(t, [duration, duration + TRANSITION], [1, 0], { ...clamp, easing: IN_OUT });
  const a = transition(enter, inP, 1);
  const b = transition(exit, outP, -1);
  const z = Math.exp(cam.lz) * creep;
  return {
    x: a.x + b.x + (W / 2 - cam.x) * z + fx,
    y: a.y + b.y + (H / 2 - cam.y) * z + fy,
    s: a.s * b.s * z,
    r: cam.r,
    rx: cam.rx,
    ry: cam.ry,
    o: a.o * b.o,
    b: a.b + b.b,
  };
}

/**
 * One shot of the film. Children are laid out on a 1920×1080 stage; the camera
 * glides over it on a spline (with 3D pitch/yaw), and entries/exits use the transitions above.
 * The Sequence holding a Shot should run `duration + TRANSITION` seconds.
 */
export function Shot({ duration, children, keys = [], enter = "blur", exit = "blur" }: { id?: string; duration: number; children: ReactNode; keys?: Key[]; enter?: Move; exit?: Move }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const now = pose(t, duration, keys, enter, exit);
  if (now.o <= 0.001) return null;

  return (
    <AbsoluteFill style={{ opacity: now.o, perspective: 2200 }}>
      <AbsoluteFill
        style={{
          transform: `translate3d(${now.x}px, ${now.y}px, 0) scale(${now.s}) rotateX(${now.rx}deg) rotateY(${now.ry}deg) rotate(${now.r}deg)`,
          transformOrigin: "50% 50%",
          filter: now.b > 0.05 ? `blur(${now.b.toFixed(2)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
