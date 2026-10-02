import { type CSSProperties, useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, fontsReady } from "../theme";
import { SmoothMotionBlur } from "../components/blur";
import { AE_GRAPH_GLIDE, clamp } from "../components/ui";
import { Finish } from "../components/fx";
import { Glyph, HandIcon, IconTile, LILAC, LogoMark, Spinner, VIOLET } from "../components/kit";

/*
 * One scene, built to move exactly like Algrow's "Ai Voice Generator" moment
 * (10.0–13.6s of the reference), with Outlier's "Analyze Video" in its place.
 *
 * Measured from the reference, then shifted 0.3s earlier:
 *   0.15  title words resolve one by one (0.09s apart) from blur, sliding in from down-right
 *   0.15–1.0  whole title rises ~52px, fast then slow, while easing back from 1.15× to 1×
 *   0.75  icon pops in
 *   1.00  card rises from below, tilted back, and pushes the title up (title lags 0.08s)
 *   1.55  camera starts a long push-in that never stops (≈ +45%/s easing to +15%/s)
 *   1.77  typing starts; 2.95 click; spinner
 */

export const SCENE_TEST_SECONDS = 4.2;

const GLIDE = AE_GRAPH_GLIDE;
/** The card/title rise: a soft start, then a long settle (fitted to the reference: 27% at 0.1s, 57% at 0.2s, 74% at 0.3s). */
const RISE = GLIDE;
const SINE = Easing.bezier(0.37, 0, 0.63, 1);

const p = (t: number, at: number, dur: number, easing: (n: number) => number = GLIDE) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing });

// Layout at camera zoom 1, in 1920×1080 stage pixels.
const CARD = { x: 506, y: 403, w: 908, h: 504 };
const TITLE_Y0 = 616; // where the title starts
const TITLE_Y1 = 564; // after its own rise
const TITLE_Y2 = 354; // after the card pushes it up
const ORIGIN = { x: 960, y: 800 }; // the push-in zooms about this point

// The card leaves while the title is still gliding, so the motion never comes to rest between the two.
const T = { words: 0.15, icon: 0.6, card: 0.78, push: 1.45, type: 1.9, hand: 2.45, click: 3.25 };

function Bands({ t }: { t: number }) {
  const band = (x: number, w: number, rot: number, a: number, v: number, i: number): CSSProperties => ({
    position: "absolute",
    left: `${x}%`,
    top: "-110%",
    width: `${w}%`,
    height: "320%",
    transform: `translate(${t * v * 24 + Math.sin(t * 0.25 + i) * 14}px, 0) rotate(${rot}deg)`,
    background: `linear-gradient(90deg, transparent 0%, rgba(${VIOLET},${a * 0.25}) 25%, rgba(124,58,237,${a}) 50%, rgba(${VIOLET},${a * 0.3}) 72%, transparent 100%)`,
  });
  return (
    <AbsoluteFill style={{ background: "#05040c", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 62% at ${50 + Math.sin(t * 0.3) * 3}% 58%, rgba(91,33,182,0.5), rgba(49,20,120,0.22) 55%, transparent 80%)` }} />
      <div style={band(8, 48, 62, 0.34, 1, 0)} />
      <div style={band(44, 40, 62, 0.22, -0.8, 1)} />
      <div style={band(-22, 36, 62, 0.14, 0.6, 2)} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

function TitleWord({ t, at, children, accent = false }: { t: number; at: number; children: string; accent?: boolean }) {
  const k = p(t, at, 1.3); // position: fast out of the gate, very long settle
  const soft = p(t, at, 1.0, Easing.out(Easing.quad)); // blur clears slowly, so the word stays soft while it lands
  const fade = p(t, at, 0.45, Easing.out(Easing.quad));
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.26em",
        opacity: fade,
        filter: soft < 0.995 ? `blur(${(1 - soft) * 18}px)` : undefined,
        transform: `translate(${(1 - k) * 70}px, ${(1 - k) * 40}px) rotate(${(1 - k) * 4}deg)`,
        color: accent ? "#9d6bff" : C.text,
      }}
    >
      {children}
    </span>
  );
}

function Title({ t }: { t: number }) {
  const rise = p(t, T.words, 1.5);
  const pushed = p(t, T.card + 0.06, 1.5, RISE);
  const y = TITLE_Y0 + (TITLE_Y1 - TITLE_Y0) * rise + (TITLE_Y2 - TITLE_Y1) * pushed;
  const s = 1.15 - 0.15 * p(t, T.words, 1.8);
  const icon = p(t, T.icon, 1.0);
  const iconSoft = p(t, T.icon, 0.7, Easing.out(Easing.quad));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 0, transform: `translate(0px, ${y}px) scale(${s})`, transformOrigin: "960px 0px" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -40, height: 80, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 62, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        <TitleWord t={t} at={T.words} accent>
          Analyze
        </TitleWord>
        <TitleWord t={t} at={T.words + 0.13}>
          Any
        </TitleWord>
        <TitleWord t={t} at={T.words + 0.26}>
          Video
        </TitleWord>
        <span style={{ display: "inline-flex", marginLeft: 4, opacity: Math.min(1, iconSoft * 2), filter: iconSoft < 0.995 ? `blur(${(1 - iconSoft) * 10}px)` : undefined, transform: `translate(${(1 - icon) * 30}px, ${-12 + (1 - icon) * 26}px) scale(${0.4 + 0.6 * icon}) rotate(${12 - (1 - icon) * 40}deg)` }}>
          <IconTile size={52}>{Glyph.chart(30)}</IconTile>
        </span>
      </div>
    </div>
  );
}

function Typing({ t, text, at, cps }: { t: number; text: string; at: number; cps: number }) {
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
      {n < text.length + 2 || blink ? <span style={{ opacity: 0.75, fontWeight: 400 }}>|</span> : null}
    </span>
  );
}

/**
 * A soft glow around a rectangle, built only from gradients (edges, corners, centre).
 * Wide box-shadows and big blur filters both get clipped to hard edges when the picture
 * is captured for motion blur; gradients come through untouched.
 */
function GlowRect({ x, y, w, h, spread, rgb, a }: { x: number; y: number; w: number; h: number; spread: number; rgb: string; a: number }) {
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

/** The card's bloom: a wide soft pool (sitting a little low, like a light under the card) and a tight bright halo. */
function Bloom({ t }: { t: number }) {
  const k = p(t, T.card, 1.5, RISE);
  const glow = (0.45 + 0.55 * p(t, T.push, 1.6, SINE)) * p(t, T.card + 0.1, 0.7, Easing.out(Easing.quad));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(0px, ${(1 - k) * 300}px)` }}>
      <GlowRect x={CARD.x + 70} y={CARD.y + 90} w={CARD.w - 140} h={CARD.h - 130} spread={250} rgb="109,40,217" a={0.7 * glow} />
      <GlowRect x={CARD.x + 26} y={CARD.y + 26} w={CARD.w - 52} h={CARD.h - 52} spread={64} rgb={VIOLET} a={0.85 * glow} />
    </div>
  );
}

function Card({ t }: { t: number }) {
  const k = p(t, T.card, 1.5, RISE);
  const clear = p(t, T.card, 0.8, Easing.out(Easing.quad));
  const glow = 0.45 + 0.55 * p(t, T.push, 1.6, SINE);
  const typed = t >= T.type;
  const busy = p(t, T.click + 0.1, 0.6);
  const press = t >= T.click && t < T.click + 0.14;
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        opacity: p(t, T.card, 0.4, Easing.out(Easing.quad)),
        filter: clear < 0.995 ? `blur(${(1 - clear) * 14}px)` : undefined,
        transformOrigin: "50% 100%",
        // Rises 420px while un-tilting from 44° to a resting 5°, like the reference's card.
        transform: `perspective(1500px) translateY(${(1 - k) * 420}px) rotateX(${5 + (1 - k) * 39}deg) rotateY(${-2 * k}deg)`,
      }}
    >
      {/* Bright edge ring, tilting with the card. */}
      <div style={{ position: "absolute", inset: -3, borderRadius: 33, background: `rgba(${VIOLET},1)`, opacity: glow }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 30, background: "linear-gradient(180deg, #0c0b14 0%, #07070c 100%)", border: `1px solid rgba(${LILAC},0.22)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 34, top: 26, width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.05)", display: "grid", placeItems: "center" }}>
          <LogoMark size={28} />
        </div>
        <div style={{ position: "absolute", right: 38, top: 34, opacity: 0.85 }}>{Glyph.bell(26)}</div>

        <div style={{ position: "absolute", left: 34, right: 34, top: 96, bottom: 104, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.025)" }}>
          <div style={{ position: "absolute", left: 28, top: 24, fontFamily: FONT.body, opacity: 1 - busy }}>
            {typed ? (
              <span style={{ fontSize: 30, fontWeight: 500, color: C.text, letterSpacing: "-0.01em" }}>
                <Typing t={t} text="youtube.com/shorts/x7Kq2" at={T.type} cps={22} />
              </span>
            ) : (
              <span style={{ fontSize: 17, color: "rgba(255,255,255,0.55)" }}>Paste any Short link to see why it went viral …</span>
            )}
          </div>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: busy, transform: `scale(${0.7 + 0.3 * busy})` }}>
            <Spinner size={72} />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 34,
            bottom: 30,
            height: 50,
            padding: "0 24px",
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            fontFamily: FONT.body,
            fontWeight: 700,
            fontSize: 18,
            color: "#fff",
            background: "linear-gradient(180deg, #8b5cf6, #6d28d9)",
            boxShadow: `0 0 24px rgba(${VIOLET},0.7), inset 0 1px 0 rgba(255,255,255,0.3)`,
            transform: `scale(${press ? 0.94 : 1})`,
          }}
        >
          Analyze video
        </div>
      </div>
    </div>
  );
}

function Pointer({ t }: { t: number }) {
  if (t < T.hand) return null;
  const k = p(t, T.hand, T.click - T.hand + 0.25);
  const tx = CARD.x + CARD.w - 100;
  const ty = CARD.y + CARD.h - 52;
  const x = tx - 330 + 330 * k;
  const y = ty + 330 - 330 * k;
  const ring = p(t, T.click, 0.5);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${x - 18}px, ${y - 3}px)`, opacity: p(t, T.hand, 0.2) }}>
      {t >= T.click && ring < 1 ? <div style={{ position: "absolute", left: -12, top: -26, width: 60, height: 60, borderRadius: 99, border: `3px solid rgba(${LILAC},${1 - ring})`, transform: `scale(${0.4 + ring})` }} /> : null}
      <HandIcon size={46} pressed={t >= T.click && t < T.click + 0.14} />
    </div>
  );
}

export type SceneTestProps = { motionBlur: number };

export function SceneTest({ motionBlur }: SceneTestProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);

  // The push-in, fitted to the reference: it takes over while the card is still settling
  // (1→1.36× in ~0.8s, soft start, long tail) and then never stops (+13%/s creep).
  const move = p(t, T.push, 1.5, Easing.bezier(0.4, 0, 0.2, 1));
  const c = Math.max(0, t - (T.push + 0.7));
  const zoom = 1 + 0.36 * move + 0.1 * (c - (1 - Math.exp(-c * 3)) / 3);

  const picture = (
    <AbsoluteFill>
      <Bands t={t} />
      <AbsoluteFill style={{ transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`, transform: `scale(${zoom})` }}>
        <Title t={t} />
        <Bloom t={t} />
        <Card t={t} />
        <Pointer t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: "#05040c" }}>
      {/* A light shutter (120°): enough to soften fast moves without smearing the text. */}
      {motionBlur > 0 ? (
        <SmoothMotionBlur samples={motionBlur} shutterAngle={120}>
          {picture}
        </SmoothMotionBlur>
      ) : (
        picture
      )}
      <Finish grain={0.07} />
    </AbsoluteFill>
  );
}
