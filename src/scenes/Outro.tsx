import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Cursor, Logo, Scene, Title, Words, clamp, easeOut, useSpring } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

const WHY = ["Made for Shorts.", "Measured against the channel.", "Numbers hours old, not weeks.", "Priced for creators."];

/** Rapid-fire statements on the breakdown, one every half bar. */
export function Why({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const each = duration / WHY.length;
  const i = Math.min(WHY.length - 1, Math.floor(frame / each));
  const local = frame - i * each;
  const outP = interpolate(local, [each - 6, each], [0, 1], clamp);
  return (
    <Scene duration={duration} enter={6} exit={6} drift={0.02}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.body, fontSize: 26, color: C.accentText, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 26 }}>Why Outlier · {i + 1}/4</div>
        <div key={i} style={{ opacity: 1 - outP, filter: `blur(${outP * 10}px)`, transform: `scale(${1 + outP * 0.06})` }}>
          <Title size={120}>
            <Words text={WHY[i]} start={i * each} stagger={2} gradient={i === WHY.length - 1} />
          </Title>
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

/** Pricing hit, then the URL. */
export function Cta({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const logo = useSpring(0, 12, 0.8);
  const strike = interpolate(frame, [44, 56], [0, 1], { ...clamp, easing: easeOut });
  const newPrice = useSpring(54, 10, 0.6);
  const pill = useSpring(84, 14, 0.7);
  const pressed = frame >= 128 && frame < 134;
  const glow = 0.5 + 0.5 * Math.sin(frame / 7);
  return (
    <Scene duration={duration} enter={1} exit={24} drift={0.02}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ transform: `scale(${0.5 + 0.5 * logo})`, opacity: logo, filter: "drop-shadow(0 0 50px rgba(139,92,246,0.7))" }}>
          <Logo size={130} />
        </div>
        <Title size={104} style={{ marginTop: 34 }}>
          <Words text="Try Pro free for 3 days" start={6} stagger={3} highlight={["free"]} />
        </Title>
        <div style={{ display: "flex", alignItems: "baseline", gap: 28, marginTop: 26, fontFamily: FONT.display, fontWeight: 800 }}>
          <span style={{ position: "relative", fontSize: 64, color: C.muted, opacity: interpolate(frame, [30, 40], [0, 1], clamp) }}>
            $15
            <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 6, borderRadius: 9, background: "#f87171", transform: `scaleX(${strike})`, transformOrigin: "left" }} />
          </span>
          <span style={{ fontSize: 96, transform: `scale(${newPrice})`, display: "inline-block", ...GRADIENT_TEXT }}>$10</span>
          <span style={{ fontSize: 40, color: C.textSecondary, opacity: newPrice, fontWeight: 600 }}>/month · cancel any time</span>
        </div>
        <div
          style={{
            marginTop: 60,
            padding: "26px 58px",
            borderRadius: 999,
            background: C.accent,
            color: "#fff",
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: "-0.01em",
            transform: `scale(${pill * (pressed ? 0.95 : 1)})`,
            opacity: pill,
            boxShadow: `0 0 ${50 + glow * 40}px rgba(139,92,246,${0.5 + glow * 0.3}), 0 1px 0 rgba(255,255,255,0.3) inset`,
          }}
        >
          useoutlier.online →
        </div>
      </AbsoluteFill>
      <Cursor
        path={[
          [100, 1500, 1050],
          [126, 990, 795],
          [190, 990, 795],
        ]}
        clicks={[128]}
      />
    </Scene>
  );
}
