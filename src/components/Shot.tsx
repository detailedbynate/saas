import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DRIFT, IN_OUT, clamp } from "./ui";

/** How long a whip/zoom transition takes; neighbouring shots overlap by this much. */
export const TRANSITION = 0.42;

export type Move = "left" | "up" | "zoom" | "cut";

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
}

/** Camera keys → pose. Each segment eases on its own, like AE's easy-ease keyframes. */
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
      // Interpolate zoom geometrically so pushes feel linear to the eye.
      return { t, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z: a.z * Math.pow(b.z / a.z, p), r: a.r + (b.r - a.r) * p };
    }
  }
  return full[full.length - 1];
}

/** Offset that a whip-in / whip-out adds on top of the camera. p: 0 = off screen, 1 = settled. */
function transition(move: Move, p: number, dir: 1 | -1): Omit<Pose, "o"> & { o: number } {
  const q = 1 - p;
  switch (move) {
    case "left":
      return { x: dir * q * W * 1.05, y: 0, s: 1, r: 0, o: 1 };
    case "up":
      return { x: 0, y: dir * q * H * 1.1, s: 1, r: 0, o: 1 };
    case "zoom":
      // Incoming grows from small; outgoing flies past the camera.
      return { x: 0, y: 0, s: dir === 1 ? 1 - 0.45 * q : 1 + 2.2 * q, r: 0, o: Math.min(1, p * 2.2) };
    case "cut":
      return { x: 0, y: 0, s: 1, r: 0, o: p > 0 ? 1 : 0 };
  }
}

function pose(t: number, duration: number, keys: Key[], enter: Move, exit: Move): Pose {
  const cam = camera(keys, t);
  const inP = enter === "cut" ? 1 : interpolate(t, [0, TRANSITION], [0, 1], { ...clamp, easing: IN_OUT });
  const outP = exit === "cut" ? (t < duration ? 1 : 0) : interpolate(t, [duration, duration + TRANSITION], [1, 0], { ...clamp, easing: IN_OUT });
  const a = transition(enter, inP, 1);
  const b = transition(exit, outP, -1);
  return {
    x: a.x + b.x + (W / 2 - cam.x) * cam.z,
    y: a.y + b.y + (H / 2 - cam.y) * cam.z,
    s: a.s * b.s * cam.z,
    r: cam.r,
    o: a.o * b.o,
  };
}

/**
 * One shot of the film. Children are laid out on a 1920×1080 stage; the camera
 * pans/zooms over it, and entries/exits are whips with directional motion blur.
 * The Sequence holding a Shot should run `duration + TRANSITION` seconds.
 */
export function Shot({ id, duration, children, keys = [], enter = "left", exit = "left" }: { id: string; duration: number; children: ReactNode; keys?: Key[]; enter?: Move; exit?: Move }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const now = pose(t, duration, keys, enter, exit);
  const prev = pose(t - 1 / fps, duration, keys, enter, exit);

  // Motion blur proportional to per-frame screen velocity, split by axis.
  // Slow drifts stay sharp; only whips (above ~10px/frame at 60fps) smear.
  const k = 60 / fps;
  const smear = (v: number) => Math.max(0, v * k - 10) * 0.45;
  const bx = Math.min(60, smear(Math.abs(now.x - prev.x)));
  const by = Math.min(60, smear(Math.abs(now.y - prev.y)));
  const bs = Math.min(18, Math.max(0, Math.abs(Math.log(now.s / prev.s)) * k - 0.01) * 300);
  const blurX = Math.max(bx, bs);
  const blurY = Math.max(by, bs);
  const blurred = blurX > 0.3 || blurY > 0.3;
  const filterId = `mb-${id}`;

  if (now.o <= 0.001) return null;

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
          filter: blurred ? `url(#${filterId})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
