import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { Shot, type Key, type Move } from "../components/Shot";
import { BuildLine, DRIFT, OUT, TiltIn, prog, useTime } from "../components/ui";
import { C } from "../theme";

/**
 * The product, full frame. Panels are designed at `design` px wide and scaled up
 * so the UI fills the shot, the way the references frame their product beats.
 * Panel centre sits at (960, 540) on the stage, so camera keys can aim at it.
 */
export function Stage({ children, design = 820, scale = 1.6, tilt = 22, yaw = -10, at = 0 }: { children: ReactNode; design?: number; scale?: number; tilt?: number; yaw?: number; at?: number }) {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: design, transform: `scale(${scale})` }}>
        <TiltIn at={at} from={tilt} yaw={yaw}>
          {children}
        </TiltIn>
      </div>
    </AbsoluteFill>
  );
}

/** A huge soft ring of light rising behind the type, like the arcs in Jupiter's and Omnipair's films. */
function Arc({ from, to }: { from: number; to: number }) {
  const t = useTime();
  const p = prog(t, 0, 1.4, DRIFT);
  const y = from + (to - from) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: 2600,
          height: 1500,
          marginLeft: -1300,
          borderRadius: "50%",
          boxShadow: `0 0 0 3px rgba(196,181,253,0.55), 0 0 90px 30px rgba(139,92,246,0.55), inset 0 0 160px 40px rgba(139,92,246,0.35)`,
          filter: "blur(6px)",
          opacity: 0.35 + 0.65 * prog(t, 0, 0.6, OUT),
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 38% at 50% 50%, rgba(0,0,0,0.85), transparent 75%)` }} />
    </AbsoluteFill>
  );
}

/**
 * A ~1s text beat: one line that builds word by word and re-centres as it grows,
 * over a slowly rising arc of light. The camera creeps in the whole time.
 */
export function TitleBeat({ id, duration, words, highlight = [], enter = "blur", exit = "blur", arc = "low", size = 118 }: { id: string; duration: number; words: string[]; highlight?: string[]; enter?: Move; exit?: Move; arc?: "low" | "high"; size?: number }) {
  // Words land on a steady pulse across the first ~60% of the beat.
  const span = Math.min(0.55, duration * 0.55);
  const beats = words.map((_, i) => 0.06 + (words.length > 1 ? (i * span) / (words.length - 1) : 0));
  const keys: Key[] = [{ t: 0, z: 1 }, { t: duration + 0.5, z: 1.06 }];
  return (
    <Shot id={id} duration={duration} enter={enter} exit={exit} keys={keys}>
      <Arc from={arc === "low" ? 980 : -1150} to={arc === "low" ? 760 : -930} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <BuildLine words={words} beats={beats} size={size} highlight={highlight} color={C.text} />
      </AbsoluteFill>
    </Shot>
  );
}
