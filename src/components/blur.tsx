import type { ReactNode } from "react";
import { AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig } from "remotion";

/*
 * True motion blur: the picture is drawn at several moments inside each frame's
 * shutter window and the copies are averaged.
 *
 * The copies are ordinary stacked layers: copy i sits over the ones below at 1/(i+1)
 * opacity, which works out to an even average of all of them. Chrome composites this
 * exactly as it does the unblurred picture, so glows and soft gradients keep their look.
 * (@remotion/motion-blur's <HtmlInCanvasMotionBlur> was tried first: its captured copies
 * render faint, semi-transparent glows brighter and hard-edged, worse with every sample.)
 *
 * The picture passed in must be opaque (have its own background).
 */
export function SmoothMotionBlur({ children, samples = 8, shutterAngle = 180 }: { children: ReactNode; samples?: number; shutterAngle?: number }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const shutter = shutterAngle / 360;
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      {Array.from({ length: samples }, (_, i) => {
        const at = Math.max(0, Math.min(durationInFrames - 1, frame + ((i + 0.5) / samples - 0.5) * shutter));
        return (
          <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
            <Freeze frame={at}>{children}</Freeze>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
}
