import type { CSSProperties, ReactNode } from "react";
import { lightLeak } from "@remotion/effects/light-leak";
import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, Sequence, Solid, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";
import { LILAC, VIOLET } from "./kit";
import { clamp, prog, useTime } from "./ui";

/* ------------------------------------------------------------------ Springs */

/** A spring that starts at `at` seconds. Default: a quick settle with barely any overshoot. */
export function sp(t: number, at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) {
  return spring({ frame: Math.max(0, (t - at) * 60), fps: 60, config: { damping: 19, stiffness: 120, mass: 0.9, ...cfg } });
}
/** A firm spring with no overshoot (camera-like pushes). */
export const firm = { damping: 200, stiffness: 140, mass: 1 };
/** A lively spring with visible overshoot (pops, badges). */
export const bouncy = { damping: 13, stiffness: 150, mass: 0.7 };

/* ------------------------------------------------------------------ Kinetic type */

/**
 * Per-letter reveal: each letter rises out of a mask and settles without overshoot,
 * one after another. Letters only translate (no rotation, no changing letter-spacing),
 * so nothing re-flows while the line lands.
 * `out` (seconds) makes the letters drop away again, last letter first.
 */
export function Kinetic({ text, at = 0, out, size = 120, weight = 800, color = C.text, accent = [], stagger = 0.028, style, glow = 0 }: { text: string; at?: number; out?: number; size?: number; weight?: number; color?: string; accent?: string[]; stagger?: number; style?: CSSProperties; glow?: number }) {
  const t = useTime();
  const words = text.split(" ");
  const total = text.replace(/ /g, "").length;
  let n = 0;
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: weight, fontSize: size, lineHeight: 1.08, letterSpacing: "-0.035em", color, textAlign: "center", ...style }}>
      {words.map((w, wi) => {
        const lit = accent.includes(w.replace(/[.,?!×]/g, ""));
        return (
          <span key={wi} style={{ display: "inline-block", whiteSpace: "pre", overflow: "hidden", verticalAlign: "top", padding: "0.06em 0.02em 0.14em", margin: "-0.06em -0.02em -0.14em" }}>
            {w.split("").map((ch) => {
              const i = n++;
              const a = prog(t, at + i * stagger, 0.75, Easing.bezier(0.16, 1, 0.3, 1));
              const o = out === undefined ? 0 : prog(t, out + (total - 1 - i) * 0.012, 0.28, Easing.in(Easing.cubic));
              const y = (1 - a) * 115 - o * 120;
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transform: a < 0.9995 || o > 0 ? `translate(0, ${y}%)` : undefined,
                    opacity: Math.min(1, a * 1.6) * (1 - o),
                    filter: a < 0.97 ? `blur(${(1 - a) * 8}px)` : undefined,
                    textShadow: glow ? `0 0 ${40 * glow}px rgba(${VIOLET},${0.8 * glow})` : undefined,
                    ...(lit ? { background: "linear-gradient(100deg, #ffffff 0%, #c4b5fd 40%, #8b5cf6 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : null),
                  }}
                >
                  {ch}
                </span>
              );
            })}
            {wi < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Footage */

/** A Short: live video or a poster frame, in a rounded card with a glow edge. */
export function ShortCard({ clip, w, h, live = false, from = 0, badge, glow = 0.5, style, rate = 1, flat = false }: { clip: string; w: number; h: number; live?: boolean; from?: number; badge?: string; glow?: number; style?: CSSProperties; rate?: number; flat?: boolean }) {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 16,
        overflow: "hidden",
        border: `2px solid rgba(${LILAC},${0.25 + 0.6 * glow})`,
        boxShadow: flat ? undefined : `0 0 ${26 * glow}px rgba(${VIOLET},${0.75 * glow}), 0 0 ${90 * glow}px rgba(${VIOLET},${0.35 * glow}), 0 30px 80px rgba(0,0,0,0.6)`,
        background: "#0b0a12",
        flexShrink: 0,
        ...style,
      }}
    >
      {live ? (
        <Video src={staticFile(`footage/${clip}.mp4`)} muted loop trimBefore={Math.round(from * fps)} playbackRate={rate} style={{ width: w, height: h }} objectFit="cover" />
      ) : (
        <Img src={staticFile(`footage/${clip}.jpg`)} style={{ width: w, height: h, objectFit: "cover" }} />
      )}
      {flat ? null : <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.55))" }} />}
      {badge ? (
        <div style={{ position: "absolute", right: w * 0.05, top: w * 0.05, padding: `${w * 0.02}px ${w * 0.05}px`, borderRadius: 999, background: C.accent, color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: w * 0.085, boxShadow: `0 6px 24px rgba(${VIOLET},0.7)` }}>{badge}</div>
      ) : null}
    </div>
  );
}

/** Width of the cropped app recording, and the scale it's shown at inside AppWindow. */
export const APP_W = 1904;
export const APP_H = 944;
export const WIN = { x: 180, y: 96, w: 1560, bar: 54 };
const APP_S = WIN.w / APP_W;
/** Map a pixel of the (cropped) app recording to stage coordinates. */
export const app = (ax: number, ay: number): [number, number] => [WIN.x + ax * APP_S, WIN.y + WIN.bar + ay * APP_S];

/** The real Outlier app, in a glass browser window. `children` is the footage (Img or Video) plus overlays in app pixels. */
export function AppWindow({ children, glow = 0.6 }: { children: ReactNode; glow?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: WIN.x,
        top: WIN.y,
        width: WIN.w,
        borderRadius: 16,
        overflow: "hidden",
        background: "#06050b",
        border: `1.5px solid rgba(${LILAC},${0.25 + 0.5 * glow})`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 ${60 * glow}px rgba(${VIOLET},${0.5 * glow}), 0 0 ${200 * glow}px rgba(${VIOLET},${0.25 * glow}), 0 60px 140px rgba(0,0,0,0.75)`,
      }}
    >
      <div style={{ height: WIN.bar, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "linear-gradient(180deg, #15131f, #0e0c16)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c, opacity: 0.9 }} />
        ))}
        <div style={{ margin: "0 auto", padding: "6px 60px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: C.textSecondary, fontFamily: FONT.body, fontSize: 17 }}>useoutlier.online</div>
        <span style={{ width: 59 }} />
      </div>
      <div style={{ position: "relative", width: WIN.w, height: APP_H * APP_S, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, transform: `scale(${APP_S})`, transformOrigin: "0 0" }}>{children}</div>
      </div>
    </div>
  );
}

/** A still frame of the app recording. */
export function AppStill({ name, style }: { name: string; style?: CSSProperties }) {
  return <Img src={staticFile(`footage/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, ...style }} />;
}

/** A stretch of the app recording, starting `from` seconds into it, at `rate`× speed. */
export function AppClip({ from, rate = 1, style }: { from: number; rate?: number; style?: CSSProperties }) {
  const { fps } = useVideoConfig();
  return <Video src={staticFile("footage/app.mp4")} muted trimBefore={Math.round(from * fps)} playbackRate={rate} style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, ...style }} />;
}

/** A soft highlight box drawn over the app (app pixels), pulsing once as it lands. */
export function Spot({ x, y, w, h, at, r = 18 }: { x: number; y: number; w: number; h: number; at: number; r?: number }) {
  const t = useTime();
  const p = prog(t, at, 0.6, Easing.bezier(0.16, 1, 0.3, 1));
  const pulse = prog(t, at, 0.9);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `scale(${1 + (20 * (1 - p)) / w}, ${1 + (20 * (1 - p)) / h})`,
        borderRadius: r,
        border: `3px solid rgba(${LILAC},${0.95 * p})`,
        boxShadow: `0 0 ${40 + 60 * (1 - pulse)}px rgba(${VIOLET},${0.9 * p}), inset 0 0 40px rgba(${VIOLET},${0.25 * p})`,
        opacity: p,
      }}
    />
  );
}

/** A caption chip that springs in beside whatever the camera is looking at (stage pixels). */
export function Callout({ x, y, at, out, children, side = "left" }: { x: number; y: number; at: number; out?: number; children: ReactNode; side?: "left" | "right" }) {
  const t = useTime();
  const p = prog(t, at, 0.7, Easing.bezier(0.16, 1, 0.3, 1));
  const o = out === undefined ? 0 : prog(t, out, 0.35, Easing.bezier(0.65, 0, 0.35, 1));
  const dir = side === "left" ? -1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${side === "left" ? -100 : 0}%, -50%) translate(${dir * (1 - p) * 70}px, ${-o * 24}px) scale(${0.94 + 0.06 * p})`,
        transformOrigin: side === "left" ? "100% 50%" : "0% 50%",
        opacity: Math.min(1, p * 1.4) * (1 - o),
        filter: p < 0.97 ? `blur(${(1 - p) * 10}px)` : undefined,
        padding: "16px 30px",
        borderRadius: 20,
        background: "linear-gradient(180deg, rgba(139,92,246,0.95), rgba(109,40,217,0.95))",
        border: "1.5px solid rgba(255,255,255,0.35)",
        boxShadow: `0 0 50px rgba(${VIOLET},0.7), 0 20px 50px rgba(0,0,0,0.5)`,
        color: "#fff",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        zIndex: 20,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Atmosphere */

/** Drifting dust motes with depth: near ones are bigger, blurrier and move more. */
export function Dust({ count = 46, seed = "dust", tint = LILAC, speed = 1 }: { count?: number; seed?: string; tint?: string; speed?: number }) {
  const frame = useCurrentFrame();
  const t = frame / 60;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const z = random(`${seed}-z-${i}`); // 0 far … 1 near
        const x0 = random(`${seed}-x-${i}`) * 1920;
        const y0 = random(`${seed}-y-${i}`) * 1080;
        const v = (0.4 + z * 1.6) * speed;
        const x = (((x0 + t * 26 * v + Math.sin(t * 0.6 + i) * 20) % 2000) + 2000) % 2000 - 40;
        const y = (((y0 - t * 14 * v) % 1160) + 1160) % 1160 - 40;
        // Near motes are bigger and softer (a wide radial falloff stands in for depth-of-field blur).
        const size = (2 + z * z * 9) * (z > 0.75 ? 3.2 : 2.2);
        const tw = 0.5 + 0.5 * Math.sin(t * (1 + z * 2) + i * 2.3);
        const a = (0.2 + 0.6 * tw) * (0.4 + 0.6 * z) * (z > 0.75 ? 0.55 : 1);
        return <div key={i} style={{ position: "absolute", left: 0, top: 0, transform: `translate(${x}px, ${y}px)`, width: size, height: size, borderRadius: 99, background: `radial-gradient(circle, rgba(${tint},${a}) 0%, rgba(${tint},${a * 0.35}) ${z > 0.75 ? 35 : 45}%, transparent 70%)` }} />;
      })}
    </AbsoluteFill>
  );
}

/** A burst of sparks from a point, for hits and clicks. */
export function Sparks({ x, y, at, count = 22, seed = "sparks", reach = 420 }: { x: number; y: number; at: number; count?: number; seed?: string; reach?: number }) {
  const t = useTime();
  const u = (t - at) / 0.9;
  if (u <= 0 || u >= 1) return null;
  const e = 1 - (1 - u) ** 3;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = random(`${seed}-a-${i}`) * Math.PI * 2;
        const d = (0.35 + 0.65 * random(`${seed}-d-${i}`)) * reach * e;
        const s = 3 + random(`${seed}-s-${i}`) * 7;
        return <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 80 * u * u}px)`, width: s, height: s, borderRadius: 99, background: "#fff", boxShadow: `0 0 ${s * 3}px rgba(${LILAC},1), 0 0 ${s * 6}px rgba(${VIOLET},0.8)`, opacity: (1 - u) ** 1.5 }} />;
      })}
    </>
  );
}

/** A WebGL light leak that sweeps over a transition, centred on `at` seconds (composition time). */
export function Leak({ at, dur = 0.9, seed = 1, hue = 130, strength = 0.38 }: { at: number; dur?: number; seed?: number; hue?: number; strength?: number }) {
  const { fps, width, height } = useVideoConfig();
  const from = Math.round((at - dur / 2) * fps);
  const len = Math.round(dur * fps);
  return (
    <Sequence from={from} durationInFrames={len} layout="none">
      <LeakInner len={len} seed={seed} hue={hue} strength={strength} width={width} height={height} />
    </Sequence>
  );
}

function LeakInner({ len, seed, hue, strength, width, height }: { len: number; seed: number; hue: number; strength: number; width: number; height: number }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: strength, pointerEvents: "none" }}>
      <Solid width={width} height={height} effects={[lightLeak({ seed, hueShift: hue, progress: interpolate(frame, [0, len - 1], [0, 1], clamp) })]} />
    </AbsoluteFill>
  );
}

/** The finishing pass over the whole frame: film grain that changes every frame, and a vignette. */
export function Finish({ grain = 0.11 }: { grain?: number }) {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`gx-${frame}`) * 512);
  const oy = Math.floor(random(`gy-${frame}`) * 512);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 78% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("fx/grain.png")})`, backgroundPosition: `${ox}px ${oy}px`, mixBlendMode: "overlay", opacity: grain }} />
    </AbsoluteFill>
  );
}
