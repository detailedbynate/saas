import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Counter, Scene, Title, Words, clamp, easeOut, useSpring } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

/** A Short from a tiny channel, its views spinning up past millions. */
function ShortCard() {
  const frame = useCurrentFrame();
  const s = useSpring(4, 15, 0.8);
  const badge = useSpring(118, 9, 0.6);
  const glow = interpolate(frame, [100, 125], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        width: 380,
        height: 676,
        borderRadius: 36,
        position: "relative",
        transform: `translateY(${(1 - s) * 80}px) scale(${0.85 + 0.15 * s}) rotate(${(1 - s) * -6}deg)`,
        opacity: s,
        background: "linear-gradient(160deg, #2a1b4f 0%, #120c24 45%, #070510 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: `0 50px 120px rgba(0,0,0,0.8), 0 0 ${120 * glow}px rgba(139,92,246,${0.55 * glow})`,
        overflow: "hidden",
      }}
    >
      {/* Faux video content: soft shapes */}
      <div style={{ position: "absolute", left: -60, top: 120, width: 300, height: 300, borderRadius: 999, background: "radial-gradient(circle, rgba(167,139,250,0.55), transparent 70%)", transform: `translateY(${Math.sin(frame / 14) * 20}px)` }} />
      <div style={{ position: "absolute", right: -80, top: 300, width: 340, height: 340, borderRadius: 999, background: "radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)", transform: `translateX(${Math.cos(frame / 18) * 20}px)` }} />
      {/* Play glyph */}
      <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", width: 96, height: 96, borderRadius: 99, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center" }}>
        <svg width="38" height="38" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
      </div>
      {/* Shorts chrome */}
      <div style={{ position: "absolute", left: 26, right: 26, bottom: 30, fontFamily: FONT.body, color: C.text }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 99, background: "linear-gradient(135deg,#a78bfa,#6366f1)" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>@buildwithmo</div>
            <div style={{ fontSize: 18, color: C.textSecondary }}>2,140 subscribers</div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 21, lineHeight: 1.3, color: "rgba(255,255,255,0.9)" }}>I built a whole city in 60 seconds</div>
        <div style={{ marginTop: 14, height: 4, borderRadius: 9, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${interpolate(frame, [0, 180], [0, 100], clamp)}%`, height: 4, borderRadius: 9, background: "#fff" }} />
        </div>
      </div>
      {/* Outlier stamp */}
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 22,
          padding: "10px 18px",
          borderRadius: 999,
          background: C.accent,
          color: "#fff",
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 30,
          transform: `scale(${badge * 1}) rotate(${(1 - badge) * 20}deg)`,
          opacity: Math.min(1, badge * 2),
          boxShadow: "0 10px 40px rgba(139,92,246,0.7)",
        }}
      >
        79× ↑
      </div>
    </div>
  );
}

export function Hook({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const leftP = interpolate(frame, [10, 28], [0, 1], { ...clamp, easing: easeOut });
  const rightP = interpolate(frame, [58, 76], [0, 1], { ...clamp, easing: easeOut });
  const bottomP = interpolate(frame, [124, 140], [0, 1], { ...clamp, easing: easeOut });
  return (
    <Scene duration={duration} enter={1}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <ShortCard />
      </AbsoluteFill>

      {/* Left stat */}
      <div style={{ position: "absolute", left: 150, top: 380, width: 520, textAlign: "right", opacity: leftP, transform: `translateX(${(1 - leftP) * -40}px)`, filter: `blur(${(1 - leftP) * 8}px)` }}>
        <div style={{ fontFamily: FONT.body, fontSize: 30, color: C.textSecondary }}>This channel has</div>
        <Title size={104}>
          <Counter value={2140} start={12} dur={30} />
        </Title>
        <div style={{ fontFamily: FONT.body, fontSize: 30, color: C.textSecondary }}>subscribers</div>
      </div>

      {/* Right stat */}
      <div style={{ position: "absolute", right: 150, top: 380, width: 520, opacity: rightP, transform: `translateX(${(1 - rightP) * 40}px)`, filter: `blur(${(1 - rightP) * 8}px)` }}>
        <div style={{ fontFamily: FONT.body, fontSize: 30, color: C.textSecondary }}>Its latest Short got</div>
        <Title size={104} style={GRADIENT_TEXT}>
          <Counter value={4.1} start={62} dur={44} decimals={1} suffix="M" />
        </Title>
        <div style={{ fontFamily: FONT.body, fontSize: 30, color: C.textSecondary }}>views</div>
      </div>

      {/* Payoff */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", opacity: bottomP }}>
        <Title size={64}>
          <Words text="That's an outlier." start={124} stagger={4} highlight={["outlier"]} />
        </Title>
      </div>
    </Scene>
  );
}
