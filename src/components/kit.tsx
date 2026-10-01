import type { CSSProperties, ReactNode } from "react";
import { Img, staticFile } from "remotion";
import { C, FONT } from "../theme";
import { OUT, prog, useTime } from "./ui";

/*
 * Building blocks for the Algrow-structured cut: glowing cards, Shorts thumbnails,
 * the radial spinner, a hand pointer, and the two-tone feature titles.
 */

export const VIOLET = "139,92,246";
export const LILAC = "196,181,253";

/** The reference's signature look: near-black card with a bright edge and a wide bloom. */
/** Shared surface: deep matte slate glass with a hairline border and a background blur. */
export const GLASS: CSSProperties = {
  background: "rgba(11,15,25,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

export function GlowCard({ children, style, glow = 1, radius = 16 }: { children?: ReactNode; style?: CSSProperties; glow?: number; radius?: number }) {
  return (
    <div
      style={{
        position: "relative",
        ...GLASS,
        borderRadius: radius,
        // A restrained accent: a faint violet ring and bloom over a deep drop shadow.
        boxShadow: `0 0 0 1px rgba(${VIOLET},${0.22 * glow}), 0 0 ${70 * glow}px rgba(${VIOLET},${0.2 * glow}), inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 70px rgba(0,0,0,0.55)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Plain dark card (the reference's input boxes). */
export function DarkCard({ children, style, dashed = false }: { children?: ReactNode; style?: CSSProperties; dashed?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        ...GLASS,
        border: `1px ${dashed ? "dashed" : "solid"} rgba(255,255,255,${dashed ? 0.16 : 0.08})`,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Thumbnails */

export type ThumbKind = "blocks" | "city" | "person" | "food" | "road" | "lab" | "gym" | "cat";

/** A Shorts-style frame drawn in CSS: a simple scene, a bold caption, and a soft vignette. */
export function Thumb({ kind, hue, caption, w, h, badge, style, glow = 0.8 }: { kind: ThumbKind; hue: number; caption?: string; w: number; h: number; badge?: string; style?: CSSProperties; glow?: number }) {
  const t = useTime();
  const sky = `linear-gradient(180deg, hsl(${hue},55%,${kind === "city" ? 12 : 58}%) 0%, hsl(${hue + 20},50%,${kind === "city" ? 22 : 38}%) 60%, hsl(${hue + 40},40%,16%) 100%)`;
  const s = Math.min(w, h);
  const scene = (() => {
    switch (kind) {
      case "blocks":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #7cc4ff 0%, #b4e1ff 55%, #5aa83a 55%, #3d7d26 100%)" }} />
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: `${(i % 6) * 16 + 2}%`, top: `${48 + Math.floor(i / 6) * 13 - ((i * 7) % 3) * 6}%`, width: "15%", height: "12%", background: i % 4 === 0 ? "#8a5a2b" : "#4f9a33", border: "2px solid rgba(0,0,0,0.25)" }} />
            ))}
            <div style={{ position: "absolute", left: "38%", top: "26%", width: "18%", height: "30%", background: "#c040c8", border: "3px solid rgba(0,0,0,0.3)" }} />
          </>
        );
      case "city":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: sky }} />
            {[12, 26, 20, 34, 16, 28, 22].map((ht, i) => (
              <div key={i} style={{ position: "absolute", bottom: "18%", left: `${i * 14 - 2}%`, width: "13%", height: `${ht + 18}%`, background: `hsl(${hue + 200},30%,${10 + (i % 3) * 4}%)`, boxShadow: "inset 0 0 0 2px rgba(255,220,140,0.05)", backgroundImage: "radial-gradient(rgba(255,214,120,0.9) 1.5px, transparent 2px)", backgroundSize: "12px 16px" }} />
            ))}
            <div style={{ position: "absolute", inset: "82% 0 0 0", background: "#0b0910" }} />
          </>
        );
      case "person":
      case "gym":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 30%, hsl(${hue},60%,46%), hsl(${hue + 30},50%,14%) 75%)` }} />
            <div style={{ position: "absolute", left: "50%", bottom: "-6%", width: "70%", height: "48%", transform: "translateX(-50%)", borderRadius: "45% 45% 0 0", background: kind === "gym" ? "#d9452b" : `hsl(${hue + 180},40%,30%)` }} />
            <div style={{ position: "absolute", left: "50%", top: "28%", width: "30%", height: s > 260 ? "26%" : "30%", transform: "translateX(-50%)", borderRadius: "50%", background: "linear-gradient(180deg, #f1c7a0, #c99572)" }} />
            <div style={{ position: "absolute", left: "50%", top: "24%", width: "33%", height: "12%", transform: "translateX(-50%)", borderRadius: "50% 50% 30% 30%", background: "#2a1b12" }} />
          </>
        );
      case "food":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #c98a4a, #6b3a1c)" }} />
            <div style={{ position: "absolute", left: "50%", top: "52%", width: "78%", aspectRatio: "1", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, #fff 55%, #e8e2da 57%, #fff 70%)", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }} />
            <div style={{ position: "absolute", left: "50%", top: "52%", width: "44%", aspectRatio: "1", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #ffcf5c, #e0752d 60%, #9a3d13)" }} />
          </>
        );
      case "road":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #8e9aa8 0%, #c6c9cc 45%, #3a3c40 45%, #232427 100%)" }} />
            <div style={{ position: "absolute", left: "50%", top: "45%", width: "4%", height: "55%", transform: "translateX(-50%) perspective(200px) rotateX(60deg)", background: "repeating-linear-gradient(180deg, #f5f5f5 0 14px, transparent 14px 30px)" }} />
            <div style={{ position: "absolute", left: "30%", top: "50%", width: "40%", height: "14%", borderRadius: 10, background: `hsl(${hue},70%,45%)`, boxShadow: "0 10px 20px rgba(0,0,0,0.5)", transform: `translateX(${Math.sin(t * 2) * 4}px)` }} />
          </>
        );
      case "lab":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, hsl(${hue},45%,30%), hsl(${hue + 40},45%,10%))` }} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", bottom: "20%", left: `${18 + i * 24}%`, width: "16%", height: `${30 + i * 8}%`, borderRadius: "10px 10px 40% 40%", background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0 30%, hsl(${hue + 60 + i * 50},80%,55%) 30%)`, border: "2px solid rgba(255,255,255,0.35)" }} />
            ))}
          </>
        );
      case "cat":
        return (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #e9e4dc 0%, #cfc6b8 100%)" }} />
            <div style={{ position: "absolute", right: "6%", top: "8%", width: "42%", height: "80%", borderRadius: 12, background: "linear-gradient(90deg, #f7f7f7, #dcdcdc)", border: "3px solid #bbb" }} />
            <div style={{ position: "absolute", left: "16%", bottom: "12%", width: "42%", height: "34%", borderRadius: "50% 50% 40% 40%", background: "#e08a3c" }} />
            <div style={{ position: "absolute", left: "26%", bottom: "36%", width: "24%", height: "20%", borderRadius: "50%", background: "#e08a3c" }} />
          </>
        );
    }
  })();
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 26,
        overflow: "hidden",
        border: `2px solid rgba(${LILAC},${0.4 + 0.5 * glow})`,
        boxShadow: `0 0 ${24 * glow}px rgba(${VIOLET},${0.7 * glow}), 0 0 ${70 * glow}px rgba(${VIOLET},${0.3 * glow}), 0 30px 70px rgba(0,0,0,0.6)`,
        flexShrink: 0,
        ...style,
      }}
    >
      {scene}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,0.45))" }} />
      {caption ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "16%", textAlign: "center", padding: "0 8%", fontFamily: FONT.display, fontWeight: 800, fontSize: Math.max(18, s * 0.085), lineHeight: 1.1, color: "#fff", textShadow: "0 0 2px #000, 0 0 2px #000, 0 3px 6px rgba(0,0,0,0.9)", WebkitTextStroke: "1px rgba(0,0,0,0.6)" }}>
          {caption}
        </div>
      ) : null}
      {badge ? (
        <div style={{ position: "absolute", right: 14, top: 14, padding: "6px 14px", borderRadius: 999, background: C.accent, color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: Math.max(18, s * 0.07), boxShadow: `0 6px 20px rgba(${VIOLET},0.6)` }}>{badge}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Bits */

/** The reference's tick spinner: 14 radial ticks with a rotating bright head. */
export function Spinner({ size = 64, color = "#fff" }: { size?: number; color?: string }) {
  const t = useTime();
  const n = 14;
  const head = (t * 14) % n;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ display: "block", filter: `drop-shadow(0 0 8px rgba(${LILAC},0.8))` }}>
      {Array.from({ length: n }, (_, i) => {
        const d = (i - head + n) % n;
        const a = (i / n) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 26} y1={Math.sin(a) * 26} x2={Math.cos(a) * 44} y2={Math.sin(a) * 44} stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.18 + 0.82 * Math.max(0, 1 - d / 8)} />;
      })}
    </svg>
  );
}

/** White pointing-hand cursor with a dark outline (the reference's clicker). */
export function HandIcon({ size = 64, pressed = false }: { size?: number; pressed?: boolean }) {
  const shapes = (
    <>
      <rect x="9" y="1.5" width="4.4" height="13" rx="2.2" />
      <rect x="5.2" y="10.5" width="15" height="12" rx="4.5" />
      <rect x="13" y="8.6" width="3.6" height="7" rx="1.8" />
      <rect x="16.4" y="9.6" width="3.6" height="6.6" rx="1.8" />
      <rect x="2.4" y="12" width="4" height="7.6" rx="2" transform="rotate(-28 4.4 15.8)" />
    </>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", transform: `scale(${pressed ? 0.86 : 1})`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}>
      <g fill="#111" stroke="#111" strokeWidth="2.2" strokeLinejoin="round">{shapes}</g>
      <g fill="#fff">{shapes}</g>
      <g stroke="#9a9aa6" strokeWidth="0.6" strokeLinecap="round">
        <line x1="13.4" y1="11.5" x2="13.4" y2="14.5" />
        <line x1="16.6" y1="12" x2="16.6" y2="15" />
      </g>
    </svg>
  );
}

/** A hand that glides through [t, x, y] waypoints (stage px) and clicks with a soft ring. */
export function Hand({ path, clicks = [], size = 70 }: { path: [number, number, number][]; clicks?: number[]; size?: number }) {
  const t = useTime();
  if (t < path[0][0]) return null;
  let i = 0;
  while (i < path.length - 2 && t > path[i + 1][0]) i++;
  const [t0, x0, y0] = path[i];
  const [t1, x1, y1] = path[i + 1];
  const p = prog(t, t0, Math.max(0.01, t1 - t0), OUT);
  const x = x0 + (x1 - x0) * p;
  const y = y0 + (y1 - y0) * p;
  const pressed = clicks.some((c) => t >= c && t < c + 0.12);
  const appear = prog(t, path[0][0], 0.25);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${x - size * 0.4}px, ${y - size * 0.05}px)`, opacity: appear, zIndex: 50, pointerEvents: "none" }}>
      {clicks.map((c) => {
        const r = prog(t, c, 0.55);
        if (t < c || r >= 1) return null;
        return <div key={c} style={{ position: "absolute", left: size * 0.4 - 34, top: -26, width: 68, height: 68, borderRadius: 99, border: `3px solid rgba(${LILAC},${1 - r})`, transform: `scale(${0.4 + r * 0.9})` }} />;
      })}
      <HandIcon size={size} pressed={pressed} />
    </div>
  );
}

/** Two-tone feature title (accent word + white), each word resolving out of blur, optional icon. */
export function FeatureTitle({ accent, rest, at = 0, size = 76, icon, style }: { accent: string; rest: string; at?: number; size?: number; icon?: ReactNode; style?: CSSProperties }) {
  const t = useTime();
  const words = [...accent.split(" ").filter(Boolean).map((w) => ({ w, a: true })), ...rest.split(" ").filter(Boolean).map((w) => ({ w, a: false }))];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.display, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", lineHeight: 1.05, whiteSpace: "nowrap", ...style }}>
      <span>
        {words.map(({ w, a }, i) => {
          const p = prog(t, at + i * 0.1, 0.7);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.24em",
                opacity: Math.min(1, p * 1.4),
                filter: p < 0.995 ? `blur(${(1 - p) * 10}px)` : undefined,
                transform: `translate(${(1 - p) * 0.4}em, 0)`,
                ...(a ? { background: "linear-gradient(100deg, #c4b5fd, #8b5cf6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : { color: C.text }),
              }}
            >
              {w}
            </span>
          );
        })}
      </span>
      {icon ? <span style={{ display: "inline-flex", ...popStyle(prog(t, at + words.length * 0.1, 0.6)) }}>{icon}</span> : null}
    </div>
  );
}

function popStyle(p: number): CSSProperties {
  return { opacity: p, transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -20}deg)`, filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : undefined };
}

/** Small glossy icon tiles that sit after a feature title, like the reference's 3D emoji. */
export function IconTile({ children, size = 64 }: { children: ReactNode; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, display: "grid", placeItems: "center", background: "linear-gradient(160deg, #a78bfa, #6d28d9)", boxShadow: `0 8px 24px rgba(${VIOLET},0.6), inset 0 2px 0 rgba(255,255,255,0.35)` }}>
      {children}
    </div>
  );
}

export const Glyph = {
  eye: (s = 80) => (
    <svg width={s} height={s * 0.62} viewBox="0 0 64 40" fill="none">
      <path d="M2 20C10 8 20 3 32 3s22 5 30 17c-8 12-18 17-30 17S10 32 2 20Z" stroke="#fff" strokeWidth="3.5" />
      <circle cx="32" cy="20" r="11" fill="rgba(167,139,250,0.35)" stroke="#fff" strokeWidth="3.5" />
      <circle cx="32" cy="20" r="4.5" fill="#fff" />
    </svg>
  ),
  calendar: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></svg>
  ),
  gauge: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M4 18a8 8 0 1 1 16 0" /><path d="m12 18 4-6" /></svg>
  ),
  chart: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>
  ),
  pen: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13 7 4 4" /></svg>
  ),
  bolt: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
  ),
  bell: (s = 30) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></svg>
  ),
  yt: (s = 40) => (
    <svg width={s} height={s * 0.72} viewBox="0 0 28 20"><rect width="28" height="20" rx="5" fill="#ff2a2a" /><path d="M11 5.5v9l8-4.5z" fill="#fff" /></svg>
  ),
  arrowUp: (s = 30) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
  ),
  film: (s = 34) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#c9c9d6" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>
  ),
};

export function LogoMark({ size }: { size: number }) {
  return <Img src={staticFile("brand/logo-512.png")} style={{ width: size, height: size, display: "block" }} />;
}

/** Typing where the newest few characters are still resolving out of blur (as in the reference's prompt bar). */
export function SoftType({ text, at, cps = 30, trail = 3, caret = false }: { text: string; at: number; cps?: number; trail?: number; caret?: boolean }) {
  const t = useTime();
  const n = (t - at) * cps;
  const done = n >= text.length + trail;
  const blink = Math.floor(t * 2.4) % 2 === 0;
  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {text.split("").map((ch, i) => {
        const p = Math.max(0, Math.min(1, (n - i) / trail));
        if (p <= 0) return null;
        return (
          <span key={i} style={{ opacity: p, filter: p < 0.99 ? `blur(${(1 - p) * 5}px)` : undefined }}>
            {ch}
          </span>
        );
      })}
      {caret && t >= at - 0.1 && (!done || blink) ? <span style={{ opacity: 0.8, fontWeight: 300 }}>|</span> : null}
    </span>
  );
}

/** Enter style: fade + blur + offset, p 0→1. */
export function ent(p: number, dx = 0, dy = 0, s0 = 1): CSSProperties {
  return {
    opacity: Math.min(1, p * 1.4),
    transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${s0 + (1 - s0) * p})`,
    filter: p < 0.995 ? `blur(${(1 - p) * 10}px)` : undefined,
  };
}
