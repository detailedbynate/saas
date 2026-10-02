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

/* ------------------------------------------------------------------ 1. Hook: a typed line whose middle gets selected and swapped */

const SELECT = "linear-gradient(90deg, #c4b5fd 0%, #f0abfc 55%, #fcd34d 100%)";

export function Hook({ dur }: SceneProps) {
  const t = useT();
  const cps = 15;
  const T = { type: 0.2, select: 1.7, swap: 2.3, more: 2.85 };
  const head = "Find ";
  const old = "trending Shorts";
  const tail = " before they blow up";
  const wipe = p(t, T.select, 0.55, Easing.bezier(0.4, 0, 0.2, 1)); // the selection sweeps across the phrase
  const roll = p(t, T.swap, 1.0); // old phrase rolls up and out, the new word rolls in from below
  const rollSoft = p(t, T.swap, 0.45, SOFT);
  // the new word follows a beat behind, so the two never sit on top of each other
  const rollIn = p(t, T.swap + 0.2, 1.0);
  const inSoft = p(t, T.swap + 0.2, 0.55, SOFT);
  const frame = p(t, T.swap + 0.3, 0.9); // the selection box draws on
  const tick = p(t, T.select + 0.35, 0.6);
  // The whole sentence is laid out from the start; the stage slides so what is visible stays centred.
  const pan = 370 * (1 - p(t, T.swap, 1.9, SINE));
  const handle = (left: boolean, top: boolean) => (
    <span style={{ position: "absolute", width: 9, height: 9, background: "#fff", border: `2px solid ${ACCENT}`, left: left ? -6 : undefined, right: left ? undefined : -6, top: top ? -6 : undefined, bottom: top ? undefined : -6, transform: `scale(${p(t, T.swap + 0.3 + (left ? 0 : 0.5), 0.5)})` }} />
  );
  const out = { opacity: 1 - rollSoft, transform: `translate(0px, ${-0.55 * roll}em)`, filter: rollSoft > 0.005 && rollSoft < 1 ? `blur(${rollSoft * 12}px)` : undefined } as const;
  return (
    <Stage t={t} dur={dur} push={1.3} amount={0.13} creep={0.06} origin={[960, 540]}>
      <div style={{ position: "absolute", left: 0, width: 1920, top: 440, height: 200, transform: `translate(${pan}px, 0px)`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT.display, fontWeight: 500, fontSize: 86, letterSpacing: "-0.03em", color: C.text, whiteSpace: "pre" }}>
        <Typing t={t} text={head} at={T.type} cps={cps} caret={t < T.type + head.length / cps} hold={0} />
        <span style={{ display: "inline-grid", position: "relative" }}>
          {/* keeps the slot as wide as the old phrase, then lets it close up smoothly to the new word */}
          <span style={{ gridArea: "1 / 1", visibility: "hidden", fontSize: `${1 - 0.7 * roll}em`, lineHeight: 0 }}>{old}</span>
          {roll < 1 ? (
            <span style={{ position: "absolute", left: 0, top: 0, ...out }}>
              <span style={{ display: "inline-block", clipPath: `inset(-20% 0 -20% ${wipe * 100}%)` }}>
                <Typing t={t} text={old} at={T.type + head.length / cps} cps={cps} caret={t < T.select} hold={9} />
              </span>
              <span style={{ position: "absolute", left: 0, top: 0, clipPath: `inset(-20% ${100 - wipe * 100}% -20% 0)`, background: SELECT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{old}</span>
              {tick > 0 && tick < 1
                ? [-1, 1].map((d) => <span key={d} style={{ position: "absolute", left: "50%", top: -50, width: 8, height: 32, borderRadius: 9, background: "#fff", opacity: 1 - tick, transform: `translate(${d * 34}px, ${-tick * 26}px) rotate(${d * 22}deg) scaleY(${1 - 0.5 * tick})`, boxShadow: "0 0 14px 2px rgba(255,255,255,0.8)" }} />)
                : null}
            </span>
          ) : null}
          <span style={{ gridArea: "1 / 1", justifySelf: "start", position: "relative", padding: "0 12px", opacity: inSoft, transform: `translate(0px, ${0.55 * (1 - rollIn)}em)`, filter: inSoft < 0.995 ? `blur(${(1 - inSoft) * 12}px)` : undefined }}>
            <span style={{ position: "absolute", inset: "10px 0", border: `2px solid ${ACCENT}`, clipPath: `inset(-10px ${(1 - frame) * 100}% -10px -10px)` }} />
            <span style={{ position: "absolute", inset: "10px 0" }}>
              {handle(true, true)}
              {handle(true, false)}
              {handle(false, true)}
              {handle(false, false)}
            </span>
            outliers
          </span>
        </span>
        <Typing t={t} text={tail} at={T.more} cps={19} caret={t >= T.more - 0.25} />
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ 2. Introducing → the name lands above it */

export function Intro({ dur }: SceneProps) {
  const t = useT();
  const T = { type: 0.12, name: 0.85 };
  const down = p(t, T.name - 0.05, 1.3);
  const k = p(t, T.name, 1.2);
  const soft = p(t, T.name, 0.7, SOFT);
  return (
    <Stage
      t={t}
      dur={dur}
      push={0.9}
      amount={0.14}
      creep={0.07}
      origin={[960, 540]}
    >
      <Guides
        t={t}
        at={T.name}
        ys={[418, 578]}
        xs={[572, 1348]}
        out={T.name + 1.1}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 500 + 124 * down,
          height: 80,
          display: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          transform: `translate(0px, ${500 + 126 * down}px) scale(${1 - 0.24 * down})`,
          transformOrigin: "960px 40px",
          height: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT.display,
          fontWeight: 500,
          fontSize: 76,
          letterSpacing: "-0.02em",
          color: down > 0.5 ? "rgba(255,255,255,0.72)" : C.text,
        }}
      >
        <Typing
          t={t}
          text="Introducing"
          at={T.type}
          cps={24}
          caret={t < T.name}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 418,
          height: 160,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 26,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 168,
          letterSpacing: "-0.03em",
          color: C.text,
        }}
      >
        <div
          style={{
            opacity: p(t, T.name, 0.3, SOFT),
            filter: soft < 0.995 ? `blur(${(1 - soft) * 16}px)` : undefined,
            transform: `translate(0px, ${(1 - k) * -40}px) scale(${1.3 - 0.3 * k}) rotate(${(1 - k) * -16}deg)`,
          }}
        >
          <LogoMark size={140} />
        </div>
        <GlowIn t={t} at={T.name + 0.08} text="Outlier" stagger={0.06} />
      </div>
      <Sparkle t={t} at={T.name + 0.15} x={500} y={596} size={84} seed={1} />
      <Sparkle t={t} at={T.name + 0.3} x={1424} y={400} size={66} seed={2} />
      <Sparkle
        t={t}
        at={T.name + 0.45}
        x={1380}
        y={640}
        size={44}
        seed={3}
        color="#f0abfc"
      />
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

/* ------------------------------------------------------------------ 5. Analyze Video */

export function AnalyzeVideo({ dur }: SceneProps) {
  const t = useT();
  const card: Box = { x: 506, y: 403, w: 908, h: 504 };
  const T = {
    title: 0.15,
    card: 0.78,
    push: 1.45,
    type: 1.9,
    hand: 2.45,
    click: 3.25,
    result: 4.05,
  };
  const lit = 0.45 + 0.55 * p(t, T.push, 1.6, SINE);
  const busy =
    p(t, T.click + 0.1, 0.6) * (1 - p(t, T.result - 0.1, 0.35, SOFT));
  const rk = p(t, T.result, 1.2);
  return (
    <Stage t={t} dur={dur} push={T.push} amount={0.22} creep={0.06}>
      <Title
        t={t}
        at={T.title}
        text="Analyze| Any Video"
        icon={icon(Glyph.chart(30))}
        yPushed={354}
        pushAt={T.card}
      />
      <Bloom
        t={t}
        box={card}
        at={T.card}
        strength={lit + 0.35 * p(t, T.result, 0.8, SOFT)}
      />
      <Rise t={t} at={T.card} box={card} ring={lit}>
        <Face>
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 26,
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.05)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LogoMark size={28} />
          </div>
          <div
            style={{ position: "absolute", right: 38, top: 34, opacity: 0.85 }}
          >
            {Glyph.bell(26)}
          </div>
          <div
            style={{
              position: "absolute",
              left: 34,
              right: 34,
              top: 96,
              bottom: 104,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 28,
                top: 24,
                fontFamily: FONT.body,
                opacity: 1 - p(t, T.click + 0.1, 0.6),
              }}
            >
              {t >= T.type ? (
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: C.text,
                    letterSpacing: "-0.01em",
                  }}
                >
                  <Typing t={t} text="youtube.com/shorts/x7Kq2" at={T.type} />
                </span>
              ) : (
                <span style={{ ...label, fontSize: 17 }}>
                  Paste any Short link to see why it went viral …
                </span>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                opacity: busy,
                transform: `scale(${0.7 + 0.3 * busy})`,
              }}
            >
              <Spinner size={72} />
            </div>
            {/* The answer: one big number. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: p(t, T.result, 0.45, SOFT),
                transform: `translate(0px, ${(1 - rk) * 24}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 150,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  color: C.text,
                }}
              >
                <GlowIn t={t} at={T.result} text="62×" stagger={0.1} />
              </div>
              <div style={{ ...label, fontSize: 22, marginTop: 8 }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>
                  outlier score
                </span>{" "}
                · 1.6M views on a 31.9K-sub channel
              </div>
            </div>
          </div>
          <Button
            pressed={t >= T.click && t < T.click + 0.14}
            style={{ position: "absolute", right: 34, bottom: 30 }}
          >
            Analyze video
          </Button>
        </Face>
      </Rise>
      <Pointer
        t={t}
        at={T.hand}
        click={T.click}
        x={card.x + card.w - 100}
        y={card.y + card.h - 52}
      />
    </Stage>
  );
}

/* ------------------------------------------------------------------ Script Writer (marked "Soon", as in the app) */

const SCRIPT: [string, string][] = [
  ["HOOK", "Your dog dies in one hit. Mine never will."],
  ["BEATS", "Name tag. Armor. Then the one block that saves it."],
  ["PAYOFF", "Do this once and you never lose a dog again."],
];

export function ScriptWriter({ dur }: SceneProps) {
  const t = useT();
  const card: Box = { x: 330, y: 392, w: 1260, h: 500 };
  const T = { title: 0.05, card: 0.78, hand: 1.35, click: 2.0, write: 2.15 };
  const soon = (
    <span style={{ display: "inline-flex", alignItems: "center", height: 40, padding: "0 16px", borderRadius: 999, border: "1.5px solid rgba(252,211,77,0.7)", color: "#fcd34d", background: "rgba(252,211,77,0.1)", fontFamily: FONT.body, fontWeight: 700, fontSize: 20, letterSpacing: 0, marginLeft: 6 }}>Soon</span>
  );
  return (
    <Stage t={t} dur={dur} push={1.45} amount={0.16} creep={0.05} origin={[960, 760]}>
      <Title t={t} at={T.title} text="Script| Writer" icon={soon} yPushed={300} pushAt={T.card} />
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
          {/* right: the script arrives block by block */}
          {SCRIPT.map(([tag, line], i) => {
            const at = T.write + i * 0.42;
            const k = p(t, at, 1.1);
            return (
              <div key={tag} style={{ position: "absolute", left: 424, right: 34, top: 34 + i * 148, height: 136, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", opacity: Math.min(1, k * 2.5), transform: `translate(${(1 - k) * 40}px, 0px)` }}>
                <div style={{ position: "absolute", left: 24, top: 18, color: ACCENT, fontFamily: FONT.body, fontWeight: 700, fontSize: 16, letterSpacing: "0.14em" }}>{tag}</div>
                <div style={{ position: "absolute", left: 24, top: 52, right: 20, fontFamily: FONT.body, fontWeight: 500, fontSize: 30, color: C.text, letterSpacing: "-0.01em" }}>
                  <Typing t={t} text={line} at={at + 0.15} cps={52} caret={false} />
                </div>
              </div>
            );
          })}
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
  const live = p(t, at(1) + 0.5, 0.9);
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
        text="Track| any ~Channel"
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
            <div
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(52,211,153,0.14)",
                border: "1px solid rgba(52,211,153,0.45)",
                color: "#6ee7b7",
                fontFamily: FONT.body,
                fontWeight: 700,
                fontSize: 19,
                opacity: Math.min(1, live * 3),
                transform: `scale(${0.7 + 0.3 * live})`,
              }}
            >
              ● Breaking out
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
        text="Find the |~outliers."
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
