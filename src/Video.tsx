import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useVideoConfig } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { Finish, Leak } from "./components/fx";
import { TRANSITION } from "./components/Shot";
import { LEAD } from "./components/ui";
import { Cta, Tagline } from "./scenes/Close";
import { Dash, Finder, Score, Stat } from "./scenes/Product";
import { Hook, LogoHit, Wall } from "./scenes/Story";
import { fontsReady } from "./theme";
import { FPS, SHOTS, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const end = (s: { at: number; dur: number }) => s.at + s.dur;
const f = (sec: number) => Math.round(sec * FPS);

/** Sound effects: [file, seconds, volume]. Every move gets a layer: whoosh into it, hit on it. */
const SFX: [string, number, number][] = [
  // Hook: a soft swell under each line
  ["shimmer", 0.1, 0.3],
  ["whoosh-fast", 1.2, 0.22],
  ["shimmer", 1.3, 0.35],
  // Punch into the first Short
  ["whoosh", end(S.hook) - 0.3, 0.45],
  ["subhit", S.wall.at, 0.5],
  // Pull-back reveal of the wall
  ["whoosh", S.wall.at + 1.0, 0.5],
  ["ticker", S.wall.at + 1.6, 0.18],
  // Outliers light up
  ["subhit", S.wall.at + 3.2, 0.45],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.wall.at + 3.25 + i * 0.14, 0.45]),
  ["ding", S.wall.at + 3.3, 0.3],
  // Riser into the logo, then the drop
  ["riser", S.logo.at - 1.5, 0.5],
  ["subhit", S.logo.at, 0.9],
  ["shimmer", S.logo.at + 0.05, 0.5],
  // Whip into the product
  ["whoosh", end(S.logo) - 0.28, 0.55],
  ["typing", S.finder.at + 0.1, 0.4],
  ["typing", S.finder.at + 0.75, 0.35],
  ["click", S.finder.at + 2.2, 0.6],
  ["subhit", S.finder.at + 2.4, 0.45],
  ["whoosh-fast", S.finder.at + 2.5, 0.35],
  ["whoosh-fast", S.finder.at + 3.35, 0.35],
  ["pop", S.finder.at + 3.85, 0.4],
  ["whoosh-fast", S.finder.at + 4.7, 0.35],
  ["pop", S.finder.at + 5.2, 0.4],
  ["pop", S.finder.at + 5.38, 0.35],
  // Score
  ["whoosh", end(S.finder) - 0.28, 0.55],
  ["whoosh-fast", S.score.at + 0.6, 0.38],
  ["ding", S.score.at + 1.1, 0.4],
  ["pop", S.score.at + 1.25, 0.4],
  ["whoosh-fast", S.score.at + 2.0, 0.35],
  ["pop", S.score.at + 2.6, 0.38],
  ["whoosh-fast", S.score.at + 3.1, 0.3],
  // Stat
  ["whoosh", end(S.score) - 0.3, 0.5],
  ["subhit", S.stat.at + 0.05, 0.8],
  ["ticker", S.stat.at + 0.1, 0.3],
  ["shimmer", S.stat.at + 1.7, 0.4],
  ["whoosh-fast", S.stat.at + 1.6, 0.3],
  // Dashboard
  ["whoosh", end(S.stat) - 0.28, 0.55],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.dash.at + 1.0 + i * 0.13, 0.4]),
  ["whoosh-fast", S.dash.at + 0.5, 0.35],
  ["whoosh-fast", S.dash.at + 2.45, 0.38],
  ["pop", S.dash.at + 3.15, 0.4],
  // Tagline: breakdown
  ["shimmer", S.tagline.at + 0.15, 0.4],
  ["shimmer", S.tagline.at + 1.4, 0.5],
  ["riser", S.cta.at - 1.5, 0.45],
  // CTA: the final hit
  ["subhit", S.cta.at, 0.95],
  ["shimmer", S.cta.at + 0.05, 0.5],
  ["pop", S.cta.at + 0.55, 0.4],
  ["click", S.cta.at + 1.75, 0.7],
  ["cash", S.cta.at + 1.8, 0.35],
];

/** A shot's Sequence starts LEAD early so its transition can straddle the boundary. */
function shot(s: { at: number; dur: number }) {
  return { from: f(s.at - LEAD), durationInFrames: f(s.dur + TRANSITION) };
}

function Film() {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Backdrop />
      <Sequence {...shot(S.hook)}><Hook dur={S.hook.dur} /></Sequence>
      <Sequence {...shot(S.wall)}><Wall dur={S.wall.dur} /></Sequence>
      <Sequence {...shot(S.logo)}><LogoHit dur={S.logo.dur} /></Sequence>
      <Sequence {...shot(S.finder)}><Finder dur={S.finder.dur} /></Sequence>
      <Sequence {...shot(S.score)}><Score dur={S.score.dur} /></Sequence>
      <Sequence {...shot(S.stat)}><Stat dur={S.stat.dur} /></Sequence>
      <Sequence {...shot(S.dash)}><Dash dur={S.dash.dur} /></Sequence>
      <Sequence {...shot(S.tagline)}><Tagline dur={S.tagline.dur} /></Sequence>
      <Sequence {...shot(S.cta)}><Cta dur={S.cta.dur} /></Sequence>
    </AbsoluteFill>
  );
}

export type LaunchProps = {
  /** Sub-frame samples for true motion blur, applied to every frame. 0 = off (fast drafts). 8 is a good final value. */
  motionBlur: number;
  /** WebGL light leaks over the big transitions. Needs a GPU-backed GL (`--gl=angle`). */
  lightLeaks: boolean;
};

export function OutlierLaunch({ motionBlur, lightLeaks }: LaunchProps) {
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill>
        {motionBlur > 0 ? (
          <HtmlInCanvasMotionBlur width={width} height={height} samples={motionBlur} shutterAngle={180}>
            <Film />
          </HtmlInCanvasMotionBlur>
        ) : (
          <Film />
        )}
        {lightLeaks ? (
          <>
            <Leak at={S.logo.at + 0.1} seed={3} dur={1.2} />
            <Leak at={S.stat.at + 0.1} seed={7} dur={1.0} strength={0.3} />
            <Leak at={S.cta.at + 0.1} seed={11} dur={1.3} />
          </>
        ) : null}
      </AbsoluteFill>
      <Finish />

      <Audio src={staticFile("audio/music.wav")} volume={(fr) => interpolate(fr, [TOTAL_FRAMES - f(0.7), TOTAL_FRAMES], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
