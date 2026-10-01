import { AbsoluteFill } from "remotion";
import { Shot } from "../components/Shot";
import { BACK, IN_OUT, Logo, OUT, SwapWord, Title, prog, useTime } from "../components/ui";
import { C, GRADIENT_TEXT } from "../theme";

/** Niches that cycle through one slot of the tagline, on the beat (Pump.fun's "Trade [Solana / BNB / anything]"). */
const NICHES = ["minecraft", "cooking", "finance", "any niche."];
const NICHE_BEATS = [1.3, 1.9, 2.5, 3.1];

export function Reveal({ dur }: { dur: number }) {
  const t = useTime();
  const logo = prog(t, 0, 1.2, BACK);
  const logoBlur = prog(t, 0, 0.8, OUT);
  const glow = prog(t, 0, 1.4);
  const word = prog(t, 0.35, 1.2, IN_OUT);
  const line = prog(t, 1.0, 0.9, OUT);
  return (
    <Shot id="reveal" duration={dur} enter="push" exit="blur" keys={[{ t: 0, x: 900, y: 560, z: 0.9, r: -1 }, { t: 2.0, x: 960, y: 540, z: 1.02, r: 0 }, { t: dur + 0.9, x: 1030, y: 530, z: 1.18, r: 1 }]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {[0, 0.25].map((d) => {
          const p = prog(t, d, 1.8);
          return <div key={d} style={{ position: "absolute", width: 300, height: 300, borderRadius: 999, border: `2px solid rgba(196,181,253,${0.5 * (1 - p)})`, transform: `scale(${0.5 + p * 4.5})`, top: 250, filter: "blur(1px)" }} />;
        })}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -40 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ transform: `scale(${0.35 + 0.65 * logo})`, filter: `blur(${(1 - logoBlur) * 16}px) drop-shadow(0 0 ${60 * glow}px rgba(139,92,246,0.8))`, opacity: logoBlur, zIndex: 2 }}>
              <Logo size={190} />
            </div>
            {/* Wordmark slides out from behind the logo */}
            <div style={{ overflow: "hidden", width: 640 * word }}>
              <Title size={170} style={{ paddingLeft: 36, transform: `translateX(${(1 - word) * -260}px)`, letterSpacing: "-0.05em", whiteSpace: "nowrap", filter: word < 0.98 ? `blur(${(1 - word) * 10}px)` : undefined }}>
                Outlier
              </Title>
            </div>
          </div>
          <div style={{ marginTop: 44, display: "flex", justifyContent: "center", opacity: line, filter: line < 0.98 ? `blur(${(1 - line) * 12}px)` : undefined, transform: `translateY(${(1 - line) * 18}px)` }}>
            <Title size={64} style={{ fontWeight: 700, color: C.textSecondary, whiteSpace: "pre", display: "flex" }}>
              <span>Find outliers in </span>
              <SwapWord words={NICHES} beats={NICHE_BEATS} size={64} weight={700} style={GRADIENT_TEXT} />
            </Title>
          </div>
        </div>
      </AbsoluteFill>
    </Shot>
  );
}
