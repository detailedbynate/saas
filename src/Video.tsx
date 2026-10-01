import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop, Bloom } from "./components/Backdrop";
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

/** Sound effects: [file, seconds, volume]. Soft whooshes sit under each dissolve, peaking mid-move. */
const SFX: [string, number, number][] = [
  // Hook
  ["pop", 0.1, 0.35],
  ["ticker", 0.75, 0.25],
  ["ticker", 1.45, 0.28],
  ["ding", 2.6, 0.38],
  ["pop", 2.65, 0.45],
  // Dissolves: a soft whoosh; pushes: a fuller one
  ...[S.hook, S.reveal, S.research, S.growth, S.picks, S.analyze].map((s): [string, number, number] => ["whoosh", end(s) + 0.05, 0.24]),
  ...[S.problem, S.why].map((s): [string, number, number] => ["whoosh", end(s) - 0.05, 0.42]),
  // Reveal: one soft tick per niche swap
  ...[1.3, 1.9, 2.5, 3.1].map((d): [string, number, number] => ["click", S.reveal.at + d, 0.28]),
  // Research
  ["typing", S.research.at + 1.3, 0.45],
  ["click", S.research.at + 2.75, 0.5],
  ["click", S.research.at + 3.15, 0.5],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.research.at + 3.4 + i * 0.18, 0.18]),
  // Growth
  ["ticker", S.growth.at + 1.6, 0.2],
  // Picks
  ...[0, 1, 2, 3, 4].map((i): [string, number, number] => ["pop", S.picks.at + 1.15 + i * 0.16, 0.26]),
  // Analyze
  ["click", S.analyze.at + 1.9, 0.55],
  ["ticker", S.analyze.at + 2.3, 0.25],
  ["ding", S.analyze.at + 4.4, 0.35],
  // Script
  ["typing-long", S.script.at + 1.6, 0.38],
  // Why: hard cut in on the breakdown, then a swoosh per statement
  ["click", S.why.at, 0.5],
  ...[1, 2, 3].map((i): [string, number, number] => ["whoosh-fast", S.why.at + i - 0.1, 0.22]),
  // CTA
  ["cash", S.cta.at + 1.25, 0.45],
  ["whoosh", S.cta.at + 2.7, 0.24],
  ["pop", S.cta.at + 3.8, 0.3],
  ["click", S.cta.at + 4.9, 0.6],
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

      {/* Light blooms on the two music drops */}
      <Bloom at={S.reveal.at + 0.1} />
      <Bloom at={S.cta.at + 0.05} strength={0.8} />

      <Audio src={staticFile("audio/music.wav")} volume={(fr) => interpolate(fr, [TOTAL_FRAMES - f(0.8), TOTAL_FRAMES], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
