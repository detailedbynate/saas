import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Dust } from "./fx";

/**
 * The stage: near-black violet with three slow aurora pools, soft diagonal light
 * shards and drifting dust. Everything moves a little, all the time.
 */
export function Backdrop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pools = [
    { x: 30 + Math.sin(t * 0.19) * 14, y: 34 + Math.cos(t * 0.15) * 10, s: 62, c: "124,58,237", a: 0.34 },
    { x: 74 + Math.cos(t * 0.13 + 1) * 12, y: 70 + Math.sin(t * 0.17 + 2) * 12, s: 56, c: "79,70,229", a: 0.26 },
    { x: 55 + Math.sin(t * 0.11 + 3) * 20, y: 12 + Math.cos(t * 0.21) * 8, s: 40, c: "192,38,211", a: 0.12 },
  ];
  const shards = [
    { x: 16, w: 46, rot: 32, a: 0.22, v: 0.5 },
    { x: 62, w: 34, rot: 32, a: 0.16, v: -0.4 },
    { x: -8, w: 40, rot: -28, a: 0.12, v: 0.3 },
  ];
  return (
    <AbsoluteFill style={{ background: "#040209", overflow: "hidden" }}>
      {pools.map((p, i) => (
        <AbsoluteFill key={i} style={{ background: `radial-gradient(ellipse ${p.s}% ${p.s * 0.85}% at ${p.x}% ${p.y}%, rgba(${p.c},${p.a}), transparent 70%)` }} />
      ))}
      {shards.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x + t * s.v + Math.sin(t * 0.2 + i) * 2}%`,
            top: "-30%",
            width: `${s.w}%`,
            height: "170%",
            transform: `rotate(${s.rot + Math.sin(t * 0.12 + i) * 1.5}deg)`,
            // A soft gradient on its own; no live blur filter (those are the slowest thing to render).
            background: `linear-gradient(90deg, transparent 0%, rgba(139,92,246,${s.a * 0.12}) 22%, rgba(139,92,246,${s.a * 0.45}) 40%, rgba(167,139,250,${s.a}) 50%, rgba(139,92,246,${s.a * 0.35}) 58%, rgba(139,92,246,${s.a * 0.08}) 78%, transparent 100%)`,
          }}
        />
      ))}
      <Dust count={32} seed="bg" />
    </AbsoluteFill>
  );
}
