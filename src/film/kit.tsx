import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";
import { AE_GRAPH_GLIDE, clamp } from "../components/ui";
import { HandIcon, LILAC, VIOLET } from "../components/kit";

/*
 * The motion kit for the whole film. Every scene is built from these few moves, which
 * were agreed on one test scene (matched frame by frame to Algrow's "Ai Voice Generator"):
 *
 *   - words resolve one at a time out of a long blur, sliding in from down-right
 *   - things enter on the After Effects graph curve (fast out, very long settle), 1.0–1.5s
 *   - the next thing enters while the last is still landing, so motion never comes to rest
 *   - cards rise from below tilted back and push what is above them upward
 *   - the camera starts pushing in while things settle and never stops
 *
 * Rules that keep it smooth: animate only transform / opacity / filter; text uses 2D
 * transforms; glows are gradients (see GlowRect).
 */

export const GLIDE = AE_GRAPH_GLIDE;
export const SOFT = Easing.out(Easing.quad);
export const SINE = Easing.bezier(0.37, 0, 0.63, 1);
const PUSH = Easing.bezier(0.4, 0, 0.2, 1);

/** 0→1 between `at` and `at + dur` seconds. */
export const p = (t: number, at: number, dur: number, easing: (n: number) => number = GLIDE) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing });

/** Seconds since the start of the enclosing Sequence. */
export function useT() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}

/* ------------------------------------------------------------------ Camera */

/** The push-in: eases in from rest at `push`, travels `amount`, then creeps on at `creep` per second for good. */
export function zoomAt(t: number, push: number, amount = 0.36, creep = 0.1) {
  const c = Math.max(0, t - (push + 0.7));
  return 1 + amount * p(t, push, 1.5, PUSH) + creep * (c - (1 - Math.exp(-c * 3)) / 3);
}

/**
 * One scene: everything inside rides the camera push, and leaves in the last 0.25s
 * (a quick fade while still pushing in) so the next scene's entrances can take over.
 */
export function Stage({ t, dur, push = 0.6, amount = 0.36, creep = 0.1, origin = [960, 800], exit = true, children }: { t: number; dur: number; push?: number; amount?: number; creep?: number; origin?: [number, number]; exit?: boolean; children: ReactNode }) {
  const out = exit ? p(t, dur - 0.25, 0.25, Easing.in(Easing.quad)) : 0;
  // A slow drift from the first frame, so even the opening title beat is never static.
  const zoom = zoomAt(t, push, amount, creep) * (1 + 0.015 * t) * (1 + 0.05 * out);
  return (
    <AbsoluteFill style={{ transformOrigin: `${origin[0]}px ${origin[1]}px`, transform: `scale(${zoom})`, opacity: 1 - out, filter: out > 0.005 ? `blur(${out * 10}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ Text */

export type Word = { w: string; accent?: boolean; scramble?: boolean };
/** Shorthand: words before `|` are accent-coloured; a word starting with `~` decodes from scrambled glyphs. */
export const words = (s: string): Word[] => {
  const [a, b] = s.includes("|") ? s.split("|") : ["", s];
  const mk = (w: string, accent: boolean): Word => (w.startsWith("~") ? { w: w.slice(1), accent, scramble: true } : { w, accent });
  return [...a.split(" ").filter(Boolean).map((w) => mk(w, true)), ...b.split(" ").filter(Boolean).map((w) => mk(w, false))];
};

export const ACCENT = "#9d6bff";

/** One word: position on the graph curve over 1.3s, blur clearing on its own slower curve. */
export function WordIn({ t, at, children, accent = false, color }: { t: number; at: number; children: ReactNode; accent?: boolean; color?: string }) {
  const k = p(t, at, 1.3);
  const soft = p(t, at, 1.0, SOFT);
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.26em",
        opacity: p(t, at, 0.45, SOFT),
        filter: soft < 0.995 ? `blur(${(1 - soft) * 18}px)` : undefined,
        transform: `translate(${(1 - k) * 70}px, ${(1 - k) * 40}px) rotate(${(1 - k) * 4}deg)`,
        color: color ?? (accent ? ACCENT : C.text),
      }}
    >
      {children}
    </span>
  );
}

/** A line of words resolving one after another. Ends with an optional icon that pops in after the last word. */
export function Line({ t, at, text, stagger = 0.13, size = 62, weight = 700, icon, style }: { t: number; at: number; text: string; stagger?: number; size?: number; weight?: number; icon?: ReactNode; style?: CSSProperties }) {
  const list = words(text);
  const iconAt = at + list.length * stagger + 0.06;
  const k = p(t, iconAt, 1.0);
  const soft = p(t, iconAt, 0.7, SOFT);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap", ...style }}>
      {list.map(({ w, accent, scramble }, i) => (
        <WordIn key={i} t={t} at={at + i * stagger} accent={accent}>
          {scramble ? <Scramble t={t} at={at + i * stagger + 0.1} text={w} color={accent ? ACCENT : C.text} /> : w}
        </WordIn>
      ))}
      {icon ? (
        <span style={{ display: "inline-flex", marginLeft: 4, opacity: Math.min(1, soft * 2), filter: soft < 0.995 ? `blur(${(1 - soft) * 10}px)` : undefined, transform: `translate(${(1 - k) * 30}px, ${-size * 0.19 + (1 - k) * 26}px) scale(${0.4 + 0.6 * k}) rotate(${12 - (1 - k) * 40}deg)` }}>{icon}</span>
      ) : null}
    </div>
  );
}

/**
 * A scene title, centred on `x`. It rises `lift` px as its words land, eases back from 1.15× to 1×,
 * and is then pushed from `y` up to `yPushed` when the scene's card arrives at `pushAt`.
 */
export function Title({ t, at = 0.05, text, icon, x = 960, y = 564, yPushed, pushAt, lift = 52, size = 62, stagger = 0.13 }: { t: number; at?: number; text: string; icon?: ReactNode; x?: number; y?: number; yPushed?: number; pushAt?: number; lift?: number; size?: number; stagger?: number }) {
  const rise = p(t, at, 1.5);
  const pushed = pushAt === undefined || yPushed === undefined ? 0 : p(t, pushAt + 0.06, 1.5);
  const ty = y + lift * (1 - rise) + ((yPushed ?? y) - y) * pushed;
  const s = 1.15 - 0.15 * p(t, at, 1.8);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 0, transform: `translate(${x - 960}px, ${ty}px) scale(${s})`, transformOrigin: "960px 0px" }}>
      <Line t={t} at={at} text={text} icon={icon} size={size} stagger={stagger} style={{ position: "absolute", left: 0, right: 0, top: -size, height: size * 2 }} />
    </div>
  );
}

/** Typing: each new character fades in over a couple of keystrokes; a caret blinks once it stops. */
export function Typing({ t, text, at, cps = 22, caret = true }: { t: number; text: string; at: number; cps?: number; caret?: boolean }) {
  const n = (t - at) * cps;
  const blink = Math.floor(t * 2.4) % 2 === 0;
  return (
    <span style={{ whiteSpace: "pre" }}>
      {text.split("").map((ch, i) => {
        const k = Math.max(0, Math.min(1, (n - i) / 2.5));
        return k <= 0 ? null : (
          <span key={i} style={{ opacity: k }}>
            {ch}
          </span>
        );
      })}
      {caret && (n < text.length + 2 || blink) ? <span style={{ opacity: 0.75, fontWeight: 400 }}>|</span> : null}
    </span>
  );
}

/** A number counting up on a long ease-out. */
export function Count({ t, at, dur = 1.6, to, from = 0, decimals = 0, prefix = "", suffix = "" }: { t: number; at: number; dur?: number; to: number; from?: number; decimals?: number; prefix?: string; suffix?: string }) {
  const n = from + (to - from) * p(t, at, dur, Easing.bezier(0.2, 0.8, 0.2, 1));
  return (
    <span>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ Glow */

/**
 * A soft glow around a rectangle, built only from gradients (edges, corners, centre).
 * Wide box-shadows and big blur filters are slow and can clip to hard edges; gradients do neither.
 */
export function GlowRect({ x, y, w, h, spread, rgb = VIOLET, a }: { x: number; y: number; w: number; h: number; spread: number; rgb?: string; a: number }) {
  if (a <= 0.002) return null;
  const stops = [
    [0, 1],
    [0.12, 0.84],
    [0.25, 0.64],
    [0.4, 0.42],
    [0.55, 0.25],
    [0.7, 0.12],
    [0.85, 0.04],
    [1, 0],
  ]
    .map(([at, v]) => `rgba(${rgb},${(v * a).toFixed(4)}) ${at * 100}%`)
    .join(", ");
  const s = spread;
  const piece = (left: number, top: number, width: number, height: number, background: string) => <div style={{ position: "absolute", left, top, width, height, background }} />;
  return (
    <>
      {piece(x, y, w, h, `rgba(${rgb},${a})`)}
      {piece(x, y - s, w, s, `linear-gradient(0deg, ${stops})`)}
      {piece(x, y + h, w, s, `linear-gradient(180deg, ${stops})`)}
      {piece(x - s, y, s, h, `linear-gradient(270deg, ${stops})`)}
      {piece(x + w, y, s, h, `linear-gradient(90deg, ${stops})`)}
      {piece(x - s, y - s, s, s, `radial-gradient(circle ${s}px at 100% 100%, ${stops})`)}
      {piece(x + w, y - s, s, s, `radial-gradient(circle ${s}px at 0% 100%, ${stops})`)}
      {piece(x - s, y + h, s, s, `radial-gradient(circle ${s}px at 100% 0%, ${stops})`)}
      {piece(x + w, y + h, s, s, `radial-gradient(circle ${s}px at 0% 0%, ${stops})`)}
    </>
  );
}

export type Box = { x: number; y: number; w: number; h: number };

/** A card's bloom: a wide soft pool sitting a little low (like a light under the card) and a tight bright halo. Flat, behind the card. */
export function Bloom({ t, box, at, strength = 1, travel = 300, wide = 250 }: { t: number; box: Box; at: number; strength?: number; travel?: number; wide?: number }) {
  const k = p(t, at, 1.5);
  const a = strength * p(t, at + 0.1, 0.7, SOFT);
  const m = Math.min(70, box.w * 0.2, box.h * 0.2);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(0px, ${(1 - k) * travel}px)` }}>
      <GlowRect x={box.x + m} y={box.y + m * 1.3} w={box.w - 2 * m} h={box.h - m * 1.9} spread={wide} rgb="109,40,217" a={0.7 * a} />
      <GlowRect x={box.x + 26} y={box.y + 26} w={box.w - 52} h={box.h - 52} spread={64} a={0.85 * a} />
    </div>
  );
}

/* ------------------------------------------------------------------ Cards */

/**
 * The card entrance: rises `from` px while un-tilting from `tilt`° to a resting `rest`°, fading in from blur.
 * Children are laid out in the card's own box (0,0 – w,h).
 */
export function Rise({ t, at, box, from = 420, tilt = 39, rest = 5, yaw = -2, dur = 1.5, blur = 14, radius = 30, ring = 0, children, style }: { t: number; at: number; box: Box; from?: number; tilt?: number; rest?: number; yaw?: number; dur?: number; blur?: number; radius?: number; ring?: number; children?: ReactNode; style?: CSSProperties }) {
  const k = p(t, at, dur);
  const clear = p(t, at, 0.8, SOFT);
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        opacity: p(t, at, 0.4, SOFT),
        filter: clear < 0.995 ? `blur(${(1 - clear) * blur}px)` : undefined,
        transformOrigin: "50% 100%",
        transform: `perspective(1500px) translateY(${(1 - k) * from}px) rotateX(${rest + (1 - k) * tilt}deg) rotateY(${yaw * k}deg)`,
        ...style,
      }}
    >
      {ring > 0 ? <div style={{ position: "absolute", inset: -3, borderRadius: radius + 3, background: `rgba(${VIOLET},1)`, opacity: ring }} /> : null}
      {children}
    </div>
  );
}

/** The dark card face used throughout. */
export function Face({ radius = 30, children, style }: { radius?: number; children?: ReactNode; style?: CSSProperties }) {
  return <div style={{ position: "absolute", inset: 0, borderRadius: radius, background: "linear-gradient(180deg, #0c0b14 0%, #07070c 100%)", border: `1px solid rgba(${LILAC},0.22)`, overflow: "hidden", ...style }}>{children}</div>;
}

/** The violet action button. */
export function Button({ children, pressed = false, style }: { children: ReactNode; pressed?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ height: 50, padding: "0 24px", borderRadius: 13, display: "grid", placeItems: "center", fontFamily: FONT.body, fontWeight: 700, fontSize: 18, color: "#fff", background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", boxShadow: `0 0 24px rgba(${VIOLET},0.7), inset 0 1px 0 rgba(255,255,255,0.3)`, transform: `scale(${pressed ? 0.94 : 1})`, ...style }}>
      {children}
    </div>
  );
}

/** A hand that glides up to (x, y) from below-left on the graph curve and clicks at `click`. */
export function Pointer({ t, at, click, x, y, size = 46 }: { t: number; at: number; click: number; x: number; y: number; size?: number }) {
  if (t < at) return null;
  const k = p(t, at, click - at + 0.25);
  const ring = p(t, click, 0.5);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${x - 330 * (1 - k) - size * 0.4}px, ${y + 330 * (1 - k) - 3}px)`, opacity: p(t, at, 0.2) }}>
      {t >= click && ring < 1 ? <div style={{ position: "absolute", left: -12, top: -26, width: 60, height: 60, borderRadius: 99, border: `3px solid rgba(${LILAC},${1 - ring})`, transform: `scale(${0.4 + ring})` }} /> : null}
      <HandIcon size={size} pressed={t >= click && t < click + 0.14} />
    </div>
  );
}

/* ------------------------------------------------------------------ Backdrop */

/**
 * The stage: near-black with broad diagonal bands of violet light that drift all the time.
 * At every scene change (`cuts`, seconds) the bands slide on with the graph curve, so a cut
 * reads as one continuous move.
 */
export function Bands({ cuts = [] }: { cuts?: number[] }) {
  const t = useT();
  const slide = cuts.reduce((sum, c, i) => sum + (i % 2 ? -1 : 1) * 220 * p(t, c - 0.1, 1.4), 0);
  const band = (x: number, w: number, a: number, v: number, i: number): CSSProperties => ({
    position: "absolute",
    left: `${x}%`,
    top: "-110%",
    width: `${w}%`,
    height: "320%",
    transform: `translate(${t * v * 24 + Math.sin(t * 0.25 + i) * 14 + slide * (0.6 + i * 0.25)}px, 0) rotate(62deg)`,
    background: `linear-gradient(90deg, transparent 0%, rgba(${VIOLET},${a * 0.25}) 25%, rgba(124,58,237,${a}) 50%, rgba(${VIOLET},${a * 0.3}) 72%, transparent 100%)`,
  });
  return (
    <AbsoluteFill style={{ background: "#05040c", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 62% at ${50 + Math.sin(t * 0.3) * 3}% 58%, rgba(91,33,182,0.5), rgba(49,20,120,0.22) 55%, transparent 80%)` }} />
      <div style={band(8, 48, 0.34, 1, 0)} />
      <div style={band(44, 40, 0.22, -0.8, 1)} />
      <div style={band(-22, 36, 0.14, 0.6, 2)} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

/* ====================================================================================
 * Moves taken from the isaacedits showreel (refs/src/isaac.mp4, bottom-right clip):
 * typed headline with a selected phrase that gets swapped, scramble-decode words,
 * four-point sparkles, guide lines, rolling digits, glow-in characters, light streaks,
 * and the big zoom into a small control with a dropdown unrolling under an arrow cursor.
 * ==================================================================================== */

const GLYPHS = "A9e&t%6@n#{G+4$Kx7?Zq";

/** A word that decodes: each character flickers through random glyphs (in the accent colour) until its turn to resolve. */
export function Scramble({ t, at, text, dur = 0.9, color = C.text, accent = "#a78bfa" }: { t: number; at: number; text: string; dur?: number; color?: string; accent?: string }) {
  const frame = Math.floor(t * 20); // glyphs change 20×/s
  const done = p(t, at + dur, 0.35, SOFT);
  return (
    <span style={{ whiteSpace: "pre" }}>
      {text.split("").map((ch, i) => {
        const resolveAt = at + (dur * (i + 1)) / text.length;
        const fixed = t >= resolveAt || ch === " ";
        const g = GLYPHS[(i * 7 + frame * 3 + ((frame * (i + 3)) % 5)) % GLYPHS.length];
        return (
          <span key={i} style={{ color: done >= 1 ? color : accent, opacity: t < at ? 0 : 1 }}>
            {fixed ? ch : g}
          </span>
        );
      })}
    </span>
  );
}

/** A four-point sparkle that pops in, then twinkles (slow turn, breathing scale). */
export function Sparkle({ t, at, x, y, size = 44, color = "#b58cff", seed = 0 }: { t: number; at: number; x: number; y: number; size?: number; color?: string; seed?: number }) {
  const k = p(t, at, 0.9);
  if (k <= 0) return null;
  const tw = 0.82 + 0.18 * Math.sin((t - at) * 3.1 + seed * 2.3);
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: Math.min(1, k * 2), transform: `scale(${(0.2 + 0.8 * k) * tw}) rotate(${(1 - k) * -90 + (t - at) * 14 + seed * 20}deg)`, filter: `drop-shadow(0 0 ${size * 0.18}px ${color})` }}>
      <path d="M0 -50 C 6 -14, 14 -6, 50 0 C 14 6, 6 14, 0 50 C -6 14, -14 6, -50 0 C -14 -6, -6 -14, 0 -50 Z" fill={color} />
    </svg>
  );
}

/** Thin guide lines (the editor-grid look): each draws out from its centre, holds faintly, and fades. */
export function Guides({ t, at, xs = [], ys = [], out }: { t: number; at: number; xs?: number[]; ys?: number[]; out?: number }) {
  const fade = out === undefined ? 1 : 1 - p(t, out, 0.6, SOFT);
  const line = (i: number, horizontal: boolean, pos: number) => {
    const k = p(t, at + i * 0.06, 1.1);
    return <div key={`${horizontal}-${i}`} style={{ position: "absolute", left: horizontal ? 0 : pos, top: horizontal ? pos : 0, width: horizontal ? 1920 : 1, height: horizontal ? 1 : 1080, background: "rgba(255,255,255,0.16)", opacity: fade * Math.min(1, k * 2), transform: horizontal ? `scaleX(${k})` : `scaleY(${k})` }} />;
  };
  return (
    <>
      {ys.map((y, i) => line(i, true, y))}
      {xs.map((x, i) => line(i + ys.length, false, x))}
    </>
  );
}

/** One digit rolling from `from` to `to` like an odometer (old digit leaves upward, new one arrives from below). */
export function Roll({ t, at, from, to, dur = 0.7 }: { t: number; at: number; from: string; to: string; dur?: number }) {
  const k = p(t, at, dur);
  const moving = k > 0.001 && k < 0.999;
  return (
    <span style={{ display: "inline-block", position: "relative", overflow: "hidden", height: "1.08em", lineHeight: "1.08em", verticalAlign: "bottom" }}>
      <span style={{ display: "block", transform: `translate(0px, ${-k * 108}%)`, filter: moving ? `blur(${Math.sin(k * Math.PI) * 5}px)` : undefined }}>{from}</span>
      <span style={{ display: "block", position: "absolute", left: 0, top: 0, transform: `translate(0px, ${(1 - k) * 108}%)`, filter: moving ? `blur(${Math.sin(k * Math.PI) * 5}px)` : undefined }}>{to}</span>
    </span>
  );
}

/** Characters arriving one by one, each landing out of blur with a white glow that dies away (the "$497" reveal). */
export function GlowIn({ t, at, text, stagger = 0.09, glow = VIOLET }: { t: number; at: number; text: string; stagger?: number; glow?: string }) {
  return (
    <span style={{ whiteSpace: "pre" }}>
      {text.split("").map((ch, i) => {
        const a = at + i * stagger;
        const k = p(t, a, 0.9);
        const soft = p(t, a, 0.55, SOFT);
        const hot = 1 - p(t, a + 0.1, 1.1, SOFT);
        return (
          <span key={i} style={{ display: "inline-block", opacity: p(t, a, 0.25, SOFT), filter: soft < 0.995 ? `blur(${(1 - soft) * 14}px)` : undefined, transform: `translate(${(1 - k) * 26}px, 0px) scale(${1 + 0.18 * (1 - k)})`, textShadow: `0 0 ${10 + 30 * hot}px rgba(255,255,255,${0.25 + 0.6 * hot}), 0 0 ${40 + 40 * hot}px rgba(${glow},${0.35 + 0.5 * hot})` }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}

/** Light streaks: glowing capsules that sweep across the frame on shallow arcs and are gone. */
export function Streaks({ t, at, count = 7, seed = 1, colors = ["#f0abfc", "#c4b5fd", "#ffffff", "#fcd34d", "#a78bfa", "#f472b6"] }: { t: number; at: number; count?: number; seed?: number; colors?: string[] }) {
  const rnd = (i: number, k: number) => {
    const v = Math.sin((i + 1) * 12.9898 * seed + k * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const start = at + rnd(i, 1) * 0.9;
        const life = 0.55 + rnd(i, 2) * 0.35;
        const u = (t - start) / life;
        if (u <= 0 || u >= 1) return null;
        const e = 1 - (1 - u) ** 2.2; // fast out, easing off
        const fromLeft = rnd(i, 3) > 0.5;
        const x0 = fromLeft ? -100 : 2020;
        const x1 = fromLeft ? 500 + rnd(i, 4) * 1400 : 1420 - rnd(i, 4) * 1400;
        const y0 = 80 + rnd(i, 5) * 920;
        const y1 = y0 + (rnd(i, 6) - 0.5) * 520;
        const x = x0 + (x1 - x0) * e;
        const y = y0 + (y1 - y0) * e - Math.sin(e * Math.PI) * 90;
        const ang = (Math.atan2(y1 - y0 - Math.cos(e * Math.PI) * 280, x1 - x0) * 180) / Math.PI;
        const len = 70 + rnd(i, 7) * 90;
        const c = colors[i % colors.length];
        return <div key={i} style={{ position: "absolute", left: 0, top: 0, width: len * (1.25 - 0.5 * u), height: 13, borderRadius: 99, background: c, opacity: Math.sin(u * Math.PI) ** 0.6, transform: `translate(${x}px, ${y}px) rotate(${ang}deg)`, boxShadow: `0 0 18px 4px ${c}` }} />;
      })}
    </>
  );
}

/** An arrow cursor gliding through [t, x, y] waypoints on the graph curve. */
export function Arrow({ t, path, clicks = [], size = 40 }: { t: number; path: [number, number, number][]; clicks?: number[]; size?: number }) {
  if (t < path[0][0]) return null;
  let i = 0;
  while (i < path.length - 2 && t > path[i + 1][0]) i++;
  const [t0, x0, y0] = path[i];
  const [t1, x1, y1] = path[i + 1];
  const k = p(t, t0, Math.max(0.01, t1 - t0), Easing.bezier(0.3, 0.9, 0.3, 1));
  const down = clicks.some((c) => t >= c && t < c + 0.12);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0, opacity: p(t, path[0][0], 0.2), transform: `translate(${x0 + (x1 - x0) * k}px, ${y0 + (y1 - y0) * k}px) scale(${down ? 0.86 : 1})`, transformOrigin: "0 0" }}>
      <path d="M4 2 L4 20 L9 15.5 L12.2 22.5 L15 21.2 L11.9 14.4 L18.5 14 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
