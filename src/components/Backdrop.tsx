import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SHOTS } from "../timeline";
import { DRIFT, clamp } from "./ui";

/**
 * Algrow-style stage: deep navy-black with big soft diagonal shards of light that
 * slide slowly the whole time. Black under the opening prompt, then the shards
 * fade up on the first feature. Recoloured to Outlier violet.
 */
export function Backdrop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const on = interpolate(t, [SHOTS.finder.at - 0.3, SHOTS.finder.at + 0.6], [0, 1], { ...clamp, easing: DRIFT });
  // Each shard drifts on its own slow path; the whole field also rotates a touch per shot.
  const shards = [
    { x: 18, y: -10, w: 70, h: 160, rot: 32, a: 0.5, sx: 22, sy: 6, hue: "139,92,246" },
    { x: 58, y: 10, w: 50, h: 170, rot: 32, a: 0.38, sx: -18, sy: 4, hue: "99,102,241" },
    { x: -10, y: 30, w: 60, h: 120, rot: -28, a: 0.28, sx: 14, sy: -8, hue: "167,139,250" },
    { x: 75, y: 50, w: 40, h: 130, rot: 38, a: 0.32, sx: -12, sy: -6, hue: "124,58,237" },
  ];
  return (
    <AbsoluteFill style={{ background: "#03020a", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: on }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 80% at 60% 45%, #120a2e 0%, #07051a 55%, #030209 100%)" }} />
        {shards.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x + Math.sin(t * 0.21 + i) * 3 + (t * s.sx) / 25}%`,
              top: `${s.y + Math.cos(t * 0.17 + i * 2) * 3 + (t * s.sy) / 25}%`,
              width: `${s.w}%`,
              height: `${s.h}%`,
              transform: `rotate(${s.rot + Math.sin(t * 0.13 + i) * 2}deg)`,
              background: `linear-gradient(90deg, transparent 0%, rgba(${s.hue},${s.a * 0.35}) 35%, rgba(${s.hue},${s.a}) 50%, rgba(${s.hue},${s.a * 0.25}) 62%, transparent 100%)`,
              filter: "blur(40px)",
              borderRadius: "40%",
            }}
          />
        ))}
        {/* A crisp edge on the main shard, like the light planes in the reference */}
        <div
          style={{
            position: "absolute",
            left: `${44 + (t * 0.9) % 30 - 15}%`,
            top: "-20%",
            width: "3px",
            height: "150%",
            transform: "rotate(32deg)",
            background: "linear-gradient(180deg, transparent, rgba(196,181,253,0.25), transparent)",
            filter: "blur(2px)",
          }}
        />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Big soft fluid blobs, used behind the "Scanning" beat. */
export function Fluid({ t }: { t: number }) {
  const blobs = [
    { x: 8, y: 30, r: 46, c: "124,58,237", sx: 0.6, sy: 0.4 },
    { x: 88, y: 20, r: 40, c: "139,92,246", sx: -0.5, sy: 0.6 },
    { x: 70, y: 95, r: 50, c: "99,102,241", sx: 0.4, sy: -0.5 },
    { x: 20, y: 95, r: 36, c: "167,139,250", sx: -0.4, sy: -0.3 },
  ];
  return (
    <AbsoluteFill style={{ background: "#040210", overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x + Math.sin(t * 1.4 * b.sx + i) * 8}%`,
            top: `${b.y + Math.cos(t * 1.2 * b.sy + i) * 8}%`,
            width: `${b.r}vw`,
            height: `${b.r * 1.4}vw`,
            transform: `translate(-50%, -50%) rotate(${t * 20 * b.sx}deg)`,
            borderRadius: "45% 55% 60% 40%",
            background: `radial-gradient(ellipse at 50% 50%, rgba(${b.c},0.95), rgba(${b.c},0.5) 40%, transparent 70%)`,
            filter: "blur(50px)",
          }}
        />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(0,0,0,0.75), transparent 80%)" }} />
    </AbsoluteFill>
  );
}
