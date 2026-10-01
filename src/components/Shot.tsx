import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DRIFT, IN_OUT, clamp } from "./ui";

/** How long a transition takes; neighbouring shots overlap by this much. */
export const TRANSITION = 0.5;

/**
 * Transitions, in the vocabulary of the reference launch films:
 * - blur:  dissolve through a soft blur with a slight scale (the most common one)
 * - push:  the camera flies through the outgoing shot; the next one settles in from slightly small
 * - slide: a short lateral glide (~15% of frame) with blur, never a full-frame whip
 * - rise:  the next shot glides up from below while the old one lifts away
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
  b: number; // isotropic blur, px
}

/** Camera keys → pose. Each segment eases on its own (easeInOutSine), like AE's easy-ease keyframes. */
function camera(keys: Key[], t: number) {
  const full = keys.map((k, i) => {
    const prev = keys.slice(0, i + 1).reverse();
    const pick = (f: "x" | "y" | "z" | "r", d: number) => prev.find((p) => p[f] !== undefined)?.[f] ?? d;
    return { t: k.t, x: pick("x", W / 2), y: pick("y", H / 2), z: pick("z", 1), r: pick("r", 0) };
  });
  if (full.length === 0) return { x: W / 2, y: H / 2, z: 1, r: 0 };
  if (t <= full[0].t) return full[0];
  for (let i = 0; i < full.length - 1; i++) {
    const a = full[i];
    const b = full[i + 1];
    if (t <= b.t) {
      const p = interpolate(t, [a.t, b.t], [0, 1], { ...clamp, easing: DRIFT });
      // Interpolate zoom geometrically so pushes feel even to the eye.
      return { t, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z: a.z * Math.pow(b.z / a.z, p), r: a.r + (b.r - a.r) * p };
    }
  }
  return full[full.length - 1];
}

/** What a transition adds on top of the camera. p: 0 = gone, 1 = settled. dir 1 = entering, -1 = leaving. */
function transition(move: Move, p: number, dir: 1 | -1): Pose {
  const q = 1 - p;
  const enter = dir === 1;
  switch (move) {
    case "blur":
      return { x: 0, y: 0, s: enter ? 1 - 0.05 * q : 1 + 0.07 * q, r: 0, o: Math.min(1, p * 1.5), b: q * 26 };
    case "push":
      return { x: 0, y: 0, s: enter ? 1 - 0.14 * q : 1 + 1.4 * q * q, r: 0, o: enter ? Math.min(1, p * 1.8) : Math.min(1, p * 2.2), b: q * (enter ? 18 : 30) };
    case "slide":
      return { x: (enter ? 1 : -1) * q * 300, y: 0, s: 1, r: 0, o: Math.min(1, p * 1.6), b: q * 16 };
    case "rise":
      return { x: 0, y: (enter ? 1 : -1) * q * 240, s: 1, r: 0, o: Math.min(1, p * 1.6), b: q * 16 };
    case "cut":
      return { x: 0, y: 0, s: 1, r: 0, o: p > 0 ? 1 : 0, b: 0 };
  }
}

function pose(t: number, duration: number, keys: Key[], enter: Move, exit: Move): Pose {
  const cam = camera(keys, t);
  const inP = enter === "cut" ? (t >= 0 ? 1 : 0) : interpolate(t, [0, TRANSITION], [0, 1], { ...clamp, easing: IN_OUT });
  // A cut lands exactly on the shot boundary, which the timeline keeps on a beat.
  const outP = exit === "cut" ? (t < duration ? 1 : 0) : interpolate(t, [duration, duration + TRANSITION], [1, 0], { ...clamp, easing: IN_OUT });
  const a = transition(enter, inP, 1);
  const b = transition(exit, outP, -1);
  return {
    x: a.x + b.x + (W / 2 - cam.x) * cam.z,
    y: a.y + b.y + (H / 2 - cam.y) * cam.z,
    s: a.s * b.s * cam.z,
    r: cam.r,
    o: a.o * b.o,
    b: a.b + b.b,
  };
}

/**
 * One shot of the film. Children are laid out on a 1920×1080 stage; the camera
 * pans/zooms over it with easeInOutSine keyframes, and entries/exits use the
 * transitions above. The Sequence holding a Shot should run `duration + TRANSITION` seconds.
 */
export function Shot({ id, duration, children, keys = [], enter = "blur", exit = "blur" }: { id: string; duration: number; children: ReactNode; keys?: Key[]; enter?: Move; exit?: Move }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const now = pose(t, duration, keys, enter, exit);
  const prev = pose(t - 1 / fps, duration, keys, enter, exit);

  // Directional motion blur from per-frame screen velocity. Camera drifts stay sharp;
  // only the quick part of a slide or push smears, like a 180° shutter would.
  const k = 60 / fps;
  const smear = (v: number) => Math.max(0, v * k - 8) * 0.4;
  const bx = Math.min(40, smear(Math.abs(now.x - prev.x)));
  const by = Math.min(40, smear(Math.abs(now.y - prev.y)));
  const bs = Math.min(14, Math.max(0, Math.abs(Math.log(now.s / prev.s)) * k - 0.008) * 260);
  const blurX = Math.max(bx, bs);
  const blurY = Math.max(by, bs);
  const directional = blurX > 0.3 || blurY > 0.3;
  const filterId = `mb-${id}`;

  if (now.o <= 0.001) return null;

  const filters = [directional ? `url(#${filterId})` : "", now.b > 0.3 ? `blur(${now.b.toFixed(2)}px)` : ""].filter(Boolean).join(" ");

  return (
    <AbsoluteFill style={{ opacity: now.o }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${blurX.toFixed(2)} ${blurY.toFixed(2)}`} />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translate(${now.x}px, ${now.y}px) scale(${now.s}) rotate(${now.r}deg)`,
          transformOrigin: "50% 50%",
          // Clip to the stage so blur filters never rasterize off-screen content (e.g. the tilted feed).
          overflow: "hidden",
          filter: filters || undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
