import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { AppStill, AppWindow, ShortCard } from "../components/fx";
import { FeatureTitle, GlowCard, Glyph, Hand, IconTile, LILAC, LogoMark, SoftType, Spinner, VIOLET } from "../components/kit";
import { Shot } from "../components/Shot";
import { Counter, Words, clamp, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

/*
 * v7: simple scenes, one idea each, moving the way the two references move
 * (refs/NOTES.md "v7"): every scene arrives on a quick zoom-out, then holds on a
 * very slow push; things resolve out of blur on a long ease-out; scenes dissolve
 * through blur. Nothing bounces. Only 2D transforms inside shots (see Shot.tsx).
 */

const OUT = Easing.bezier(0.16, 1, 0.3, 1); // long, soft landing
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const abs = (x: number, y: number, extra?: CSSProperties): CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/** Resolve out of blur: fade, de-blur and settle from a small offset/scale. */
function arrive(p: number, dx = 0, dy = 0, s0 = 0.96, blur = 12): CSSProperties {
  return {
    opacity: Math.min(1, p * 1.3),
    transform: p < 0.9995 ? `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${s0 + (1 - s0) * p})` : undefined,
    filter: p < 0.99 ? `blur(${(1 - p) * blur}px)` : undefined,
  };
}

/** Leave with a sideways smear into blur (the reference's text exits). */
function leave(o: number, dx = -120): CSSProperties {
  return o <= 0 ? {} : { opacity: 1 - o, transform: `translate(${o * dx}px, 0)`, filter: `blur(${o * 16}px)` };
}

/** The standard camera: arrive on a zoom-out, then a slow push for the rest of the shot. */
const settle = (dur: number, from = 1.22, to = 1.0, x = 960, y = 540) => [
  { t: -0.3, z: from * to, x, y },
  { t: 0.9, z: to, x, y, ramp: true },
  { t: dur + 0.4, z: to * (1 + 0.02 * dur), x, y },
];
/** Feature scenes sit a little closer, framed just below centre so the title stays in shot. */
const FEATURE = [1.13, 960, 528] as const;

/** A headline: medium weight, word by word out of blur. */
function Line({ text, at, size = 112, accent = [], weight = 650, color = C.text }: { text: string; at: number; size?: number; accent?: string[]; weight?: number; color?: string }) {
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1.1, color, textAlign: "center", whiteSpace: "nowrap" }}>
      <Words text={text} at={at} stagger={0.16} dur={0.85} highlight={accent} />
    </div>
  );
}

/* ------------------------------------------------------------------ 1. Hook */

export function Hook({ dur }: { dur: number }) {
  const t = useTime();
  const out1 = prog(t, 1.2, 0.35, IO);
  return (
    <Shot id="hook" duration={dur} enter="cut" exit="blur" keys={[{ t: 0, x: 900, z: 1.06 }, { t: dur + 0.4, x: 1010, z: 1.0 }]}>
      {/* A slow aurora behind the words */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 2100,
            height: 900,
            marginLeft: -1050,
            marginTop: -450,
            borderRadius: "50%",
            transform: `rotate(${(i ? -1 : 1) * (16 + t * 7)}deg) translate(${(i ? 1 : -1) * t * 30}px, 0)`,
            background: i ? `radial-gradient(ellipse 46% 46% at 44% 50%, rgba(236,72,153,0.4), rgba(${VIOLET},0.2) 40%, rgba(${VIOLET},0.06) 72%, transparent 100%)` : `radial-gradient(ellipse 46% 46% at 54% 50%, rgba(${LILAC},0.48), rgba(${VIOLET},0.34) 36%, rgba(${VIOLET},0.09) 70%, transparent 100%)`,
            opacity: prog(t, 0, 0.9, OUT),
          }}
        />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", ...leave(out1) }}>
          <Line text="Going viral" at={0.2} size={128} />
        </div>
        <div style={{ position: "absolute" }}>
          <Line text="isn't luck." at={1.45} size={144} accent={["luck"]} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 2. One Short becomes many */

const CLIPS = ["short-b", "hoops-3", "short-a", "short-c", "hoops-1", "hoops-2"];
/** Scattered cards: [x, y, depth 0 far … 1 near]. */
const SCATTER: [number, number, number][] = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + random(`sc-a-${i}`) * 0.5;
  const r = 0.55 + random(`sc-r-${i}`) * 0.5;
  return [960 + Math.cos(a) * r * 900, 540 + Math.sin(a) * r * 520, random(`sc-z-${i}`)];
});

export function Multiply({ dur }: { dur: number }) {
  const t = useTime();
  const first = prog(t, 0, 0.9, OUT);
  const fade1 = prog(t, 1.0, 0.5, IO);
  return (
    <Shot
      id="multiply"
      duration={dur}
      enter="blur"
      exit="blur"
      keys={[
        { t: 0, z: 1.5 },
        { t: 0.7, z: 1.44 },
        { t: 1.8, z: 1.0, ramp: true },
        { t: dur + 0.4, z: 1.05 },
      ]}
    >
      {SCATTER.map(([x, y, z], i) => {
        const p = prog(t, 0.75 + i * 0.03, 1.1, OUT);
        const s = 0.5 + z * 0.75;
        const w = 190 * s;
        const h = 338 * s;
        const drift = (t - 0.75) * (10 + 26 * z);
        const dirx = (x - 960) / 900;
        const diry = (y - 540) / 520;
        // Far and near cards sit out of focus; the mid-depth ones are sharp.
        const focus = Math.abs(z - 0.55) * 9;
        return (
          <div key={i} style={{ ...abs(960 + (x - 960) * p + dirx * drift - w / 2, 540 + (y - 540) * p + diry * drift - h / 2), opacity: Math.min(1, p * 1.5) * (0.35 + 0.65 * z), filter: `blur(${focus + (1 - p) * 8}px)`, zIndex: Math.round(z * 10) }}>
            <ShortCard clip={CLIPS[i % CLIPS.length]} w={w} h={h} glow={0.15} flat />
          </div>
        );
      })}
      <div style={{ ...abs(960 - 150, 540 - 267), ...arrive(first, 0, 30, 0.9), opacity: Math.min(1, first * 1.3) * (1 - 0.75 * fade1), zIndex: 6 }}>
        <ShortCard clip="short-b" w={300} h={534} live glow={0.5 * (1 - fade1)} />
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 12 }}>
        <div style={{ padding: "30px 80px", background: "radial-gradient(ellipse at 50% 50%, rgba(4,2,9,0.82), rgba(4,2,9,0.5) 55%, transparent 75%)" }}>
          <Line text="Millions of Shorts." at={1.15} accent={["Shorts"]} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 3. The turn, then the logo */

/** Glowing spheres that drift, then gather into the logo. [x, y, size, depth] */
const ORBS: [number, number, number, number][] = Array.from({ length: 11 }, (_, i) => [140 + random(`o-x-${i}`) * 1640, 90 + random(`o-y-${i}`) * 900, 60 + random(`o-s-${i}`) * 170, random(`o-z-${i}`)]);

function Orb({ size }: { size: number }) {
  return <div style={{ width: size, height: size, borderRadius: 999, background: "radial-gradient(circle at 34% 30%, #ffffff 0%, #ddd6fe 12%, #a78bfa 34%, #7c3aed 62%, #3b0f86 100%)", boxShadow: `0 0 ${size * 0.5}px rgba(${VIOLET},0.75), 0 0 ${size * 1.3}px rgba(${VIOLET},0.3)` }} />;
}

export function TurnLogo({ dur }: { dur: number }) {
  const t = useTime();
  const HIT = 2; // the logo lands here, on the music's drop
  const gather = prog(t, HIT - 0.55, 0.55, Easing.in(Easing.cubic));
  const textOut = prog(t, HIT - 0.75, 0.4, IO);
  const logo = prog(t, HIT - 0.05, 0.9, OUT);
  const sub = prog(t, HIT + 0.55, 0.8, OUT);
  return (
    <Shot
      id="turn"
      duration={dur}
      enter="blur"
      exit="zoomIn"
      keys={[
        { t: -0.3, z: 1.16 },
        { t: 0.9, z: 1.0, ramp: true },
        { t: HIT - 0.1, z: 1.04 },
        { t: HIT + 0.7, z: 1.0, ramp: true },
        { t: dur + 0.4, z: 1.035 },
      ]}
    >
      {ORBS.map(([x, y, size, z], i) => {
        const p = prog(t, 0.05 + i * 0.04, 1.0, OUT);
        const fx = x + Math.sin(t * 0.7 + i) * 26 + (t * (12 + 30 * z)) * (i % 2 ? 1 : -1);
        const fy = y + Math.cos(t * 0.6 + i * 2) * 20 - t * 10 * z;
        const cx = fx + (960 - fx) * gather;
        const cy = fy + (500 - fy) * gather;
        const s = size * (1 - 0.8 * gather);
        return (
          <div key={i} style={{ ...abs(cx - s / 2, cy - s / 2), opacity: p * (1 - prog(t, HIT - 0.05, 0.2)), filter: `blur(${Math.abs(z - 0.5) * 10 * (1 - gather) + (1 - p) * 10}px)`, zIndex: Math.round(z * 10) }}>
            <Orb size={s} />
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 12 }}>
        <div style={{ position: "absolute", ...leave(textOut, 0) }}>
          <Line text="A few break out." at={0.25} accent={["break", "out"]} />
        </div>
      </AbsoluteFill>
      {/* Logo */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${34 + 16 * logo}% ${30 + 14 * logo}% at 50% 46%, rgba(${VIOLET},${0.5 * logo}), transparent 72%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: -40, ...arrive(logo, 0, 0, 0.82, 18) }}>
          <div style={{ borderRadius: 44, overflow: "hidden", boxShadow: `0 0 ${90 * logo}px rgba(${VIOLET},0.9)` }}>
            <LogoMark size={190} />
          </div>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 200, letterSpacing: "-0.05em", color: C.text }}>Outlier</div>
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT.body, fontWeight: 500, fontSize: 46, color: C.textSecondary, ...arrive(sub, 0, 20, 1, 10) }}>See what's about to blow up.</div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ Features: a title and one clean visual each */

function Titled({ accent, rest, icon, children }: { accent: string; rest: string; icon: ReactNode; children: ReactNode }) {
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 84, display: "flex", justifyContent: "center" }}>
        <FeatureTitle accent={accent} rest={rest} at={0.1} size={86} icon={<IconTile size={74}>{icon}</IconTile>} />
      </div>
      {children}
    </>
  );
}

/* 4. Niche Finder: type a topic, get an opportunity score */

export function NicheFinder({ dur }: { dur: number }) {
  const t = useTime();
  const pill = prog(t, 0.2, 0.8, OUT);
  const morph = prog(t, 1.35, 0.7, IO);
  const ring = prog(t, 1.7, 1.1, OUT);
  const R = 2 * Math.PI * 88;
  return (
    <Shot id="niche" duration={dur} enter="zoomIn" exit="blur" keys={settle(dur, 1.0, ...FEATURE)}>
      <Titled accent="Niche" rest="Finder" icon={Glyph.eye(46)}>
        {/* The search pill, which lifts to make room for the result */}
        <div style={{ ...abs(960 - 450, interpolate(morph, [0, 1], [470, 300])), ...arrive(pill, 0, 40) }}>
          <div style={{ width: 900, height: 108, borderRadius: 999, display: "flex", alignItems: "center", gap: 22, padding: "0 40px", background: `linear-gradient(180deg, rgba(${VIOLET},0.5), rgba(76,29,149,0.6))`, border: `2px solid rgba(${LILAC},0.8)`, boxShadow: `0 0 50px rgba(${VIOLET},0.7), 0 0 150px rgba(${VIOLET},0.3), inset 0 2px 0 rgba(255,255,255,0.3)`, fontFamily: FONT.body, fontWeight: 500, fontSize: 44, color: "#fff" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <SoftType text="Minecraft" at={0.5} cps={16} trail={3} />
            <div style={{ marginLeft: "auto", padding: "14px 34px", borderRadius: 999, background: "#fff", color: "#5b21b6", fontWeight: 700, fontSize: 30, transform: `scale(${t >= 1.25 && t < 1.37 ? 0.93 : 1})` }}>Research</div>
          </div>
        </div>
        {/* Result: an opportunity score and three facts */}
        <div style={{ ...abs(960 - 520, 470), width: 1040, display: "flex", alignItems: "center", gap: 60, ...arrive(prog(t, 1.6, 0.9, OUT), 0, 50) }}>
          <GlowCard glow={0.8} radius={40} style={{ width: 300, height: 300, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width="230" height="230" viewBox="0 0 200 200" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke={`rgba(${VIOLET},0.2)`} strokeWidth="14" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="#a78bfa" strokeWidth="14" strokeLinecap="round" strokeDasharray={R} strokeDashoffset={R * (1 - 0.77 * ring)} />
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 96, lineHeight: 1, ...GRADIENT_TEXT }}>
                <Counter value={77} at={1.7} dur={1.1} />
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: 22, color: C.muted, letterSpacing: "0.08em" }}>OPPORTUNITY</div>
            </div>
          </GlowCard>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              ["Demand", "High · 36K/day"],
              ["Growth", "+24%"],
              ["Typical channel", "$383–$1.5K / mo"],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "22px 30px", borderRadius: 20, background: "rgba(14,13,20,0.9)", border: "1.5px solid rgba(255,255,255,0.12)", fontFamily: FONT.body, ...arrive(prog(t, 1.85 + i * 0.12, 0.8, OUT), 50, 0, 1, 8) }}>
                <span style={{ fontSize: 30, color: C.textSecondary }}>{k}</span>
                <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: i ? C.good : C.text }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Titled>
    </Shot>
  );
}

/* 5. Viral Videos: a collage of Shorts and a climbing view count */

const COLLAGE: { x: number; y: number; w: number; h: number; clip: string; live?: boolean; badge?: string }[] = [
  { x: 70, y: 110, w: 300, h: 440, clip: "short-b", live: true, badge: "405×" },
  { x: 395, y: 110, w: 250, h: 340, clip: "hoops-3", badge: "137×" },
  { x: 670, y: 110, w: 250, h: 440, clip: "short-a", live: true, badge: "151×" },
  { x: 70, y: 575, w: 250, h: 400, clip: "hoops-1" },
  { x: 345, y: 475, w: 300, h: 500, clip: "short-c", live: true, badge: "82×" },
  { x: 670, y: 575, w: 250, h: 400, clip: "hoops-2" },
];

export function ViralVideos({ dur }: { dur: number }) {
  const t = useTime();
  const sw = prog(t, 1.0, 0.9, IO);
  return (
    <Shot id="viral" duration={dur} enter="blur" exit="blur" keys={[{ t: -0.3, z: 1.2, x: 880 }, { t: 0.9, z: 1.0, x: 950, ramp: true }, { t: dur + 0.4, z: 1.07, x: 990 }]}>
      {COLLAGE.map((c, i) => (
        <div key={i} style={{ ...abs(c.x, c.y), ...arrive(prog(t, 0.05 + i * 0.07, 1.0, OUT), -260, 0, 0.94, 10) }}>
          <ShortCard clip={c.clip} w={c.w} h={c.h} live={c.live} from={i * 0.5} badge={c.badge} glow={0.55} />
        </div>
      ))}
      <div style={abs(1050, 380)}>
        <FeatureTitle accent="Viral" rest="Videos" at={0.3} size={92} />
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 20, ...arrive(prog(t, 0.6, 0.8, OUT), 40, 0, 1, 10) }}>
          {Glyph.eye(118)}
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 124, letterSpacing: "-0.03em", color: C.text }}>
            <Counter value={38} at={0.65} dur={2.0} prefix="+" suffix="M" />
          </span>
        </div>
        <svg width="600" height="60" viewBox="0 0 600 60" style={{ display: "block", overflow: "visible", marginLeft: -10 }}>
          <path d="M8 40 C 150 14, 390 12, 592 30" stroke="#a78bfa" strokeWidth="7" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - sw} />
        </svg>
      </div>
    </Shot>
  );
}

/* 6. Analyze Video: paste a link, get its outlier score */

export function AnalyzeVideo({ dur }: { dur: number }) {
  const t = useTime();
  const rise = prog(t, 0.05, 1.0, OUT);
  const typedOut = prog(t, 1.5, 0.2);
  const spin = prog(t, 1.5, 0.25) * (1 - prog(t, 1.95, 0.2));
  const morph = prog(t, 2.0, 0.75, IO);
  const w = interpolate(morph, [0, 1], [1180, 980]);
  const h = interpolate(morph, [0, 1], [520, 190]);
  const result = prog(t, 2.4, 0.7, OUT);
  return (
    <Shot id="analyze" duration={dur} enter="blur" exit="blur" keys={settle(dur, 1.22, ...FEATURE)}>
      <Titled accent="Analyze" rest="Video" icon={Glyph.gauge(40)}>
        <div style={{ position: "absolute", left: 960 - w / 2, top: interpolate(morph, [0, 1], [270, 440]), ...arrive(rise, 0, 120, 0.94) }}>
          <GlowCard glow={0.7 + 0.3 * morph} style={{ width: w, height: h, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - morph, filter: morph > 0.01 ? `blur(${morph * 10}px)` : undefined }}>
              <div style={{ position: "absolute", left: 60, top: 60, right: 60, height: 250, borderRadius: 26, border: "2px solid rgba(255,255,255,0.12)" }}>
                <div style={{ position: "absolute", left: 34, top: 30, display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.body, fontSize: 36, color: C.text, opacity: 1 - typedOut }}>
                  {Glyph.yt(46)}
                  <SoftType text="youtube.com/shorts/c1tyIn60s" at={0.45} cps={36} caret />
                </div>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: spin }}>
                  <Spinner size={70} />
                </div>
              </div>
              <div style={{ position: "absolute", right: 60, bottom: 54, padding: "18px 44px", borderRadius: 18, background: C.accent, color: "#fff", fontFamily: FONT.body, fontWeight: 700, fontSize: 32, boxShadow: `0 0 30px rgba(${VIOLET},0.6)`, transform: `scale(${t >= 1.4 && t < 1.52 ? 0.94 : 1})` }}>Analyze</div>
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 34, padding: "0 50px", opacity: result, filter: result < 0.99 ? `blur(${(1 - result) * 8}px)` : undefined }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 104, letterSpacing: "-0.04em", ...GRADIENT_TEXT }}>
                <Counter value={79} at={2.4} dur={0.9} suffix="×" />
              </div>
              <div style={{ fontFamily: FONT.body, lineHeight: 1.25 }}>
                <div style={{ fontSize: 28, color: C.text, fontWeight: 700 }}>outlier score</div>
                <div style={{ fontSize: 23, color: C.muted }}>4.1M views vs 52K median</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 6, height: 74 }}>
                {Array.from({ length: 24 }, (_, i) => {
                  const big = i === 20;
                  const hh = (big ? 1 : 0.18 + 0.22 * Math.abs(Math.sin(i * 1.7))) * prog(t, 2.5 + i * 0.015, 0.6, OUT);
                  return <div key={i} style={{ width: 9, height: 74 * hh, borderRadius: 4, background: big ? "linear-gradient(180deg,#fff,#a78bfa)" : `rgba(${LILAC},0.5)` }} />;
                })}
              </div>
            </div>
          </GlowCard>
        </div>
        {morph < 0.4 ? (
          <Hand
            path={[
              [0.9, 1560, 1100],
              [1.35, 1440, 720],
              [2.0, 1480, 780],
            ]}
            clicks={[1.4]}
          />
        ) : null}
      </Titled>
    </Shot>
  );
}

/* 7. Tracked Channels: three cards fan out */

function Fan({ i, t, children }: { i: number; t: number; children: ReactNode }) {
  const p = prog(t, 0.35 + i * 0.09, 1.0, OUT);
  return (
    <div style={{ position: "absolute", left: 960 - 185 + (i - 1) * 410 * p, top: 280, transform: p < 0.9995 ? `rotate(${(1 - p) * (i - 1) * 7}deg) scale(${0.7 + 0.3 * p})` : undefined, opacity: Math.min(1, p * 1.6), filter: p < 0.99 ? `blur(${(1 - p) * 10}px)` : undefined, zIndex: i === 1 ? 2 : 1 }}>
      <GlowCard glow={0.8} radius={30} style={{ width: 370, height: 600, padding: 34, fontFamily: FONT.body, display: "flex", flexDirection: "column" }}>
        {children}
      </GlowCard>
    </div>
  );
}

export function TrackedChannels({ dur }: { dur: number }) {
  const t = useTime();
  const draw = prog(t, 0.9, 1.2, IO);
  return (
    <Shot id="tracked" duration={dur} enter="blur" exit="blur" keys={settle(dur, 1.22, ...FEATURE)}>
      <Titled accent="Tracked" rest="Channels" icon={Glyph.chart(40)}>
        <Fan i={0} t={t}>
          <div style={{ fontSize: 28, color: C.muted }}>Views · 24h</div>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 66, color: C.good, marginTop: 6 }}>
            <Counter value={1.2} at={0.8} dur={1.3} decimals={1} prefix="+" suffix="M" />
          </div>
          <svg viewBox="0 0 240 100" preserveAspectRatio="none" style={{ width: "100%", height: 170, marginTop: "auto", overflow: "visible" }}>
            <path d="M0 92 C30 90 50 86 80 80 S130 70 160 54 S210 20 240 8" stroke="#c4b5fd" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
          </svg>
        </Fan>
        <Fan i={1} t={t}>
          <div style={{ width: 124, height: 124, borderRadius: 99, background: "linear-gradient(135deg,#f0abfc,#7c3aed)", alignSelf: "center", marginTop: 26, boxShadow: `0 0 40px rgba(${VIOLET},0.6)` }} />
          <div style={{ textAlign: "center", marginTop: 26, fontSize: 36, fontWeight: 700, color: C.text }}>Snack Lab</div>
          <div style={{ textAlign: "center", fontSize: 23, color: C.muted, marginTop: 4 }}>cooking hacks · 11.8K subs</div>
          <div style={{ alignSelf: "center", marginTop: "auto", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: C.good, fontWeight: 700, fontSize: 23 }}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: C.good }} />
            Breaking out
          </div>
        </Fan>
        <Fan i={2} t={t}>
          <div style={{ fontSize: 28, color: C.muted }}>Subs · 48h</div>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 66, color: C.good, marginTop: 6 }}>
            <Counter value={18.4} at={0.9} dur={1.3} decimals={1} prefix="+" suffix="K" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 170, marginTop: "auto" }}>
            {[0.25, 0.32, 0.3, 0.45, 0.4, 0.62, 0.78, 1].map((hh, i) => (
              <div key={i} style={{ flex: 1, height: `${hh * 100 * prog(t, 1.0 + i * 0.06, 0.8, OUT)}%`, borderRadius: 6, background: i === 7 ? "linear-gradient(180deg,#ddd6fe,#8b5cf6)" : `rgba(${LILAC},0.35)` }} />
            ))}
          </div>
        </Fan>
      </Titled>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 8. Any niche */

const NICHES = ["Basketball", "Minecraft", "Battle Cats", "My Singing Monsters", "Crime", "Motivation", "Cooking", "Fitness", "Gaming", "Comedy"];

export function AnyNiche({ dur }: { dur: number }) {
  const t = useTime();
  const pill = prog(t, 0.1, 0.9, OUT);
  return (
    <Shot id="any" duration={dur} enter="blur" exit="zoomOut" keys={settle(dur, 1.3, 1.08)}>
      {NICHES.map((n, i) => {
        const a = (i / NICHES.length) * Math.PI * 2 + 0.4;
        const z = random(`n-z-${i}`); // 0 far … 1 near
        const p = prog(t, 0.25 + i * 0.05, 1.0, OUT);
        // Tags drift outwards past the camera; nearer ones travel faster and are softer.
        const r = (330 + 300 * z) * (0.75 + 0.25 * p) + t * (20 + 70 * z);
        const x = 960 + Math.cos(a) * r * 1.5;
        const y = 540 + Math.sin(a) * r * 0.8;
        return (
          <div key={n} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.7 * z})`, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.body, fontWeight: 600, fontSize: 34, color: C.text, whiteSpace: "nowrap", opacity: p * (0.45 + 0.55 * (1 - Math.abs(z - 0.5) * 2)), filter: `blur(${Math.abs(z - 0.45) * 8 + (1 - p) * 8}px)` }}>
            <span style={{ width: 14, height: 14, borderRadius: 99, background: "#a78bfa", boxShadow: `0 0 14px rgba(${VIOLET},0.9)` }} />
            {n}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: "30px 76px", borderRadius: 34, background: "linear-gradient(100deg, #7c3aed, #c084fc 55%, #f0abfc)", boxShadow: `0 0 90px rgba(${VIOLET},0.8), 0 0 220px rgba(192,132,252,0.35), inset 0 2px 0 rgba(255,255,255,0.4)`, fontFamily: FONT.display, fontWeight: 700, fontSize: 84, letterSpacing: "-0.03em", color: "#fff", ...arrive(pill, 0, 0, 0.86, 16) }}>In any niche</div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 9. The dashboard, settling out of a 3D tilt */

export function Dashboard({ dur }: { dur: number }) {
  return (
    <Shot
      id="dash"
      duration={dur}
      enter="zoomOut"
      exit="blur"
      keys={[
        { t: -0.3, x: 960, y: 640, z: 1.5, rx: 46, ry: -14 },
        { t: 1.3, x: 960, y: 560, z: 1.0, rx: 16, ry: -7, ramp: true },
        { t: dur + 0.4, x: 960, y: 548, z: 1.06, rx: 11, ry: -4 },
      ]}
    >
      <AppWindow glow={0.9}>
        <AppStill name="app-0.5" />
      </AppWindow>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 10. Tagline */

export function Tagline({ dur }: { dur: number }) {
  const t = useTime();
  const out1 = prog(t, 1.05, 0.35, IO);
  return (
    <Shot id="tagline" duration={dur} enter="blur" exit="blur" keys={[{ t: -0.3, z: 1.1 }, { t: dur + 0.4, z: 1.0 }]}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 36% at 50% 50%, rgba(${VIOLET},0.26), transparent 75%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", ...leave(out1) }}>
          <Line text="Less guessing." at={0.15} size={128} color={C.textSecondary} />
        </div>
        <div style={{ position: "absolute" }}>
          <Line text="More outliers." at={1.25} size={144} accent={["outliers"]} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 11. End card */

export function End({ dur }: { dur: number }) {
  const t = useTime();
  const logo = prog(t, 0, 1.0, OUT);
  const sub = prog(t, 0.45, 0.9, OUT);
  const pill = prog(t, 0.85, 0.9, OUT);
  const out = prog(t, dur - 0.5, 0.5, IO);
  return (
    <Shot id="end" duration={dur} enter="blur" exit="cut" keys={[{ t: -0.3, z: 0.96 }, { t: dur, z: 0.96 * (1 + 0.016 * dur) }]}>
      <AbsoluteFill style={{ opacity: 1 - out }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 46% 40% at 50% 44%, rgba(${VIOLET},${0.45 * logo}), transparent 72%)` }} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: -70, ...arrive(logo, 0, 0, 0.9, 16) }}>
            <div style={{ borderRadius: 40, overflow: "hidden", boxShadow: `0 0 80px rgba(${VIOLET},0.9)` }}>
              <LogoMark size={170} />
            </div>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 184, letterSpacing: "-0.05em", color: C.text }}>Outlier</div>
          </div>
          <div style={{ marginTop: 28, fontFamily: FONT.body, fontWeight: 500, fontSize: 44, color: C.textSecondary, ...arrive(sub, 0, 20, 1, 10) }}>Find your next outlier before everyone else.</div>
          <div style={{ marginTop: 50, padding: "22px 56px", borderRadius: 999, background: "linear-gradient(100deg, #7c3aed, #c084fc 60%, #f0abfc)", boxShadow: `0 0 80px rgba(${VIOLET},0.75), inset 0 2px 0 rgba(255,255,255,0.4)`, color: "#fff", fontFamily: FONT.display, fontWeight: 700, fontSize: 46, ...arrive(pill, 0, 24, 0.92, 12) }}>useoutlier.online</div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Shot>
  );
}
