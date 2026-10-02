import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { LogoMark } from "../components/kit";
import { REF } from "./introData";

/*
 * The intro (f0–f419, 7.0 s), rebuilt shot for shot from SPEC.md.
 *
 * Timing, positions, sizes, overshoots, dissolves and typing speeds are the reference's:
 * the big moves are driven directly by the measured per-frame curves in ./introData.ts.
 * Words, logo, colours and the background are Outlier's. Every frame is a pure function of
 * the frame number: no timers, no random values (the scribble "boil" is seeded by frame / 8).
 *
 *   Shot 1   f0–f98     "find viral shorts" drops in; "shorts" becomes a camera icon; the line shrinks
 *   dissolve f99–f110
 *   Shot 2   f111–f274  "Viral Shorts" drops in, lifts; "Research" types in under it; scribbles; subtitle
 *   dissolve f275–f289
 *   Shot 3   f290–f378  five feature buttons, each label arriving a different way; replayed from f379
 */

export const INTRO_FRAMES = 420;

/* ------------------------------------------------------------------ helpers */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
/** 0→1 linearly from frame a to frame b. */
const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const easeOut = (n: number) => 1 - (1 - n) ** 3;
/** Value from an array that starts at frame `start` (held at both ends). */
const from = (arr: readonly (number | null)[], start: number, f: number) => arr[Math.max(0, Math.min(arr.length - 1, f - start))] ?? 0;
/** Value from a [frame, value] table, linearly interpolated, held at both ends. */
function table(rows: readonly (readonly number[])[], f: number, col = 1) {
  if (f <= rows[0][0]) return rows[0][col];
  for (let i = 1; i < rows.length; i++) {
    if (f <= rows[i][0]) {
      const [f0, f1] = [rows[i - 1][0], rows[i][0]];
      return rows[i - 1][col] + ((rows[i][col] - rows[i - 1][col]) * (f - f0)) / (f1 - f0);
    }
  }
  return rows[rows.length - 1][col];
}

const WHITE = "#ffffff";
const INK = "#0b0930"; // shot 2's "black" on the light stage
const POP = "#7a4dff"; // the reference's blue highlight, in Outlier violet
const SKY = "#9fd8ff"; // the reference's "Colors" blue on the dark stage

/* ------------------------------------------------------------------ background */

/**
 * The stage: the client's gradient (azure top-left, pale top-right, pale bottom-left, deep
 * bottom-right), pushed slightly toward purple, with every pool of colour drifting slowly.
 * `light` (0–1) follows the reference's dissolves: 0 on the dark shots, 1 on the light one.
 */
export function GradientStage({ f, light }: { f: number; light: number }) {
  const t = f / 60;
  const pool = (x: number, y: number, size: number, rgb: string, a: number, ph: number, ax = 7, ay = 6): CSSProperties => ({
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse ${size}% ${size * 1.15}% at ${x + Math.sin(t * 0.55 + ph) * ax}% ${y + Math.cos(t * 0.45 + ph * 1.7) * ay}%, rgba(${rgb},${a}) 0%, rgba(${rgb},${a * 0.55}) 45%, rgba(${rgb},0) 100%)`,
  });
  return (
    <AbsoluteFill style={{ background: "#7480ff", overflow: "hidden" }}>
      <div style={pool(12, 12, 78, "56,96,255", 1, 0)} />
      <div style={pool(90, 8, 70, "222,214,255", 1, 1.3)} />
      <div style={pool(6, 94, 66, "200,210,255", 1, 2.4)} />
      <div style={pool(88, 90, 80, "62,20,255", 1, 3.6)} />
      <div style={pool(50, 52, 40, "128,120,255", 0.5, 4.9, 10, 8)} />
      <AbsoluteFill style={{ background: `rgba(14,6,60,${0.1 * (1 - light)})` }} />
      <AbsoluteFill style={{ background: `rgba(246,244,255,${0.3 * light})` }} />
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ shot 1 */

const fade: CSSProperties = { WebkitMaskImage: "linear-gradient(to bottom, #000 30%, rgba(0,0,0,0.3) 92%)", maskImage: "linear-gradient(to bottom, #000 30%, rgba(0,0,0,0.3) 92%)" };

function Shot1({ f }: { f: number }) {
  const scale = from(REF.scale, 0, f);
  const size = 81;
  const word = (start: number, arr: readonly (number | null)[], rest: number): CSSProperties => ({ ...fade, display: "inline-block", visibility: f < start ? "hidden" : "visible", transform: `translate(0px, ${f - start > arr.length - 1 ? 0 : from(arr, start, f) - rest}px)` });
  // The third word collapses from its right edge (f35–f41) and is gone at f42.
  const [, x1] = [0, table(REF.w3exit, f, 1)];
  const keep = clamp01((x1 - 976) / (1192 - 976));
  const icon = REF.icon[Math.max(0, Math.min(REF.icon.length - 1, f - 39))];
  const [ix0, iy0, ix1, iy1] = [icon[1], icon[2], icon[3], icon[4]];
  const ih = iy1 - iy0;
  const body = Math.min(70, ix1 - ix0);
  const lens = ix1 - ix0 - body - 6;
  const glow = f < 39 ? 0 : 1 - ramp(f, 41, 48);
  const text: CSSProperties = { fontFamily: FONT.display, fontWeight: 500, fontSize: size, lineHeight: `${size}px`, letterSpacing: "-0.03em", color: WHITE, whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "965px 533px", transform: `scale(${scale})` }}>
        {/* words 1 and 2 end where the reference's did (x=953); word 3 starts where its did (x=976) */}
        <div style={{ position: "absolute", right: 1920 - 953, top: 493, ...text }}>
          <span style={word(0, REF.dropIn, 501)}>find</span>
          <span style={{ ...word(3, REF.dropThis, 502), marginLeft: "0.27em" }}>viral</span>
        </div>
        {f < 42 ? (
          <div style={{ position: "absolute", left: 976, top: 493, ...text, clipPath: `inset(-40% ${(1 - keep) * 100}% -40% 0)`, opacity: 1 - ramp(f, 37, 42) }}>
            <span style={{ ...word(5, REF.dropVideo, 503), transform: `translate(0px, ${(f - 5 > 25 ? 0 : from(REF.dropVideo, 5, f) - 503) + 26 * ramp(f, 36, 41)}px)` }}>shorts</span>
          </div>
        ) : null}
      </div>
      {/* the camera icon: its box is the reference's, frame for frame */}
      {f >= 39 ? (
        <div style={{ position: "absolute", left: ix0, top: iy0, height: ih, width: ix1 - ix0 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: body, height: ih, borderRadius: 14, background: WHITE, boxShadow: glow > 0.01 ? `0 0 ${34 * glow}px ${8 * glow}px rgba(255,255,255,${0.75 * glow})` : undefined, display: "grid", placeItems: "center" }}>
            <svg width={26} height={28} viewBox="0 0 26 28" style={{ opacity: ramp(f, 43, 47), transform: `scale(${0.5 + 0.5 * ramp(f, 43, 48)})` }}>
              <path d="M3 2.5 L23 14 L3 25.5 Z" fill={POP} stroke={POP} strokeWidth={3} strokeLinejoin="round" />
            </svg>
          </div>
          {lens > 2 ? <div style={{ position: "absolute", left: body + 6, top: ih * 0.16, width: lens, height: ih * 0.68, background: WHITE, borderRadius: 8, clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 70%)" }} /> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ shot 2 */

/** A hand-drawn stroke that draws on between two frames. */
function Stroke({ f, d, start, end, width, head = false }: { f: number; d: string; start: number; end: number; width: number; head?: boolean }) {
  const k = ramp(f, start, end);
  if (k <= 0) return null;
  return <path d={d} fill="none" stroke={INK} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={head ? 1 - easeOut(k) : 1 - k} />;
}

const LINE1 = ["Viral", "Shorts"];
const LINE2 = "Research";

function Shot2({ f }: { f: number }) {
  const lift = f < 138 ? 0 : table(REF.lift, f) - 482; // the measured spring: −108, 19 over, 5 under
  const a = f < 105 ? 0 : f <= 113 ? from(REF.cleanY, 105, f) - 482 : 4 * (1 - ramp(f, 113, 122));
  const b = f < 114 ? 0 : f <= 126 ? from(REF.textY, 114, f) - 482 : 0;
  const slide = table(REF.line2Left, f) - 663; // the typed word starts at the right and slides left
  const boil = Math.floor(f / 8); // the marks re-draw about 7.5 times a second
  const bold: CSSProperties = { fontFamily: FONT.display, fontWeight: 800, color: INK, whiteSpace: "nowrap", letterSpacing: "-0.03em" };
  const handle = (x: number, y: number) => <div style={{ position: "absolute", left: x - 7, top: y - 7, width: 14, height: 14, background: POP, opacity: f >= 177 ? 1 : 0 }} />;
  const sub = (start: number, dx = 0): CSSProperties => ({ display: "inline-block", opacity: ramp(f, start, start + 4), transform: `translate(${dx * (1 - easeOut(ramp(f, start, start + 15)))}px, 0px)` });
  return (
    <AbsoluteFill>
      {/* line 1: the reference's box is x 664–1261, letters 83 px tall, top at y=482 */}
      <div style={{ position: "absolute", left: 0, width: 1925, top: 482 - 9 + lift, display: "flex", justifyContent: "center", gap: 30, ...bold, fontSize: 106, lineHeight: "110px" }}>
        <span style={{ ...fade, display: "inline-block", visibility: f < 105 ? "hidden" : "visible", transform: `translate(0px, ${a}px)` }}>{LINE1[0]}</span>
        <span style={{ ...fade, display: "inline-block", visibility: f < 114 ? "hidden" : "visible", transform: `translate(0px, ${b}px)` }}>{LINE1[1]}</span>
      </div>

      {/* quote marks, where the reference had them */}
      <div style={{ position: "absolute", left: 630, top: 352, ...bold, fontSize: 64, lineHeight: "64px", opacity: ramp(f, 188, 194), transform: `scale(${0.6 + 0.4 * easeOut(ramp(f, 188, 200))})` }}>“</div>
      <div style={{ position: "absolute", left: 1268, top: 352, ...bold, fontSize: 64, lineHeight: "64px", opacity: ramp(f, 194, 200), transform: `scale(${0.6 + 0.4 * easeOut(ramp(f, 194, 212))})` }}>”</div>

      {/* line 2: dashed text box (f157), typed word (f151–), corner handles (f177) */}
      <div style={{ position: "absolute", left: 649, top: 512, width: 624, height: 133, border: `2px dashed rgba(11,9,48,0.38)`, opacity: ramp(f, 156, 159) }} />
      <div style={{ position: "absolute", left: 663, top: 524, width: 595, ...bold, fontSize: 132, lineHeight: "110px", transform: `translate(${slide}px, 0px)` }}>
        {LINE2.split("").map((ch, i) => {
          const born = 151 + i * 2.9; // the reference's typing speed: one letter every 2.9 frames
          const k = ramp(f, born, born + 4);
          const fresh = 1 - ramp(f, born + 5, born + 9); // newest letters are highlighted, then go to ink
          return (
            <span key={i} style={{ ...fade, display: "inline-block", opacity: f < born ? 0 : 0.35 + 0.65 * k, color: fresh > 0.5 ? POP : INK, transform: `scale(${1.22 - 0.22 * easeOut(k)})`, filter: k < 1 ? `blur(${(1 - k) * 5}px)` : undefined, transformOrigin: "50% 80%" }}>
              {ch}
            </span>
          );
        })}
      </div>
      {handle(649, 512)}
      {handle(1273, 512)}
      {handle(649, 645)}
      {handle(1273, 645)}

      {/* hand-drawn marks: positions and draw-on frames from the spec; they "boil" every 8 frames */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={boil} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#boil)">
          <Stroke f={f} start={160} end={174} width={30} d="M 1640 1062 C 1650 900 1570 770 1432 690" />
          <Stroke f={f} start={172} end={178} width={26} head d="M 1408 772 L 1412 672 L 1500 690" />
          <Stroke f={f} start={164} end={192} width={7} d="M 1700 72 C 1640 58 1578 92 1560 132 C 1545 168 1602 172 1606 130 C 1609 96 1500 150 1388 260" />
          <Stroke f={f} start={192} end={204} width={7} head d="M 1376 214 L 1382 268 L 1432 254" />
          <Stroke f={f} start={167} end={177} width={24} d="M -20 52 C 44 60 22 150 84 182 C 182 216 300 236 430 264" />
          <Stroke f={f} start={184} end={188} width={22} head d="M 372 206 L 446 268 L 356 300" />
          <Stroke f={f} start={180} end={212} width={6} d="M 284 796 L 386 736" />
          <Stroke f={f} start={212} end={224} width={6} head d="M 346 732 L 390 733 L 372 772" />
          {f >= 192 ? <path d="M 1116 252 L 1125 236 L 1134 252 Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
        </g>
      </svg>

      {/* subtitle: reference box x 814–1109, y 683–718; pieces at f209, f212, f215 (the last slides in from the right) */}
      <div style={{ position: "absolute", left: 0, width: 1922, top: 676, height: 48, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily: FONT.display, fontWeight: 500, fontSize: 40, color: INK, letterSpacing: "-0.02em" }}>
        <span style={sub(209)}>in</span>
        <span style={sub(212)}>
          <LogoMark size={38} />
        </span>
        <span style={sub(215, 34)}>Outlier</span>
      </div>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ shot 3 */

type Kind = "colors" | "bounce" | "mix" | "typewriter" | "snapping";
const BUTTONS: [keyof typeof REF.buttons, Kind, string][] = [
  ["Colors", "colors", "Niche Finder"],
  ["Bounce", "bounce", "Viral Videos"],
  ["Mix", "mix", "Analyze Video"],
  ["Typewriter", "typewriter", "Script Writer"],
  ["Snapping", "snapping", "Tracked Channels"],
];

function Label({ f, kind, text }: { f: number; kind: Kind; text: string }) {
  const chars = text.split("");
  const letters = chars.map((c, i) => (c === " " ? -1 : chars.slice(0, i).filter((x) => x !== " ").length)); // index among non-space letters
  let inner: ReactNode;
  if (kind === "colors") {
    // all blue from f289, fading up to f295; then white one letter at a time, every 6 frames from f293
    inner = chars.map((c, i) => (
      <span key={i} style={{ color: letters[i] >= 0 && f >= 293 + letters[i] * 5.8 ? WHITE : SKY }}>
        {c}
      </span>
    ));
    return <span style={{ whiteSpace: "pre", opacity: 0.55 + 0.45 * ramp(f, 289, 295), visibility: f < 289 ? "hidden" : "visible" }}>{inner}</span>;
  }
  if (kind === "bounce") {
    // rises ~6 px/frame from f293, 15 px past its rest at f311–f312, settled by f333 (measured curve)
    return <span style={{ display: "inline-block", whiteSpace: "pre", opacity: ramp(f, 292, 303), transform: `translate(0px, ${f < 293 ? 72 : table(REF.bounceY, f) - 418}px)` }}>{text}</span>;
  }
  if (kind === "mix") {
    // letters arrive from the right every 3 frames from f294: small, blue and soft, then white; the word slides left past its rest and back
    const last = Math.max(...letters);
    inner = chars.map((c, i) => {
      const born = 294 + Math.max(0, letters[i]) * 3;
      const k = ramp(f, born, born + 6);
      const blue = letters[i] === last ? f < 323 : f < born + 5;
      return (
        <span key={i} style={{ display: "inline-block", opacity: f < born ? 0 : k, color: blue ? SKY : WHITE, transform: `translate(${(1 - easeOut(k)) * 16}px, 0px) scale(${0.6 + 0.4 * easeOut(k)})`, filter: k < 1 ? `blur(${(1 - k) * 4}px)` : undefined }}>
          {c}
        </span>
      );
    });
    return <span style={{ display: "inline-block", whiteSpace: "pre", transform: `translate(${f < 294 ? 43 : table(REF.mixX0, f) - 1385}px, 0px)` }}>{inner}</span>;
  }
  if (kind === "typewriter") {
    // one character every 4.7 frames from f291; each appears grey and brightens over 3 frames
    inner = chars.map((c, i) => {
      const born = 291 + i * 4.7;
      return (
        <span key={i} style={{ opacity: f < born ? 0 : 0.45 + 0.55 * ramp(f, born, born + 3) }}>
          {c}
        </span>
      );
    });
    return <span style={{ whiteSpace: "pre" }}>{inner}</span>;
  }
  // snapping: a letter comes up from below about every 3.7 frames from f298 and snaps into place; the word re-centres as it grows
  inner = chars.map((c, i) => {
    const born = 298 + i * 3.7;
    const k = ramp(f, born, born + 4);
    if (f < born) return null;
    return (
      <span key={i} style={{ display: "inline-block", position: "relative" }}>
        {/* takes up a growing share of the letter's width, so the centred word glides instead of jumping */}
        <span style={{ visibility: "hidden", fontSize: `${k}em` }}>{c}</span>
        <span style={{ position: "absolute", left: 0, bottom: 0, transform: `translate(0px, ${(1 - easeOut(k)) * 42}px)`, opacity: 0.4 + 0.6 * k }}>{c}</span>
      </span>
    );
  });
  return <span style={{ display: "inline-block", whiteSpace: "pre" }}>{inner}</span>;
}

function Shot3({ f }: { f: number }) {
  // The reference replays the animation from its first frame at f379 (and again at f496).
  const local = f >= 379 ? f - 89 : f;
  return (
    <AbsoluteFill>
      {BUTTONS.map(([key, kind, text]) => {
        const [x0, y0, x1, y1] = REF.buttons[key];
        return (
          <div key={key} style={{ position: "absolute", left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, borderRadius: 8, background: "rgba(10,6,44,0.5)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontFamily: FONT.display, fontWeight: 500, fontSize: 50, letterSpacing: "-0.02em", color: WHITE }}>
            <Label f={local} kind={kind} text={text} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ the intro */

/** Frames 0–419. `out` (0–1) lets the film fade the intro away over its last frames. */
export function Intro() {
  const f = useCurrentFrame();
  // The reference's two dissolves are straight ramps: f99–f110 and f275–f289.
  const d1 = ramp(f, 98, 110);
  const d2 = ramp(f, 274, 289);
  const light = d1 * (1 - d2);
  const out = ramp(f, INTRO_FRAMES - 12, INTRO_FRAMES); // hand-off to the rest of the film (not in the reference)
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <GradientStage f={f} light={light} />
      {f < 111 ? (
        <AbsoluteFill style={{ opacity: 1 - d1 }}>
          <Shot1 f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= 99 && f < 290 ? (
        <AbsoluteFill style={{ opacity: d1 * (1 - d2) }}>
          <Shot2 f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= 275 ? (
        <AbsoluteFill style={{ opacity: d2 }}>
          <Shot3 f={f} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
