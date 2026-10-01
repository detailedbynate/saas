import { AbsoluteFill } from "remotion";
import { Fluid } from "../components/Backdrop";
import { LILAC, SoftType, Spinner, VIOLET } from "../components/kit";
import { Shot } from "../components/Shot";
import { IN_OUT, OUT, prog, useTime } from "../components/ui";
import { FONT } from "../theme";

/* ------------------------------------------------------------------ Prompt (Algrow 0–2.65) */

const QUERY = "find breakout Shorts channels in minecraft";

/** A glossy 3D-ish violet arrow, the reference's send cursor. */
function Arrow3D({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", filter: `drop-shadow(0 12px 24px rgba(${VIOLET},0.7))` }}>
      <defs>
        <linearGradient id="arrowFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="0.55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <path d="M14 10 L88 46 L54 56 L40 90 Z" fill="#3b0f86" transform="translate(5 5)" />
      <path d="M14 10 L88 46 L54 56 L40 90 Z" fill="url(#arrowFace)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 16 L70 42" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Prompt({ dur }: { dur: number }) {
  const t = useTime();
  const grow = prog(t, 0.05, 0.8, IN_OUT);
  const glow = prog(t, 0.25, 0.7);
  const w = 180 + 1020 * grow;
  const press = prog(t, 1.95, 0.35);
  const arrow = prog(t, 1.4, 0.5, OUT);
  const pressed = t >= 1.95 && t < 2.08;
  return (
    <Shot
      id="prompt"
      duration={dur}
      enter="cut"
      exit="cut"
      keys={[
        { t: 0, x: 860, y: 610, z: 0.86, ry: 8 },
        { t: 1.1, x: 950, y: 548, z: 1.0, ry: 2 },
        { t: 2.0, x: 1110, y: 540, z: 1.14, ry: -2 },
        { t: 2.5, x: 1400, y: 540, z: 1.7, ry: -6 },
      ]}
    >
      {/* Soft halo behind the bar */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${30 + 25 * glow}% ${18 + 10 * glow}% at 50% 50%, rgba(${VIOLET},${0.28 * glow}), transparent 70%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: w,
            height: 112,
            borderRadius: 999,
            opacity: prog(t, 0, 0.3),
            background: `linear-gradient(180deg, rgba(${VIOLET},${0.25 + 0.55 * glow}), rgba(76,29,149,${0.3 + 0.6 * glow}))`,
            border: `2px solid rgba(${LILAC},${0.2 + 0.7 * glow})`,
            boxShadow: `0 0 ${50 * glow}px rgba(${VIOLET},${0.8 * glow}), 0 0 ${140 * glow}px rgba(${VIOLET},${0.35 * glow}), inset 0 2px 0 rgba(255,255,255,${0.35 * glow}), inset 0 -10px 30px rgba(0,0,0,0.25)`,
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            overflow: "hidden",
            fontFamily: FONT.body,
            fontWeight: 500,
            fontSize: 40,
            color: "#fff",
          }}
        >
          <SoftType text={QUERY} at={0.5} cps={34} trail={4} />
        </div>
        {/* Send button sitting on the bar's right end */}
        <div
          style={{
            position: "absolute",
            left: 960 + w / 2 - 70,
            top: 540 - 44,
            width: 88,
            height: 88,
            borderRadius: 99,
            opacity: prog(t, 0.6, 0.4),
            background: `radial-gradient(circle at 35% 30%, #ddd6fe, #8b5cf6 55%, #5b21b6)`,
            boxShadow: `0 0 ${30 + 60 * press * (1 - press) * 4}px rgba(${VIOLET},0.9), inset 0 2px 0 rgba(255,255,255,0.5)`,
            transform: `scale(${pressed ? 0.9 : 1})`,
          }}
        />
        {/* The arrow cursor flies in and presses send */}
        <div
          style={{
            position: "absolute",
            left: 960 + w / 2 - 50 + (1 - arrow) * 380,
            top: 520 + (1 - arrow) * 260,
            opacity: arrow,
            transform: `rotate(${(1 - arrow) * 30}deg) scale(${pressed ? 0.88 : 1})`,
            filter: arrow < 0.99 ? `blur(${(1 - arrow) * 8}px)` : undefined,
          }}
        >
          <Arrow3D />
        </div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ Scan (Algrow 2.65–3.55) */

const SCAN = "Scanning millions of Shorts";

export function Scan({ dur }: { dur: number }) {
  const t = useTime();
  const sweep = -4 + (t / dur) * (SCAN.length + 8);
  return (
    <Shot id="scan" duration={dur} enter="cut" exit="push" keys={[{ t: 0, z: 1.0 }, { t: dur + 0.5, z: 1.1, r: 1 }]}>
      <Fluid t={t + 2} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26 }}>
        <div style={{ opacity: prog(t, 0, 0.3) }}>
          <Spinner size={86} />
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 46, letterSpacing: "-0.01em", whiteSpace: "pre", textShadow: `0 0 18px rgba(${LILAC},0.6)` }}>
          {SCAN.split("").map((ch, i) => {
            const d = Math.abs(i - sweep);
            const lit = Math.max(0, 1 - d / 5);
            return (
              <span key={i} style={{ color: `rgba(255,255,255,${0.55 + 0.45 * lit})` }}>
                {ch}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </Shot>
  );
}
