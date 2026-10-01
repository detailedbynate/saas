import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { useEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { TRANSITION } from "./components/Shot";
import { Compare, End, Finder, Picks, Score, Script, Tracker } from "./scenes/Beats";
import { Prompt, Scan } from "./scenes/Open";
import { fontsReady } from "./theme";
import { FPS, SHOTS, TOTAL_FRAMES } from "./timeline";

const S = SHOTS;
const end = (s: { at: number; dur: number }) => s.at + s.dur;
const f = (sec: number) => Math.round(sec * FPS);

/** Sound effects: [file, seconds, volume]. Soft whooshes sit under each dissolve. */
const SFX: [string, number, number][] = [
  // Prompt: typing, the send click, and a whoosh into the scan
  ["typing-long", S.prompt.at + 0.5, 0.4],
  ["click", S.prompt.at + 1.95, 0.6],
  ["whoosh-fast", S.prompt.at + 2.15, 0.4],
  // Scan → first feature
  ["whoosh", end(S.scan) - 0.1, 0.4],
  // Finder: thumbnails land, counter ticks
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.finder.at + 0.15 + i * 0.12, 0.2]),
  ["ticker", S.finder.at + 0.6, 0.3],
  ["ticker", S.finder.at + 1.6, 0.25],
  // Picks: tiles pop out of the card
  ...[0, 1, 2, 3].map((i): [string, number, number] => ["pop", S.picks.at + 1.0 + i * 0.07, 0.28]),
  // Analyzer
  ["typing", S.score.at + 0.85, 0.42],
  ["click", S.score.at + 1.95, 0.6],
  ["ding", S.score.at + 2.6, 0.35],
  ["whoosh-fast", S.score.at + 2.9, 0.28],
  ["ticker", S.score.at + 3.35, 0.25],
  // Tracker
  ["typing", S.tracker.at + 0.3, 0.4],
  ["click", S.tracker.at + 1.25, 0.6],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.tracker.at + 2.1 + i * 0.08, 0.3]),
  // Script
  ["typing", S.script.at + 0.25, 0.4],
  ["pop", S.script.at + 1.12, 0.35],
  ["click", S.script.at + 1.6, 0.6],
  ...[0, 1, 2].map((i): [string, number, number] => ["pop", S.script.at + 2.35 + i * 0.1, 0.3]),
  // Compare: a swoosh per wipe
  ...[0.35, 1.15, 1.95].map((d): [string, number, number] => ["whoosh-fast", S.compare.at + d, 0.2]),
  // End
  ["whoosh", end(S.compare) - 0.15, 0.4],
  ["cash", S.end.at + 0.2, 0.4],
];

/** Soft whooshes under every dissolve between features. */
for (const s of [S.finder, S.picks, S.score, S.tracker, S.script]) SFX.push(["whoosh", end(s) - 0.05, 0.22]);

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
      <Sequence {...shot(S.prompt)}><Prompt dur={S.prompt.dur} /></Sequence>
      <Sequence {...shot(S.scan)}><Scan dur={S.scan.dur} /></Sequence>
      <Sequence {...shot(S.finder)}><Finder dur={S.finder.dur} /></Sequence>
      <Sequence {...shot(S.picks)}><Picks dur={S.picks.dur} /></Sequence>
      <Sequence {...shot(S.score)}><Score dur={S.score.dur} /></Sequence>
      <Sequence {...shot(S.tracker)}><Tracker dur={S.tracker.dur} /></Sequence>
      <Sequence {...shot(S.script)}><Script dur={S.script.dur} /></Sequence>
      <Sequence {...shot(S.compare)}><Compare dur={S.compare.dur} /></Sequence>
      <Sequence {...shot(S.end, true)}><End dur={S.end.dur} /></Sequence>

      <Audio src={staticFile("audio/music.wav")} volume={(fr) => interpolate(fr, [TOTAL_FRAMES - f(0.6), TOTAL_FRAMES], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {SFX.map(([name, at, vol], i) => (
        <Sequence key={i} from={Math.max(0, f(at))} layout="none">
          <Audio src={staticFile(`audio/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
