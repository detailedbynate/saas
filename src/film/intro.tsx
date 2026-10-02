import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../theme";
import { LogoMark } from "../components/kit";

/*
 * The intro (f0–f419, 7.0 s).
 *
 * One object in the middle of the frame keeps morphing into the next thing, the way the
 * Sprites promo does between 2 s and 6 s (refs/src/anna.mp4): a circle opens into a search
 * bar, the query is typed and sent, the bar collapses into a dark "researching" pill, the
 * pill opens into a library of Shorts, and the library folds into the one that broke out.
 * Each morph is a fast size/shape/colour change with the old content blurring out and the
 * new content blurring in; the camera starts tight on each new state and eases back; an
 * arrow cursor does the clicking. The shape and the camera ride closed-form springs (a sum of one
 * spring per change), so nothing starts or stops abruptly and every frame stays a pure function of time.
 *
 *   f0    logo circle pops in
 *   f24   circle → search bar; "how to make a good youtube channel" is typed (34 characters a second)
 *   f114  send is clicked; bar → "Researching 105 channels" pill
 *   f172  pill → "Viral Shorts" library; one Short is flagged as the outlier
 *   f268  it is clicked; library → that Short's card; "Analyze video" is clicked at f338
 *   f398  everything blurs away into the first feature scene
 *
 * Every frame is a pure function of the frame number.
 */

export const INTRO_FRAMES = 420;

/* ------------------------------------------------------------------ helpers */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * A spring's response to being told "go from 0 to 1" at time 0, in closed form, so it is a pure
 * function of time. `w` is its speed (rad/s); `z` is damping: 1 = no overshoot, 0.8 = a tiny one.
 */
function step(seconds: number, w: number, z = 1) {
  if (seconds <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * seconds) * (1 + w * seconds);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * seconds) * (Math.cos(wd * seconds) + ((z * w) / wd) * Math.sin(wd * seconds));
}
/**
 * A value that is retargeted several times: the sum of one spring per change. It never jumps and
 * never has a kink, however close together the changes are. `changes` is [frame, target].
 */
function sprung(f: number, start: number, changes: readonly (readonly [number, number])[], w: number, z = 1) {
  let v = start;
  let prev = start;
  for (const [at, target] of changes) {
    v += (target - prev) * step((f - at) / 60, w, z);
    prev = target;
  }
  return v;
}
const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(",")})`;

const INK = "#111118";
const GREY = "#7a7a86";
const VIOLET = "#7a4dff";

/* ------------------------------------------------------------------ background */

/**
 * The stage for the whole film: the client's gradient (azure top-left, pale top-right, pale
 * bottom-left, deep bottom-right), pushed slightly toward purple, every pool of colour drifting.
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

/** The stage stays deep for the whole intro. */
export function introLight(_f: number) {
  return 0;
}

/* ------------------------------------------------------------------ the morphing object */

type State = { w: number; h: number; r: number; bg: number[] };
const S: State[] = [
  { w: 104, h: 104, r: 52, bg: [255, 255, 255] }, // 0 logo circle
  { w: 1000, h: 108, r: 54, bg: [255, 255, 255] }, // 1 search bar
  { w: 660, h: 88, r: 44, bg: [17, 17, 24] }, // 2 researching pill
  { w: 1296, h: 652, r: 30, bg: [255, 255, 255] }, // 3 library
  { w: 540, h: 812, r: 30, bg: [255, 255, 255] }, // 4 the outlier's card
];
/** When each morph runs: [from state, start frame, end frame]. */
const MORPHS: [number, number, number][] = [
  [0, 24, 50],
  [1, 116, 142],
  [2, 172, 204],
  [3, 270, 300],
];
const T = { type: 50, cps: 36, send: 114, flag: 232, pick: 268, analyze: 338, out: 398 };
const QUERY = "how to make a good youtube channel";

// The shape itself rides springs: width leads, height trails a little, so it opens wide before it
// opens tall; each has a tiny overshoot. Colour and corner radius follow without overshoot.
const shape = (f: number, key: "w" | "h" | "r", w: number, z: number) => sprung(f, S[0][key], MORPHS.map(([from, at]) => [at, S[from + 1][key]] as const), w, z);
const tint = (f: number, channel: number) => sprung(f, S[0].bg[channel], MORPHS.map(([from, at]) => [at, S[from + 1].bg[channel]] as const), 16, 1);

/** Content of one state: blurs out during the first part of the morph away from it, blurs in during the last part of the morph into it. */
function Content({ f, index, children }: { f: number; index: number; children: ReactNode }) {
  const into = MORPHS.find(([from]) => from + 1 === index);
  const away = MORPHS.find(([from]) => from === index);
  const a = into ? ramp(f, into[1] + 7, into[1] + 22) : 1;
  const b = away ? ramp(f, away[1], away[1] + 9) : 0;
  const vis = a * (1 - b);
  if (vis <= 0.001) return null;
  const blur = (1 - a) * 14 + b * 14;
  return <div style={{ position: "absolute", left: "50%", top: "50%", width: S[index].w, height: S[index].h, marginLeft: -S[index].w / 2, marginTop: -S[index].h / 2, opacity: vis, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>{children}</div>;
}

/* ------------------------------------------------------------------ contents */

function SearchBar({ f }: { f: number }) {
  const typed = Math.max(0, Math.min(QUERY.length, Math.floor(((f - T.type) / 60) * T.cps)));
  const has = typed > 0;
  const caret = f < T.send + 4 && (typed < QUERY.length || Math.floor(f / 16) % 2 === 0);
  const press = f >= T.send && f < T.send + 7;
  return (
    <>
      <svg width={34} height={34} viewBox="0 0 24 24" style={{ position: "absolute", left: 38, top: 37 }} fill={INK}>
        <path d="M10 2 L11.8 7.6 L17.5 9.5 L11.8 11.4 L10 17 L8.2 11.4 L2.5 9.5 L8.2 7.6 Z M18.5 13 L19.4 15.6 L22 16.5 L19.4 17.4 L18.5 20 L17.6 17.4 L15 16.5 L17.6 15.6 Z" />
      </svg>
      <div style={{ position: "absolute", left: 90, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: FONT.body, fontWeight: 500, fontSize: 38, letterSpacing: "-0.01em", color: INK, whiteSpace: "pre" }}>
        {has ? QUERY.slice(0, typed) : <span style={{ color: "#a9a9b4", fontWeight: 400 }}>Ask Outlier anything…</span>}
        {caret && f >= T.type - 4 ? <span style={{ width: 3, height: 44, background: INK, marginLeft: 3 }} /> : null}
      </div>
      <div style={{ position: "absolute", right: 18, top: 18, width: 72, height: 72, borderRadius: 99, background: has ? INK : "#c8c8d0", display: "grid", placeItems: "center", transform: `scale(${press ? 0.88 : 1})` }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
        </svg>
      </div>
    </>
  );
}

function Pill({ f }: { f: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, color: "#fff", letterSpacing: "-0.01em" }}>
      <svg width={30} height={30} viewBox="-16 -16 32 32" style={{ transform: `rotate(${f * 11}deg)` }}>
        <circle r={12} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3.4} />
        <path d="M 0 -12 A 12 12 0 0 1 12 0" fill="none" stroke="#b79cff" strokeWidth={3.4} strokeLinecap="round" />
      </svg>
      Researching 105 channels
    </div>
  );
}

const LIBRARY = ["short-a", "mc-0", "mc-3", "hoops-1", "mc-1", "hoops-2", "mc-2", "short-b", "hoops-3", "short-c"];
const STAR = 2; // the Short that gets flagged

function Library({ f }: { f: number }) {
  const w = 232;
  const h = 254;
  const flag = out(ramp(f, T.flag, T.flag + 14));
  return (
    <>
      <div style={{ position: "absolute", left: 30, top: 24, display: "flex", alignItems: "baseline", gap: 14, fontFamily: FONT.display }}>
        <span style={{ fontWeight: 700, fontSize: 28, color: INK }}>Viral Shorts</span>
        <span style={{ fontFamily: FONT.body, fontSize: 21, color: GREY }}>1.3K videos analysed</span>
      </div>
      <div style={{ position: "absolute", right: 30, top: 28, fontFamily: FONT.body, fontWeight: 600, fontSize: 20, color: INK, opacity: flag }}>
        <span style={{ color: VIOLET }}>●</span> Outlier found
      </div>
      {LIBRARY.map((clip, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const focus = ramp(f, 186 + i * 1.5, 214 + i * 1.5); // the grid comes into focus tile by tile
        const star = i === STAR;
        return (
          <div key={clip} style={{ position: "absolute", left: 36 + col * (w + 16), top: 86 + row * (h + 16), width: w, height: h, borderRadius: 16, overflow: "hidden", background: "#e9e9ef", filter: focus < 1 ? `blur(${(1 - focus) * 12}px)` : undefined, opacity: star ? 1 : 1 - 0.45 * flag, outline: star ? `${5 * flag}px solid ${VIOLET}` : undefined, outlineOffset: 2 }}>
            <Img src={staticFile(`footage/${clip}.jpg`)} style={{ width: w, height: h, objectFit: "cover", transform: `scale(${1.12 - 0.12 * out(focus)})` }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 36 + STAR * (w + 16) + w / 2 - 80, top: 56, width: 160, height: 38, borderRadius: 99, background: INK, color: "#fff", display: "grid", placeItems: "center", fontFamily: FONT.body, fontWeight: 700, fontSize: 19, opacity: Math.min(1, flag * 2), transform: `translate(0px, ${(1 - flag) * 12}px) scale(${0.7 + 0.3 * flag})` }}>62× outlier</div>
    </>
  );
}

function Detail({ f }: { f: number }) {
  // the button goes dark → brown-ish → violet as it is clicked, like the reference's "Approve & launch" → "Launched"
  const done = ramp(f, T.analyze + 2, T.analyze + 14);
  const press = f >= T.analyze && f < T.analyze + 7;
  return (
    <>
      <div style={{ position: "absolute", left: 28, top: 22, right: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.body, fontSize: 19, color: INK }}>
        <span style={{ padding: "5px 14px", borderRadius: 99, background: INK, color: "#fff", fontWeight: 700, fontSize: 16 }}>Shorts</span>
        <span style={{ fontWeight: 600 }}>GalaxiHD</span>
        <span style={{ marginLeft: "auto", color: GREY, fontSize: 17 }}>
          <span style={{ color: VIOLET }}>●</span> 62× outlier
        </span>
      </div>
      <div style={{ position: "absolute", left: 28, top: 70, width: 484, height: 500, borderRadius: 20, overflow: "hidden", background: "#111" }}>
        <Img src={staticFile("footage/mc-3.jpg")} style={{ width: 484, height: 500, objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 28, top: 586, right: 28, fontFamily: FONT.body }}>
        <div style={{ fontSize: 15, color: GREY }}>Title</div>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 24, color: INK, lineHeight: 1.2, marginTop: 4 }}>This Minecraft Mod Was Going To Replace 40 Mods… Then It Got BANNED</div>
        <div style={{ fontSize: 18, color: GREY, marginTop: 8 }}>1.6M views · 31.9K subs</div>
      </div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 26, height: 66, display: "flex", gap: 14, fontFamily: FONT.body, fontWeight: 700, fontSize: 21 }}>
        <div style={{ width: 130, borderRadius: 99, border: "1.5px solid #dcdce4", color: INK, display: "grid", placeItems: "center" }}>Track</div>
        <div style={{ flex: 1, borderRadius: 99, background: mix([17, 17, 24], [122, 77, 255], done), color: "#fff", display: "grid", placeItems: "center", transform: `scale(${press ? 0.96 : 1})` }}>
          <span style={{ position: "absolute", opacity: 1 - ramp(f, T.analyze + 2, T.analyze + 8) }}>Analyze video</span>
          <span style={{ position: "absolute", opacity: ramp(f, T.analyze + 8, T.analyze + 14) }}>✓ Analyzing</span>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ cursor and camera */

/** [frame, x, y] in stage pixels (inside the camera). */
const CURSOR: [number, number, number][] = [
  [0, 1210, 760],
  [44, 1180, 690],
  [100, 1410, 566],
  [T.send, 1404, 556],
  [140, 1420, 600],
  [176, 1330, 640],
  [214, 1120, 560],
  [256, 978, 452],
  [T.pick, 974, 446],
  [296, 1080, 640],
  [330, 1040, 884],
  [T.analyze, 1036, 882],
  [396, 1100, 930],
];

function Cursor({ f }: { f: number }) {
  let i = 0;
  while (i < CURSOR.length - 2 && f > CURSOR[i + 1][0]) i++;
  const [f0, x0, y0] = CURSOR[i];
  const [f1, x1, y1] = CURSOR[i + 1];
  const k = inOut(ramp(f, f0, f1));
  const down = [T.send, T.pick, T.analyze].some((c) => f >= c && f < c + 7);
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0, opacity: ramp(f, 30, 40), transform: `translate(${lerp(x0, x1, k)}px, ${lerp(y0, y1, k)}px) scale(${down ? 0.84 : 1})`, transformOrigin: "0 0" }}>
      <path d="M4 2 L4 20 L9 15.5 L12.2 22.5 L15 21.2 L11.9 14.4 L18.5 14 Z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Camera zoom, as a sum of soft springs (no overshoot), so it never changes direction abruptly:
 * a little closer as each new state opens, then a long ease back while it is read. [frame, zoom]
 */
const CAMERA: [number, number][] = [
  [20, 1.72],
  [50, 1.14],
  [116, 1.3],
  [172, 1.3],
  [196, 1.0],
  [270, 1.14],
  [300, 1.02],
];
function zoomAt(f: number) {
  return sprung(f, 1.5, CAMERA, 5.2, 1) + 0.0002 * f;
}

/* ------------------------------------------------------------------ the intro */

export function Intro() {
  const f = useCurrentFrame();
  const w = Math.max(1, shape(f, "w", 15, 0.82));
  const h = Math.max(1, shape(f, "h", 12, 0.86));
  const r = Math.max(0, shape(f, "r", 13, 1));
  const pop = out(ramp(f, 2, 20)); // the circle pops in
  const leave = ramp(f, T.out, INTRO_FRAMES); // the blur hand-off into the first feature scene
  const zoom = zoomAt(f) * (1 + 0.08 * leave);
  return (
    <AbsoluteFill style={{ opacity: 1 - Easing.in(Easing.quad)(leave), filter: leave > 0.01 ? `blur(${leave * 16}px)` : undefined }}>
      <AbsoluteFill style={{ transformOrigin: "960px 540px", transform: `scale(${zoom})` }}>
        <div
          style={{
            position: "absolute",
            left: 960 - w / 2,
            top: 540 - h / 2,
            width: w,
            height: h,
            borderRadius: Math.min(r, h / 2),
            background: `rgb(${[0, 1, 2].map((c) => Math.round(Math.max(0, Math.min(255, tint(f, c))))).join(",")})`,
            boxShadow: "0 30px 80px rgba(12,6,70,0.38), 0 4px 14px rgba(12,6,70,0.2)",
            overflow: "hidden",
            opacity: Math.min(1, pop * 2),
            transform: `scale(${0.4 + 0.6 * pop})`,
          }}
        >
          <Content f={f} index={0}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <LogoMark size={64} />
            </div>
          </Content>
          <Content f={f} index={1}>
            <SearchBar f={f} />
          </Content>
          <Content f={f} index={2}>
            <Pill f={f} />
          </Content>
          <Content f={f} index={3}>
            <Library f={f} />
          </Content>
          <Content f={f} index={4}>
            <Detail f={f} />
          </Content>
        </div>
        <Cursor f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
