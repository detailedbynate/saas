import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SHOTS } from "../timeline";
import { IN_OUT, clamp } from "./ui";
import { TRANSITION } from "./Shot";

/**
 * Calm black stage: two soft violet glows and a faint grid. No pulsing.
 * The grid slides a little on every whip, so the background parallaxes with the camera.
 */
export function Backdrop() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let shift = 0;
  for (const s of Object.values(SHOTS)) {
    shift += interpolate(t, [s.at + s.dur, s.at + s.dur + TRANSITION], [0, 1], { ...clamp, easing: IN_OUT });
  }
  const gx = -shift * 320;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 50% at 50% 38%, rgba(139,92,246,0.24), transparent 72%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 40% at ${80 - t * 0.4}% 85%, rgba(99,102,241,0.12), transparent 70%)` }} />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `${gx}px 0px`,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
    </AbsoluteFill>
  );
}
