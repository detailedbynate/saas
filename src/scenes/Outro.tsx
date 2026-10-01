import { AbsoluteFill, Easing } from "remotion";
import { Shot } from "../components/Shot";
import { BACK, Cursor, Logo, OUT, Title, Words, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

const WHY = ["Made for Shorts.", "Measured against the channel.", "Numbers hours old.", "Priced for creators."];

/** Four statements, one per beat, on the breakdown: just big type snapping up into place. */
export function Why({ dur }: { dur: number }) {
  const t = useTime();
  const each = dur / WHY.length;
  const i = Math.min(WHY.length - 1, Math.floor(t / each));
  return (
    <Shot id="why" duration={dur} enter="zoom" exit="zoom" keys={[{ t: 0, z: 0.94 }, { t: dur, z: 1.12 }]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Title size={150} key={i} style={{ maxWidth: 1600 }}>
          <Words text={WHY[i]} at={i * each} stagger={0.03} dur={0.45} gradient={i === WHY.length - 1} />
        </Title>
      </AbsoluteFill>
    </Shot>
  );
}

/** Pricing hit, then the URL being clicked. */
export function Cta({ dur }: { dur: number }) {
  const t = useTime();
  const logo = prog(t, 0, 0.6, BACK);
  const strike = prog(t, 0.75, 0.3, OUT);
  const newPrice = prog(t, 0.85, 0.5, BACK);
  const pill = prog(t, 1.25, 0.6, BACK);
  const pressed = t >= 2.1 && t < 2.2;
  const shimmer = prog(t, 2.15, 0.8, Easing.bezier(0.4, 0, 0.2, 1));
  const end = prog(t, dur - 0.7, 0.7, Easing.in(Easing.cubic));
  return (
    <Shot id="cta" duration={dur} enter="zoom" exit="cut" keys={[{ t: 0, z: 1.08 }, { t: 1.2, z: 1 }, { t: dur, z: 0.96 }]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: 1 - end }}>
        <div style={{ transform: `scale(${0.3 + 0.7 * logo})`, opacity: Math.min(1, logo * 3), filter: "drop-shadow(0 0 50px rgba(139,92,246,0.7))" }}>
          <Logo size={130} />
        </div>
        <Title size={108} style={{ marginTop: 34 }}>
          <Words text="Try Pro free for 3 days" at={0.1} stagger={0.04} highlight={["free"]} />
        </Title>
        <div style={{ display: "flex", alignItems: "baseline", gap: 28, marginTop: 26, fontFamily: FONT.display, fontWeight: 800 }}>
          <span style={{ position: "relative", fontSize: 64, color: C.muted, opacity: prog(t, 0.5, 0.3) }}>
            $15
            <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 6, borderRadius: 9, background: "#f87171", transform: `scaleX(${strike})`, transformOrigin: "left" }} />
          </span>
          <span style={{ fontSize: 100, transform: `scale(${newPrice})`, display: "inline-block", ...GRADIENT_TEXT }}>$10</span>
          <span style={{ fontSize: 40, color: C.textSecondary, opacity: Math.min(1, newPrice), fontWeight: 600 }}>/month · cancel any time</span>
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 60,
            padding: "26px 58px",
            borderRadius: 999,
            background: C.accent,
            color: "#fff",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 48,
            transform: `scale(${pill * (pressed ? 0.95 : 1)})`,
            opacity: Math.min(1, pill * 3),
            boxShadow: "0 0 70px rgba(139,92,246,0.6), 0 1px 0 rgba(255,255,255,0.3) inset",
          }}
        >
          useoutlier.online →
          <span style={{ position: "absolute", top: 0, bottom: 0, width: 120, left: `${-20 + shimmer * 140}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)", transform: "skewX(-20deg)" }} />
        </div>
        <Cursor
          path={[
            [1.6, 1500, 1050],
            [2.05, 990, 800],
            [6, 990, 800],
          ]}
          clicks={[2.1]}
        />
      </AbsoluteFill>
    </Shot>
  );
}
