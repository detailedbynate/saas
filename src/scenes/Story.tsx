import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Kinetic, ShortCard, Sparks, bouncy, firm, sp } from "../components/fx";
import { LILAC, LogoMark, VIOLET } from "../components/kit";
import { Shot } from "../components/Shot";
import { clamp, prog, useTime } from "../components/ui";
import { C, FONT } from "../theme";

/* ------------------------------------------------------------------ 1. Hook */

/** "Going viral / isn't luck." over a slow aurora that swells with each line. */
export function Hook({ dur }: { dur: number }) {
  const t = useTime();
  const swell = 0.6 + 0.4 * sp(t, 1.3, firm);
  return (
    <Shot
      id="hook"
      duration={dur}
      enter="cut"
      exit="zoomIn"
      keys={[
        { t: 0, z: 0.94, r: -1.5 },
        { t: 1.3, z: 1.02, r: 0 },
        { t: 3.2, z: 1.16, r: 1.2 },
      ]}
    >
      {/* Aurora: two counter-rotating lobes of light behind the type */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 2000,
            height: 860,
            marginLeft: -1000,
            marginTop: -430,
            borderRadius: "50%",
            transform: `rotate(${(i ? -1 : 1) * (18 + t * 9)}deg) scale(${swell * (i ? 0.8 : 1)})`,
            // Wide radial falloffs give the soft look without a live blur filter.
            background: i ? `radial-gradient(ellipse 46% 46% at 44% 50%, rgba(236,72,153,0.42), rgba(${VIOLET},0.22) 40%, rgba(${VIOLET},0.07) 72%, transparent 100%)` : `radial-gradient(ellipse 46% 46% at 54% 50%, rgba(${LILAC},0.5), rgba(${VIOLET},0.36) 36%, rgba(${VIOLET},0.1) 70%, transparent 100%)`,
            opacity: prog(t, 0, 0.8) * 0.9,
          }}
        />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute" }}>
          <Kinetic text="Going viral" at={0.15} out={1.15} size={150} />
        </div>
        <div style={{ position: "absolute" }}>
          <Kinetic text="isn't luck." at={1.35} size={170} accent={["luck"]} glow={0.6} />
        </div>
      </AbsoluteFill>
    </Shot>
  );
}

/* ------------------------------------------------------------------ 2. The wall */

const CLIPS = ["short-b", "hoops-3", "short-a", "short-c", "hoops-1", "hoops-2"];
const COLS = 11;
const ROWS = 5;
const CW = 150;
const CH = 266;
const GX = 174;
const GY = 290;
/** The cards that turn out to be outliers: [row, col, badge]. The centre card is the one we open on. */
const OUTLIERS: [number, number, string][] = [
  [2, 5, "405×"],
  [1, 2, "151×"],
  [3, 8, "137×"],
];

/**
 * Opens tight on one Short, speed-ramps back to reveal a wall of them, then the wall
 * dims and three cards light up with their outlier scores.
 */
export function Wall({ dur }: { dur: number }) {
  const t = useTime();
  const dim = prog(t, 3.0, 0.7, Easing.bezier(0.65, 0, 0.35, 1));
  const reveal = prog(t, 1.0, 0.9); // other cards fade up as the camera pulls back
  return (
    <>
      <Shot
        id="wall"
        duration={dur}
        enter="zoomIn"
        exit="zoomIn"
        keys={[
          { t: 0, z: 2.75, r: 0 },
          { t: 1.0, z: 2.55 },
          { t: 1.9, z: 1.02, r: -2, ramp: true },
          { t: 4.4, z: 1.16, r: 0.5 },
          { t: 5.2, z: 1.5 },
        ]}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const hit = OUTLIERS.find(([or, oc]) => or === r && oc === c);
          const centre = r === 2 && c === 5;
          // Rows above and below the centre drift in opposite directions.
          const drift = (r - 2) * 16 * Math.max(0, t - 1);
          const x = 960 + (c - 5) * GX - CW / 2 + drift;
          const y = 540 + (r - 2) * GY - CH / 2;
          const clip = CLIPS[(r * 3 + c * 5) % CLIPS.length];
          const live = centre || (hit !== undefined && true);
          const pop = hit ? sp(t, 3.25 + OUTLIERS.indexOf(hit) * 0.14, bouncy) : 0;
          const fade = centre ? 1 : reveal;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                // Dimming is opacity only: a blur filter on 50 cards is very slow to render.
                opacity: fade * (hit ? 1 : 1 - 0.8 * dim),
                transform: `scale(${1 + 0.16 * pop})`,
                zIndex: hit ? 3 : 1,
              }}
            >
              <ShortCard clip={centre ? "short-b" : clip} w={CW} h={CH} live={live} from={(i % 4) * 0.6} flat={!hit} glow={hit ? 0.25 + 0.75 * pop : 0.12} />
              {hit ? (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -18,
                    transform: `translateX(-50%) scale(${pop})`,
                    padding: "5px 14px",
                    borderRadius: 999,
                    background: C.accent,
                    color: "#fff",
                    fontFamily: FONT.display,
                    fontWeight: 800,
                    fontSize: 24,
                    whiteSpace: "nowrap",
                    boxShadow: `0 0 30px rgba(${VIOLET},0.9)`,
                    opacity: Math.min(1, pop * 2),
                  }}
                >
                  {hit[2]}
                </div>
              ) : null}
            </div>
          );
        })}
        <Sparks x={960} y={540 - CH / 2} at={3.25} seed="w1" reach={220} count={14} />
      </Shot>
      {/* Foreground cards sweep past the lens during the pull-back, for depth */}
      {[0, 1].map((i) => {
        const p = interpolate(t, [0.95 + i * 0.12, 2.1 + i * 0.12], [0, 1], clamp);
        if (p <= 0 || p >= 1) return null;
        return (
          <div key={i} style={{ position: "absolute", left: i ? 1920 - p * 2600 : -700 + p * 2600, top: i ? 520 : -120, filter: "blur(22px)", opacity: 0.55 * Math.sin(p * Math.PI), transform: `rotate(${i ? 8 : -10}deg)` }}>
            <ShortCard clip={CLIPS[i + 2]} w={520} h={924} glow={0} />
          </div>
        );
      })}
      {/* Captions sit in screen space, over a soft scrim */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 96 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, background: "linear-gradient(180deg, transparent, rgba(4,2,9,0.92))", opacity: prog(t, 1.4, 0.5) * (1 - prog(t, dur - 0.25, 0.25)) }} />
        <div style={{ position: "absolute", bottom: 96 }}>
          <Kinetic text="Millions of Shorts." at={1.55} out={2.85} size={104} />
        </div>
        <div style={{ position: "absolute", bottom: 96 }}>
          <Kinetic text="A few break out." at={3.15} out={dur - 0.3} size={104} accent={["break", "out"]} glow={0.5} />
        </div>
      </AbsoluteFill>
    </>
  );
}

/* ------------------------------------------------------------------ 3. Logo hit (the drop) */

export function LogoHit({ dur }: { dur: number }) {
  const t = useTime();
  const hit = sp(t, 0, bouncy);
  const ring = prog(t, 0, 1.1);
  const sub = sp(t, 0.5, firm);
  return (
    <Shot
      id="logo"
      duration={dur}
      enter="zoomIn"
      exit="whipU"
      keys={[
        { t: 0, z: 0.92, r: -1 },
        { t: 1.7, z: 1.1, r: 0.6 },
      ]}
    >
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${40 + 30 * ring}% ${35 + 25 * ring}% at 50% 48%, rgba(${VIOLET},${0.55 * (1 - ring * 0.6)}), transparent 72%)` }} />
      {/* Shockwave rings */}
      {[0, 0.12, 0.26].map((d) => {
        const p = prog(t, d, 1.2);
        return <div key={d} style={{ position: "absolute", left: 960 - 160, top: 500 - 160, width: 320, height: 320, borderRadius: 999, border: `3px solid rgba(${LILAC},${0.7 * (1 - p)})`, transform: `scale(${0.4 + p * 5})` }} />;
      })}
      <Sparks x={960} y={500} at={0} seed="logo" reach={620} count={34} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: -40 }}>
          <div style={{ transform: `scale(${0.3 + 0.7 * hit}) rotate(${(1 - hit) * -25}deg)`, borderRadius: 44, overflow: "hidden", boxShadow: `0 0 ${90 * hit}px rgba(${VIOLET},0.9), 0 0 200px rgba(${VIOLET},0.4)` }}>
            <LogoMark size={200} />
          </div>
          <Kinetic text="Outlier" at={0.1} size={210} stagger={0.04} style={{ textAlign: "left" }} />
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT.body, fontWeight: 500, fontSize: 46, color: C.textSecondary, opacity: sub, transform: `translate(0, ${(1 - sub) * 26}px)`, filter: sub < 0.95 ? `blur(${(1 - sub) * 8}px)` : undefined }}>See what's about to blow up.</div>
      </AbsoluteFill>
    </Shot>
  );
}
