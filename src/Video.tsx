import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { type ComponentType, useEffect, useState } from "react";
import { SmoothMotionBlur } from "./components/blur";
import { Finish } from "./components/fx";
import { Bands } from "./film/kit";
import { AnalyzeVideo, Dashboard, End, Hook, Intro, NicheFinder, Tagline, TrackedChannels, ViralVideos } from "./film/scenes";
import { fontsReady } from "./theme";
import { FPS, SHOTS, type SceneId, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const f = (sec: number) => Math.round(sec * FPS);

/** Every scene after the first starts this long before the previous one ends, so its first words are already arriving as the old scene leaves. */
const OVERLAP = 0.2;
const lead = (id: SceneId) => (id === "hook" ? 0 : OVERLAP);
/** When a scene's own clock starts, in film seconds. */
const start = (id: SceneId) => S[id].at - lead(id);
const length = (id: SceneId) => S[id].dur + lead(id);

const SCENES: [SceneId, ComponentType<{ dur: number }>][] = [
  ["hook", Hook],
  ["intro", Intro],
  ["niche", NicheFinder],
  ["viral", ViralVideos],
  ["analyze", AnalyzeVideo],
  ["tracked", TrackedChannels],
  ["dash", Dashboard],
  ["tagline", Tagline],
  ["end", End],
];

/** Sound effects: [file, seconds, volume]. A soft whoosh into each scene, clicks on the clicks, a hit on the end card. */
const SFX: [string, number, number][] = [
  ...SCENES.slice(1).map(([id]): [string, number, number] => ["whoosh", start(id) - 0.1, 0.25]),
  ["typing", start("hook") + 0.2, 0.35],
  ["pop", start("hook") + 1.55, 0.3],
  ["shimmer", start("hook") + 2.1, 0.35],
  ["typing", start("hook") + 2.6, 0.3],
  ["subhit", start("intro") + 0.85, 0.7],
  ["shimmer", start("intro") + 0.9, 0.4],
  ["click", start("niche") + 1.95, 0.5],
  ["click", start("niche") + 3.75, 0.5],
  ...[0, 1, 2, 3].map((i): [string, number, number] => ["pop", start("viral") + 1.5 + i * 0.12, 0.25]),
  ["typing", start("analyze") + 1.9, 0.35],
  ["click", start("analyze") + 3.25, 0.5],
  ["ding", start("analyze") + 4.05, 0.35],
  ["shimmer", start("tagline") + 0.1, 0.35],
  ["subhit", start("end") + 0.1, 0.8],
  ["shimmer", start("end") + 0.05, 0.4],
];

function Film() {
  return (
    <AbsoluteFill style={{ background: "#05040c" }}>
      <Bands cuts={SCENES.slice(1).map(([id]) => start(id))} />
      {SCENES.map(([id, Scene]) => (
        <Sequence key={id} name={id} from={f(start(id))} durationInFrames={f(length(id))}>
          <Scene dur={length(id)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

/** One scene on its own (quick to render while tuning). */
export function SceneTest({ scene, motionBlur }: { scene: SceneId; motionBlur: number }) {
  useFonts();
  const [, Scene] = SCENES.find(([id]) => id === scene) ?? SCENES[4];
  const picture = (
    <AbsoluteFill style={{ background: "#05040c" }}>
      <Bands />
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
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {motionBlur > 0 ? (
        <SmoothMotionBlur samples={motionBlur} shutterAngle={SHUTTER}>
          <Film />
        </SmoothMotionBlur>
      ) : (
        <Film />
      )}
      <Finish grain={0.07} />

      <Audio src={staticFile("audio/music.wav")} volume={(fr) => interpolate(fr, [TOTAL_FRAMES - f(0.9), TOTAL_FRAMES], [0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
