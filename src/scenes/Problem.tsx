import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Scene, Title, Words, clamp } from "../components/ui";
import { C } from "../theme";

const HUES = [262, 250, 275, 240, 290, 255, 268, 245];

/** An endless, tilted wall of Shorts thumbnails scrolling too fast to read. */
function Feed() {
  const frame = useCurrentFrame();
  const speed = interpolate(frame, [0, 120], [6, 30], clamp);
  const offset = (frame * speed) % 420;
  const cols = 9;
  const rows = 6;
  return (
    <AbsoluteFill style={{ perspective: 1400, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 220px)`,
          gap: 28,
          transform: `rotateX(48deg) rotateZ(-14deg) translateY(${-offset}px) scale(1.35)`,
          filter: `blur(${interpolate(frame, [0, 120], [1, 5], clamp)}px)`,
          opacity: 0.85,
        }}
      >
        {Array.from({ length: cols * rows }, (_, i) => (
          <div
            key={i}
            style={{
              height: 390,
              borderRadius: 22,
              background: `linear-gradient(160deg, hsla(${HUES[i % 8]},45%,${18 + (i % 5) * 3}%,1), #0a0a10)`,
              border: `1px solid ${C.border}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 16, right: 40, bottom: 44, height: 12, borderRadius: 9, background: "rgba(255,255,255,0.14)" }} />
            <div style={{ position: "absolute", left: 16, width: 90, bottom: 22, height: 10, borderRadius: 9, background: "rgba(255,255,255,0.08)" }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function Problem({ duration }: { duration: number }) {
  return (
    <Scene duration={duration} drift={0.08}>
      <Feed />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.85), rgba(0,0,0,0.35) 80%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <Title size={92}>
          <Words text="Finding them by hand?" start={6} stagger={4} />
        </Title>
        <Title size={92} style={{ color: C.muted, marginTop: 6 }}>
          <Words text="Hours of scrolling." start={44} stagger={5} />
        </Title>
      </AbsoluteFill>
    </Scene>
  );
}
