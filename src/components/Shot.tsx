import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LEAD, clamp } from "./ui";

/** How long a transition takes; neighbouring shots overlap by this much. */
export const TRANSITION = LEAD * 2;

/**
 * Transitions. The whips and zooms are *motion-matched*: the outgoing shot
 * accelerates away during the first half of the overlap and the incoming shot
 * arrives during the second half already moving at the same speed in the same
 * direction, so the cut reads as one continuous camera move.
 * - whipL / whipR / whipU / whipD: the camera whips in that direction
 * - zoomIn:  the camera punches through the outgoing shot into the next
 * - zoomOut: the camera pulls back out of the outgoing shot
 * - blur:    a soft dissolve
 * - cut:     a hard cut on the beat
 */
export type Move = "whipL" | "whipR" | "whipU" | "whipD" | "zoomIn" | "zoomOut" | "blur" | "cut";

/**
 * Camera keyframe: at `t` seconds, look at point (x, y) of the 1920×1080 stage with zoom `z`,
 * roll `r`, and 3D pitch `rx` / yaw `ry` (degrees). `ramp: true` makes the move *into* this
 * key a speed ramp (slow → fast → slow) instead of a constant glide.
 */
export type Key = { t: number; x?: number; y?: number; z?: number; r?: number; rx?: number; ry?: number; ramp?: boolean };

const W = 1920;
const H = 1080;
const F = ["x", "y", "lz", "r", "rx", "ry"] as const;
type Field = (typeof F)[number];
type Pt = { t: number; ramp: boolean } & Record<Field, number>;

interface Pose {
  x: number;
  y: number;
  s: number;
  r: number;
  rx: number;
  ry: number;
  o: number;
  b: number; // soft blur
  bx: number; // directional blur, x
  by: number; // directional blur, y
}

const RAMP = Easing.bezier(0.83, 0, 0.17, 1); // easeInOutQuint: the speed ramp

/**
 * Camera keys → a smooth curve. Glide segments are a Catmull-Rom spline (the camera
 * passes through keys without stopping); ramp segments ease hard in and out.
 * Past either end the camera keeps drifting along the end tangent.
 */
function camera(keys: Key[], t: number): Record<Field, number> {
  const pts: Pt[] = keys.map((k, i) => {
    const prev = keys.slice(0, i + 1).reverse();
    const pick = (f: "x" | "y" | "z" | "r" | "rx" | "ry", d: number) => (prev.find((p) => p[f] !== undefined)?.[f] as number | undefined) ?? d;
    return { t: k.t, ramp: !!k.ramp, x: pick("x", W / 2), y: pick("y", H / 2), lz: Math.log(pick("z", 1)), r: pick("r", 0), rx: pick("rx", 0), ry: pick("ry", 0) };
  });
  if (pts.length === 0) return { x: W / 2, y: H / 2, lz: 0, r: 0, rx: 0, ry: 0 };
  if (pts.length === 1) return pts[0];

  const tangent = (i: number) => {
    // A ramp segment arrives and leaves at rest, so its end keys get a zero tangent on that side.
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const flat = pts[i].ramp || pts[Math.min(pts.length - 1, i + 1)].ramp;
    const dt = b.t - a.t || 1;
    return Object.fromEntries(F.map((f) => [f, flat ? 0 : (b[f] - a[f]) / dt])) as Record<Field, number>;
  };

  if (t <= pts[0].t || t >= pts[pts.length - 1].t) {
    const i = t <= pts[0].t ? 0 : pts.length - 1;
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dt = b.t - a.t || 1;
    const d = t - pts[i].t;
    // Drift gently (a third of the neighbouring segment's speed) so the shot never parks.
    return Object.fromEntries(F.map((f) => [f, pts[i][f] + ((b[f] - a[f]) / dt) * d * 0.33])) as Record<Field, number>;
  }

  let i = 0;
  while (t > pts[i + 1].t) i++;
  const a = pts[i];
  const b = pts[i + 1];
  const h = b.t - a.t;
  const u = (t - a.t) / h;
  if (b.ramp) {
    const e = RAMP(u);
    return Object.fromEntries(F.map((f) => [f, a[f] + (b[f] - a[f]) * e])) as Record<Field, number>;
  }
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
  const h10 = u ** 3 - 2 * u ** 2 + u;
  const h01 = -2 * u ** 3 + 3 * u ** 2;
  const h11 = u ** 3 - u ** 2;
  const ma = tangent(i);
  const mb = tangent(i + 1);
  return Object.fromEntries(F.map((f) => [f, h00 * a[f] + h10 * h * ma[f] + h01 * b[f] + h11 * h * mb[f]])) as Record<Field, number>;
}

const DIR: Record<string, [number, number]> = { whipL: [-1, 0], whipR: [1, 0], whipU: [0, -1], whipD: [0, 1] };

/**
 * What a transition adds on top of the camera. `p` runs 0→1 across the overlap.
 * Outgoing shots use the first half (accelerating), incoming shots the second half
 * (decelerating); both have speed 4·D at the handoff, which is what matches the motion.
 */
function transition(move: Move, p: number, entering: boolean) {
  const base = { x: 0, y: 0, s: 1, o: 1, b: 0, bx: 0, by: 0 };
  if (move === "cut") return { ...base, o: entering ? (p > 0 ? 1 : 0) : p < 1 ? 1 : 0 };
  if (move === "blur") {
    const q = entering ? 1 - p : p;
    const e = Easing.bezier(0.65, 0, 0.35, 1)(q);
    return { ...base, s: entering ? 1 - 0.05 * e : 1 + 0.06 * e, o: 1 - Math.min(1, e * 1.3), b: e * 18 };
  }
  // u: 0→1 over this shot's half of the overlap.
  const u = entering ? Math.min(1, Math.max(0, p * 2 - 1)) : Math.min(1, p * 2);
  const visible = entering ? p >= 0.5 : p < 0.5;
  if (!visible) return { ...base, o: 0 };
  if (move in DIR) {
    const [dx, dy] = DIR[move];
    // The camera whips in `dir`, so the content travels the other way.
    const travel = entering ? (1 - u) ** 2 : -(u ** 2);
    const speed = entering ? 2 * (1 - u) : 2 * u; // per half-overlap
    const dist = dx !== 0 ? W * 1.05 : H * 1.08;
    return { ...base, x: dx * dist * travel, y: dy * dist * travel, bx: Math.abs(dx) * speed * 46, by: Math.abs(dy) * speed * 46 };
  }
  // Zooms: scale changes exponentially so the perceived speed is constant at the handoff.
  const inward = move === "zoomIn";
  const k = 1.5; // log-scale travel
  const ls = entering ? -(inward ? 1 : -1) * k * (1 - u) ** 2 : (inward ? 1 : -1) * k * u ** 2;
  const speed = entering ? 2 * (1 - u) : 2 * u;
  return { ...base, s: Math.exp(ls), o: entering ? Math.min(1, u * 4) : 1 - Math.max(0, u * 4 - 3), b: speed * 9 };
}

function pose(t: number, duration: number, keys: Key[], enter: Move, exit: Move): Pose {
  const cam = camera(keys, t);
  // A slow, ever-present push and a faint float under every camera move.
  const creep = 1 + 0.01 * t;
  const fx = Math.sin(t * 0.5 + 0.7) * 7;
  const fy = Math.sin(t * 0.37 + 2.1) * 4.5;
  const inP = interpolate(t, [-TRANSITION / 2, TRANSITION / 2], [0, 1], clamp);
  const outP = interpolate(t, [duration - TRANSITION / 2, duration + TRANSITION / 2], [0, 1], clamp);
  const a = inP < 1 ? transition(enter, inP, true) : { x: 0, y: 0, s: 1, o: 1, b: 0, bx: 0, by: 0 };
  const b = outP > 0 ? transition(exit, outP, false) : { x: 0, y: 0, s: 1, o: 1, b: 0, bx: 0, by: 0 };
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
    bx: a.bx + b.bx,
    by: a.by + b.by,
  };
}

/**
 * One shot of the film. Children are laid out on a 1920×1080 stage; the camera glides
 * (or speed-ramps) over it with 3D pitch/yaw. Shots are centred on their boundaries:
 * the Sequence holding a Shot should start TRANSITION/2 early and run `duration + TRANSITION`.
 * Inside, time 0 is the boundary itself.
 */
export function Shot({ id, duration, children, keys = [], enter = "blur", exit = "blur" }: { id: string; duration: number; children: ReactNode; keys?: Key[]; enter?: Move; exit?: Move }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - TRANSITION / 2;
  const now = pose(t, duration, keys, enter, exit);
  if (now.o <= 0.001) return null;
  const directional = now.bx > 0.5 || now.by > 0.5;
  const filters = [directional ? `url(#whip-${id})` : "", now.b > 0.05 ? `blur(${now.b.toFixed(2)}px)` : ""].filter(Boolean).join(" ");

  return (
    <AbsoluteFill style={{ opacity: now.o, perspective: 2200 }}>
      {directional ? (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id={`whip-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={`${now.bx.toFixed(1)} ${now.by.toFixed(1)}`} />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill
        style={{
          transform: `translate3d(${now.x}px, ${now.y}px, 0) scale(${now.s}) rotateX(${now.rx}deg) rotateY(${now.ry}deg) rotate(${now.r}deg)`,
          transformOrigin: "50% 50%",
          filter: filters || undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
