import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo, Scene, Title, Words, clamp, easeOut, useSpring } from "../components/ui";
import { C, FONT } from "../theme";

const NICHES = ["cooking hacks", "minecraft", "personal finance", "pets", "satisfying", "fitness", "tech reviews", "comedy skits", "history facts", "skincare", "cars", "travel", "roblox", "motivation"];

function Marquee() {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [40, 60], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, overflow: "hidden", opacity: p, maskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)" }}>
      <div style={{ display: "flex", gap: 18, transform: `translateX(${-frame * 3}px)`, width: "max-content" }}>
        {[...NICHES, ...NICHES].map((n, i) => (
          <span key={i} style={{ padding: "12px 24px", borderRadius: 999, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.textSecondary, fontFamily: FONT.body, fontSize: 24, whiteSpace: "nowrap" }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Reveal({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const logo = useSpring(0, 11, 0.8);
  const ring = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: easeOut });
  const word = useSpring(14, 16, 0.8);
  return (
    <Scene duration={duration} enter={1} drift={0.03}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* Shockwave rings */}
        {[0, 8].map((d) => {
          const p = interpolate(frame, [d, d + 40], [0, 1], { ...clamp, easing: easeOut });
          return <div key={d} style={{ position: "absolute", width: 300, height: 300, borderRadius: 999, border: `2px solid rgba(196,181,253,${0.6 * (1 - p)})`, transform: `scale(${0.6 + p * 4})`, top: 230 }} />;
        })}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ transform: `scale(${0.3 + 0.7 * logo}) rotate(${(1 - logo) * -25}deg)`, filter: `drop-shadow(0 0 ${60 * ring}px rgba(139,92,246,0.8))` }}>
              <Logo size={190} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <Title size={170} style={{ transform: `translateX(${(1 - word) * -60}px)`, opacity: word, letterSpacing: "-0.05em" }}>
                Outlier
              </Title>
            </div>
          </div>
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <Title size={58} style={{ fontWeight: 700, color: C.textSecondary }}>
              <Words text="Find your next outlier before everyone else." start={30} stagger={3} highlight={["outlier"]} />
            </Title>
          </div>
        </div>
      </AbsoluteFill>
      <Marquee />
    </Scene>
  );
}
