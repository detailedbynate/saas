import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { TRANSITION } from "./components/Shot";
import { Analyze, Growth, Picks, Research, Script } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { Cta, Why } from "./scenes/Outro";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { fontsReady } from "./theme";
import { FPS, SHOTS, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const end = (s: { at: number; dur: number }) => s.at + s.dur;
const f = (sec: number) => Math.round(sec * FPS);

/** Sound effects: [file, seconds, volume]. */
const SFX: [string, number, number][] = [
  // Hook
  ["pop", 0.05, 0.45],
  ["ticker", 0.85, 0.3],
  ["ding", 1.75, 0.4],
  ["pop", 1.75, 0.6],
  // A whoosh on every whip, landing just before the cut point
  ...[S.hook, S.reveal, S.research, S.growth, S.picks, S.analyze].map((s): [string, number, number] => ["whoosh", end(s) - 0.12, 0.5]),
  ["whoosh", end(S.problem) - 0.2, 0.35],
  ["whoosh", end(S.script) - 0.15, 0.45],
  // Research
  ["typing", S.research.at + 0.45, 0.5],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.research.at + 1.0 + i * 0.05, 0.25]),
  ["click", S.research.at + 1.3, 0.6],
  ["click", S.research.at + 1.5, 0.6],
  ["whoosh-fast", S.research.at + 1.65, 0.2],
  // Growth
  ["ticker", S.growth.at + 0.6, 0.22],
  // Picks
  ...[0, 1, 2, 3, 4].map((i): [string, number, number] => ["pop", S.picks.at + 0.25 + i * 0.07, 0.4]),
  // Analyze
  ["click", S.analyze.at + 0.52, 0.6],
  ["ticker", S.analyze.at + 1.05, 0.28],
  ["ding", S.analyze.at + 2.2, 0.4],
  // Script
  ["typing-long", S.script.at + 0.55, 0.42],
  // Why: one swoosh per statement, on the beat
  ...[0, 1, 2, 3].map((i): [string, number, number] => ["whoosh-fast", S.why.at + i * 0.5 - 0.06, 0.3]),
  // CTA
  ["cash", S.cta.at + 0.75, 0.5],
  ["pop", S.cta.at + 1.25, 0.4],
  ["click", S.cta.at + 2.1, 0.7],
];

function shot(s: { at: number; dur: number }, last = false) {
  return { from: f(s.at), durationInFrames: f(s.dur + (last ? 0 : TRANSITION)) };
}

export function OutlierLaunch() {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Backdrop />
      <Sequence {...shot(S.hook)}><Hook dur={S.hook.dur} /></Sequence>
      <Sequence {...shot(S.problem)}><Problem dur={S.problem.dur} /></Sequence>
      <Sequence {...shot(S.reveal)}><Reveal dur={S.reveal.dur} /></Sequence>
      <Sequence {...shot(S.research)}><Research dur={S.research.dur} /></Sequence>
      <Sequence {...shot(S.growth)}><Growth dur={S.growth.dur} /></Sequence>
      <Sequence {...shot(S.picks)}><Picks dur={S.picks.dur} /></Sequence>
      <Sequence {...shot(S.analyze)}><Analyze dur={S.analyze.dur} /></Sequence>
      <Sequence {...shot(S.script)}><Script dur={S.script.dur} /></Sequence>
      <Sequence {...shot(S.why)}><Why dur={S.why.dur} /></Sequence>
      <Sequence {...shot(S.cta, true)}><Cta dur={S.cta.dur} /></Sequence>

      <Audio src={staticFile("audio/music.wav")} volume={(fr) => interpolate(fr, [TOTAL_FRAMES - f(0.8), TOTAL_FRAMES], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
