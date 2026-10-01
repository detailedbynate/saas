import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { DarkCard, FeatureTitle, GlowCard, Glyph, Hand, IconTile, LILAC, LogoMark, SoftType, Spinner, Thumb, VIOLET, ent, type ThumbKind } from "../components/kit";
import { Shot } from "../components/Shot";
import { Counter, IN_OUT, OUT, clamp, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

/*
 * The six feature beats, each laid out like its counterpart in the Algrow film
 * (stage coordinates are the reference's frame scaled to 1920×1080).
 */

const abs = (x: number, y: number, extra?: CSSProperties): CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

/* ------------------------------------------------------------------ 1. Outlier Finder  (≈ Niche Finding) */

const FINDER: { x: number; y: number; w: number; h: number; kind: ThumbKind; hue: number; cap: string }[] = [
  { x: 60, y: 66, w: 380, h: 250, kind: "person", hue: 50, cap: "a self-taught editor" },
  { x: 60, y: 340, w: 380, h: 250, kind: "lab", hue: 200, cap: "and it actually worked" },
  { x: 470, y: 66, w: 300, h: 524, kind: "gym", hue: 0, cap: "MADE ME LIKE" },
  { x: 60, y: 620, w: 236, h: 400, kind: "blocks", hue: 120, cap: "let me explain" },
  { x: 320, y: 620, w: 236, h: 400, kind: "person", hue: 330, cap: "when he finds out" },
  { x: 580, y: 620, w: 236, h: 400, kind: "road", hue: 20, cap: "he's about to" },
];

function Swoosh({ at }: { at: number }) {
  const p = prog(useTime(), at, 0.8, IN_OUT);
  return (
    <svg width="560" height="60" viewBox="0 0 560 60" style={{ display: "block", overflow: "visible" }}>
      <path d="M8 40 C 140 14, 360 12, 552 30" stroke="#a78bfa" strokeWidth="7" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} style={{ filter: `drop-shadow(0 0 10px rgba(${VIOLET},0.9))` }} />
    </svg>
  );
}

export function Finder({ dur }: { dur: number }) {
  const t = useTime();
  const swap = prog(t, 1.9, 0.5, IN_OUT);
  return (
    <Shot
      id="finder"
      duration={dur}
      enter="blur"
      exit="blur"
      keys={[
        { t: 0, x: 800, y: 560, z: 1.14, ry: 12 },
        { t: 1.3, x: 930, y: 540, z: 1.0, ry: 4 },
        { t: 3.5, x: 1010, y: 530, z: 1.05, ry: -3 },
      ]}
    >
      {FINDER.map((f, i) => {
        const p = prog(t, 0.04 * i, 0.9, OUT);
        const float = Math.sin(t * 1.1 + i) * 5;
        return (
          <div key={i} style={{ ...abs(f.x, f.y), ...ent(p, -420, 40 * ((i % 2) * 2 - 1), 0.9), marginTop: float }}>
            {i === 3 ? (
              <div style={{ position: "relative", width: f.w, height: f.h }}>
                <Thumb kind="blocks" hue={120} caption="let me explain" w={f.w} h={f.h} />
                <div style={{ position: "absolute", inset: 0, opacity: swap, filter: swap < 0.99 ? `blur(${(1 - swap) * 8}px)` : undefined }}>
                  <Thumb kind="cat" hue={30} caption="wait for it…" w={f.w} h={f.h} />
                </div>
              </div>
            ) : (
              <Thumb kind={f.kind} hue={f.hue} caption={f.cap} w={f.w} h={f.h} />
            )}
          </div>
        );
      })}
      <div style={abs(1070, 400)}>
        <FeatureTitle accent="Outlier" rest="Finder" at={0.25} size={82} />
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 18, ...ent(prog(t, 0.55, 0.7), 40, 0) }}>
          {Glyph.eye(118)}
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 116, letterSpacing: "-0.03em", color: C.text, textShadow: `0 0 30px rgba(${VIOLET},0.45)` }}>
            <Counter value={38} at={0.6} dur={2.3} prefix="+" suffix="M" />
          </span>
        </div>
        <div style={{ marginTop: -6, marginLeft: -10 }}>
          <Swoosh at={0.9} />
        </div>
      </div>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 2. Daily Picks  (≈ AI Video Generator) */

const PICK_TILES: { x: number; y: number; w: number; h: number; kind: ThumbKind; hue: number; cap: string; badge: string }[] = [
  { x: 136, y: 214, w: 380, h: 690, kind: "lab", hue: 210, cap: "this $9 gadget replaced my lamp", badge: "41×" },
  { x: 580, y: 190, w: 760, h: 390, kind: "city", hue: 30, cap: "I built a whole city in 60 seconds", badge: "33×" },
  { x: 590, y: 612, w: 740, h: 390, kind: "food", hue: 20, cap: "the 2-minute pasta hack", badge: "27×" },
  { x: 1404, y: 204, w: 380, h: 690, kind: "cat", hue: 30, cap: "my cat learned to open the fridge", badge: "22×" },
];

export function Picks({ dur }: { dur: number }) {
  const t = useTime();
  const cardOut = prog(t, 0.95, 0.45, IN_OUT);
  const cardIn = prog(t, 0.15, 0.6);
  return (
    <Shot
      id="picks"
      duration={dur}
      enter="blur"
      exit="blur"
      keys={[
        { t: 0, x: 960, y: 600, z: 0.96, rx: 8 },
        { t: 1.2, x: 960, y: 560, z: 1.0, rx: 2 },
        { t: 3.5, x: 990, y: 560, z: 1.07, rx: -2, ry: -2 },
      ]}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center" }}>
        <FeatureTitle accent="Daily" rest="Picks" at={0.05} size={84} icon={<IconTile size={74}>{Glyph.calendar(40)}</IconTile>} />
      </div>
      {/* The request card, which hands over to the picks */}
      {cardOut < 1 ? (
        <div style={{ ...abs(560, 380), opacity: cardIn * (1 - cardOut), transform: `translate3d(0, ${(1 - cardIn) * 60}px, 0) scale(${1 - 0.25 * cardOut})`, filter: cardOut > 0 ? `blur(${cardOut * 14}px)` : cardIn < 0.99 ? `blur(${(1 - cardIn) * 10}px)` : undefined }}>
          <DarkCard style={{ width: 800, padding: "34px 40px", fontFamily: FONT.body }}>
            <div style={{ fontSize: 26, color: C.muted, marginBottom: 14 }}>Today · 5 picks</div>
            <div style={{ fontSize: 40, color: C.text, fontWeight: 500 }}>
              <SoftType text="Breakout channels picked for you" at={0.3} cps={44} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {["tech", "comedy", "pets", "food"].map((n, i) => (
                <span key={n} style={{ padding: "8px 18px", borderRadius: 999, background: `rgba(${VIOLET},0.18)`, color: C.accentText, fontSize: 22, ...ent(prog(t, 0.45 + i * 0.06, 0.4), 0, 10) }}>{n}</span>
              ))}
            </div>
          </DarkCard>
        </div>
      ) : null}
      {PICK_TILES.map((p, i) => {
        const s = prog(t, 0.95 + i * 0.07, 0.9, OUT);
        const cx = 960 - (p.x + p.w / 2);
        const cy = 540 - (p.y + p.h / 2);
        return (
          <div key={i} style={{ ...abs(p.x, p.y), opacity: Math.min(1, s * 1.5), transform: `translate3d(${cx * (1 - s)}px, ${cy * (1 - s) + Math.sin(t * 1.2 + i) * 4}px, 0) scale(${0.35 + 0.65 * s})`, filter: s < 0.99 ? `blur(${(1 - s) * 10}px)` : undefined }}>
            <Thumb kind={p.kind} hue={p.hue} caption={p.cap} w={p.w} h={p.h} badge={p.badge} glow={0.6} />
          </div>
        );
      })}
    </Shot>
  );
}

/* ------------------------------------------------------------------ 3. Video Analyzer  (≈ AI Voice Generator) */

function Histogram({ t, n = 26, h = 70 }: { t: number; n?: number; h?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h }}>
      {Array.from({ length: n }, (_, i) => {
        const base = i === n - 4 ? 1 : 0.18 + 0.22 * Math.abs(Math.sin(i * 1.7));
        const live = base * (0.75 + 0.25 * Math.sin(t * 6 + i * 0.8));
        return <div key={i} style={{ width: 9, height: h * live, borderRadius: 4, background: i === n - 4 ? "linear-gradient(180deg,#fff,#a78bfa)" : `rgba(${LILAC},0.55)`, boxShadow: i === n - 4 ? `0 0 16px rgba(${VIOLET},0.9)` : undefined }} />;
      })}
    </div>
  );
}

export function Score({ dur }: { dur: number }) {
  const t = useTime();
  const rise = prog(t, 0.05, 0.95, IN_OUT);
  const typedOut = prog(t, 2.0, 0.25);
  const spin = prog(t, 2.05, 0.3) * (1 - prog(t, 2.6, 0.2));
  const ready = prog(t, 2.6, 0.3) * (1 - prog(t, 2.95, 0.2));
  const morph = prog(t, 2.9, 0.75, IN_OUT);
  const w = interpolate(morph, [0, 1], [1280, 980]);
  const h = interpolate(morph, [0, 1], [720, 190]);
  const result = prog(t, 3.35, 0.6);
  return (
    <Shot
      id="score"
      duration={dur}
      enter="blur"
      exit="blur"
      keys={[
        { t: 0, x: 960, y: 640, z: 0.94, rx: 12 },
        { t: 1.2, x: 900, y: 530, z: 1.06, rx: 2 },
        { t: 2.0, x: 1250, y: 720, z: 1.16, rx: 0, ry: -4 },
        { t: 2.9, x: 960, y: 570, z: 1.02, ry: 0 },
        { t: 4.5, x: 960, y: 540, z: 1.12 },
      ]}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(morph, [0, 1], [70, 280]), display: "flex", justifyContent: "center" }}>
        <FeatureTitle accent="Video" rest="Analyzer" at={0.05} size={84} icon={<IconTile size={74}>{Glyph.gauge(40)}</IconTile>} />
      </div>
      <div style={{ position: "absolute", left: 960 - w / 2, top: interpolate(morph, [0, 1], [200, 470]), ...ent(rise, 0, 340, 0.92) }}>
        <GlowCard glow={0.7 + 0.3 * morph} style={{ width: w, height: h, overflow: "hidden" }}>
          {/* Full card: logo, bell, input box, Analyze button */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - morph, filter: morph > 0.01 ? `blur(${morph * 10}px)` : undefined }}>
            <div style={{ position: "absolute", left: 40, top: 30, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
              <LogoMark size={64} />
            </div>
            <div style={{ position: "absolute", right: 46, top: 44 }}>{Glyph.bell(34)}</div>
            <div style={{ position: "absolute", left: 90, top: 140, width: 1100, height: 420, borderRadius: 26, border: "2px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.015)" }}>
              <div style={{ position: "absolute", left: 34, top: 30, display: "flex", alignItems: "center", gap: 16, fontFamily: FONT.body, fontSize: 34, color: C.text, opacity: 1 - typedOut }}>
                <span style={{ opacity: prog(t, 0.7, 0.3) }}>{Glyph.yt(44)}</span>
                <SoftType text="youtube.com/shorts/c1tyIn60s" at={0.85} cps={30} caret />
              </div>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: spin }}>
                <Spinner size={72} />
              </div>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: FONT.body, fontSize: 32, color: C.textSecondary, opacity: ready }}>Your report is ready</div>
            </div>
            <div style={{ position: "absolute", right: 40, bottom: 34, padding: "18px 40px", borderRadius: 18, background: C.accent, color: "#fff", fontFamily: FONT.body, fontWeight: 700, fontSize: 32, boxShadow: `0 0 30px rgba(${VIOLET},0.6)`, transform: `scale(${t >= 1.95 && t < 2.07 ? 0.94 : 1})` }}>Analyze</div>
          </div>
          {/* Collapsed result: the score bar */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 34, padding: "0 46px", opacity: result, filter: result < 0.99 ? `blur(${(1 - result) * 8}px)` : undefined }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 100, letterSpacing: "-0.04em", ...GRADIENT_TEXT }}>
              <Counter value={79} at={3.35} dur={1.0} suffix="×" />
            </div>
            <div style={{ fontFamily: FONT.body, lineHeight: 1.25 }}>
              <div style={{ fontSize: 26, color: C.text, fontWeight: 700 }}>outlier score</div>
              <div style={{ fontSize: 22, color: C.muted }}>4.1M views vs 52K median</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Histogram t={t} />
            </div>
          </div>
        </GlowCard>
      </div>
      {morph < 0.5 ? (
        <Hand
          path={[
            [1.35, 1560, 1120],
            [1.85, 1475, 885],
            [2.6, 1520, 960],
          ]}
          clicks={[1.95]}
        />
      ) : null}
    </Shot>
  );
}

/* ------------------------------------------------------------------ 4. Channel Tracker  (≈ AI Video Automation) */

function MiniArea({ t, at }: { t: number; at: number }) {
  const d = prog(t, at, 1.1, IN_OUT);
  const path = "M0 92 C30 90 50 86 80 80 S130 70 160 54 S210 20 240 8";
  return (
    <svg viewBox="0 0 240 100" preserveAspectRatio="none" style={{ width: "100%", height: 150, overflow: "visible" }}>
      <defs>
        <clipPath id="tr-clip">
          <rect x="-2" y="-10" width={244 * d} height="120" />
        </clipPath>
        <linearGradient id="tr-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath="url(#tr-clip)">
        <path d={`${path} V100 H0 Z`} fill="url(#tr-fill)" />
        <path d={path} stroke="#c4b5fd" strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function Bars({ t, at }: { t: number; at: number }) {
  const hs = [0.25, 0.32, 0.3, 0.45, 0.4, 0.62, 0.78, 1];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
      {hs.map((h, i) => {
        const p = prog(t, at + i * 0.06, 0.6, OUT);
        return <div key={i} style={{ flex: 1, height: `${h * 100 * p}%`, borderRadius: 6, background: i === hs.length - 1 ? "linear-gradient(180deg,#ddd6fe,#8b5cf6)" : `rgba(${LILAC},0.35)` }} />;
      })}
    </div>
  );
}

function StatCard({ children, i, t, at }: { children: ReactNode; i: number; t: number; at: number }) {
  const p = prog(t, at + i * 0.08, 0.85, OUT);
  const x = (i - 1) * 400;
  return (
    <div style={{ position: "absolute", left: 960 - 185 + x * p, top: 290 + (1 - p) * 40, transform: `rotate(${(1 - p) * (i - 1) * 8}deg) scale(${0.5 + 0.5 * p})`, opacity: Math.min(1, p * 2), filter: p < 0.99 ? `blur(${(1 - p) * 8}px)` : undefined, zIndex: i === 1 ? 2 : 1 }}>
      <GlowCard glow={0.85} radius={30} style={{ width: 370, height: 640, padding: 34, fontFamily: FONT.body, display: "flex", flexDirection: "column" }}>
        {children}
      </GlowCard>
    </div>
  );
}

export function Tracker({ dur }: { dur: number }) {
  const t = useTime();
  const inputsOut = prog(t, 1.4, 0.4, IN_OUT);
  const spin = prog(t, 1.45, 0.3) * (1 - prog(t, 2.05, 0.25, IN_OUT));
  const fan = 2.1;
  const titleMove = prog(t, 1.9, 0.6, IN_OUT);
  return (
    <Shot
      id="tracker"
      duration={dur}
      enter="blur"
      exit="blur"
      keys={[
        { t: 0, x: 850, y: 520, z: 1.22, rx: 8, ry: -16 },
        { t: 1.15, x: 1150, y: 680, z: 1.15, rx: 5, ry: -10 },
        { t: 1.75, x: 960, y: 560, z: 1.0, rx: 0, ry: 0 },
        { t: 4.0, x: 960, y: 560, z: 1.08, ry: 3 },
      ]}
    >
      <div style={{ position: "absolute", left: interpolate(titleMove, [0, 1], [1090, 960]), top: interpolate(titleMove, [0, 1], [118, 170]), transform: `translateX(-50%) scale(${1 - 0.15 * titleMove})` }}>
        <FeatureTitle accent="Channel" rest="Tracker" at={0.05} size={88} icon={<IconTile size={74}>{Glyph.chart(40)}</IconTile>} />
      </div>
      {inputsOut < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - inputsOut, transform: `scale(${1 - 0.6 * inputsOut})`, filter: inputsOut > 0 ? `blur(${inputsOut * 14}px)` : undefined, transformOrigin: "960px 560px" }}>
          <div style={{ ...abs(470, 220), ...ent(prog(t, 0.1, 0.7), 0, 30) }}>
            <DarkCard style={{ width: 1240, height: 150, display: "flex", alignItems: "center", gap: 20, padding: "0 38px", fontFamily: FONT.body, fontSize: 46, color: C.text }}>
              {Glyph.yt(56)}
              <SoftType text="youtube.com/@snacklab" at={0.3} cps={30} />
            </DarkCard>
          </div>
          <div style={{ ...abs(470, 430), ...ent(prog(t, 0.2, 0.7), 0, 40) }}>
            <DarkCard style={{ width: 1240, height: 470, padding: 40, fontFamily: FONT.body, fontSize: 40, color: C.muted }}>
              <SoftType text="Track views, subs and new Shorts every hour" at={0.75} cps={60} caret />
              <div style={{ position: "absolute", right: 34, bottom: 30, padding: "16px 40px", borderRadius: 16, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 32, boxShadow: `0 0 30px rgba(${VIOLET},0.6)`, opacity: prog(t, 0.9, 0.3), transform: `scale(${t >= 1.25 && t < 1.37 ? 0.93 : 1})` }}>Track</div>
            </DarkCard>
          </div>
          <Hand
            path={[
              [0.85, 1760, 1120],
              [1.2, 1610, 845],
              [1.6, 1640, 900],
            ]}
            clicks={[1.25]}
          />
        </div>
      ) : null}
      {spin > 0.001 ? (
        <div style={{ ...abs(960 - 150, 560 - 150), opacity: spin, transform: `scale(${0.8 + 0.2 * spin})` }}>
          <GlowCard glow={0.8} radius={30} style={{ width: 300, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <Spinner size={68} />
            <div style={{ fontFamily: FONT.body, fontSize: 24, color: C.textSecondary }}>Tracking channel</div>
          </GlowCard>
        </div>
      ) : null}
      {t >= fan - 0.05 ? (
        <>
          <StatCard i={0} t={t} at={fan}>
            <div style={{ fontSize: 28, color: C.muted }}>Views · 24h</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: C.good, marginTop: 6 }}>
              <Counter value={1.2} at={fan + 0.2} dur={1.2} decimals={1} prefix="+" suffix="M" />
            </div>
            <div style={{ marginTop: "auto" }}>
              <MiniArea t={t} at={fan + 0.2} />
            </div>
          </StatCard>
          <StatCard i={1} t={t} at={fan}>
            <div style={{ width: 120, height: 120, borderRadius: 99, background: "linear-gradient(135deg,#f0abfc,#7c3aed)", alignSelf: "center", marginTop: 30, boxShadow: `0 0 40px rgba(${VIOLET},0.6)` }} />
            <div style={{ textAlign: "center", marginTop: 28, fontSize: 34, fontWeight: 700, color: C.text }}>Snack Lab</div>
            <div style={{ textAlign: "center", fontSize: 22, color: C.muted, marginTop: 4 }}>cooking hacks · 11.8K subs</div>
            <div style={{ alignSelf: "center", marginTop: "auto", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: C.good, fontWeight: 700, fontSize: 22 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: C.good, boxShadow: `0 0 12px ${C.good}`, transform: `scale(${1 + 0.3 * Math.abs(Math.sin(t * 3))})` }} />
              Breaking out
            </div>
          </StatCard>
          <StatCard i={2} t={t} at={fan}>
            <div style={{ fontSize: 28, color: C.muted }}>Subs · 48h</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: C.good, marginTop: 6 }}>
              <Counter value={18.4} at={fan + 0.25} dur={1.2} decimals={1} prefix="+" suffix="K" />
            </div>
            <div style={{ marginTop: "auto" }}>
              <Bars t={t} at={fan + 0.25} />
            </div>
          </StatCard>
        </>
      ) : null}
    </Shot>
  );
}

/* ------------------------------------------------------------------ 5. Script Writer  (≈ AI Image Generation) */

const SCRIPT_CARDS = [
  { tag: "HOOK", text: "I gave myself 60 seconds to build an entire city…" },
  { tag: "BEATS", text: "Roads first. Then the skyline — watch the timer." },
  { tag: "PAYOFF", text: "Comment which district I should build next." },
];

export function Script({ dur }: { dur: number }) {
  const t = useTime();
  const formOut = prog(t, 1.7, 0.4, IN_OUT);
  const spin = prog(t, 1.75, 0.3) * (1 - prog(t, 2.3, 0.25, IN_OUT));
  const dropped = prog(t, 1.12, 0.35, OUT);
  // The dragged reference thumbnail rides with the hand until it's dropped.
  const drag = prog(t, 0.5, 0.6, IN_OUT);
  const dragX = interpolate(drag, [0, 1], [1600, 1010]);
  const dragY = interpolate(drag, [0, 1], [1100, 700]);
  return (
    <Shot
      id="script"
      duration={dur}
      enter="blur"
      exit="blur"
      keys={[
        { t: 0, x: 960, y: 500, z: 1.02, ry: -8 },
        { t: 1.1, x: 1000, y: 620, z: 1.08, ry: -3 },
        { t: 1.65, x: 1230, y: 470, z: 1.14, ry: 0 },
        { t: 2.3, x: 960, y: 580, z: 0.98, ry: 4 },
        { t: 4.0, x: 960, y: 570, z: 1.05, ry: -2 },
      ]}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", justifyContent: "center" }}>
        <FeatureTitle accent="Script" rest="Writer" at={0.05} size={84} icon={<IconTile size={74}>{Glyph.pen(40)}</IconTile>} />
      </div>
      {formOut < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - formOut, transform: `scale(${1 - 0.65 * formOut})`, filter: formOut > 0 ? `blur(${formOut * 14}px)` : undefined, transformOrigin: "960px 580px" }}>
          <div style={{ ...abs(540, 236), ...ent(prog(t, 0.08, 0.7), 0, 40) }}>
            <DarkCard style={{ width: 1000, height: 300, padding: "34px 40px", fontFamily: FONT.body, fontSize: 38, color: C.text }}>
              <SoftType text="Write a 40-second script like this Short" at={0.25} cps={40} caret />
              <div style={{ position: "absolute", right: 30, bottom: 28, width: 70, height: 70, borderRadius: 18, display: "grid", placeItems: "center", background: C.accent, boxShadow: `0 0 26px rgba(${VIOLET},0.7)`, transform: `scale(${t >= 1.55 && t < 1.67 ? 0.9 : 1})` }}>{Glyph.arrowUp(36)}</div>
            </DarkCard>
          </div>
          <div style={{ ...abs(540, 620), ...ent(prog(t, 0.16, 0.7), 0, 40) }}>
            <DarkCard dashed style={{ width: 1000, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: FONT.body, fontSize: 32, color: C.textSecondary, borderColor: `rgba(${LILAC},${0.16 + 0.5 * dropped})`, boxShadow: dropped > 0 ? `0 0 ${50 * dropped}px rgba(${VIOLET},${0.45 * dropped})` : undefined }}>
              {dropped < 0.5 ? (
                <>
                  {Glyph.film(44)}
                  <span>Add a reference Short (optional)</span>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: dropped }}>
                  <Thumb kind="city" hue={30} w={96} h={160} glow={0.6} />
                  <div>
                    <div style={{ color: C.text, fontSize: 30, fontWeight: 600 }}>I built a whole city in 60 seconds</div>
                    <div style={{ color: C.good, fontSize: 24, marginTop: 6 }}>4.1M views · 79× outlier</div>
                  </div>
                </div>
              )}
            </DarkCard>
          </div>
          {dropped < 1 && t >= 0.5 ? (
            <div style={{ ...abs(dragX - 50, dragY - 120), transform: `rotate(${(1 - drag) * 10 - 4}deg) scale(${1 - 0.3 * dropped})`, opacity: 1 - dropped }}>
              <Thumb kind="city" hue={30} w={100} h={170} glow={1} />
            </div>
          ) : null}
          <Hand
            path={[
              [0.5, 1640, 1110],
              [1.1, 1040, 710],
              [1.55, 1505, 470],
              [2.0, 1560, 560],
            ]}
            clicks={[1.12, 1.6]}
          />
        </div>
      ) : null}
      {spin > 0.001 ? (
        <div style={{ ...abs(960 - 140, 580 - 140), opacity: spin, transform: `scale(${0.8 + 0.2 * spin})` }}>
          <GlowCard glow={0.8} radius={28} style={{ width: 280, height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <Spinner size={64} />
            <div style={{ fontFamily: FONT.body, fontSize: 22, color: C.textSecondary }}>Writing your script…</div>
          </GlowCard>
        </div>
      ) : null}
      {SCRIPT_CARDS.map((c, i) => {
        const at = 2.35 + i * 0.1;
        const p = prog(t, at, 0.8, OUT);
        if (t < at - 0.05) return null;
        return (
          <div key={c.tag} style={{ ...abs(225 + i * 500, 340), ...ent(p, (1 - i) * 200, 60, 0.6) }}>
            <GlowCard glow={0.9} radius={30} style={{ width: 470, height: 420, padding: 40, fontFamily: FONT.body }}>
              <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: "0.1em", color: C.accentText }}>{c.tag}</div>
              <div style={{ marginTop: 26, fontSize: 42, lineHeight: 1.3, color: C.text, fontWeight: 500 }}>
                <SoftType text={c.text} at={at + 0.2} cps={55} />
              </div>
            </GlowCard>
          </div>
        );
      })}
    </Shot>
  );
}

/* ------------------------------------------------------------------ 6. Outlier Score  (≈ Caption Remover) */

export function Compare({ dur }: { dur: number }) {
  const t = useTime();
  const enter = prog(t, 0, 0.8, OUT);
  // The divider sweeps back and forth like the reference's before/after wipe.
  const d = interpolate(t, [0, 0.35, 1.15, 1.95, 2.8, 3.5], [0.92, 0.9, 0.12, 0.88, 0.1, 0.5], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const W = 640;
  const H = 910;
  const split = W * d;
  return (
    <Shot
      id="compare"
      duration={dur}
      enter="blur"
      exit="push"
      keys={[
        { t: 0, x: 1080, y: 560, z: 1.1, ry: -8 },
        { t: 1.4, x: 1000, y: 540, z: 1.02, ry: -2 },
        { t: 3.5, x: 980, y: 540, z: 1.07, ry: 2 },
      ]}
    >
      <div style={{ ...abs(390, 380) }}>
        <FeatureTitle accent="" rest="Outlier" at={0.15} size={96} />
        <div style={{ marginTop: 4 }}>
          <FeatureTitle accent="Score" rest="" at={0.27} size={96} icon={<IconTile size={70}>{Glyph.bolt(36)}</IconTile>} />
        </div>
      </div>
      <div style={{ ...abs(990, 85), ...ent(enter, 260, 0, 0.94) }}>
        <div style={{ position: "relative", width: W, height: H, borderRadius: 34, overflow: "hidden", border: `3px solid rgba(${LILAC},0.85)`, boxShadow: `0 0 30px rgba(${VIOLET},0.8), 0 0 110px rgba(${VIOLET},0.4)` }}>
          {/* Before: views only (right of the divider) */}
          <div style={{ position: "absolute", inset: 0 }}>
            <Thumb kind="city" hue={30} w={W} h={H} glow={0} style={{ borderRadius: 0, border: "none" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center" }}>
              <span style={{ padding: "12px 26px", borderRadius: 12, background: "rgba(0,0,0,0.65)", color: "#fff", fontFamily: FONT.body, fontWeight: 600, fontSize: 34 }}>4.1M views</span>
            </div>
            <span style={{ position: "absolute", right: 34, top: 34, padding: "10px 26px", borderRadius: 14, background: "rgba(255,255,255,0.92)", color: "#111", fontFamily: FONT.display, fontWeight: 800, fontSize: 46 }}>Before</span>
          </div>
          {/* After: the score overlay (left of the divider) */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${W - split}px 0 0)` }}>
            <Thumb kind="city" hue={30} w={W} h={H} glow={0} style={{ borderRadius: 0, border: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(${VIOLET},0.25), rgba(20,10,40,0.55))` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 170, letterSpacing: "-0.05em", color: "#fff", textShadow: `0 0 40px rgba(${VIOLET},0.9)` }}>79×</div>
              <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 34, color: "#fff" }}>its channel's median</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center" }}>
              <span style={{ padding: "12px 26px", borderRadius: 12, background: C.accent, color: "#fff", fontFamily: FONT.body, fontWeight: 700, fontSize: 32 }}>median 52K · this 4.1M</span>
            </div>
            <span style={{ position: "absolute", left: 34, top: 34, padding: "10px 26px", borderRadius: 14, background: C.accent, color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 46, boxShadow: `0 0 20px rgba(${VIOLET},0.7)` }}>After</span>
          </div>
          {/* Divider */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: split - 2, width: 4, background: "#ddd6fe", boxShadow: `0 0 20px rgba(${VIOLET},1)` }} />
        </div>
      </div>
    </Shot>
  );
}

/* ------------------------------------------------------------------ End card */

export function End({ dur }: { dur: number }) {
  const t = useTime();
  const a = prog(t, 0, 0.7, OUT);
  const b = prog(t, 0.3, 0.7, OUT);
  const out = prog(t, dur - 0.35, 0.35, IN_OUT);
  return (
    <Shot id="end" duration={dur} enter="push" exit="cut" keys={[{ t: 0, z: 0.94 }, { t: dur, z: 1.04 }]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, ...ent(a, 0, 30, 0.9) }}>
          <div style={{ borderRadius: 34, overflow: "hidden", boxShadow: `0 0 60px rgba(${VIOLET},0.7)` }}>
            <LogoMark size={150} />
          </div>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 160, letterSpacing: "-0.05em", color: C.text }}>Outlier</span>
        </div>
        <div style={{ marginTop: 46, padding: "22px 54px", borderRadius: 999, background: C.accent, color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 46, boxShadow: `0 0 70px rgba(${VIOLET},0.6)`, ...ent(b, 0, 30, 0.9) }}>useoutlier.online →</div>
      </AbsoluteFill>
    </Shot>
  );
}
