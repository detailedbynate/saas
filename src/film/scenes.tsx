import type { ReactNode } from "react";
import { Easing, Img, staticFile } from "remotion";
import { C, FONT } from "../theme";
import { ShortCard } from "../components/fx";
import { Glyph, IconTile, LILAC, LogoMark, Spinner, VIOLET } from "../components/kit";
import { ACCENT, Bloom, type Box, Button, Count, Face, GLIDE, GlowRect, Line, Pointer, Rise, SINE, SOFT, Stage, Title, Typing, p, useT } from "./kit";

/*
 * The film's nine scenes. Each is a few seconds, one idea, and moves the way the agreed
 * test scene does (see ./kit.tsx). `dur` is the scene's length in seconds; the last
 * quarter-second is the hand-off to the next scene.
 */

type SceneProps = { dur: number };

const icon = (glyph: ReactNode) => <IconTile size={52}>{glyph}</IconTile>;
const label = { fontFamily: FONT.body, color: "rgba(255,255,255,0.55)" } as const;

/* ------------------------------------------------------------------ 1. Prompt */

export function Prompt({ dur }: SceneProps) {
  const t = useT();
  const bar: Box = { x: 430, y: 486, w: 1060, h: 108 };
  const T = { bar: 0.05, type: 0.6, hand: 1.55, click: 2.15 };
  const sent = p(t, T.click, 0.5);
  return (
    <Stage t={t} dur={dur} push={0.45} amount={0.26} origin={[960, 540]}>
      <Bloom t={t} box={bar} at={T.bar} strength={0.6 + 0.4 * p(t, T.type, 1.2, SINE) + 0.5 * sent * (1 - sent) * 4} travel={200} wide={200} />
      <Rise t={t} at={T.bar} box={bar} from={260} tilt={34} rest={3} yaw={0} radius={54} ring={0.5 + 0.5 * p(t, T.type, 1.2, SINE)}>
        <Face radius={54}>
          <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: FONT.body, fontWeight: 500, fontSize: 36, color: C.text, letterSpacing: "-0.01em" }}>
            {t < T.type ? <span style={{ ...label, fontSize: 32, fontWeight: 400 }}>Ask Outlier anything …</span> : <Typing t={t} text="find breakout Shorts in minecraft" at={T.type} cps={24} />}
          </div>
          <div style={{ position: "absolute", right: 16, top: 16, width: 76, height: 76, borderRadius: 99, display: "grid", placeItems: "center", background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", boxShadow: `0 0 24px rgba(${VIOLET},0.7), inset 0 1px 0 rgba(255,255,255,0.3)`, transform: `scale(${t >= T.click && t < T.click + 0.14 ? 0.9 : 1})` }}>{Glyph.arrowUp(34)}</div>
        </Face>
      </Rise>
      <Pointer t={t} at={T.hand} click={T.click} x={bar.x + bar.w - 50} y={bar.y + 62} size={54} />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 2. Scanning */

export function Scan({ dur }: SceneProps) {
  const t = useT();
  const k = p(t, 0.02, 0.9);
  return (
    <Stage t={t} dur={dur} push={0} amount={0.14} creep={0.1} origin={[960, 540]}>
      <div style={{ position: "absolute", left: 960 - 44, top: 420, opacity: p(t, 0.02, 0.35, SOFT), transform: `translate(0px, ${(1 - k) * 30}px) scale(${0.6 + 0.4 * k})` }}>
        <Spinner size={88} />
      </div>
      <Title t={t} at={0.08} text="Scanning |millions of Shorts" y={590} size={56} stagger={0.09} lift={36} />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 3. Niche Finder */

const CLIPS = ["short-a", "hoops-1", "short-b", "hoops-2", "short-c", "hoops-3"];

export function NicheFinder({ dur }: SceneProps) {
  const t = useT();
  const w = 214;
  const h = 380;
  const cell = (i: number): Box => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return { x: 150 + col * (w + 22), y: 142 + row * (h + 22) + (col === 1 ? 44 : 0) - (col === 2 ? 20 : 0), w, h };
  };
  const T = { cards: 0.05, title: 0.55, count: 1.05 };
  const ck = p(t, T.count, 1.3);
  const csoft = p(t, T.count, 0.9, SOFT);
  return (
    <Stage t={t} dur={dur} push={1.1} amount={0.12} creep={0.06} origin={[700, 560]}>
      <Bloom t={t} box={{ x: 190, y: 220, w: 620, h: 660 }} at={T.cards + 0.2} strength={0.55} wide={260} />
      {CLIPS.map((clip, i) => (
        <Rise key={clip} t={t} at={T.cards + i * 0.08} box={cell(i)} from={300} tilt={32} rest={0} yaw={0} radius={16} blur={10}>
          <ShortCard clip={clip} w={w} h={h} flat />
        </Rise>
      ))}
      <Title t={t} at={T.title} text="Niche| Finder" x={1340} y={440} icon={icon(Glyph.eye(34))} size={70} />
      <div style={{ position: "absolute", left: 1340 - 300, top: 506, width: 600, textAlign: "center", opacity: p(t, T.count, 0.45, SOFT), filter: csoft < 0.995 ? `blur(${(1 - csoft) * 16}px)` : undefined, transform: `translate(${(1 - ck) * 50}px, ${(1 - ck) * 40}px)` }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 132, letterSpacing: "-0.03em", color: C.text, lineHeight: 1.1 }}>
          <Count t={t} at={T.count} dur={2.2} to={38} prefix="+" suffix="M" />
        </div>
        <div style={{ ...label, fontSize: 26, marginTop: 2 }}>views in this niche this week</div>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 4. Viral Videos */

export function ViralVideos({ dur }: SceneProps) {
  const t = useT();
  const w = 244;
  const h = 434;
  const gap = 34;
  const x0 = 960 - (4 * w + 3 * gap) / 2;
  const picks: [string, string][] = [
    ["hoops-2", "405×"],
    ["short-a", "151×"],
    ["hoops-3", "137×"],
    ["short-c", "98×"],
  ];
  const T = { title: 0.05, cards: 0.78, badges: 1.5 };
  return (
    <Stage t={t} dur={dur} push={1.4} amount={0.2} creep={0.06} origin={[960, 760]}>
      <Title t={t} at={T.title} text="Viral| Videos" icon={icon(Glyph.chart(30))} yPushed={250} pushAt={T.cards} />
      <Bloom t={t} box={{ x: x0 + 20, y: 380, w: 4 * w + 3 * gap - 40, h: h - 60 }} at={T.cards + 0.15} strength={0.6} wide={240} />
      {picks.map(([clip, mult], i) => {
        const b = p(t, T.badges + i * 0.12, 0.9);
        return (
          <Rise key={clip} t={t} at={T.cards + i * 0.08} box={{ x: x0 + i * (w + gap), y: 344 + (i % 2 ? 26 : 0), w, h }} from={420} tilt={36} rest={3} yaw={0} radius={16} blur={12}>
            <ShortCard clip={clip} w={w} h={h} flat />
            <div style={{ position: "absolute", left: 14, bottom: 14, padding: "8px 18px", borderRadius: 999, background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 34, letterSpacing: "-0.02em", opacity: Math.min(1, b * 3), transform: `translate(0px, ${(1 - b) * 26}px) scale(${0.6 + 0.4 * b})`, transformOrigin: "0% 100%" }}>{mult}</div>
          </Rise>
        );
      })}
    </Stage>
  );
}

/* ------------------------------------------------------------------ 5. Analyze Video */

export function AnalyzeVideo({ dur }: SceneProps) {
  const t = useT();
  const card: Box = { x: 506, y: 403, w: 908, h: 504 };
  const T = { title: 0.15, card: 0.78, push: 1.45, type: 1.9, hand: 2.45, click: 3.25, result: 4.05 };
  const lit = 0.45 + 0.55 * p(t, T.push, 1.6, SINE);
  const busy = p(t, T.click + 0.1, 0.6) * (1 - p(t, T.result - 0.1, 0.35, SOFT));
  const rk = p(t, T.result, 1.2);
  const rsoft = p(t, T.result, 0.8, SOFT);
  return (
    <Stage t={t} dur={dur} push={T.push} amount={0.22} creep={0.06}>
      <Title t={t} at={T.title} text="Analyze| Any Video" icon={icon(Glyph.chart(30))} yPushed={354} pushAt={T.card} />
      <Bloom t={t} box={card} at={T.card} strength={lit + 0.35 * p(t, T.result, 0.8, SOFT)} />
      <Rise t={t} at={T.card} box={card} ring={lit}>
        <Face>
          <div style={{ position: "absolute", left: 34, top: 26, width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.05)", display: "grid", placeItems: "center" }}>
            <LogoMark size={28} />
          </div>
          <div style={{ position: "absolute", right: 38, top: 34, opacity: 0.85 }}>{Glyph.bell(26)}</div>
          <div style={{ position: "absolute", left: 34, right: 34, top: 96, bottom: 104, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.025)" }}>
            <div style={{ position: "absolute", left: 28, top: 24, fontFamily: FONT.body, opacity: 1 - p(t, T.click + 0.1, 0.6) }}>
              {t >= T.type ? (
                <span style={{ fontSize: 30, fontWeight: 500, color: C.text, letterSpacing: "-0.01em" }}>
                  <Typing t={t} text="youtube.com/shorts/x7Kq2" at={T.type} />
                </span>
              ) : (
                <span style={{ ...label, fontSize: 17 }}>Paste any Short link to see why it went viral …</span>
              )}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: busy, transform: `scale(${0.7 + 0.3 * busy})` }}>
              <Spinner size={72} />
            </div>
            {/* The answer: one big number. */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p(t, T.result, 0.45, SOFT), filter: rsoft < 0.995 ? `blur(${(1 - rsoft) * 14}px)` : undefined, transform: `translate(0px, ${(1 - rk) * 40}px) scale(${0.86 + 0.14 * rk})` }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 150, letterSpacing: "-0.03em", lineHeight: 1, color: C.text }}>
                <Count t={t} at={T.result} dur={1.2} from={1} to={79} suffix="×" />
              </div>
              <div style={{ ...label, fontSize: 22, marginTop: 8 }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>outlier score</span> · 4.1M views vs a 52K median
              </div>
            </div>
          </div>
          <Button pressed={t >= T.click && t < T.click + 0.14} style={{ position: "absolute", right: 34, bottom: 30 }}>
            Analyze video
          </Button>
        </Face>
      </Rise>
      <Pointer t={t} at={T.hand} click={T.click} x={card.x + card.w - 100} y={card.y + card.h - 52} />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 6. Tracked Channels */

function Stat({ t, at, title, value, children }: { t: number; at: number; title: string; value?: ReactNode; children?: ReactNode }) {
  return (
    <Face radius={24}>
      <div style={{ position: "absolute", left: 28, top: 26, ...label, fontSize: 19 }}>{title}</div>
      {value ? <div style={{ position: "absolute", left: 28, top: 58, fontFamily: FONT.display, fontWeight: 800, fontSize: 64, letterSpacing: "-0.03em", color: C.text, opacity: p(t, at + 0.35, 0.5, SOFT) }}>{value}</div> : null}
      {children}
    </Face>
  );
}

export function TrackedChannels({ dur }: SceneProps) {
  const t = useT();
  const w = 330;
  const h = 410;
  const gap = 36;
  const x0 = 960 - (3 * w + 2 * gap) / 2;
  const T = { title: 0.05, cards: 0.78 };
  const box = (i: number): Box => ({ x: x0 + i * (w + gap), y: 372 + (i === 1 ? -22 : 0), w, h });
  const at = (i: number) => T.cards + i * 0.1;
  const draw = p(t, at(0) + 0.5, 1.6, Easing.bezier(0.3, 0, 0.2, 1));
  const live = p(t, at(1) + 0.5, 0.9);
  return (
    <Stage t={t} dur={dur} push={1.45} amount={0.2} creep={0.06} origin={[960, 760]}>
      <Title t={t} at={T.title} text="Tracked| Channels" icon={icon(Glyph.bell(30))} yPushed={250} pushAt={T.cards} />
      <Bloom t={t} box={{ x: x0 + 20, y: 400, w: 3 * w + 2 * gap - 40, h: h - 60 }} at={T.cards + 0.15} strength={0.7} wide={240} />
      <Rise t={t} at={at(0)} box={box(0)} radius={24} ring={0.5} tilt={36} rest={3} yaw={0}>
        <Stat t={t} at={at(0)} title="Views · 24h" value={<Count t={t} at={at(0) + 0.4} dur={1.8} to={1.2} decimals={1} prefix="+" suffix="M" />}>
          <svg width={w - 56} height={170} viewBox="0 0 274 170" style={{ position: "absolute", left: 28, bottom: 30 }}>
            <path d="M2 160 C 70 156, 110 140, 150 108 S 230 30, 272 8" fill="none" stroke={ACCENT} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          </svg>
        </Stat>
      </Rise>
      <Rise t={t} at={at(1)} box={box(1)} radius={24} ring={0.5} tilt={36} rest={3} yaw={0}>
        <Stat t={t} at={at(1)} title="Tracking">
          <div style={{ position: "absolute", left: 0, right: 0, top: 88, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 120, height: 120, borderRadius: 99, background: "linear-gradient(160deg, #c4b5fd, #7c3aed)", boxShadow: `0 0 30px rgba(${VIOLET},0.7)` }} />
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: C.text, letterSpacing: "-0.02em" }}>Snack Lab</div>
            <div style={{ padding: "8px 18px", borderRadius: 999, background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.45)", color: "#6ee7b7", fontFamily: FONT.body, fontWeight: 700, fontSize: 19, opacity: Math.min(1, live * 3), transform: `scale(${0.7 + 0.3 * live})` }}>● Breaking out</div>
          </div>
        </Stat>
      </Rise>
      <Rise t={t} at={at(2)} box={box(2)} radius={24} ring={0.5} tilt={36} rest={3} yaw={0}>
        <Stat t={t} at={at(2)} title="Subscribers · 48h" value={<Count t={t} at={at(2) + 0.4} dur={1.8} to={17.6} decimals={1} prefix="+" suffix="K" />}>
          <div style={{ position: "absolute", left: 28, right: 28, bottom: 30, height: 170, display: "flex", alignItems: "flex-end", gap: 12 }}>
            {[0.22, 0.3, 0.27, 0.42, 0.55, 0.74, 1].map((v, i) => (
              <div key={i} style={{ flex: 1, height: 170 * v, borderRadius: 7, background: i === 6 ? "linear-gradient(180deg, #c4b5fd, #8b5cf6)" : `rgba(${LILAC},0.28)`, transformOrigin: "50% 100%", transform: `scaleY(${p(t, at(2) + 0.45 + i * 0.07, 1.1)})` }} />
            ))}
          </div>
        </Stat>
      </Rise>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 7. The dashboard */

export function Dashboard({ dur }: SceneProps) {
  const t = useT();
  const win: Box = { x: 250, y: 338, w: 1420, h: 704 };
  const T = { title: 0.05, win: 0.78 };
  return (
    <Stage t={t} dur={dur} push={1.5} amount={0.16} creep={0.06} origin={[960, 720]}>
      <Title t={t} at={T.title} text="Everything| in one place" yPushed={226} pushAt={T.win} size={66} />
      <Bloom t={t} box={win} at={T.win} strength={0.75} wide={280} />
      <Rise t={t} at={T.win} box={win} from={520} tilt={42} rest={6} yaw={0} radius={22} ring={0.8}>
        <Face radius={22}>
          <Img src={staticFile("footage/app-0.5.png")} style={{ position: "absolute", left: 0, top: 0, width: win.w, height: win.h, objectFit: "cover" }} />
        </Face>
      </Rise>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 8. Tagline */

export function Tagline({ dur }: SceneProps) {
  const t = useT();
  return (
    <Stage t={t} dur={dur} push={0} amount={0.1} creep={0.08} origin={[960, 540]}>
      <Title t={t} at={0.05} text="Stop guessing." y={476} size={118} lift={44} />
      <Title t={t} at={0.75} text="Find the |outliers." y={622} size={118} lift={44} />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 9. End card */

export function End({ dur }: SceneProps) {
  const t = useT();
  const k = p(t, 0.05, 1.4);
  const soft = p(t, 0.05, 0.9, SOFT);
  const pill: Box = { x: 960 - 230, y: 612, w: 460, h: 84 };
  const fade = p(t, dur - 0.35, 0.35, Easing.in(Easing.quad));
  return (
    <Stage t={t} dur={dur} push={0} amount={0.09} creep={0.07} origin={[960, 540]} exit={false}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - fade }}>
        <GlowRect x={760} y={420} w={400} h={120} spread={420} rgb="109,40,217" a={0.45 * p(t, 0.1, 1.2, SOFT)} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 388, height: 150, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          <div style={{ opacity: p(t, 0.05, 0.45, SOFT), filter: soft < 0.995 ? `blur(${(1 - soft) * 16}px)` : undefined, transform: `translate(${(1 - k) * -40}px, ${(1 - k) * 30}px) scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -14}deg)` }}>
            <LogoMark size={132} />
          </div>
          <Line t={t} at={0.22} text="Outlier" size={150} weight={800} />
        </div>
        <Rise t={t} at={0.8} box={pill} from={160} tilt={30} rest={0} yaw={0} radius={42} blur={10}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 42, display: "grid", placeItems: "center", background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3)`, fontFamily: FONT.body, fontWeight: 700, fontSize: 34, color: "#fff", letterSpacing: "-0.01em" }}>useoutlier.online →</div>
        </Rise>
      </div>
    </Stage>
  );
}

// Re-exported so a single scene can be previewed on its own.
export const SCENES = { Prompt, Scan, NicheFinder, ViralVideos, AnalyzeVideo, TrackedChannels, Dashboard, Tagline, End };
export { GLIDE };
