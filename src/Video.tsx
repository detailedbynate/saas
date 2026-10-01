import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { Analyze, Growth, Picks, Research, Script } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Cta, Why } from "./scenes/Outro";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { fontsReady } from "./theme";
import { SCENES, TOTAL_FRAMES } from "./timeline";

const S = SCENES;

/** Sound effects: [file, frame, volume]. Frames are absolute. */
const SFX: [string, number, number][] = [
  // Hook
  ["pop", 6, 0.5],
  ["ticker", S.hook.from + 62, 0.35],
  ["ding", 106, 0.45],
  ["pop", 118, 0.6],
  ["whoosh", S.problem.from - 8, 0.5],
  // Problem → reveal (the impact is in the music)
  ["whoosh", S.reveal.from - 12, 0.4],
  // Research
  ["whoosh", S.research.from - 8, 0.45],
  ["typing", S.research.from + 26, 0.5],
  ["pop", S.research.from + 52, 0.3],
  ["pop", S.research.from + 56, 0.3],
  ["pop", S.research.from + 60, 0.3],
  ["click", S.research.from + 64, 0.6],
  ["click", S.research.from + 72, 0.6],
  ["whoosh-fast", S.research.from + 84, 0.25],
  // Growth
  ["whoosh", S.growth.from - 8, 0.45],
  ["ticker", S.growth.from + 40, 0.25],
  ["ding", S.growth.from + 84, 0.3],
  // Picks
  ["whoosh", S.picks.from - 8, 0.45],
  ...[0, 1, 2, 3, 4].map((i): [string, number, number] => ["pop", S.picks.from + 22 + i * 10, 0.45]),
  // Analyze
  ["whoosh", S.analyze.from - 8, 0.45],
  ["click", S.analyze.from + 44, 0.6],
  ["ticker", S.analyze.from + 52, 0.3],
  ["ding", S.analyze.from + 110, 0.45],
  // Script
  ["whoosh", S.script.from - 8, 0.45],
  ["typing-long", S.script.from + 26, 0.45],
  // Why
  ...[0, 1, 2, 3].map((i): [string, number, number] => ["whoosh-fast", S.why.from + i * 30 - 3, 0.35]),
  // CTA
  ["cash", S.cta.from + 46, 0.5],
  ["pop", S.cta.from + 84, 0.45],
  ["click", S.cta.from + 128, 0.7],
];

export function OutlierLaunch() {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Backdrop />
      <Sequence from={S.hook.from} durationInFrames={S.hook.duration}><Hook duration={S.hook.duration} /></Sequence>
      <Sequence from={S.problem.from} durationInFrames={S.problem.duration}><Problem duration={S.problem.duration} /></Sequence>
      <Sequence from={S.reveal.from} durationInFrames={S.reveal.duration}><Reveal duration={S.reveal.duration} /></Sequence>
      <Sequence from={S.research.from} durationInFrames={S.research.duration}><Research duration={S.research.duration} /></Sequence>
      <Sequence from={S.growth.from} durationInFrames={S.growth.duration}><Growth duration={S.growth.duration} /></Sequence>
      <Sequence from={S.picks.from} durationInFrames={S.picks.duration}><Picks duration={S.picks.duration} /></Sequence>
      <Sequence from={S.analyze.from} durationInFrames={S.analyze.duration}><Analyze duration={S.analyze.duration} /></Sequence>
      <Sequence from={S.script.from} durationInFrames={S.script.duration}><Script duration={S.script.duration} /></Sequence>
      <Sequence from={S.why.from} durationInFrames={S.why.duration}><Why duration={S.why.duration} /></Sequence>
      <Sequence from={S.cta.from} durationInFrames={S.cta.duration}><Cta duration={S.cta.duration} /></Sequence>

      <Audio src={staticFile("audio/music.wav")} volume={(f) => interpolate(f, [TOTAL_FRAMES - 30, TOTAL_FRAMES], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, at)} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
