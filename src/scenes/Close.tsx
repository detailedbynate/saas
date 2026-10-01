import { AbsoluteFill, Easing } from "remotion";
import { Dust, Kinetic, Sparks, bouncy, firm, sp } from "../components/fx";
import { Hand, LILAC, LogoMark, VIOLET } from "../components/kit";
import { Shot } from "../components/Shot";
import { prog, useTime } from "../components/ui";
import { C, FONT } from "../theme";

/* ------------------------------------------------------------------ 8. Tagline (the breakdown) */

export function Tagline({ dur }: { dur: number }) {
  const t = useTime();
  return (
    <Shot
      id="tagline"
      duration={dur}
      enter="blur"
      exit="zoomOut"
      keys={[
        { t: 0, z: 0.94, x: 930, r: -1 },
        { t: 1.4, z: 1.0, x: 960, r: 0 },
        { t: 3.2, z: 1.1, x: 990, r: 1 },
      ]}
    >
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 36% at 50% 50%, rgba(${VIOLET},${0.22 + 0.2 * sp(t, 1.4, firm)}), transparent 75%)` }} />
      <Dust count={30} seed="tag" speed={1.6} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute" }}>
          <Kinetic text="Stop guessing." at={0.15} out={1.25} size={150} color={C.textSecondary} />
        </div>
        <div style={{ position: "absolute" }}>
          <Kinetic text="Find the outliers." at={1.4} size={164} accent={["outliers"]} glow={0.7} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 9. Call to action (the final hit) */

export function Cta({ dur }: { dur: number }) {
  const t = useTime();
  const hit = sp(t, 0, bouncy);
  const pill = sp(t, 0.55, { damping: 12, stiffness: 130 });
  const click = 1.75;
  const pressed = t >= click && t < click + 0.12;
  const shimmer = prog(t, click + 0.05, 0.9, Easing.bezier(0.4, 0, 0.2, 1));
  const sub = sp(t, 0.9, firm);
  const out = prog(t, dur - 0.5, 0.5, Easing.in(Easing.cubic));
  return (
    <Shot
      id="cta"
      duration={dur}
      enter="zoomOut"
      exit="cut"
      keys={[
        { t: 0, z: 1.08, r: 1 },
        { t: 1.6, z: 1.0, r: 0 },
        { t: 3.6, z: 1.07, r: -0.6 },
      ]}
    >
      <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 14}px)` : undefined }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 48% 42% at 50% 46%, rgba(${VIOLET},${0.5 * hit}), transparent 72%)` }} />
        {[0, 0.14].map((d) => {
          const p = prog(t, d, 1.3);
          return <div key={d} style={{ position: "absolute", left: 960 - 160, top: 430 - 160, width: 320, height: 320, borderRadius: 999, border: `3px solid rgba(${LILAC},${0.6 * (1 - p)})`, transform: `scale(${0.4 + p * 5.5})` }} />;
        })}
        <Sparks x={960} y={430} at={0} seed="cta" reach={640} count={36} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: -90 }}>
            <div style={{ transform: `scale(${0.3 + 0.7 * hit}) rotate(${(1 - hit) * 20}deg)`, borderRadius: 40, overflow: "hidden", boxShadow: `0 0 ${80 * hit}px rgba(${VIOLET},0.9)` }}>
              <LogoMark size={170} />
            </div>
            <Kinetic text="Outlier" at={0.08} size={184} stagger={0.04} style={{ textAlign: "left" }} />
          </div>
          <div style={{ marginTop: 30, fontFamily: FONT.body, fontWeight: 500, fontSize: 44, color: C.textSecondary, opacity: sub, transform: `translate3d(0, ${(1 - sub) * 24}px, 0)`, filter: sub < 0.95 ? `blur(${(1 - sub) * 8}px)` : undefined }}>Find your next outlier before everyone else.</div>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              marginTop: 52,
              padding: "26px 62px",
              borderRadius: 999,
              background: "linear-gradient(180deg, #a78bfa, #7c3aed)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              color: "#fff",
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 52,
              letterSpacing: "-0.02em",
              transform: `scale(${(0.6 + 0.4 * pill) * (pressed ? 0.95 : 1)})`,
              opacity: Math.min(1, pill * 2),
              boxShadow: `0 0 ${70 + 50 * shimmer * (1 - shimmer) * 4}px rgba(${VIOLET},0.75), inset 0 2px 0 rgba(255,255,255,0.4)`,
            }}
          >
            useoutlier.online →
            <span style={{ position: "absolute", top: 0, bottom: 0, width: 140, left: `${-25 + shimmer * 150}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", transform: "skewX(-20deg)" }} />
          </div>
        </AbsoluteFill>
        <Hand
          path={[
            [1.1, 1500, 1120],
            [1.7, 1030, 690],
            [dur, 1040, 700],
          ]}
          clicks={[click]}
        />
        <Sparks x={960} y={690} at={click} seed="click" reach={260} count={16} />
      </AbsoluteFill>
    </Shot>
  );
}
