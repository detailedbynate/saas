import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useVideoConfig } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { Finish, Leak } from "./components/fx";
import { TRANSITION } from "./components/Shot";
import { LEAD } from "./components/ui";
import { AnalyzeVideo, AnyNiche, Dashboard, End, Hook, Multiply, NicheFinder, Tagline, TrackedChannels, TurnLogo, ViralVideos } from "./scenes/Film";
import { fontsReady } from "./theme";
import { FPS, SHOTS, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const end = (s: { at: number; dur: number }) => s.at + s.dur;
const f = (sec: number) => Math.round(sec * FPS);

/** Sound effects: [file, seconds, volume]. A soft whoosh under each dissolve, a hit on each landing. */
const SFX: [string, number, number][] = [
  ["shimmer", 0.2, 0.3],
  ["shimmer", 1.45, 0.35],
  ["whoosh", S.multiply.at + 0.7, 0.4],
  ["shimmer", S.multiply.at + 1.15, 0.3],
  ["shimmer", S.turn.at + 0.25, 0.3],
  ["riser", S.turn.at + 0.5, 0.5],
  ["subhit", S.turn.at + 2, 0.9],
  ["shimmer", S.turn.at + 2.05, 0.5],
  ["whoosh", S.niche.at - 0.3, 0.45],
  ["typing", S.niche.at + 0.5, 0.4],
  ["click", S.niche.at + 1.25, 0.55],
  ["ticker", S.niche.at + 1.7, 0.25],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.viral.at + 0.1 + i * 0.14, 0.25]),
  ["ticker", S.viral.at + 0.65, 0.28],
  ["typing", S.analyze.at + 0.45, 0.4],
  ["click", S.analyze.at + 1.4, 0.55],
  ["ding", S.analyze.at + 2.4, 0.35],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.tracked.at + 0.35 + i * 0.09, 0.3]),
  ["shimmer", S.any.at + 0.1, 0.4],
  ["whoosh", S.dash.at - 0.3, 0.45],
  ["shimmer", S.tagline.at + 0.15, 0.35],
  ["shimmer", S.tagline.at + 1.25, 0.45],
  ["riser", S.end.at - 1.5, 0.4],
  ["subhit", S.end.at, 0.9],
  ["shimmer", S.end.at + 0.05, 0.45],
  // A soft whoosh under every dissolve between features
  ...[S.niche, S.viral, S.analyze, S.tracked, S.any].map((s): [string, number, number] => ["whoosh", end(s) - 0.25, 0.22]),
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
      <Sequence {...shot(S.multiply)}><Multiply dur={S.multiply.dur} /></Sequence>
      <Sequence {...shot(S.turn)}><TurnLogo dur={S.turn.dur} /></Sequence>
      <Sequence {...shot(S.niche)}><NicheFinder dur={S.niche.dur} /></Sequence>
      <Sequence {...shot(S.viral)}><ViralVideos dur={S.viral.dur} /></Sequence>
      <Sequence {...shot(S.analyze)}><AnalyzeVideo dur={S.analyze.dur} /></Sequence>
      <Sequence {...shot(S.tracked)}><TrackedChannels dur={S.tracked.dur} /></Sequence>
      <Sequence {...shot(S.any)}><AnyNiche dur={S.any.dur} /></Sequence>
      <Sequence {...shot(S.dash)}><Dashboard dur={S.dash.dur} /></Sequence>
      <Sequence {...shot(S.tagline)}><Tagline dur={S.tagline.dur} /></Sequence>
      <Sequence {...shot(S.end)}><End dur={S.end.dur} /></Sequence>
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
            <Leak at={S.turn.at + 2.1} seed={3} dur={1.2} />
            <Leak at={S.end.at + 0.1} seed={11} dur={1.3} />
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
