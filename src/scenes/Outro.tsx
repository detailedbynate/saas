import { AbsoluteFill, Easing } from "remotion";
import { Shot } from "../components/Shot";
import { BACK, BuildLine, Cursor, IN_OUT, Logo, OUT, Title, Words, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

const WHY = ["Made for Shorts.", "Measured against the channel.", "Numbers hours old.", "Priced for creators."];

/**
 * Four statements, one per beat, on the breakdown. Each resolves out of blur and
 * dissolves back into it just before the next lands (Jupiter's "Fixed terms. No liquidation.").
 */
export function Why({ dur }: { dur: number }) {
  const t = useTime();
  const each = dur / WHY.length;
  return (
    <Shot id="why" duration={dur} enter="cut" exit="push" keys={[{ t: 0, x: 880, z: 0.9, r: -1.2 }, { t: dur / 2, x: 960, z: 1.04, r: 0 }, { t: dur + 0.9, x: 1050, z: 1.22, r: 1.2 }]}>
      {WHY.map((w, i) => {
        const at = i * each;
        const last = i === WHY.length - 1;
        const out = last ? 0 : prog(t, at + each - 0.25, 0.28, IN_OUT);
        if (t < at - 0.05 || out >= 1) return null;
        return (
          <AbsoluteFill key={i} style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 1 - out, filter: out > 0 ? `blur(${out * 18}px)` : undefined, transform: `translate3d(${(i % 2 ? -1 : 1) * (t - at) * 22}px, 0, 0) scale(${1 + (t - at) * 0.045})` }}>
            <Title size={140} style={{ maxWidth: 1650 }}>
              <Words text={w} at={at} stagger={0.08} dur={0.6} gradient={last} />
            </Title>
          </AbsoluteFill>
        );
      })}
    </Shot>
  );
}

/** Where the price beat hands over to the end card, in seconds into the CTA. */
const END_CARD = 3.0;

/** Pricing hit, then a short end card: logo, wordmark and the URL being clicked. */
export function Cta({ dur }: { dur: number }) {
  const t = useTime();
  // --- Price beat
  const logo = prog(t, 0, 1.0, BACK);
  const strike = prog(t, 1.1, 0.6, IN_OUT);
  const newPrice = prog(t, 1.25, 0.9, BACK);
  const away = prog(t, END_CARD - 0.4, 0.8, IN_OUT);
  // --- End card
  const card = prog(t, END_CARD, 1.1, OUT);
  const pill = prog(t, END_CARD + 0.8, 0.9, OUT);
  const click = END_CARD + 1.9;
  const pressed = t >= click && t < click + 0.1;
  const shimmer = prog(t, click + 0.05, 0.8, Easing.bezier(0.4, 0, 0.2, 1));
  const end = prog(t, dur - 0.7, 0.7, IN_OUT);
  return (
    <Shot id="cta" duration={dur} enter="push" exit="cut" keys={[{ t: 0, x: 900, y: 560, z: 1.12, r: -1 }, { t: 2.0, x: 960, y: 540, z: 1.0, r: 0 }, { t: 3.4, x: 940, y: 560, z: 0.98, r: 0.4 }, { t: dur, x: 990, y: 520, z: 1.14, r: -0.6 }]}>
      {away < 1 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 1 - away, filter: away > 0 ? `blur(${away * 24}px)` : undefined, transform: `scale(${1 + away * 0.06})` }}>
          <div style={{ transform: `scale(${0.4 + 0.6 * logo})`, opacity: Math.min(1, logo * 2.5), filter: "drop-shadow(0 0 50px rgba(139,92,246,0.7))" }}>
            <Logo size={130} />
          </div>
          <Title size={112} style={{ marginTop: 34 }}>
            <Words text="Try Pro free for 3 days" at={0.3} stagger={0.1} highlight={["free"]} />
          </Title>
          <div style={{ display: "flex", alignItems: "baseline", gap: 28, marginTop: 26, fontFamily: FONT.display, fontWeight: 800 }}>
            <span style={{ position: "relative", fontSize: 64, color: C.muted, opacity: prog(t, 0.8, 0.6) }}>
              $15
              <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 6, borderRadius: 9, background: "#f87171", transform: `scaleX(${strike})`, transformOrigin: "left" }} />
            </span>
            <span style={{ fontSize: 104, transform: `scale(${0.6 + 0.4 * newPrice})`, opacity: Math.min(1, newPrice * 2), display: "inline-block", ...GRADIENT_TEXT }}>$10</span>
            <span style={{ fontSize: 40, color: C.textSecondary, opacity: Math.min(1, newPrice), fontWeight: 600 }}>/month · cancel any time</span>
          </div>
        </AbsoluteFill>
      ) : null}

      {t >= END_CARD - 0.05 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: card * (1 - end), filter: card < 0.98 ? `blur(${(1 - card) * 20}px)` : end > 0 ? `blur(${end * 10}px)` : undefined, transform: `scale(${0.95 + 0.05 * card})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ filter: "drop-shadow(0 0 50px rgba(139,92,246,0.7))" }}>
              <Logo size={150} />
            </div>
            <Title size={150} style={{ letterSpacing: "-0.05em" }}>Outlier</Title>
          </div>
          <div style={{ marginTop: 34 }}>
            <BuildLine words={["Find", "your", "next", "outlier."]} beats={[END_CARD + 0.4, END_CARD + 0.58, END_CARD + 0.76, END_CARD + 0.94]} size={52} weight={700} color={C.textSecondary} highlight={["outlier"]} />
          </div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              marginTop: 56,
              padding: "24px 56px",
              borderRadius: 999,
              background: C.accent,
              color: "#fff",
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 46,
              transform: `translateY(${(1 - pill) * 30}px) scale(${pressed ? 0.95 : 1})`,
              opacity: pill,
              filter: pill < 0.98 ? `blur(${(1 - pill) * 10}px)` : undefined,
              boxShadow: "0 0 70px rgba(139,92,246,0.6), 0 1px 0 rgba(255,255,255,0.3) inset",
            }}
          >
            useoutlier.online →
            <span style={{ position: "absolute", top: 0, bottom: 0, width: 120, left: `${-20 + shimmer * 140}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)", transform: "skewX(-20deg)" }} />
          </div>
          <Cursor
            path={[
              [END_CARD + 1.0, 1440, 1040],
              [click - 0.05, 1010, 790],
              [dur, 1010, 790],
            ]}
            clicks={[click]}
          />
        </AbsoluteFill>
      ) : null}
    </Shot>
  );
}
