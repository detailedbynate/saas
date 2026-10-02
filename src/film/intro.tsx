import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { LogoMark } from "../components/kit";
import { REF } from "./introData";

/*
 * The intro (f0–f419, 7.0 s): an original Outlier opening built from the text animations
 * measured in SPEC.md (word drop with overshoot, the spring lift, typing inside a text box
 * with highlighted new letters, the icon pop, snapping letters, colour wipe, bounce, mix,
 * typewriter, and boiling hand-drawn marks). The structure and words are Outlier's own.
 *
 *   Hook      f0–f150    "Find outliers" drops in and lifts; "before they blow up" types in under it
 *   Name      f138–f289  Introducing → logo pops → "Outlier" snaps in → subtitle colour-wipes
 *   Features  f275–f419  five feature buttons, each label arriving a different way
 *
 * Every frame is a pure function of the frame number (the scribble "boil" is seeded by frame / 8).
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
      <AbsoluteFill style={{ background: `rgba(14,6,60,${0.24 * (1 - light)})` }} />
      <AbsoluteFill style={{ background: `rgba(246,244,255,${0.3 * light})` }} />
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ beat 1: the hook */

const fade: CSSProperties = { WebkitMaskImage: "linear-gradient(to bottom, #000 30%, rgba(0,0,0,0.3) 92%)", maskImage: "linear-gradient(to bottom, #000 30%, rgba(0,0,0,0.3) 92%)" };

/** The reference's word drop: falls in from above, a few px past its rest, and eases back. Returns the y offset. */
function drop(f: number, start: number, travel = 1.5) {
  if (f < start) return 0;
  const i = f - start;
  if (i <= 8) return (from(REF.cleanY, 105, 105 + i) - 482) * travel;
  return 4 * travel * (1 - ramp(i, 8, 17));
}

/** A hand-drawn stroke that draws on between two frames. */
function Stroke({ f, d, start, end, width, color, head = false }: { f: number; d: string; start: number; end: number; width: number; color: string; head?: boolean }) {
  const k = ramp(f, start, end);
  if (k <= 0) return null;
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={head ? 1 - easeOut(k) : 1 - k} />;
}

/** Hand-drawn marks "boil": their outline re-draws every 8 frames, as in the reference. */
function Boil({ f, children }: { f: number; children: ReactNode }) {
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={Math.floor(f / 8)} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter="url(#boil)">{children}</g>
    </svg>
  );
}

const TYPED = "before they blow up";

/** f0–f150. "Find outliers" drops in and lifts; "before they blow up" types in under it inside a text box; an arrow scribbles on. */
function Hook({ f }: { f: number }) {
  const T = { find: 4, outliers: 13, lift: 40, type: 52, box: 58, handles: 112, arrow: 84, quoteL: 100, quoteR: 106 };
  // the reference's lift: straight up, 19 px past, 5 px back under, settled
  const lift = f < T.lift ? 0 : (table(REF.lift, 138 + (f - T.lift)) - 482) * 0.9;
  const typedEnd = T.type + TYPED.length * 2.9;
  // the typed line starts at the right and slides left as letters arrive (the reference's curve, stretched to this line's length)
  const slide = ((table(REF.line2Left, 151 + ((f - T.type) / (typedEnd - T.type)) * 27) - 663) / 462) * 560;
  const big: CSSProperties = { fontFamily: FONT.display, fontWeight: 800, fontSize: 168, lineHeight: "170px", letterSpacing: "-0.035em", color: WHITE, whiteSpace: "nowrap" };
  const handle = (x: number, y: number) => <div style={{ position: "absolute", left: x - 8, top: y - 8, width: 16, height: 16, background: WHITE, border: `3px solid ${SKY}`, transform: `scale(${easeOut(ramp(f, T.handles, T.handles + 8))})` }} />;
  const box = { x: 484, y: 548, w: 952, h: 128 };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, width: 1920, top: 452 + lift, display: "flex", justifyContent: "center", gap: 44, ...big }}>
        <span style={{ ...fade, display: "inline-block", visibility: f < T.find ? "hidden" : "visible", transform: `translate(0px, ${drop(f, T.find)}px)` }}>Find</span>
        <span style={{ ...fade, display: "inline-block", visibility: f < T.outliers ? "hidden" : "visible", transform: `translate(0px, ${drop(f, T.outliers)}px)` }}>outliers</span>
      </div>

      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, border: "2px dashed rgba(255,255,255,0.5)", opacity: ramp(f, T.box, T.box + 3) }} />
      <div style={{ position: "absolute", left: box.x + 22, top: box.y + 12, fontFamily: FONT.display, fontWeight: 700, fontSize: 96, lineHeight: "104px", letterSpacing: "-0.03em", whiteSpace: "pre", transform: `translate(${Math.max(0, slide)}px, 0px)` }}>
        {TYPED.split("").map((ch, i) => {
          const born = T.type + i * 2.9; // the reference's typing speed
          const k = ramp(f, born, born + 4);
          const fresh = f < born + 7; // the newest letters are highlighted
          return (
            <span key={i} style={{ ...fade, display: "inline-block", opacity: f < born ? 0 : 0.35 + 0.65 * k, color: fresh ? SKY : WHITE, transform: `scale(${1.22 - 0.22 * easeOut(k)})`, filter: k < 1 ? `blur(${(1 - k) * 5}px)` : undefined, transformOrigin: "50% 80%" }}>
              {ch}
            </span>
          );
        })}
      </div>
      {handle(box.x, box.y)}
      {handle(box.x + box.w, box.y)}
      {handle(box.x, box.y + box.h)}
      {handle(box.x + box.w, box.y + box.h)}

      <div style={{ position: "absolute", left: 588, top: 268, ...big, fontSize: 110, lineHeight: "110px", opacity: ramp(f, T.quoteL, T.quoteL + 5), transform: `scale(${0.6 + 0.4 * easeOut(ramp(f, T.quoteL, T.quoteL + 12))})` }}>“</div>
      <div style={{ position: "absolute", left: 1478, top: 268, ...big, fontSize: 110, lineHeight: "110px", opacity: ramp(f, T.quoteR, T.quoteR + 5), transform: `scale(${0.6 + 0.4 * easeOut(ramp(f, T.quoteR, T.quoteR + 12))})` }}>”</div>

      <Boil f={f}>
        <Stroke f={f} color={WHITE} start={T.arrow} end={T.arrow + 14} width={26} d="M 1700 1050 C 1730 900 1690 790 1560 700" />
        <Stroke f={f} color={WHITE} start={T.arrow + 12} end={T.arrow + 18} width={22} head d="M 1552 786 L 1540 690 L 1636 690" />
        <Stroke f={f} color={WHITE} start={T.arrow + 6} end={T.arrow + 30} width={7} d="M 150 250 C 210 236 270 268 290 306 C 306 342 250 348 246 306 C 242 272 350 322 452 404" />
        <Stroke f={f} color={WHITE} start={T.arrow + 30} end={T.arrow + 40} width={7} head d="M 462 356 L 458 410 L 404 400" />
      </Boil>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ beat 2: the name */

const SUB = "The outlier finder for YouTube Shorts";

/** f138–f289. "Introducing" drops in, the logo pops up like the reference's icon, "Outlier" snaps in letter by letter, the subtitle colour-wipes. */
function Name({ f }: { f: number }) {
  const T = { label: 142, logo: 150, name: 156, sub: 192, line: 214 };
  // the logo rides the reference's icon curve: up from below, 11 px past, settle
  const iconTop = table(REF.icon, 39 + (f - T.logo), 2);
  const logoY = f < T.logo ? 60 : iconTop - 505;
  const glow = f < T.logo ? 0 : 1 - ramp(f, T.logo + 2, T.logo + 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, width: 1920, top: 312, textAlign: "center", fontFamily: FONT.display, fontWeight: 500, fontSize: 52, color: INK, letterSpacing: "-0.02em", visibility: f < T.label ? "hidden" : "visible", transform: `translate(0px, ${drop(f, T.label, 1)}px)` }}>Introducing</div>

      <div style={{ position: "absolute", left: 0, width: 1920, top: 392, height: 210, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, fontFamily: FONT.display, fontWeight: 800, fontSize: 190, letterSpacing: "-0.035em", color: INK, whiteSpace: "pre" }}>
        <div style={{ opacity: ramp(f, T.logo, T.logo + 3), transform: `translate(0px, ${logoY}px)`, borderRadius: 34, boxShadow: glow > 0.01 ? `0 0 ${44 * glow}px ${10 * glow}px rgba(122,77,255,${0.7 * glow})` : undefined }}>
          <LogoMark size={156} />
        </div>
        <span style={{ display: "inline-block" }}>
          {"Outlier".split("").map((c, i) => {
            const born = T.name + i * 3.7; // snapping: a letter comes up from below every ~3.7 frames, the word re-centres as it grows
            const k = ramp(f, born, born + 4);
            if (f < born) return null;
            return (
              <span key={i} style={{ display: "inline-block", position: "relative" }}>
                <span style={{ visibility: "hidden", fontSize: `${k}em` }}>{c}</span>
                <span style={{ ...fade, position: "absolute", left: 0, bottom: 0, transform: `translate(0px, ${(1 - easeOut(k)) * 90}px)`, opacity: 0.4 + 0.6 * k }}>{c}</span>
              </span>
            );
          })}
        </span>
      </div>

      {/* colour wipe: the whole line arrives violet, then turns to ink one letter at a time */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: 632, textAlign: "center", fontFamily: FONT.display, fontWeight: 500, fontSize: 58, letterSpacing: "-0.02em", whiteSpace: "pre", visibility: f < T.sub ? "hidden" : "visible", opacity: 0.4 + 0.6 * ramp(f, T.sub, T.sub + 6) }}>
        {SUB.split("").map((c, i) => (
          <span key={i} style={{ color: f >= T.sub + 5 + i * 1.5 ? INK : POP }}>
            {c}
          </span>
        ))}
      </div>

      <Boil f={f}>
        <Stroke f={f} color={INK} start={T.line} end={T.line + 16} width={9} d="M 690 742 C 860 722 1060 752 1232 730" />
        <Stroke f={f} color={INK} start={T.line + 8} end={T.line + 22} width={22} d="M 250 190 C 330 170 400 250 470 330" />
        <Stroke f={f} color={INK} start={T.line + 20} end={T.line + 26} width={20} head d="M 478 244 L 480 340 L 388 338" />
        <Stroke f={f} color={INK} start={T.line + 14} end={T.line + 30} width={6} d="M 1640 880 L 1548 800" />
        <Stroke f={f} color={INK} start={T.line + 30} end={T.line + 38} width={6} head d="M 1594 802 L 1546 798 L 1552 846" />
      </Boil>
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

/** f275–f419. Five feature buttons, each label arriving with a different one of the reference's text animations. */
function Features({ f }: { f: number }) {
  const local = f;
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

// Two straight 12- and 15-frame dissolves, like the reference's.
const D1 = [138, 150] as const;
const D2 = [275, 289] as const;

/** How light the stage is during the intro (0 = deep, 1 = light), for the shared background. */
export function introLight(f: number) {
  return ramp(f, D1[0], D1[1]) * (1 - ramp(f, D2[0], D2[1]));
}

/** Frames 0–419: hook → name → features. Draws only its own content; the gradient stage is shared with the rest of the film. */
export function Intro() {
  const f = useCurrentFrame();
  const d1 = ramp(f, D1[0], D1[1]);
  const d2 = ramp(f, D2[0], D2[1]);
  const out = ramp(f, INTRO_FRAMES - 12, INTRO_FRAMES); // hand-off to the first feature scene
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {f <= D1[1] ? (
        <AbsoluteFill style={{ opacity: 1 - d1 }}>
          <Hook f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= D1[0] && f <= D2[1] ? (
        <AbsoluteFill style={{ opacity: d1 * (1 - d2) }}>
          <Name f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= D2[0] ? (
        <AbsoluteFill style={{ opacity: d2 }}>
          <Features f={f} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
