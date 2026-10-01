import type { CSSProperties, ReactNode } from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, GRADIENT_TEXT } from "../theme";

/*
 * Motion primitives. Everything is timed in seconds so the video can render at any fps.
 * Eases mirror After Effects' speed graphs: a hard, fast start and a long, soft landing.
 */

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** Expo-out: elements arriving. */
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** Strong ease in-out: camera moves and whips. */
export const IN_OUT = Easing.bezier(0.76, 0, 0.24, 1);
/** Gentle in-out: slow camera drifts. */
export const DRIFT = Easing.bezier(0.45, 0, 0.25, 1);
/** Overshoot: pops and stamps. */
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Current time in seconds within the enclosing Sequence. */
export function useTime() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}

/** 0→1 between `at` and `at + dur` seconds. */
export function prog(t: number, at: number, dur: number, easing = OUT) {
  return interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing });
}

export function useProg(at: number, dur: number, easing = OUT) {
  return prog(useTime(), at, dur, easing);
}

/**
 * Text that slides up out of a mask, word by word — the classic AE text reveal.
 * Each word is clipped by its own line box, so it appears to rise from nowhere.
 */
export function Words({ text, at = 0, stagger = 0.04, dur = 0.7, style, highlight = [], gradient = false }: { text: string; at?: number; stagger?: number; dur?: number; style?: CSSProperties; highlight?: string[]; gradient?: boolean }) {
  const t = useTime();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((w, i) => {
        const p = prog(t, at + i * stagger, dur);
        const lit = gradient || highlight.includes(w.replace(/[.,?!]/g, ""));
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 4}deg)`,
                transformOrigin: "0 100%",
                ...(lit ? GRADIENT_TEXT : null),
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Fade + rise for small UI bits. */
export function Rise({ at, children, dist = 24, dur = 0.6, style }: { at: number; children: ReactNode; dist?: number; dur?: number; style?: CSSProperties }) {
  const p = useProg(at, dur);
  return <div style={{ opacity: Math.min(1, p * 1.8), transform: `translateY(${(1 - p) * dist}px)`, ...style }}>{children}</div>;
}

/** Scale in with a little overshoot. */
export function Pop({ at, children, dur = 0.5, from = 0.4, style }: { at: number; children: ReactNode; dur?: number; from?: number; style?: CSSProperties }) {
  const t = useTime();
  const p = prog(t, at, dur, BACK);
  const o = prog(t, at, dur * 0.4, Easing.linear);
  return <div style={{ display: "inline-block", opacity: o, transform: `scale(${from + (1 - from) * p})`, ...style }}>{children}</div>;
}

export function Eyebrow({ children, at = 0 }: { children: ReactNode; at?: number }) {
  const p = useProg(at, 0.6);
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
        transform: `translateY(${(1 - p) * 14}px)`,
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0 round 999px)`,
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
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A panel that swings up out of 3D perspective into place. */
export function TiltIn({ children, at = 0, from = 24, dur = 1, style }: { children: ReactNode; at?: number; from?: number; dur?: number; style?: CSSProperties }) {
  const t = useTime();
  const p = prog(t, at, dur);
  return (
    <div style={{ perspective: 2200, ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 160}px) rotateX(${(1 - p) * from}deg) scale(${0.92 + 0.08 * p})`,
          transformOrigin: "50% 100%",
          opacity: prog(t, at, dur * 0.35, Easing.linear),
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

export function Counter({ value, at, dur, decimals = 0, prefix = "", suffix = "" }: { value: number; at: number; dur: number; decimals?: number; prefix?: string; suffix?: string }) {
  const p = useProg(at, dur, Easing.bezier(0.2, 0.9, 0.3, 1));
  const n = value * p;
  return (
    <span>
      {prefix}
      {n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/** Text typed out character by character, with a caret. */
export function Typed({ text, at, cps = 24, caret = true }: { text: string; at: number; cps?: number; caret?: boolean }) {
  const t = useTime();
  const shown = Math.max(0, Math.floor((t - at) * cps));
  const done = shown >= text.length;
  const blink = Math.floor(t * 2.5) % 2 === 0;
  return (
    <span>
      {text.slice(0, shown)}
      {caret && (!done || blink) && t >= at - 0.2 ? <span style={{ color: C.accent, fontWeight: 400 }}>|</span> : null}
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

/** Mouse pointer gliding through waypoints [seconds, x, y]; clicks pulse a ring. */
export function Cursor({ path, clicks = [] }: { path: [number, number, number][]; clicks?: number[] }) {
  const t = useTime();
  const times = path.map((p) => p[0]);
  const x = interpolate(t, times, path.map((p) => p[1]), { ...clamp, easing: IN_OUT });
  const y = interpolate(t, times, path.map((p) => p[2]), { ...clamp, easing: IN_OUT });
  const opacity = prog(t, times[0], 0.15, Easing.linear);
  const press = clicks.some((c) => t >= c && t < c + 0.1);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none", zIndex: 50 }}>
      {clicks.map((c) => {
        const p = prog(t, c, 0.4);
        if (t < c || p >= 1) return null;
        return <div key={c} style={{ position: "absolute", left: -30, top: -30, width: 60, height: 60, borderRadius: 99, border: `3px solid ${C.accentText}`, opacity: 1 - p, transform: `scale(${0.4 + p})` }} />;
      })}
      <svg width="40" height="40" viewBox="0 0 24 24" style={{ transform: `scale(${press ? 0.85 : 1})`, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.6))" }}>
        <path d="M4 2.5 19.5 12l-7 1.6-3.6 6.4z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Title({ children, size = 96, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.035em", color: C.text, ...style }}>
      {children}
    </div>
  );
}
