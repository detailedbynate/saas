import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop, Bloom } from "./components/Backdrop";
import { TRANSITION } from "./components/Shot";
import { Analyze, Growth, Picks, Research, Script } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { TitleBeat } from "./scenes/Layouts";
import { Cta, Why } from "./scenes/Outro";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { fontsReady } from "./theme";
import { FPS, SHOTS, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const end = (s: { at: number; dur: number }) => s.at + s.dur;
const f = (sec: number) => Math.round(sec * FPS);

/** Sound effects: [file, seconds, volume]. Whooshes sit just before each transition so they peak mid-move. */
const SFX: [string, number, number][] = [
  // Hook
  ["pop", 0.05, 0.4],
  ["ticker", 0.4, 0.25],
  ["ticker", 0.9, 0.3],
  ["ding", 1.75, 0.4],
  ["pop", 1.75, 0.55],
  // Soft whooshes under blur dissolves, fuller ones under pushes
  ...[S.hook, S.researchTitle, S.research, S.picksTitle, S.analyzeTitle, S.analyze, S.scriptTitle].map((s): [string, number, number] => ["whoosh", end(s) - 0.1, 0.28]),
  ...[S.problem, S.growthTitle, S.why].map((s): [string, number, number] => ["whoosh", end(s) - 0.15, 0.5]),
  ["whoosh-fast", end(S.reveal) - 0.05, 0.3],
  ["whoosh-fast", end(S.picks) - 0.05, 0.35],
  // The hard cut out of Growth lands on the beat with a click
  ["click", end(S.growth), 0.5],
  // Reveal: one tick per niche swap
  ...[0.75, 1.0, 1.25, 1.5].map((d): [string, number, number] => ["click", S.reveal.at + d, 0.35]),
  // Title beats: a soft pop as each line resolves
  ...[S.researchTitle, S.growthTitle, S.picksTitle, S.analyzeTitle, S.scriptTitle].map((s): [string, number, number] => ["pop", s.at + 0.1, 0.22]),
  // Research
  ["typing", S.research.at + 0.3, 0.5],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.research.at + 0.7 + i * 0.05, 0.22]),
  ["click", S.research.at + 0.97, 0.6],
  ["click", S.research.at + 1.17, 0.6],
  // Growth
  ["ticker", S.growth.at + 0.7, 0.22],
  // Picks
  ...[0, 1, 2, 3, 4].map((i): [string, number, number] => ["pop", S.picks.at + 0.25 + i * 0.08, 0.35]),
  // Analyze
  ["click", S.analyze.at + 0.48, 0.6],
  ["ticker", S.analyze.at + 0.8, 0.28],
  ["ding", S.analyze.at + 2.1, 0.4],
  // Script
  ["typing-long", S.script.at + 0.3, 0.42],
  // Why: hard cut in on the breakdown, then one swoosh per statement, on the beat
  ["click", S.why.at, 0.55],
  ...[1, 2, 3].map((i): [string, number, number] => ["whoosh-fast", S.why.at + i * 0.5 - 0.06, 0.26]),
  // CTA
  ["cash", S.cta.at + 0.8, 0.5],
  ["whoosh", S.cta.at + 3.3, 0.3],
  ["pop", S.cta.at + 3.95, 0.35],
  ["click", S.cta.at + 4.75, 0.7],
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

      <Sequence {...shot(S.researchTitle)}><TitleBeat id="t-research" duration={S.researchTitle.dur} words={["Find", "breakout", "channels."]} highlight={["breakout"]} exit="rise" /></Sequence>
      <Sequence {...shot(S.research)}><Research dur={S.research.dur} /></Sequence>

      <Sequence {...shot(S.growthTitle)}><TitleBeat id="t-growth" duration={S.growthTitle.dur} words={["Catch", "them", "mid-climb."]} highlight={["mid-climb"]} arc="high" exit="push" /></Sequence>
      <Sequence {...shot(S.growth)}><Growth dur={S.growth.dur} /></Sequence>

      <Sequence {...shot(S.picksTitle)}><TitleBeat id="t-picks" duration={S.picksTitle.dur} words={["Five", "picks.", "Every", "day."]} highlight={["Five"]} enter="cut" exit="rise" /></Sequence>
      <Sequence {...shot(S.picks)}><Picks dur={S.picks.dur} /></Sequence>

      <Sequence {...shot(S.analyzeTitle)}><TitleBeat id="t-analyze" duration={S.analyzeTitle.dur} words={["See", "how", "far", "it", "beat", "its", "channel."]} highlight={["beat"]} arc="high" enter="slide" size={104} /></Sequence>
      <Sequence {...shot(S.analyze)}><Analyze dur={S.analyze.dur} /></Sequence>

      <Sequence {...shot(S.scriptTitle)}><TitleBeat id="t-script" duration={S.scriptTitle.dur} words={["Then", "write", "the", "script."]} highlight={["script"]} exit="rise" /></Sequence>
      <Sequence {...shot(S.script)}><Script dur={S.script.dur} /></Sequence>

      <Sequence {...shot(S.why)}><Why dur={S.why.dur} /></Sequence>
      <Sequence {...shot(S.cta, true)}><Cta dur={S.cta.dur} /></Sequence>

      {/* Light blooms on the two music drops */}
      <Bloom at={S.reveal.at + 0.05} />
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
