import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { type ComponentType, useEffect, useState } from "react";
import { SmoothMotionBlur } from "./components/blur";
import { Finish } from "./components/fx";
import { GradientStage, INTRO_FRAMES, Intro, introLight } from "./film/intro";
import { AnalyzeVideo, End, NicheFinder, ScriptWriter, Tagline, TrackedChannels, ViralVideos } from "./film/scenes";
import { fontsReady } from "./theme";
import { FPS, SHOTS, type SceneId, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const f = (sec: number) => Math.round(sec * FPS);

/** Every scene after the first starts this long before the previous one ends, so its first words are already arriving as the old scene leaves. */
const OVERLAP = 0.2;
const lead = (id: SceneId) => (id === "intro" ? 0 : OVERLAP);
/** When a scene's own clock starts, in film seconds. */
const start = (id: SceneId) => S[id].at - lead(id);
const length = (id: SceneId) => S[id].dur + lead(id);

const SCENES: [SceneId, ComponentType<{ dur: number }>][] = [
  ["niche", NicheFinder],
  ["viral", ViralVideos],
  ["analyze", AnalyzeVideo],
  ["script", ScriptWriter],
  ["tracked", TrackedChannels],
  ["tagline", Tagline],
  ["end", End],
];

/** Sound effects: [file, seconds, volume]. A soft whoosh into each scene, clicks on the clicks, a hit on the end card. */
const SFX: [string, number, number][] = [
  ...SCENES.slice(1).map(([id]): [string, number, number] => ["whoosh", start(id) - 0.1, 0.25]),
  // intro
  ["pop", 4 / 60, 0.3],
  ["pop", 13 / 60, 0.3],
  ["typing", 52 / 60, 0.3],
  ["subhit", 150 / 60, 0.7],
  ["shimmer", 156 / 60, 0.35],
  ["pop", 293 / 60, 0.3],
  ["typing", start("niche") + 1.35, 0.3],
  ["click", start("niche") + 2.45, 0.5],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", start("niche") + 2.8 + i * 0.09, 0.22]),
  ["click", start("niche") + 5.05, 0.5],
  ["ding", start("niche") + 5.4, 0.3],
  ["click", start("script") + 2.0, 0.5],
  ["typing", start("script") + 2.3, 0.3],
  ...[0, 1, 2, 3].map((i): [string, number, number] => ["pop", start("viral") + 1.5 + i * 0.12, 0.25]),
  ["typing", start("analyze") + 1.9, 0.35],
  ["click", start("analyze") + 3.25, 0.5],
  ["ding", start("analyze") + 4.05, 0.35],
  ["shimmer", start("tagline") + 0.1, 0.35],
  ["subhit", start("end") + 0.1, 0.8],
  ["shimmer", start("end") + 0.05, 0.4],
];

function Film() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#05040c" }}>
      {/* one gradient stage under the whole film; it lightens for the middle of the intro */}
      <GradientStage f={frame} light={introLight(frame)} />
      {SCENES.map(([id, Scene]) => (
        <Sequence key={id} name={id} from={f(start(id))} durationInFrames={f(length(id))}>
          <Scene dur={length(id)} />
        </Sequence>
      ))}
      {/* The intro sits on top and fades away over its last 12 frames. */}
      <Sequence name="intro" durationInFrames={INTRO_FRAMES}>
        <Intro />
      </Sequence>
    </AbsoluteFill>
  );
}

/** One scene on its own (quick to render while tuning). */
export function SceneTest({ scene, motionBlur }: { scene: SceneId; motionBlur: number }) {
  useFonts();
  const [, Scene] = SCENES.find(([id]) => id === scene) ?? SCENES[4];
  const picture = (
    <AbsoluteFill style={{ background: "#05040c" }}>
      <GradientStage f={0} light={0} />
      <Scene dur={length(scene)} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: "#05040c" }}>
      {motionBlur > 0 ? (
        <SmoothMotionBlur samples={motionBlur} shutterAngle={SHUTTER}>
          {picture}
        </SmoothMotionBlur>
      ) : (
        picture
      )}
      <Finish grain={0.07} />
    </AbsoluteFill>
  );
}

export type LaunchProps = {
  /** Sub-frame samples for true motion blur, applied to every frame. 0 = off (fast drafts). 8 is a good final value. */
  motionBlur: number;
  /** Unused since v8 (kept so older props files still load). */
  lightLeaks?: boolean;
};

/** A light shutter: enough to soften fast moves without smearing the text. */
const SHUTTER = 120;

function useFonts() {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
}

export function OutlierLaunch({ motionBlur }: LaunchProps) {
  useFonts();
  const frame = useCurrentFrame();
  const vignette = 0.25; // a light one: the gradient should stay bright into the corners
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {motionBlur > 0 ? (
        <SmoothMotionBlur samples={motionBlur} shutterAngle={SHUTTER}>
          <Film />
        </SmoothMotionBlur>
      ) : (
        <Film />
      )}
      <Finish grain={0.07} vignette={vignette} />

      <Audio src={staticFile("audio/music.wav")} volume={(fr) => interpolate(fr, [TOTAL_FRAMES - f(0.9), TOTAL_FRAMES], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
