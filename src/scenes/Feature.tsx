import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { CheckIcon, Eyebrow, Scene, TiltIn, Title, Words, useProgress } from "../components/ui";
import { C, FONT } from "../theme";

function Points({ points, start }: { points: string[]; start: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 34 }}>
      {points.map((p, i) => (
        <Point key={p} text={p} start={start + i * 8} />
      ))}
    </div>
  );
}

function Point({ text, start }: { text: string; start: number }) {
  const p = useProgress(start, 14);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.body, fontSize: 30, color: C.textSecondary, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
      <span style={{ width: 38, height: 38, borderRadius: 99, background: C.accentWash, display: "grid", placeItems: "center" }}>
        <CheckIcon size={20} />
      </span>
      {text}
    </div>
  );
}

/** Copy on one side, product panel on the other. */
export function SplitFeature({ duration, eyebrow, title, points, children, flip = false, highlight = [] }: { duration: number; eyebrow: string; title: string; points: string[]; children: ReactNode; flip?: boolean; highlight?: string[] }) {
  return (
    <Scene duration={duration}>
      <AbsoluteFill style={{ flexDirection: flip ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", gap: 110, padding: "0 130px" }}>
        <div style={{ width: 720 }}>
          <Eyebrow start={2}>{eyebrow}</Eyebrow>
          <Title size={80} style={{ marginTop: 28 }}>
            <Words text={title} start={6} stagger={3} highlight={highlight} />
          </Title>
          <Points points={points} start={30} />
        </div>
        <TiltIn start={8} from={flip ? 22 : 28} style={{ width: 820 }}>
          {children}
        </TiltIn>
      </AbsoluteFill>
    </Scene>
  );
}

/** Headline above, product panel below — for the hero features. */
export function StackFeature({ duration, eyebrow, title, children, highlight = [], width = 1180 }: { duration: number; eyebrow: string; title: string; children: ReactNode; highlight?: string[]; width?: number }) {
  return (
    <Scene duration={duration}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        <Eyebrow start={2}>{eyebrow}</Eyebrow>
        <Title size={78} style={{ marginTop: 24, textAlign: "center", maxWidth: 1760 }}>
          <Words text={title} start={6} stagger={3} highlight={highlight} />
        </Title>
        <TiltIn start={10} style={{ width, marginTop: 56 }}>
          {children}
        </TiltIn>
      </AbsoluteFill>
    </Scene>
  );
}
