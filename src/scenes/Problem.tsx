import { AbsoluteFill, interpolate } from "remotion";
import { Shot } from "../components/Shot";
import { Title, Words, clamp, useTime } from "../components/ui";
import { C } from "../theme";

const HUES = [262, 250, 275, 240, 290, 255, 268, 245];

/** A tilted wall of Shorts thumbnails scrolling too fast to read. */
function Feed() {
  const t = useTime();
  // Accelerating scroll: position is the integral of a rising speed.
  const offset = (t * 260 + t * t * 120) % 418;
  return (
    <AbsoluteFill style={{ perspective: 1400, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 220px)",
          gap: 28,
          transform: `rotateX(48deg) rotateZ(-14deg) translateY(${-offset}px) scale(1.35)`,
          filter: `blur(${interpolate(t, [0, 3], [0.5, 3], clamp)}px)`,
          opacity: 0.85,
        }}
      >
        {Array.from({ length: 54 }, (_, i) => (
          <div key={i} style={{ height: 390, borderRadius: 22, background: `linear-gradient(160deg, hsla(${HUES[i % 8]},45%,${18 + (i % 5) * 3}%,1), #0a0a10)`, border: `1px solid ${C.border}`, position: "relative" }}>
            <div style={{ position: "absolute", left: 16, right: 40, bottom: 44, height: 12, borderRadius: 9, background: "rgba(255,255,255,0.14)" }} />
            <div style={{ position: "absolute", left: 16, width: 90, bottom: 22, height: 10, borderRadius: 9, background: "rgba(255,255,255,0.08)" }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function Problem({ dur }: { dur: number }) {
  return (
    <Shot id="problem" duration={dur} enter="blur" exit="push" keys={[{ t: 0, z: 1.02 }, { t: 3.9, z: 1.16, r: -1.5 }]}>
      <Feed />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.88), rgba(0,0,0,0.35) 80%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Title size={100}>
          <Words text="Finding them by hand?" at={0.4} stagger={0.13} />
        </Title>
        <Title size={100} style={{ color: C.muted, marginTop: 4 }}>
          <Words text="Hours of scrolling." at={1.4} stagger={0.14} />
        </Title>
      </AbsoluteFill>
    </Shot>
  );
}
