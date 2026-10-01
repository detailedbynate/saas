import { AbsoluteFill } from "remotion";
import { Shot } from "../components/Shot";
import { BACK, Counter, IN_OUT, OUT, Title, Words, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

/** A Short from a tiny channel whose views blow past millions. */
function ShortCard() {
  const t = useTime();
  const s = prog(t, 0, 1.0, IN_OUT);
  const badge = prog(t, 1.75, 0.5, BACK);
  const glow = prog(t, 1.4, 0.6);
  return (
    <div
      style={{
        width: 380,
        height: 676,
        borderRadius: 36,
        position: "relative",
        transform: `translateY(${(1 - s) * 90}px) scale(${0.88 + 0.12 * s}) rotate(${(1 - s) * -5}deg)`,
        opacity: Math.min(1, s * 2.5),
        filter: s < 0.98 ? `blur(${(1 - s) * 14}px)` : undefined,
        background: "linear-gradient(160deg, #2a1b4f 0%, #120c24 45%, #070510 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: `0 50px 120px rgba(0,0,0,0.8), 0 0 ${130 * glow}px rgba(139,92,246,${0.55 * glow})`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: -60, top: 120, width: 300, height: 300, borderRadius: 999, background: "radial-gradient(circle, rgba(167,139,250,0.55), transparent 70%)", transform: `translateY(${Math.sin(t * 2) * 20}px)` }} />
      <div style={{ position: "absolute", right: -80, top: 300, width: 340, height: 340, borderRadius: 999, background: "radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)", transform: `translateX(${Math.cos(t * 1.6) * 20}px)` }} />
      <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%,-50%)", width: 96, height: 96, borderRadius: 99, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "grid", placeItems: "center" }}>
        <svg width="38" height="38" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
      </div>
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
          <div style={{ width: `${Math.min(100, t * 25)}%`, height: 4, borderRadius: 9, background: "#fff" }} />
        </div>
      </div>
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
          transform: `scale(${badge}) rotate(${(1 - badge) * 25}deg)`,
          opacity: badge > 0 ? 1 : 0,
          boxShadow: "0 10px 40px rgba(139,92,246,0.7)",
        }}
      >
        79× ↑
      </div>
    </div>
  );
}

function Stat({ at, side, label, foot, children }: { at: number; side: "left" | "right"; label: string; foot: string; children: React.ReactNode }) {
  const t = useTime();
  const p = prog(t, at, 0.75, OUT);
  const dir = side === "left" ? -1 : 1;
  return (
    <div
      style={{
        position: "absolute",
        top: 385,
        width: 520,
        [side]: 150,
        textAlign: side === "left" ? "right" : "left",
        opacity: Math.min(1, p * 1.8),
        transform: `translateX(${dir * (1 - p) * 70}px)`,
        filter: p < 0.98 ? `blur(${(1 - p) * 12}px)` : undefined,
      }}
    >
      <div style={{ fontFamily: FONT.body, fontSize: 30, color: C.textSecondary }}>{label}</div>
      {children}
      <div style={{ fontFamily: FONT.body, fontSize: 30, color: C.textSecondary }}>{foot}</div>
    </div>
  );
}

export function Hook({ dur }: { dur: number }) {
  return (
    <Shot
      id="hook"
      duration={dur}
      enter="cut"
      exit="blur"
      keys={[
        { t: 0, x: 960, y: 560, z: 1.38 },
        { t: 1.4, x: 960, y: 540, z: 1 },
        { t: 4.5, z: 1.07 },
      ]}
    >
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <ShortCard />
      </AbsoluteFill>
      <Stat at={0.35} side="left" label="This channel has" foot="subscribers">
        <Title size={108}>
          <Counter value={2140} at={0.35} dur={0.7} />
        </Title>
      </Stat>
      <Stat at={0.85} side="right" label="Its latest Short got" foot="views">
        <Title size={108} style={GRADIENT_TEXT}>
          <Counter value={4.1} at={0.85} dur={1.0} decimals={1} suffix="M" />
        </Title>
      </Stat>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
        <Title size={68}>
          <Words text="That's an outlier." at={2.15} stagger={0.12} highlight={["outlier"]} />
        </Title>
      </div>
    </Shot>
  );
}
