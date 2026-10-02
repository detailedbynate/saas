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
  const T = { type: 0.2, select: 1.55, swap: 2.1, more: 2.6 };
  const a = "Find ";
  const old = "trending Shorts";
  const typed = Math.max(0, Math.floor((t - T.type) * 16));
  const sel = p(t, T.select, 0.3, SOFT);
  const swapped = t >= T.swap;
  const inK = p(t, T.swap, 0.9);
  const inSoft = p(t, T.swap, 0.5, SOFT);
  const box = p(t, T.swap + 0.05, 0.6);
  const blink = Math.floor(t * 2.4) % 2 === 0;
  const tick = p(t, T.select, 0.5);
  const handle = (left: boolean, top: boolean) => (
    <span
      style={{
        position: "absolute",
        width: 9,
        height: 9,
        background: "#fff",
        border: `2px solid ${ACCENT}`,
        left: left ? -6 : undefined,
        right: left ? undefined : -6,
        top: top ? -6 : undefined,
        bottom: top ? undefined : -6,
        opacity: box,
      }}
    />
  );
  return (
    <Stage
      t={t}
      dur={dur}
      push={1.3}
      amount={0.13}
      creep={0.06}
      origin={[960, 540]}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 440,
          height: 200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT.display,
          fontWeight: 500,
          fontSize: 86,
          letterSpacing: "-0.03em",
          color: C.text,
          whiteSpace: "pre",
        }}
      >
        <span>{(a + old).slice(0, Math.min(typed, a.length))}</span>
        {!swapped ? (
          <span
            style={{
              position: "relative",
              display: "inline-block",
              transform: `scale(${1 + 0.03 * sel})`,
            }}
          >
            <span style={{ opacity: 1 - sel }}>
              {old.slice(0, Math.max(0, typed - a.length))}
            </span>
            {/* the "selected" look: the phrase lights up in a gradient */}
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                opacity: sel,
                background: SELECT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {old}
            </span>
            {/* two little pop ticks above the selection */}
            {tick > 0 && tick < 1
              ? [-1, 1].map((d) => (
                  <span
                    key={d}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: -54,
                      width: 8,
                      height: 34,
                      borderRadius: 9,
                      background: "#fff",
                      opacity: 1 - tick,
                      transform: `translate(${d * 34}px, ${-tick * 22}px) rotate(${d * 22}deg) scaleY(${1 - 0.5 * tick})`,
                      boxShadow: "0 0 14px 2px rgba(255,255,255,0.8)",
                    }}
                  />
                ))
              : null}
          </span>
        ) : (
          <span
            style={{
              position: "relative",
              display: "inline-block",
              padding: "0 10px",
              margin: "0 4px",
              opacity: p(t, T.swap, 0.3, SOFT),
              filter:
                inSoft < 0.995 ? `blur(${(1 - inSoft) * 16}px)` : undefined,
              transform: `scale(${1.08 - 0.08 * inK})`,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "8px 0",
                border: `2px solid ${ACCENT}`,
                opacity: box,
              }}
            />
            <span style={{ position: "absolute", inset: "8px 0" }}>
              {handle(true, true)}
              {handle(false, true)}
              {handle(true, false)}
              {handle(false, false)}
            </span>
            <span
              style={{
                color: p(t, T.swap + 0.5, 0.5, SOFT) < 1 ? "#c4b5fd" : C.text,
              }}
            >
              outliers
            </span>
          </span>
        )}
        {swapped && t >= T.more ? (
          <Typing
            t={t}
            text=" before they blow up"
            at={T.more}
            cps={20}
            caret={false}
          />
        ) : null}
        {(t < T.select || (t >= T.more - 0.3 && (t < T.more + 1.1 || blink))) &&
        t >= T.type - 0.1 ? (
          <span style={{ opacity: 0.75, fontWeight: 300, marginLeft: 2 }}>
            |
          </span>
        ) : null}
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

/* ------------------------------------------------------------------ 3. Niche Finder: the big zoom into a dropdown */

const NICHES: [string, string][] = [
  ["Minecraft", "#34d399"],
  ["Cooking", "#fb923c"],
  ["Fitness", "#a78bfa"],
  ["Finance", "#fcd34d"],
  ["Gaming", "#f472b6"],
];

export function NicheFinder({ dur }: SceneProps) {
  const t = useT();
  const card: Box = { x: 500, y: 470, w: 920, h: 150 };
  const T = {
    title: 0.05,
    card: 0.78,
    cursor: 1.25,
    click: 1.95,
    list: 2.0,
    zoom: 1.55,
    pick: 3.75,
  };
  const chipX = card.x + 44;
  const chipY = card.y + 39;
  const rowH = 66;
  const listY = card.y + card.h + 12;
  // The hover walks down the list with the cursor.
  const hover = t < 2.55 ? -1 : t < 3.05 ? 0 : t < 3.5 ? 1 : 2;
  const picked = p(t, T.pick, 0.5);
  const away = p(t, T.zoom, 1.0, SOFT); // the title drops out of focus as the camera goes in
  const chip = (label: ReactNode, w: number, open = false) => (
    <div
      style={{
        width: w,
        height: 72,
        borderRadius: 16,
        background: "rgba(255,255,255,0.07)",
        border: `1px solid rgba(255,255,255,${open ? 0.3 : 0.14})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: FONT.body,
        fontWeight: 500,
        fontSize: 28,
        color: C.text,
      }}
    >
      {label}
    </div>
  );
  return (
    <Stage
      t={t}
      dur={dur}
      push={T.zoom}
      amount={0.95}
      creep={0.05}
      origin={[chipX + 60, 700]}
    >
      <div
        style={{
          opacity: 1 - 0.85 * away,
          filter: away > 0.01 ? `blur(${away * 7}px)` : undefined,
        }}
      >
        <Title
          t={t}
          at={T.title}
          text="Niche| Finder"
          icon={icon(Glyph.eye(34))}
          yPushed={348}
          pushAt={T.card}
        />
      </div>
      <Bloom
        t={t}
        box={card}
        at={T.card}
        strength={0.7}
        travel={220}
        wide={220}
      />
      <Rise
        t={t}
        at={T.card}
        box={card}
        from={320}
        tilt={36}
        rest={0}
        yaw={0}
        radius={30}
        ring={0.6}
      >
        <Face radius={30} />
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 39,
            display: "flex",
            gap: 18,
          }}
        >
          {chip(
            <>
              <span>{picked > 0.3 ? "Fitness" : "Niche"}</span>
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: `rotate(${180 * p(t, T.click, 0.5) * (1 - picked)}deg)`,
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </>,
            200,
            t >= T.click,
          )}
          {chip(<>{Glyph.yt(34)} Shorts</>, 190)}
          {chip(
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Last 7 days</span>,
            220,
          )}
        </div>
      </Rise>
      {/* The list unrolls row by row under the chip. */}
      <div
        style={{
          position: "absolute",
          left: chipX,
          top: listY,
          width: 330,
          opacity: 1 - picked,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 330,
            height: rowH * NICHES.length + 20,
            borderRadius: 20,
            background: "#0d0c16",
            border: "1px solid rgba(255,255,255,0.14)",
            transformOrigin: "50% 0%",
            transform: `scaleY(${p(t, T.list, 0.7)})`,
            opacity: p(t, T.list, 0.25, SOFT),
          }}
        />
        {NICHES.map(([name, dot], i) => {
          const k = p(t, T.list + 0.05 + i * 0.07, 0.8);
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: 10,
                top: 10 + i * rowH,
                width: 310,
                height: rowH - 6,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 16,
                paddingLeft: 18,
                background:
                  hover === i ? "rgba(255,255,255,0.1)" : "transparent",
                fontFamily: FONT.body,
                fontWeight: 500,
                fontSize: 28,
                color: C.text,
                opacity: Math.min(1, k * 2),
                transform: `translate(0px, ${(1 - k) * -18}px)`,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 99,
                  background: dot,
                }}
              />
              {name}
            </div>
          );
        })}
      </div>
      {/* The answer lands where the list was. */}
      <div
        style={{
          position: "absolute",
          left: chipX + 4,
          top: listY + 6,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 104,
          letterSpacing: "-0.03em",
          color: C.text,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        <GlowIn t={t} at={T.pick + 0.2} text="+38M" stagger={0.08} />
        <div
          style={{
            ...label,
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: 0,
            marginTop: 4,
            opacity: p(t, T.pick + 0.55, 0.5, SOFT),
            transform: `translate(${(1 - p(t, T.pick + 0.55, 1.0)) * 30}px, 0px)`,
          }}
        >
          views in this niche this week
        </div>
      </div>
      <div style={{ opacity: 1 - p(t, T.pick + 0.15, 0.3, SOFT) }}>
        <Arrow
          t={t}
          size={34}
          clicks={[T.click, T.pick]}
          path={[
            [T.cursor, chipX + 420, chipY + 330],
            [T.click, chipX + 150, chipY + 44],
            [2.5, chipX + 150, chipY + 44],
            [3.0, chipX + 170, listY + 10 + rowH * 0.5],
            [3.45, chipX + 185, listY + 10 + rowH * 1.5],
            [3.75, chipX + 200, listY + 10 + rowH * 2.5],
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
  const picks: [string, string][] = [
    ["hoops-2", "405×"],
    ["short-a", "151×"],
    ["hoops-3", "137×"],
    ["short-c", "98×"],
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
      {picks.map(([clip, mult], i) => {
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
                <GlowIn t={t} at={T.result} text="79×" stagger={0.1} />
              </div>
              <div style={{ ...label, fontSize: 22, marginTop: 8 }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>
                  outlier score
                </span>{" "}
                · 4.1M views vs a 52K median
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
          title="Views · 24h"
          value={
            <Count
              t={t}
              at={at(0) + 0.4}
              dur={1.8}
              to={1.2}
              decimals={1}
              prefix="+"
              suffix="M"
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
              Snack Lab
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
          title="Subscribers · 48h"
          value={
            <Count
              t={t}
              at={at(2) + 0.4}
              dur={1.8}
              to={17.6}
              decimals={1}
              prefix="+"
              suffix="K"
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
