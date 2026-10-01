import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SCENES } from "../timeline";

/** Black stage with slow violet light blooms, a faint grid and a vignette. Pulses on the music drops. */
export function Backdrop() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drop = (at: number) => Math.exp(-Math.max(0, frame - at) / 10) * (frame >= at ? 1 : 0);
  const flash = drop(SCENES.reveal.from) + drop(SCENES.cta.from) * 0.8;
  // A soft breathing on every beat (15 frames) once the beat is in.
  const beat = frame >= SCENES.reveal.from ? Math.exp(-(frame % 15) / 5) * 0.12 : 0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at ${50 + Math.sin(t * 0.3) * 14}% ${36 + Math.cos(t * 0.25) * 8}%, rgba(139,92,246,${0.28 + beat + flash * 0.4}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 40% 40% at ${78 + Math.cos(t * 0.2) * 10}% ${80 + Math.sin(t * 0.35) * 6}%, rgba(99,102,241,0.16), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 35% 35% at ${18 + Math.sin(t * 0.22) * 8}% ${74 + Math.cos(t * 0.3) * 8}%, rgba(196,181,253,0.09), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${(frame * 0.6) % 80}px`,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
        }}
      />
      <AbsoluteFill style={{ background: `rgba(196,181,253,${flash * 0.35})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
    </AbsoluteFill>
  );
}
