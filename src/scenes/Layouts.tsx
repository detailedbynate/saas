import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { Eyebrow, TiltIn, Title, Words, useTime } from "../components/ui";

/*
 * Stage geometry, so camera keys in the scenes can aim at things:
 *   Side:  caption centre ≈ (505, 540), panel centre ≈ (1285, 540). Flipped: caption ≈ (1415, 540), panel ≈ (635, 540).
 *   Over:  caption centre ≈ (960, 250), content centre ≈ (960, 640).
 */

/** The caption keeps creeping sideways after it lands, so text is never parked either. */
function Caption({ eyebrow, title, highlight, align, size }: { eyebrow?: string; title: string; highlight: string[]; align: "left" | "right" | "center"; size: number }) {
  const t = useTime();
  const drift = (align === "right" ? 1 : -1) * t * 7;
  return (
    <div style={{ textAlign: align, transform: `translate3d(${align === "center" ? 0 : drift}px, 0, 0)` }}>
      {eyebrow ? (
        <div style={{ marginBottom: 26 }}>
          <Eyebrow at={0.25}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <Title size={size}>
        <Words text={title} at={0.45} highlight={highlight} />
      </Title>
    </div>
  );
}

/** Caption on one side, the product on the other. */
export function Side({ eyebrow, title, highlight = [], flip = false, children, design = 820, scale = 1, panelAt = 0.6, tilt = 18 }: { eyebrow?: string; title: string; highlight?: string[]; flip?: boolean; children: ReactNode; design?: number; scale?: number; panelAt?: number; tilt?: number }) {
  return (
    <AbsoluteFill style={{ flexDirection: flip ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", gap: 90 }}>
      <div style={{ width: 560 }}>
        <Caption eyebrow={eyebrow} title={title} highlight={highlight} align={flip ? "right" : "left"} size={80} />
      </div>
      <div style={{ width: design * scale, display: "flex", justifyContent: "center" }}>
        <div style={{ width: design, transform: `scale(${scale})`, flexShrink: 0 }}>
          <TiltIn at={panelAt} from={tilt} yaw={flip ? 12 : -12}>
            {children}
          </TiltIn>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Caption on top, wide content below. */
export function Over({ eyebrow, title, highlight = [], children, design = 1180, scale = 1, panelAt = 0.6, tilt = 18 }: { eyebrow?: string; title: string; highlight?: string[]; children: ReactNode; design?: number; scale?: number; panelAt?: number; tilt?: number }) {
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
      <Caption eyebrow={eyebrow} title={title} highlight={highlight} align="center" size={70} />
      <div style={{ width: design, transform: `scale(${scale})`, transformOrigin: "50% 0", marginTop: 70 }}>
        <TiltIn at={panelAt} from={tilt} yaw={0}>
          {children}
        </TiltIn>
      </div>
    </AbsoluteFill>
  );
}
