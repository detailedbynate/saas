import type { CSSProperties, ReactNode } from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, GRADIENT_TEXT } from "../theme";

/*
 * Motion primitives. Everything is timed in seconds so the video can render at any fps.
 *
 * Curves are fitted to the reference launch videos (refs/NOTES.md): optical-flow
 * speed graphs from 22 launch films put element entrances on easeOutCubic and
 * camera moves on easeInOutSine / easeInOutCubic, with most motion lasting
 * 0.5–1.0s. Nothing in them is as snappy as expo-out, so neither is this.
 */

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** easeOutCubic: elements arriving. */
export const OUT = Easing.bezier(0.33, 1, 0.68, 1);
/** easeInOutCubic: transitions and deliberate camera moves. */
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
/** easeInOutSine: slow camera drifts and background moves. */
export const DRIFT = Easing.bezier(0.37, 0, 0.63, 1);
/** Light overshoot, used sparingly (the refs barely overshoot). */
export const BACK = Easing.bezier(0.34, 1.32, 0.64, 1);

/** Shots start this many seconds before their boundary, so transitions can straddle it. */
export const LEAD = 0.3;

/** Scene time in seconds, where 0 is the shot's boundary (the Sequence starts LEAD earlier). */
export function useTime() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps - LEAD;
}

/** 0→1 between `at` and `at + dur` seconds. */
export function prog(t: number, at: number, dur: number, easing = OUT) {
  return interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing });
}

export function useProg(at: number, dur: number, easing = OUT) {
  return prog(useTime(), at, dur, easing);
}

/** One word resolving out of blur: the per-word reveal every reference uses. */
function blurIn(p: number): CSSProperties {
  return {
    opacity: Math.min(1, p * 1.35),
    filter: p < 0.995 ? `blur(${(1 - p) * 10}px)` : undefined,
    transform: `translate(0, ${(1 - p) * 0.32}em) scale(${0.97 + 0.03 * p})`,
  };
}

/**
 * Text that resolves word by word out of a soft blur. Space for every word is
 * reserved up front, so wrapped lines never jump.
 */
export function Words({ text, at = 0, stagger = 0.11, dur = 0.9, style, highlight = [], gradient = false }: { text: string; at?: number; stagger?: number; dur?: number; style?: CSSProperties; highlight?: string[]; gradient?: boolean }) {
  const t = useTime();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((w, i) => {
        const p = prog(t, at + i * stagger, dur);
        const lit = gradient || highlight.includes(w.replace(/[.,?!]/g, ""));
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", ...blurIn(p) }}>
            <span style={lit ? GRADIENT_TEXT : undefined}>{w}</span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

const measureCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
/** Pixel width of a string in a given font (fonts are loaded before the first frame renders). */
function textWidth(s: string, font: string) {
  if (!measureCtx) return s.length * 30;
  measureCtx.font = font;
  return measureCtx.measureText(s).width;
}

/**
 * A single line that builds word by word and re-centres as it grows
 * ("Introducing" → "Introducing the New" → "Introducing the New Market View").
 * Each word's slot opens from zero width while the word blurs in, so the
 * line glides sideways instead of jumping. `beats` are the arrival times.
 */
export function BuildLine({ words, beats, size, weight = 800, family = "'Schibsted Grotesk'", tracking = -0.035, color = C.text, highlight = [], dur = 0.85 }: { words: string[]; beats: number[]; size: number; weight?: number; family?: string; tracking?: number; color?: string; highlight?: string[]; dur?: number }) {
  const t = useTime();
  const font = `${weight} ${size}px ${family}`;
  return (
    <div style={{ display: "flex", justifyContent: "center", whiteSpace: "pre", fontFamily: `${family}, sans-serif`, fontWeight: weight, fontSize: size, letterSpacing: `${tracking}em`, color, lineHeight: 1.1 }}>
      {words.map((w, i) => {
        const slot = prog(t, beats[i] - 0.08, dur, IN_OUT);
        const p = prog(t, beats[i], dur);
        const full = textWidth(w + (i < words.length - 1 ? " " : ""), font) + w.length * tracking * size;
        const lit = highlight.includes(w.replace(/[.,?!]/g, ""));
        return (
          <span key={i} style={{ display: "inline-block", width: full * slot, overflow: "visible" }}>
            <span style={{ display: "inline-block", ...blurIn(p), ...(lit ? GRADIENT_TEXT : null) }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * A slot inside a sentence whose word keeps changing (Pump.fun's "Trade [Solana / BNB / anything]").
 * The slot's width eases between words so the surrounding sentence re-centres smoothly.
 */
export function SwapWord({ words, beats, size, weight = 800, family = "'Schibsted Grotesk'", tracking = -0.035, style }: { words: string[]; beats: number[]; size: number; weight?: number; family?: string; tracking?: number; style?: CSSProperties }) {
  const t = useTime();
  const font = `${weight} ${size}px ${family}`;
  const widths = words.map((w) => textWidth(w, font) + w.length * tracking * size);
  let i = 0;
  while (i < beats.length - 1 && t >= beats[i + 1]) i++;
  const into = prog(t, beats[i], 0.6, IN_OUT);
  const width = i === 0 ? widths[0] : widths[i - 1] + (widths[i] - widths[i - 1]) * into;
  return (
    <span style={{ position: "relative", display: "inline-block", width, height: "1.1em", verticalAlign: "bottom" }}>
      {words.map((w, k) => {
        if (k !== i && k !== i - 1) return null;
        const p = k === i ? (i === 0 ? prog(t, beats[0], 0.85) : into) : 1 - into;
        const dir = k === i ? 1 : -1;
        return (
          <span key={k} style={{ position: "absolute", left: 0, top: 0, whiteSpace: "pre", ...style, opacity: p, filter: p < 0.999 ? `blur(${(1 - p) * 12}px)` : undefined, transform: `translateY(${(1 - p) * 0.45 * dir}em)` }}>
            {w}
          </span>
        );
      })}
    </span>
  );
}

/** Fade + rise for small UI bits. */
export function Rise({ at, children, dist = 24, dur = 0.9, style }: { at: number; children: ReactNode; dist?: number; dur?: number; style?: CSSProperties }) {
  const p = useProg(at, dur);
  return <div style={{ opacity: Math.min(1, p * 1.8), transform: `translateY(${(1 - p) * dist}px)`, ...style }}>{children}</div>;
}

/** Scale in with a little overshoot. */
export function Pop({ at, children, dur = 0.8, from = 0.6, style }: { at: number; children: ReactNode; dur?: number; from?: number; style?: CSSProperties }) {
  const t = useTime();
  const p = prog(t, at, dur, BACK);
  const o = prog(t, at, dur * 0.4, Easing.linear);
  return <div style={{ display: "inline-block", opacity: o, transform: `scale(${from + (1 - from) * p})`, ...style }}>{children}</div>;
}

export function Eyebrow({ children, at = 0 }: { children: ReactNode; at?: number }) {
  const p = useProg(at, 0.9);
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

/**
 * A panel that settles out of 3D perspective into place, resolving from blur
 * (Jupiter / Print / Omnipair style). Lands on an in-out curve, so it glides in.
 */
export function TiltIn({ children, at = 0, from = 20, yaw = -10, dur = 1.7, style }: { children: ReactNode; at?: number; from?: number; yaw?: number; dur?: number; style?: CSSProperties }) {
  const t = useTime();
  const p = prog(t, at, dur, IN_OUT);
  const o = prog(t, at, dur * 0.55, OUT);
  return (
    <div style={{ perspective: 2400, ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 140}px) rotateX(${(1 - p) * from}deg) rotateY(${(1 - p) * yaw}deg) scale(${0.9 + 0.1 * p})`,
          transformOrigin: "50% 60%",
          opacity: o,
          filter: p < 0.995 ? `blur(${(1 - p) * 8}px)` : undefined,
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
        const p = prog(t, c, 0.6);
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
