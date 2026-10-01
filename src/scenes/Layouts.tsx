import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { TiltIn, Title, Words } from "../components/ui";

/** Big headline on one side, the product in motion on the other. Panel centre is x≈1375 (≈545 flipped), y≈540. */
export function Split({ title, children, flip = false, highlight = [] }: { title: string; children: ReactNode; flip?: boolean; highlight?: string[] }) {
  return (
    <AbsoluteFill style={{ flexDirection: flip ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", gap: 110 }}>
      <div style={{ width: 720 }}>
        <Title size={96}>
          <Words text={title} at={0.08} stagger={0.035} highlight={highlight} />
        </Title>
      </div>
      <TiltIn at={0.12} from={flip ? 20 : 26} style={{ width: 820 }}>
        {children}
      </TiltIn>
    </AbsoluteFill>
  );
}

/** Headline on top, product below. */
export function Stack({ title, children, highlight = [], width = 1180 }: { title: string; children: ReactNode; highlight?: string[]; width?: number }) {
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
      <Title size={84} style={{ textAlign: "center", maxWidth: 1760 }}>
        <Words text={title} at={0.08} stagger={0.035} highlight={highlight} />
      </Title>
      <TiltIn at={0.15} style={{ width, marginTop: 64 }}>
        {children}
      </TiltIn>
    </AbsoluteFill>
  );
}
