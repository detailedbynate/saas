import { AbsoluteFill } from "remotion";
import { Shot } from "../components/Shot";
import { BACK, Logo, OUT, Title, Words, prog, useTime } from "../components/ui";
import { C, FONT } from "../theme";

const NICHES = ["cooking hacks", "minecraft", "personal finance", "pets", "satisfying", "fitness", "tech reviews", "comedy skits", "history facts", "skincare", "cars", "travel", "roblox", "motivation"];

function Marquee() {
  const t = useTime();
  const p = prog(t, 0.6, 0.6);
  return (
    <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, overflow: "hidden", opacity: p, transform: `translateY(${(1 - p) * 30}px)`, maskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)" }}>
      <div style={{ display: "flex", gap: 18, transform: `translateX(${-200 - t * 160}px)`, width: "max-content" }}>
        {[...NICHES, ...NICHES].map((n, i) => (
          <span key={i} style={{ padding: "12px 24px", borderRadius: 999, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.04)", color: C.textSecondary, fontFamily: FONT.body, fontSize: 24, whiteSpace: "nowrap" }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Reveal({ dur }: { dur: number }) {
  const t = useTime();
  const logo = prog(t, 0, 0.7, BACK);
  const glow = prog(t, 0, 0.8);
  const word = prog(t, 0.18, 0.8, OUT);
  return (
    <Shot id="reveal" duration={dur} enter="zoom" exit="left" keys={[{ t: 0, z: 1 }, { t: 2.4, z: 1.07 }]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {[0, 0.12].map((d) => {
          const p = prog(t, d, 0.9);
          return <div key={d} style={{ position: "absolute", width: 300, height: 300, borderRadius: 999, border: `2px solid rgba(196,181,253,${0.55 * (1 - p)})`, transform: `scale(${0.5 + p * 4.5})`, top: 230 }} />;
        })}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -60 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ transform: `scale(${0.2 + 0.8 * logo}) rotate(${(1 - logo) * -40}deg)`, filter: `drop-shadow(0 0 ${60 * glow}px rgba(139,92,246,0.8))`, zIndex: 2 }}>
              <Logo size={190} />
            </div>
            {/* Wordmark slides out from behind the logo */}
            <div style={{ overflow: "hidden", width: 640 * word, transition: "none" }}>
              <Title size={170} style={{ paddingLeft: 36, transform: `translateX(${(1 - word) * -260}px)`, letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>
                Outlier
              </Title>
            </div>
          </div>
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <Title size={58} style={{ fontWeight: 700, color: C.textSecondary }}>
              <Words text="Find your next outlier before everyone else." at={0.45} stagger={0.035} highlight={["outlier"]} />
            </Title>
          </div>
        </div>
      </AbsoluteFill>
      <Marquee />
    </Shot>
  );
}
