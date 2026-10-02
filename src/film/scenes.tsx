import type { ReactNode } from "react";
import { Easing, Img, staticFile } from "remotion";
import { C, FONT } from "../theme";
import { ShortCard } from "../components/fx";
import {
  Glyph,
  IconTile,
  LILAC,
  LogoMark,
  Spinner,
  VIOLET,
} from "../components/kit";
import {
  ACCENT,
  Arrow,
  Bloom,
  type Box,
  Button,
  Count,
  Face,
  GLIDE,
  GlowIn,
  GlowRect,
  Guides,
  Pointer,
  Rise,
  SINE,
  SOFT,
  Sparkle,
  Stage,
  Streaks,
  Title,
  Typing,
  WordIn,
  p,
  useT,
} from "./kit";

/*
 * The film's nine scenes. Each is a few seconds and one idea. Entrances, cards and the camera
 * move the way the agreed test scene does; the hook, the name reveal, the dropdown zoom, the
 * decoded words, sparkles, streaks and glow-in numbers come from the isaacedits showreel (see ./kit.tsx). `dur` is the scene's length in seconds; the last
 * quarter-second is the hand-off to the next scene.
 */

type SceneProps = { dur: number };

const icon = (glyph: ReactNode) => <IconTile size={52}>{glyph}</IconTile>;
const label = {
  fontFamily: FONT.body,
  color: "rgba(255,255,255,0.55)",
} as const;

/* ------------------------------------------------------------------ 1. Hook: among a wall of Shorts, a phrase gets selected and swapped, and one Short lights up */

const SELECT = "linear-gradient(90deg, #c4b5fd 0%, #f0abfc 55%, #fcd34d 100%)";

/** The wall: dim, out-of-focus Shorts drifting upward at different speeds around the headline. [clip, x, y, width, speed] */
const WALL: [string, number, number, number, number][] = [
  ["short-a", 150, 190, 190, 1.0],
  ["hoops-1", 420, 760, 170, 0.6],
  ["short-b", 60, 660, 150, 0.8],
  ["hoops-2", 1590, 640, 190, 0.9],
  ["short-c", 1330, 800, 160, 0.55],
  ["hoops-3", 1180, 60, 130, 0.7],
];
const STAR: Box = { x: 1560, y: 96, w: 168, h: 298 }; // the one that breaks out

export function Hook({ dur }: SceneProps) {
  const t = useT();
  const T = { words: 0.1, select: 1.0, swap: 1.5, tail: 2.05 };
  const wipe = p(t, T.select, 0.5, Easing.bezier(0.4, 0, 0.2, 1)); // the selection sweeps across the phrase
  const roll = p(t, T.swap, 1.0); // old phrase rolls up and out…
  const rollSoft = p(t, T.swap, 0.45, SOFT);
  const rollIn = p(t, T.swap + 0.2, 1.0); // …the new word rolls in a beat behind
  const inSoft = p(t, T.swap + 0.2, 0.55, SOFT);
  const frame = p(t, T.swap + 0.45, 0.9); // the selection box draws on
  const tick = p(t, T.select + 0.3, 0.6);
  const lit = p(t, T.swap + 0.15, 1.2); // the breakout Short comes into focus as "outliers" lands
  const litSoft = p(t, T.swap + 0.15, 0.7, SOFT);
  const badge = p(t, T.swap + 0.55, 0.9);
  const handle = (left: boolean, top: boolean) => (
    <span style={{ position: "absolute", width: 12, height: 12, background: "#fff", border: `2px solid ${ACCENT}`, left: left ? -8 : undefined, right: left ? undefined : -8, top: top ? -8 : undefined, bottom: top ? undefined : -8, transform: `scale(${p(t, T.swap + 0.45 + (left ? 0 : 0.45), 0.5)})` }} />
  );
  return (
    <Stage t={t} dur={dur} push={0.2} amount={0.12} creep={0.07} origin={[960, 560]}>
      {/* the wall of Shorts, out of focus */}
      {WALL.map(([clip, x, y, w, v], i) => {
        const k = p(t, 0.05 + i * 0.07, 1.4);
        return (
          <div key={clip} style={{ position: "absolute", left: x, top: y, opacity: 0.26 * p(t, 0.05 + i * 0.07, 0.7, SOFT), filter: "blur(5px)", transform: `translate(0px, ${(1 - k) * 120 - t * 26 * v}px) rotate(${(i % 2 ? 1 : -1) * 3}deg)` }}>
            <ShortCard clip={clip} w={w} h={w * 1.78} flat />
          </div>
        );
      })}
      {/* the one that breaks out */}
      <GlowRect x={STAR.x + 30} y={STAR.y + 30 - t * 8} w={STAR.w - 60} h={STAR.h - 60} spread={150} a={0.75 * litSoft} />
      <div style={{ position: "absolute", left: STAR.x, top: STAR.y, opacity: 0.26 + 0.74 * litSoft, filter: litSoft < 0.995 ? `blur(${(1 - litSoft) * 5}px)` : undefined, transform: `translate(0px, ${(1 - p(t, 0.3, 1.4)) * 120 - t * 8}px) rotate(${3 - 3 * lit}deg) scale(${1 + 0.12 * lit})` }}>
        <ShortCard clip="mc-3" w={STAR.w} h={STAR.h} flat />
        <div style={{ position: "absolute", left: 12, bottom: 12, padding: "6px 16px", borderRadius: 999, background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", opacity: Math.min(1, badge * 3), transform: `translate(0px, ${(1 - badge) * 22}px) scale(${0.6 + 0.4 * badge})`, transformOrigin: "0% 100%" }}>62×</div>
      </div>

      {/* the headline */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: 420, height: 180, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 118, letterSpacing: "-0.035em", color: C.text, whiteSpace: "pre" }}>
        <WordIn t={t} at={T.words}>
          Find
        </WordIn>
        <span style={{ display: "inline-grid", position: "relative" }}>
          {/* keeps the slot as wide as the old phrase, then lets it close up smoothly to the new word */}
          <span style={{ gridArea: "1 / 1", visibility: "hidden", fontSize: `${1 - 0.7 * roll}em`, lineHeight: 0 }}>trending Shorts</span>
          {roll < 1 ? (
            <span style={{ position: "absolute", left: 0, top: 0, opacity: 1 - rollSoft, transform: `translate(0px, ${-0.5 * roll}em)`, filter: rollSoft > 0.005 ? `blur(${rollSoft * 14}px)` : undefined }}>
              <span style={{ display: "inline-block", clipPath: `inset(-30% 0 -30% ${wipe * 100}%)` }}>
                <WordIn t={t} at={T.words + 0.13}>
                  trending
                </WordIn>
                <WordIn t={t} at={T.words + 0.26}>
                  Shorts
                </WordIn>
              </span>
              <span style={{ position: "absolute", left: 0, top: 0, clipPath: `inset(-30% ${100 - wipe * 100}% -30% 0)`, background: SELECT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                <span style={{ display: "inline-block", marginRight: "0.26em" }}>trending</span>
                <span style={{ display: "inline-block" }}>Shorts</span>
              </span>
              {tick > 0 && tick < 1
                ? [-1, 1].map((d) => <span key={d} style={{ position: "absolute", left: "46%", top: -40, width: 10, height: 40, borderRadius: 9, background: "#fff", opacity: 1 - tick, transform: `translate(${d * 44}px, ${-tick * 30}px) rotate(${d * 22}deg) scaleY(${1 - 0.5 * tick})`, boxShadow: "0 0 16px 3px rgba(255,255,255,0.8)" }} />)
                : null}
            </span>
          ) : null}
          <span style={{ gridArea: "1 / 1", justifySelf: "start", position: "relative", padding: "0 18px", color: "#c4b5fd", opacity: inSoft, transform: `translate(0px, ${0.5 * (1 - rollIn)}em)`, filter: inSoft < 0.995 ? `blur(${(1 - inSoft) * 14}px)` : undefined }}>
            <span style={{ position: "absolute", inset: "14px 0", border: `2px solid ${ACCENT}`, clipPath: `inset(-10px ${(1 - frame) * 100}% -10px -10px)` }} />
            <span style={{ position: "absolute", inset: "14px 0" }}>
              {handle(true, true)}
              {handle(true, false)}
              {handle(false, true)}
              {handle(false, false)}
            </span>
            outliers
          </span>
        </span>
      </div>
      <Title t={t} at={T.tail} text="before they blow up." y={668} size={64} lift={30} stagger={0.1} />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 2. Introducing: the name lands */

export function Intro({ dur }: SceneProps) {
  const t = useT();
  const T = { label: 0.05, name: 0.4, sub: 1.2 };
  const k = p(t, T.name, 1.2);
  const soft = p(t, T.name, 0.7, SOFT);
  return (
    <Stage t={t} dur={dur} push={0.3} amount={0.14} creep={0.08} origin={[960, 540]}>
      <Streaks t={t} at={T.name - 0.15} count={7} seed={11} />
      <Guides t={t} at={T.name} ys={[430, 590]} xs={[572, 1348]} out={T.name + 1.2} />
      <GlowRect x={760} y={450} w={400} h={110} spread={420} rgb="109,40,217" a={0.42 * p(t, T.name, 1.2, SOFT)} />
      <Title t={t} at={T.label} text="Introducing" y={368} size={46} lift={26} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 430, height: 160, display: "flex", justifyContent: "center", alignItems: "center", gap: 26, fontFamily: FONT.display, fontWeight: 800, fontSize: 168, letterSpacing: "-0.03em", color: C.text }}>
        <div style={{ opacity: p(t, T.name, 0.3, SOFT), filter: soft < 0.995 ? `blur(${(1 - soft) * 16}px)` : undefined, transform: `translate(0px, ${(1 - k) * -40}px) scale(${1.3 - 0.3 * k}) rotate(${(1 - k) * -16}deg)` }}>
          <LogoMark size={140} />
        </div>
        <GlowIn t={t} at={T.name + 0.08} text="Outlier" stagger={0.06} />
      </div>
      <Title t={t} at={T.sub} text="The outlier finder for |YouTube Shorts" y={672} size={52} lift={30} stagger={0.09} />
      <Sparkle t={t} at={T.name + 0.15} x={500} y={610} size={84} seed={1} />
      <Sparkle t={t} at={T.name + 0.3} x={1424} y={410} size={66} seed={2} />
      <Sparkle t={t} at={T.name + 0.45} x={1400} y={660} size={44} seed={3} color="#f0abfc" />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 3. Niche Finder: search, then the real report (figures from the app's own Minecraft report) */

const MONEY: [string, string, string][] = [
  ["Est. RPM", "$0.14–$0.54", "Shorts $0.02–$0.06 per 1K views"],
  ["Typical channel / month", "~$383–$1.5K", "2.7M views a month"],
  ["Top channel / month", "~$17K–$64K", "117.4M views a month"],
];
const TOP: [string, number][] = [
  ["Mods", 64],
  ["Lifesteal SMP", 58],
  ["Hardcore", 53],
];
const MODS: [string, string, string?][] = [
  ["Demand", "High · 36K/day"],
  ["Avg views", "928.9K"],
  ["Growth", "+24%", "#6ee7b7"],
  ["Viral frequency", "19%", "#6ee7b7"],
];

function Panel({ t, at, box, children, from = 260 }: { t: number; at: number; box: Box; children?: ReactNode; from?: number }) {
  return (
    <Rise t={t} at={at} box={box} from={from} tilt={26} rest={0} yaw={0} radius={22} blur={10} dur={1.3}>
      <Face radius={22}>{children}</Face>
    </Rise>
  );
}

export function NicheFinder({ dur }: SceneProps) {
  const t = useT();
  const bar: Box = { x: 460, y: 470, w: 1000, h: 104 };
  const T = { title: 0.05, bar: 0.78, type: 1.35, hand: 1.75, click: 2.45, go: 2.5, money: 2.75, top: 3.3, pick: 5.05, mods: 5.1 };
  const go = p(t, T.go, 1.4); // the bar travels to the top as the report rises under it
  const lift = -292 * go;
  // Camera: in on the bar while it is typed into, back out as the report arrives, then a slow creep.
  const zoom = 1 + 0.42 * p(t, 1.2, 1.2, Easing.bezier(0.4, 0, 0.2, 1)) - 0.34 * p(t, T.click + 0.05, 1.5) + 0.022 * Math.max(0, t - 3.4);
  const rowY = (i: number) => 584 + i * 100;
  const hover = t < 4.05 ? -1 : t < 4.45 ? 2 : t < 4.8 ? 1 : 0;
  const ring = p(t, T.mods + 0.25, 1.5, Easing.bezier(0.3, 0, 0.2, 1));
  const R = 78;
  const C2 = 2 * Math.PI * R;
  return (
    <Stage t={t} dur={dur} push={0} amount={0} creep={0} origin={[960, 540]}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 525px", transform: `scale(${zoom})` }}>
        <div style={{ opacity: 1 - p(t, T.go, 0.5, SOFT), transform: `translate(0px, ${lift * 0.5}px)` }}>
          <Title t={t} at={T.title} text="Niche| Finder" icon={icon(Glyph.eye(34))} yPushed={356} pushAt={T.bar} />
        </div>

        <div style={{ position: "absolute", inset: 0, transform: `translate(0px, ${lift}px)` }}>
          <Bloom t={t} box={bar} at={T.bar} strength={0.7 - 0.3 * go} travel={220} wide={200} />
          <Rise t={t} at={T.bar} box={bar} from={320} tilt={36} rest={0} yaw={0} radius={26} ring={0.6}>
            <Face radius={26}>
              <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 20, fontFamily: FONT.body, fontWeight: 500, fontSize: 34, color: C.text }}>
                <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.6-3.6" />
                </svg>
                {t < T.type ? <span style={{ ...label, fontWeight: 400 }}>Ask for a topic …</span> : <Typing t={t} text="minecraft" at={T.type} cps={14} hold={0.5} />}
              </div>
              <Button pressed={t >= T.click && t < T.click + 0.14} style={{ position: "absolute", right: 22, top: 22, height: 60, fontSize: 22, padding: "0 30px" }}>
                Research
              </Button>
            </Face>
          </Rise>
          <div style={{ position: "absolute", left: bar.x + 8, top: bar.y + bar.h + 16, ...label, fontSize: 20, opacity: p(t, T.go + 0.5, 0.6, SOFT) }}>
            <span style={{ color: ACCENT, fontWeight: 700 }}>From Outlier data</span> · 1.3K videos from 105 channels
          </div>
        </div>

        {/* Money in the niche */}
        {MONEY.map(([name, value, sub], i) => (
          <Panel key={name} t={t} at={T.money + i * 0.09} box={{ x: 260 + i * 473, y: 320, w: 453, h: 172 }}>
            <div style={{ position: "absolute", left: 26, top: 22, ...label, fontSize: 19 }}>{name}</div>
            <div style={{ position: "absolute", left: 26, top: 54, fontFamily: FONT.display, fontWeight: 800, fontSize: 48, letterSpacing: "-0.03em", color: "#6ee7b7", whiteSpace: "nowrap" }}>
              <GlowIn t={t} at={T.money + 0.3 + i * 0.12} text={value} stagger={0.035} glow="52,211,153" />
            </div>
            <div style={{ position: "absolute", left: 26, top: 124, ...label, fontSize: 17, opacity: p(t, T.money + 0.7 + i * 0.12, 0.6, SOFT) }}>{sub}</div>
          </Panel>
        ))}

        {/* Top niches: rows unroll, the cursor walks up them and opens #1 */}
        <Panel t={t} at={T.top} box={{ x: 260, y: 512, w: 640, h: 392 }}>
          <div style={{ position: "absolute", left: 28, top: 22, fontFamily: FONT.display, fontWeight: 700, fontSize: 26, color: C.text }}>
            Top 3 niches in <span style={{ color: ACCENT }}>Minecraft</span>
          </div>
        </Panel>
        {TOP.map(([name, score], i) => {
          const k = p(t, T.top + 0.3 + i * 0.1, 1.0);
          const on = hover === i || (i === 0 && t >= T.pick);
          return (
            <div key={name} style={{ position: "absolute", left: 280, top: rowY(i), width: 600, height: 88, borderRadius: 16, background: on ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,${on ? 0.28 : 0.08})`, display: "flex", alignItems: "center", padding: "0 24px", gap: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: 32, color: C.text, opacity: Math.min(1, k * 2), transform: `translate(0px, ${(1 - k) * -26}px)` }}>
              <span style={{ ...label, fontSize: 22, fontWeight: 700 }}>#{i + 1}</span>
              {name}
              <span style={{ marginLeft: "auto", width: 64, height: 52, borderRadius: 12, border: `1.5px solid ${ACCENT}`, color: "#c4b5fd", display: "grid", placeItems: "center", fontSize: 28 }}>
                <Count t={t} at={T.top + 0.5 + i * 0.1} dur={1.2} to={score} />
              </span>
            </div>
          );
        })}

        {/* Inside the top niche */}
        <Panel t={t} at={T.mods} box={{ x: 920, y: 512, w: 740, h: 392 }} from={200}>
          <div style={{ position: "absolute", left: 30, top: 24, ...label, fontSize: 17, letterSpacing: "0.12em" }}>INSIDE MINECRAFT</div>
          <div style={{ position: "absolute", left: 30, top: 50, fontFamily: FONT.display, fontWeight: 800, fontSize: 60, letterSpacing: "-0.03em", color: "#c4b5fd" }}>
            <GlowIn t={t} at={T.mods + 0.2} text="Mods" stagger={0.06} />
          </div>
          <div style={{ position: "absolute", left: 30, top: 130, ...label, fontSize: 20, opacity: p(t, T.mods + 0.5, 0.6, SOFT) }}>Growing fast · views/day up 24% · High confidence</div>
          <svg width={200} height={200} viewBox="-100 -100 200 200" style={{ position: "absolute", right: 30, top: 22 }}>
            <circle r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} />
            <circle r={R} fill="none" stroke={ACCENT} strokeWidth={12} strokeLinecap="round" strokeDasharray={C2} strokeDashoffset={C2 * (1 - 0.64 * ring)} transform="rotate(-90)" />
          </svg>
          <div style={{ position: "absolute", right: 30, top: 22, width: 200, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 62, color: C.text, lineHeight: 1 }}>
            <Count t={t} at={T.mods + 0.25} dur={1.5} to={64} />
            <span style={{ ...label, fontSize: 13, letterSpacing: "0.14em", fontWeight: 500, marginTop: 4 }}>OPPORTUNITY</span>
          </div>
          {MODS.map(([name, value, color], i) => {
            const k = p(t, T.mods + 0.55 + i * 0.09, 1.0);
            return (
              <div key={name} style={{ position: "absolute", left: 30 + (i % 2) * 250, top: 196 + Math.floor(i / 2) * 92, opacity: Math.min(1, k * 2), transform: `translate(0px, ${(1 - k) * 22}px)` }}>
                <div style={{ ...label, fontSize: 18 }}>{name}</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 32, color: color ?? C.text, letterSpacing: "-0.02em" }}>{value}</div>
              </div>
            );
          })}
        </Panel>

        <Arrow
          t={t}
          size={36}
          clicks={[T.click, T.pick]}
          path={[
            [T.hand, bar.x + 640, bar.y + 330],
            [T.click, bar.x + bar.w - 110, bar.y + 56],
            [3.4, bar.x + bar.w - 110, bar.y + 56],
            [4.1, 700, rowY(2) + 50],
            [4.45, 690, rowY(1) + 50],
            [4.8, 680, rowY(0) + 50],
            [6.2, 680, rowY(0) + 50],
            [7.4, 760, rowY(0) + 130],
          ]}
        />
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
  // Real uploads and multipliers from the app's "Mods" report.
  const picks: [string, string, string, string][] = [
    ["mc-3", "62×", "1.6M views", "GalaxiHD"],
    ["mc-0", "25.5×", "1.5M views", "Dzyxvufy Louminterx"],
    ["mc-1", "7.5×", "5.4M views", "FalseChrono"],
    ["mc-2", "4.9×", "8.7M views", "kryvix"],
  ];
  const T = { title: 0.05, cards: 0.78, badges: 1.5 };
  return (
    <Stage
      t={t}
      dur={dur}
      push={1.4}
      amount={0.2}
      creep={0.06}
      origin={[960, 760]}
    >
      <Streaks t={t} at={T.cards - 0.1} count={6} seed={3} />
      <Title
        t={t}
        at={T.title}
        text="Viral| Videos"
        icon={icon(Glyph.chart(30))}
        yPushed={250}
        pushAt={T.cards}
      />
      <Bloom
        t={t}
        box={{ x: x0 + 20, y: 380, w: 4 * w + 3 * gap - 40, h: h - 60 }}
        at={T.cards + 0.15}
        strength={0.6}
        wide={240}
      />
      {picks.map(([clip, mult, views, channel], i) => {
        const b = p(t, T.badges + i * 0.12, 0.9);
        return (
          <Rise
            key={clip}
            t={t}
            at={T.cards + i * 0.08}
            box={{ x: x0 + i * (w + gap), y: 344 + (i % 2 ? 26 : 0), w, h }}
            from={420}
            tilt={36}
            rest={3}
            yaw={0}
            radius={16}
            blur={12}
          >
            <ShortCard clip={clip} w={w} h={h} flat />
            <div style={{ position: "absolute", left: 12, top: 12, padding: "5px 12px", borderRadius: 999, background: "rgba(0,0,0,0.7)", color: "#fff", fontFamily: FONT.body, fontWeight: 700, fontSize: 17, opacity: p(t, T.badges + i * 0.12 - 0.2, 0.5, SOFT) }}>{views}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: h + 12, textAlign: "center", ...label, fontSize: 22, whiteSpace: "nowrap", opacity: p(t, T.badges + i * 0.12, 0.6, SOFT) }}>{channel}</div>
            <div
              style={{
                position: "absolute",
                left: 14,
                bottom: 14,
                padding: "8px 18px",
                borderRadius: 999,
                background: "linear-gradient(180deg, #8b5cf6, #6d28d9)",
                color: "#fff",
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: "-0.02em",
                opacity: Math.min(1, b * 3),
                transform: `translate(0px, ${(1 - b) * 26}px) scale(${0.6 + 0.4 * b})`,
                transformOrigin: "0% 100%",
              }}
            >
              {mult}
            </div>
          </Rise>
        );
      })}
    </Stage>
  );
}

/* ------------------------------------------------------------------ 5. Analyze Video: paste a link, then the real report layout */

// Laid out like the app's Analyze page (app/analyze/page.tsx in the Outlier repo): hero with the verdict,
// five tiles, then the video among the channel's recent uploads. Views, subscribers and the 62× are from
// the app's Minecraft report; the typical-Short figure and reach follow from them; the rest are example values.
const AZ_TILES: [string, string, string, string][] = [
  ["Views", "1.6M", "+41K in the last day", "#c4b5fd"],
  ["Views a day", "118K", "channel's usual 2.1K", "#93c5fd"],
  ["Reach", "50×", "views per subscriber", "#f9a8d4"],
  ["Like rate", "4.8%", "channel's usual 3.1%", "#6ee7b7"],
  ["Comments", "2.3K", "3.2× the channel's usual rate", "#fcd34d"],
];
// The channel's recent Shorts, oldest to newest, as a share of the chart's height. The last one is this video (cut off, as in the app).
const AZ_BARS = [0.16, 0.22, 0.12, 0.3, 0.18, 0.14, 0.42, 0.2, 0.16, 0.26, 0.12, 0.34, 0.18, 0.22, 0.15, 0.58, 0.2, 0.17, 0.28, 0.14, 0.24, 0.19, 0.31, 1];

export function AnalyzeVideo({ dur }: SceneProps) {
  const t = useT();
  const bar: Box = { x: 460, y: 470, w: 1000, h: 104 };
  const T = { title: 0.15, bar: 0.78, type: 1.3, hand: 1.6, click: 2.3, go: 2.35, hero: 2.55, tiles: 2.95, chart: 3.4, bars: 3.65, flag: 4.5 };
  const go = p(t, T.go, 1.4);
  const lift = -322 * go;
  // Camera: in on the bar while the link is typed, back out as the report arrives, then a slow creep.
  const zoom = 1 + 0.42 * p(t, 1.15, 1.1, Easing.bezier(0.4, 0, 0.2, 1)) - 0.38 * p(t, T.click + 0.05, 1.5) + 0.014 * Math.max(0, t - 3.4);
  const hero: Box = { x: 260, y: 272, w: 1400, h: 228 };
  const chart: Box = { x: 260, y: 692, w: 1400, h: 300 };
  const tileW = (1400 - 4 * 16) / 5;
  const median = 0.2; // the "typical" line, as a share of the chart's height
  return (
    <Stage t={t} dur={dur} push={0} amount={0} creep={0} origin={[960, 540]}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 525px", transform: `scale(${zoom})` }}>
        <div style={{ opacity: 1 - p(t, T.go, 0.5, SOFT), transform: `translate(0px, ${lift * 0.5}px)` }}>
          <Title t={t} at={T.title} text="Analyze| Any Video" icon={icon(Glyph.chart(30))} yPushed={356} pushAt={T.bar} />
        </div>

        {/* the form: a link and the Analyze button, as in the app */}
        <div style={{ position: "absolute", inset: 0, transform: `translate(0px, ${lift}px)` }}>
          <Bloom t={t} box={bar} at={T.bar} strength={0.7 - 0.3 * go} travel={220} wide={200} />
          <Rise t={t} at={T.bar} box={bar} from={320} tilt={36} rest={0} yaw={0} radius={26} ring={0.6}>
            <Face radius={26}>
              <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT.body, fontWeight: 500, fontSize: 32, color: C.text }}>
                {Glyph.yt(38)}
                {t < T.type ? <span style={{ ...label, fontWeight: 400 }}>https://www.youtube.com/watch?v=…</span> : <Typing t={t} text="youtube.com/shorts/x7Kq2mD9" at={T.type} cps={30} hold={0.4} />}
              </div>
              <Button pressed={t >= T.click && t < T.click + 0.14} style={{ position: "absolute", right: 22, top: 22, height: 60, fontSize: 22, padding: "0 30px" }}>
                Analyze
              </Button>
            </Face>
          </Rise>
        </div>

        {/* hero: the video and the verdict */}
        <Panel t={t} at={T.hero} box={hero}>
          <Img src={staticFile("footage/mc-3.jpg")} style={{ position: "absolute", left: 22, top: 22, width: 116, height: 184, objectFit: "cover", borderRadius: 14 }} />
          <div style={{ position: "absolute", left: 164, top: 22, right: 480, fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: C.text, lineHeight: 1.18, letterSpacing: "-0.01em" }}>This Minecraft Mod Was Going To Replace 40 Mods… Then It Got BANNED</div>
          <div style={{ position: "absolute", left: 164, top: 104, display: "flex", alignItems: "center", gap: 16, ...label, fontSize: 19 }}>
            <span style={{ color: C.text, fontWeight: 600 }}>GalaxiHD</span>
            <span>31.9K subs</span>
            <span>3 days ago</span>
            <span>0:38</span>
            <span style={{ padding: "3px 12px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.2)", color: C.text, fontSize: 16 }}>Short</span>
          </div>
          <div style={{ position: "absolute", left: 164, top: 150, ...label, fontSize: 18, opacity: p(t, T.hero + 0.7, 0.6, SOFT) }}>
            vs the channel's typical Short (26K views) · #1 of its last 24 Shorts
          </div>
          <div style={{ position: "absolute", right: 30, top: 26, width: 430, textAlign: "right" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 104, letterSpacing: "-0.03em", lineHeight: 1, color: "#6ee7b7", whiteSpace: "nowrap" }}>
              <GlowIn t={t} at={T.hero + 0.3} text="62×" stagger={0.09} glow="52,211,153" />
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 20, color: C.text, marginTop: 10, opacity: p(t, T.hero + 0.7, 0.6, SOFT) }}>Breakout: far above this channel's normal.</div>
          </div>
        </Panel>

        {/* five tiles */}
        {AZ_TILES.map(([name, value, note, tone], i) => (
          <Panel key={name} t={t} at={T.tiles + i * 0.07} box={{ x: 260 + i * (tileW + 16), y: 516, w: tileW, h: 160 }}>
            <div style={{ position: "absolute", left: 22, top: 18, ...label, fontSize: 18 }}>{name}</div>
            <div style={{ position: "absolute", left: 22, top: 46, fontFamily: FONT.display, fontWeight: 800, fontSize: 52, letterSpacing: "-0.03em", color: tone, whiteSpace: "nowrap" }}>
              <GlowIn t={t} at={T.tiles + 0.25 + i * 0.09} text={value} stagger={0.045} />
            </div>
            <div style={{ position: "absolute", left: 22, right: 12, top: 116, ...label, fontSize: 16, whiteSpace: "nowrap", opacity: p(t, T.tiles + 0.6 + i * 0.09, 0.6, SOFT) }}>{note}</div>
          </Panel>
        ))}

        {/* this video among the channel's recent Shorts */}
        <Panel t={t} at={T.chart} box={chart} from={200}>
          <div style={{ position: "absolute", left: 26, top: 20, fontFamily: FONT.display, fontWeight: 700, fontSize: 24, color: C.text }}>Against the channel's recent Shorts</div>
          <div style={{ position: "absolute", right: 26, top: 24, display: "flex", gap: 22, ...label, fontSize: 17 }}>
            <span>
              <span style={{ color: ACCENT }}>■</span> Views
            </span>
            <span>┄ Typical · 26K</span>
          </div>
          <div style={{ position: "absolute", left: 26, right: 26, top: 74, bottom: 24 }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: `${median * 100}%`, borderTop: "2px dashed rgba(255,255,255,0.35)", transformOrigin: "0 50%", transform: `scaleX(${p(t, T.bars, 1.0)})` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 10 }}>
              {AZ_BARS.map((v, i) => {
                const self = i === AZ_BARS.length - 1;
                const k = p(t, T.bars + i * 0.03, 1.0);
                return (
                  <div key={i} style={{ position: "relative", flex: 1, height: `${v * 100}%`, borderRadius: "6px 6px 2px 2px", background: self ? "linear-gradient(180deg, #6ee7b7, #34d399)" : v >= median ? `rgba(${LILAC},0.75)` : `rgba(${LILAC},0.3)`, transformOrigin: "50% 100%", transform: `scaleY(${k})` }} />
                );
              })}
            </div>
            <div style={{ position: "absolute", right: 64, top: 6, padding: "6px 14px", borderRadius: 99, background: "#0c1f18", border: "1px solid rgba(52,211,153,0.6)", color: "#6ee7b7", fontFamily: FONT.body, fontWeight: 700, fontSize: 18, whiteSpace: "nowrap", opacity: Math.min(1, p(t, T.flag, 0.8) * 2.5), transform: `translate(${(1 - p(t, T.flag, 0.8)) * 24}px, 0px)` }}>This one · 1.6M</div>
          </div>
        </Panel>

        <Arrow
          t={t}
          size={36}
          clicks={[T.click]}
          path={[
            [T.hand, bar.x + 640, bar.y + 330],
            [T.click, bar.x + bar.w - 110, bar.y + 56],
            [3.3, bar.x + bar.w - 110, bar.y + 56],
            [4.4, 1500, 628],
            [6.5, 1520, 640],
          ]}
        />
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ Script Writer */

// A mini script, written out as one piece of text (example copy for the kryvix Short).
const SCRIPT = [
  "Your dog dies in one hit. Mine never will.",
  "First, a name tag, so it can never despawn.",
  "Then wolf armor. That's six extra hearts.",
  "Now the trick: put one block under its feet",
  "and nothing can knock it into lava.",
  "Do this once and you'll never lose a dog again.",
];

export function ScriptWriter({ dur }: SceneProps) {
  const t = useT();
  const card: Box = { x: 330, y: 392, w: 1260, h: 500 };
  const T = { title: 0.05, card: 0.78, hand: 1.35, click: 2.0, write: 2.15 };
  return (
    <Stage t={t} dur={dur} push={1.45} amount={0.16} creep={0.05} origin={[960, 760]}>
      <Title t={t} at={T.title} text="Script| Writer" icon={icon(Glyph.pen(30))} yPushed={300} pushAt={T.card} />
      <Bloom t={t} box={card} at={T.card} strength={0.75} />
      <Rise t={t} at={T.card} box={card} ring={0.7}>
        <Face>
          {/* left: the Short to model the script on */}
          <div style={{ position: "absolute", left: 34, top: 34, width: 360, bottom: 34, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.025)" }}>
            <div style={{ position: "absolute", left: 24, top: 20, ...label, fontSize: 17 }}>Write a script like</div>
            <Img src={staticFile("footage/mc-2.jpg")} style={{ position: "absolute", left: 24, top: 56, width: 124, height: 200, objectFit: "cover", borderRadius: 12 }} />
            <div style={{ position: "absolute", left: 166, top: 60, right: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: 26, color: C.text, lineHeight: 1.15 }}>Never lose your dog</div>
            <div style={{ position: "absolute", left: 166, top: 132, ...label, fontSize: 17, lineHeight: 1.4 }}>
              kryvix
              <br />
              8.7M views · 4.9×
            </div>
            <Button pressed={t >= T.click && t < T.click + 0.14} style={{ position: "absolute", left: 24, right: 24, bottom: 24 }}>
              Write script
            </Button>
          </div>
          {/* right: the script is written out as one piece of text */}
          <div style={{ position: "absolute", left: 424, right: 34, top: 34, bottom: 34, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", opacity: p(t, T.write - 0.1, 0.5, SOFT) }}>
            <div style={{ position: "absolute", left: 28, top: 20, ...label, fontSize: 17 }}>Script · 40 seconds</div>
            <div style={{ position: "absolute", left: 28, right: 24, top: 60, fontFamily: FONT.body, fontWeight: 500, fontSize: 29, lineHeight: "58px", color: C.text, letterSpacing: "-0.01em" }}>
              {SCRIPT.map((line, i) => {
                const before = SCRIPT.slice(0, i).join("").length;
                return (
                  <div key={i} style={{ height: 58, whiteSpace: "nowrap" }}>
                    <Typing t={t} text={line} at={T.write + before / 150} cps={150} caret={false} />
                  </div>
                );
              })}
            </div>
          </div>
        </Face>
      </Rise>
      <Pointer t={t} at={T.hand} click={T.click} x={card.x + 210} y={card.y + card.h - 56} />
    </Stage>
  );
}

/* ------------------------------------------------------------------ 6. Tracked Channels */

function Stat({
  t,
  at,
  title,
  value,
  children,
}: {
  t: number;
  at: number;
  title: string;
  value?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Face radius={24}>
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 26,
          ...label,
          fontSize: 19,
        }}
      >
        {title}
      </div>
      {value ? (
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 58,
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: "-0.03em",
            color: C.text,
            opacity: p(t, at + 0.35, 0.5, SOFT),
          }}
        >
          {value}
        </div>
      ) : null}
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
  const box = (i: number): Box => ({
    x: x0 + i * (w + gap),
    y: 372 + (i === 1 ? -22 : 0),
    w,
    h,
  });
  const at = (i: number) => T.cards + i * 0.1;
  const draw = p(t, at(0) + 0.5, 1.6, Easing.bezier(0.3, 0, 0.2, 1));
  return (
    <Stage
      t={t}
      dur={dur}
      push={1.45}
      amount={0.2}
      creep={0.06}
      origin={[960, 760]}
    >
      <Title
        t={t}
        at={T.title}
        text="Track| any Channel"
        icon={icon(Glyph.bell(30))}
        yPushed={250}
        pushAt={T.cards}
      />
      <Sparkle
        t={t}
        at={T.cards + 0.5}
        x={x0 - 54}
        y={352}
        size={60}
        seed={4}
      />
      <Sparkle
        t={t}
        at={T.cards + 0.7}
        x={x0 + 3 * w + 2 * gap + 50}
        y={800}
        size={78}
        seed={5}
      />
      <Bloom
        t={t}
        box={{ x: x0 + 20, y: 400, w: 3 * w + 2 * gap - 40, h: h - 60 }}
        at={T.cards + 0.15}
        strength={0.7}
        wide={240}
      />
      <Rise
        t={t}
        at={at(0)}
        box={box(0)}
        radius={24}
        ring={0.5}
        tilt={36}
        rest={3}
        yaw={0}
      >
        <Stat
          t={t}
          at={at(0)}
          title="Views / hour"
          value={
            <Count
              t={t}
              at={at(0) + 0.4}
              dur={1.8}
              to={127.2}
              decimals={1}
              prefix="+"
              suffix="K"
            />
          }
        >
          <svg
            width={w - 56}
            height={170}
            viewBox="0 0 274 170"
            style={{ position: "absolute", left: 28, bottom: 30 }}
          >
            <path
              d="M2 160 C 70 156, 110 140, 150 108 S 230 30, 272 8"
              fill="none"
              stroke={ACCENT}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          </svg>
        </Stat>
      </Rise>
      <Rise
        t={t}
        at={at(1)}
        box={box(1)}
        radius={24}
        ring={0.5}
        tilt={36}
        rest={3}
        yaw={0}
      >
        <Stat t={t} at={at(1)} title="Tracking">
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 88,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 99,
                background: "linear-gradient(160deg, #c4b5fd, #7c3aed)",
                boxShadow: `0 0 30px rgba(${VIOLET},0.7)`,
              }}
            />
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 34,
                color: C.text,
                letterSpacing: "-0.02em",
              }}
            >
              Kopee
            </div>
            <div style={{ ...label, fontSize: 19, marginTop: -4 }}>63.4K subs · gaming · minecraft</div>
          </div>
        </Stat>
      </Rise>
      <Rise
        t={t}
        at={at(2)}
        box={box(2)}
        radius={24}
        ring={0.5}
        tilt={36}
        rest={3}
        yaw={0}
      >
        <Stat
          t={t}
          at={at(2)}
          title="Best outlier"
          value={
            <Count
              t={t}
              at={at(2) + 0.4}
              dur={1.8}
              to={119}
              suffix="×"
            />
          }
        >
          <div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              bottom: 30,
              height: 170,
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            {[0.22, 0.3, 0.27, 0.42, 0.55, 0.74, 1].map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 170 * v,
                  borderRadius: 7,
                  background:
                    i === 6
                      ? "linear-gradient(180deg, #c4b5fd, #8b5cf6)"
                      : `rgba(${LILAC},0.28)`,
                  transformOrigin: "50% 100%",
                  transform: `scaleY(${p(t, at(2) + 0.45 + i * 0.07, 1.1)})`,
                }}
              />
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
    <Stage
      t={t}
      dur={dur}
      push={1.5}
      amount={0.16}
      creep={0.06}
      origin={[960, 720]}
    >
      <Title
        t={t}
        at={T.title}
        text="Everything| in one place"
        yPushed={226}
        pushAt={T.win}
        size={66}
      />
      <Bloom t={t} box={win} at={T.win} strength={0.75} wide={280} />
      <Rise
        t={t}
        at={T.win}
        box={win}
        from={520}
        tilt={42}
        rest={6}
        yaw={0}
        radius={22}
        ring={0.8}
      >
        <Face radius={22}>
          <Img
            src={staticFile("footage/app-0.5.png")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: win.w,
              height: win.h,
              objectFit: "cover",
            }}
          />
        </Face>
      </Rise>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 8. Tagline */

export function Tagline({ dur }: SceneProps) {
  const t = useT();
  return (
    <Stage
      t={t}
      dur={dur}
      push={0}
      amount={0.1}
      creep={0.08}
      origin={[960, 540]}
    >
      <Title
        t={t}
        at={0.05}
        text="Stop guessing."
        y={476}
        size={118}
        lift={44}
      />
      <Title
        t={t}
        at={0.75}
        text="Find the |outliers."
        y={622}
        size={118}
        lift={44}
      />
      <Streaks t={t} at={0.7} count={7} seed={7} />
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
    <Stage
      t={t}
      dur={dur}
      push={0}
      amount={0.09}
      creep={0.07}
      origin={[960, 540]}
      exit={false}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 1 - fade }}>
        <GlowRect
          x={760}
          y={420}
          w={400}
          h={120}
          spread={420}
          rgb="109,40,217"
          a={0.45 * p(t, 0.1, 1.2, SOFT)}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 388,
            height: 150,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 26,
          }}
        >
          <div
            style={{
              opacity: p(t, 0.05, 0.45, SOFT),
              filter: soft < 0.995 ? `blur(${(1 - soft) * 16}px)` : undefined,
              transform: `translate(${(1 - k) * -40}px, ${(1 - k) * 30}px) scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -14}deg)`,
            }}
          >
            <LogoMark size={132} />
          </div>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 150,
              letterSpacing: "-0.03em",
              color: C.text,
              lineHeight: 1.1,
            }}
          >
            <GlowIn t={t} at={0.22} text="Outlier" stagger={0.07} />
          </div>
        </div>
        <Sparkle t={t} at={0.7} x={560} y={560} size={72} seed={6} />
        <Sparkle
          t={t}
          at={0.9}
          x={1380}
          y={380}
          size={56}
          seed={7}
          color="#f0abfc"
        />
        <Rise
          t={t}
          at={0.8}
          box={pill}
          from={160}
          tilt={30}
          rest={0}
          yaw={0}
          radius={42}
          blur={10}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 42,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(180deg, #8b5cf6, #6d28d9)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3)`,
              fontFamily: FONT.body,
              fontWeight: 700,
              fontSize: 34,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            useoutlier.online →
          </div>
        </Rise>
      </div>
    </Stage>
  );
}

// Re-exported so a single scene can be previewed on its own.
export const SCENES = {
  Hook,
  Intro,
  NicheFinder,
  ViralVideos,
  AnalyzeVideo,
  TrackedChannels,
  Dashboard,
  Tagline,
  End,
};
export { GLIDE };
