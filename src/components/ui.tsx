import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, GRADIENT_TEXT } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 over [start, start+dur], eased. */
export function useProgress(start: number, dur: number, easing = easeOut) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing });
}

export function useSpring(delay = 0, damping = 16, mass = 0.7) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass } });
}

/**
 * Wraps a scene: blurs and scales in on entry, pushes forward and blurs out on exit.
 * Every scene drifts slowly toward the camera, which keeps static frames alive.
 */
export function Scene({ duration, children, enter = 12, exit = 10, drift = 0.04 }: { duration: number; children: ReactNode; enter?: number; exit?: number; drift?: number }) {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, enter], [0, 1], { ...clamp, easing: easeOut });
  const outP = interpolate(frame, [duration - exit, duration], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const scale = interpolate(inP, [0, 1], [1.06, 1]) * (1 + drift * (frame / duration)) * (1 + outP * 0.12);
  const blur = (1 - inP) * 14 + outP * 18;
  const opacity = inP * (1 - outP);
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
}

/** Words that rise and un-blur one after another — the core kinetic-type move. */
export function Words({ text, start = 0, stagger = 3, style, highlight = [], gradient = false }: { text: string; start?: number; stagger?: number; style?: CSSProperties; highlight?: string[]; gradient?: boolean }) {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline-block", ...style }}>
      {words.map((w, i) => {
        const p = interpolate(frame, [start + i * stagger, start + i * stagger + 14], [0, 1], { ...clamp, easing: easeOut });
        const lit = highlight.includes(w.replace(/[.,?!]/g, ""));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: p,
              transform: `translateY(${(1 - p) * 0.45}em)`,
              filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
              ...(lit || gradient ? GRADIENT_TEXT : null),
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

export function Eyebrow({ children, start = 0 }: { children: ReactNode; start?: number }) {
  const p = useProgress(start, 14);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 18px",
        borderRadius: 999,
        border: `1px solid rgba(139,92,246,0.35)`,
        background: C.accentWash,
        color: C.accentText,
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, background: C.accent, boxShadow: `0 0 12px ${C.accent}` }} />
      {children}
    </div>
  );
}

export function Glass({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
        border: `1px solid ${C.glassBorder}`,
        borderRadius: 28,
        boxShadow: "0 1px 0 rgba(255,255,255,0.07) inset, 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.4)",
        backdropFilter: "blur(20px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A panel that tilts up out of perspective into place, like a product shot. */
export function TiltIn({ children, start = 0, from = 28, style }: { children: ReactNode; start?: number; from?: number; style?: CSSProperties }) {
  const s = useSpring(start, 18, 0.9);
  const frame = useCurrentFrame();
  const float = Math.sin((frame - start) / 30) * 4;
  return (
    <div style={{ perspective: 2000, ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - s) * 140 + float}px) rotateX(${(1 - s) * from}deg) scale(${0.9 + 0.1 * s})`,
          transformOrigin: "50% 100%",
          opacity: Math.min(1, s * 1.6),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Logo({ size }: { size: number }) {
  return <Img src={staticFile("brand/logo-512.png")} style={{ width: size, height: size, display: "block" }} />;
}

export function Counter({ value, start, dur, decimals = 0, prefix = "", suffix = "", format }: { value: number; start: number; dur: number; decimals?: number; prefix?: string; suffix?: string; format?: (n: number) => string }) {
  const p = useProgress(start, dur, Easing.out(Easing.cubic));
  const n = value * p;
  const text = format ? format(n) : n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

/** Text typed out character by character, with a blinking caret. */
export function Typed({ text, start, cps = 18, caret = true }: { text: string; start: number; cps?: number; caret?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const done = shown >= text.length;
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <span>
      {text.slice(0, shown)}
      {caret && (!done || blink) && frame >= start - 10 ? <span style={{ color: C.accent, fontWeight: 400 }}>|</span> : null}
    </span>
  );
}

export function CheckIcon({ size = 22, color = C.accentText }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function SearchGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Mouse pointer gliding through waypoints [frame, x, y]; clicks pulse a ring. */
export function Cursor({ path, clicks = [] }: { path: [number, number, number][]; clicks?: number[] }) {
  const frame = useCurrentFrame();
  const frames = path.map((p) => p[0]);
  const x = interpolate(frame, frames, path.map((p) => p[1]), { ...clamp, easing: easeInOut });
  const y = interpolate(frame, frames, path.map((p) => p[2]), { ...clamp, easing: easeInOut });
  const opacity = interpolate(frame, [frames[0], frames[0] + 8], [0, 1], clamp);
  const press = clicks.some((c) => frame >= c && frame < c + 5);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none", zIndex: 50 }}>
      {clicks.map((c) => {
        const p = interpolate(frame, [c, c + 16], [0, 1], clamp);
        if (frame < c || p >= 1) return null;
        return (
          <div
            key={c}
            style={{
              position: "absolute",
              left: -30,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: 99,
              border: `3px solid ${C.accentText}`,
              opacity: 1 - p,
              transform: `scale(${0.4 + p})`,
            }}
          />
        );
      })}
      <svg width="40" height="40" viewBox="0 0 24 24" style={{ transform: `scale(${press ? 0.85 : 1})`, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.6))" }}>
        <path d="M4 2.5 19.5 12l-7 1.6-3.6 6.4z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Title({ children, size = 96, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: "-0.035em",
        color: C.text,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
