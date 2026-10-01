import { AbsoluteFill, Easing, Sequence } from "remotion";
import { AppClip, AppStill, AppWindow, Callout, Kinetic, ShortCard, Sparks, Spot, app, bouncy, firm, sp } from "../components/fx";
import { LILAC, VIOLET } from "../components/kit";
import { Shot } from "../components/Shot";
import { Counter, LEAD, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";

const F = 60;
/** Frames from the start of a scene's Sequence to scene time `t` (the Sequence starts LEAD early). */
const fr = (t: number) => Math.round((t + LEAD) * F);

/* ------------------------------------------------------------------ 4. Niche Finder */

/**
 * The real recording: "Minecraft" is typed and Research is clicked (two stretches of the
 * recording, sped up, skipping the wait), then the results land and the camera
 * speed-ramps between what the niche pays and who is going viral in it.
 */
export function Finder({ dur }: { dur: number }) {
  const t = useTime();
  const flash = prog(t, 2.38, 0.12) * (1 - prog(t, 2.5, 0.5));
  return (
    <Shot
      id="finder"
      duration={dur}
      enter="whipU"
      exit="whipL"
      keys={[
        { t: 0, x: 815, y: 296, z: 2.3 },
        { t: 2.3, x: 905, y: 282, z: 2.12 },
        { t: 3.15, x: 960, y: 520, z: 1.03, ramp: true },
        { t: 3.3, x: 962, y: 520, z: 1.035 },
        { t: 4.15, x: 1061, y: 447, z: 1.55, ramp: true },
        { t: 4.7, x: 1064, y: 452, z: 1.6 },
        { t: 5.5, x: 950, y: 700, z: 1.45, ramp: true },
        { t: 6.4, x: 985, y: 706, z: 1.5 },
      ]}
    >
      <AppWindow>
        <Sequence from={0} durationInFrames={fr(1.3)} layout="none">
          <AppClip from={6.1} rate={2} />
        </Sequence>
        <Sequence from={fr(1.3)} durationInFrames={fr(2.4) - fr(1.3)} layout="none">
          <AppClip from={11.0} rate={1.5} />
        </Sequence>
        {t >= 2.4 ? <AppStill name="app-22" /> : null}
        <AbsoluteFill style={{ background: `rgba(${LILAC},${0.5 * flash})` }} />
        {/* What the niche pays */}
        {t > 3.8 && t < 4.9 ? <Spot x={455} y={260} w={1240} h={207} at={3.95} /> : null}
        {/* Who's going viral */}
        {t > 5.2 ? <Spot x={455} y={522} w={240} h={141} at={5.35} /> : null}
        {t > 5.2 ? <Spot x={1205} y={522} w={240} h={141} at={5.5} /> : null}
      </AppWindow>
      <Callout x={app(455, 232)[0]} y={app(455, 232)[1]} at={4.05} out={4.8} side="right">
        What the niche pays
      </Callout>
      <Callout x={app(455, 476)[0]} y={app(455, 476)[1]} at={5.45} side="right">
        Who's going viral in it
      </Callout>
      <Sparks x={app(1038, 144)[0]} y={app(1038, 144)[1]} at={2.38} seed="research" reach={160} count={12} />
    </Shot>
  );
}

/* ------------------------------------------------------------------ 5. Opportunity score */

export function Score({ dur }: { dur: number }) {
  const t = useTime();
  const toScroll = prog(t, 3.3, 0.4, Easing.bezier(0.65, 0, 0.35, 1));
  const [rx, ry] = app(1620, 372);
  return (
    <Shot
      id="score"
      duration={dur}
      enter="whipL"
      exit="zoomIn"
      keys={[
        { t: 0, x: 960, y: 540, z: 1.04 },
        { t: 0.4, x: 985, y: 532, z: 1.07 },
        { t: 1.3, x: rx - 30, y: ry, z: 2.1, ramp: true },
        { t: 1.9, x: rx - 38, y: ry + 5, z: 2.18 },
        { t: 2.75, x: 1061, y: 548, z: 1.5, ramp: true },
        { t: 3.15, x: 1061, y: 554, z: 1.54 },
        { t: 3.95, x: 960, y: 540, z: 1.07, ramp: true },
        { t: 4.4, x: 960, y: 555, z: 1.1 },
      ]}
    >
      <AppWindow>
        <AppStill name="app-42" />
        {t > 3.0 ? (
          <Sequence from={fr(3.3)} layout="none">
            <AppClip from={50.2} rate={2.6} style={{ opacity: toScroll }} />
          </Sequence>
        ) : null}
        {t > 1.0 && t < 2.6 ? <Spot x={1558} y={310} w={124} h={124} at={1.2} r={999} /> : null}
        {t > 2.5 && t < 3.3 ? <Spot x={462} y={452} w={1220} h={56} at={2.7} r={14} /> : null}
      </AppWindow>
      <Callout x={rx - 80} y={ry} at={1.35} out={2.15} side="left">
        Opportunity score
      </Callout>
      <Callout x={app(475, 430)[0]} y={app(475, 430)[1]} at={2.8} out={3.25} side="right">
        Demand · growth · competition
      </Callout>
      <Sparks x={rx} y={ry} at={1.25} seed="ring" reach={130} count={14} />
    </Shot>
  );
}

/* ------------------------------------------------------------------ 6. The stat */

const NICHES = ["Basketball", "Minecraft", "Battle Cats", "My Singing Monsters", "Crime", "Motivation", "Cooking", "Fitness"];

/** 405× — a real breakout pick from the dashboard — then "in any niche" as the niche pills come forward. */
export function Stat({ dur }: { dur: number }) {
  const t = useTime();
  const num = sp(t, 0.05, { damping: 11, stiffness: 110, mass: 0.9 });
  const swap = prog(t, 1.65, 0.35, Easing.bezier(0.65, 0, 0.35, 1));
  const pills = sp(t, 1.6, firm);
  return (
    <Shot
      id="stat"
      duration={dur}
      enter="zoomIn"
      exit="whipR"
      keys={[
        { t: 0, z: 0.9, r: -2 },
        { t: 1.6, z: 1.0, r: 0 },
        { t: 3.2, z: 1.12, r: 1.4 },
      ]}
    >
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 46% 40% at 50% 46%, rgba(${VIOLET},${0.5 * num}), transparent 72%)` }} />
      {/* Two live Shorts hanging in depth either side */}
      {[
        { clip: "hoops-3", x: 150, y: 250, rot: -9, s: 0.9, b: 2.5 },
        { clip: "short-a", x: 1480, y: 300, rot: 8, s: 0.82, b: 3.5 },
      ].map((c, i) => {
        const p = sp(t, 0.15 + i * 0.1, firm);
        return (
          <div key={c.clip} style={{ position: "absolute", left: c.x + (i ? 1 : -1) * (1 - p) * 300, top: c.y + Math.sin(t * 0.9 + i * 2) * 14, transform: `rotate(${c.rot + Math.sin(t * 0.6 + i) * 1.5}deg) scale(${c.s})`, opacity: 0.75 * p, filter: `blur(${c.b}px)` }}>
            <ShortCard clip={c.clip} w={300} h={534} live glow={0.5} />
          </div>
        );
      })}
      {/* Niche pills orbiting in depth; they come forward when the line changes */}
      {NICHES.map((n, i) => {
        const a = (i / NICHES.length) * Math.PI * 2 + t * 0.22;
        const depth = 0.5 + 0.5 * Math.sin(a + 1.2); // 0 far … 1 near
        const R = 560 + 200 * pills;
        const x = 960 + Math.cos(a) * R;
        const y = 500 + Math.sin(a) * (250 + 90 * pills);
        const o = (0.25 + 0.75 * pills) * (0.45 + 0.55 * depth);
        return (
          <div
            key={n}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${0.7 + 0.5 * depth})`,
              padding: "12px 28px",
              borderRadius: 999,
              background: "rgba(18,14,30,0.85)",
              border: `1.5px solid rgba(${LILAC},${0.25 + 0.5 * depth})`,
              color: C.text,
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: 30,
              whiteSpace: "nowrap",
              opacity: o * sp(t, 0.3 + i * 0.05, firm),
              filter: `blur(${(1 - depth) * 3.5 * (1 - 0.6 * pills)}px)`,
              boxShadow: `0 0 ${30 * depth * pills}px rgba(${VIOLET},0.6)`,
              zIndex: depth > 0.5 ? 5 : 1,
            }}
          >
            {n}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${0.4 + 0.6 * num})`, opacity: Math.min(1, num * 2), fontFamily: FONT.display, fontWeight: 800, fontSize: 380, lineHeight: 1, letterSpacing: "-0.06em", marginTop: -70, ...GRADIENT_TEXT, filter: `drop-shadow(0 0 ${60 * num}px rgba(${VIOLET},0.8))`, zIndex: 3 }}>
          <Counter value={405} at={0.05} dur={1.1} suffix="×" />
        </div>
        <div style={{ position: "relative", height: 90, width: 1500, marginTop: 6, zIndex: 3 }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - swap, transform: `translate(0, ${-swap * 30}px)`, filter: swap > 0.02 ? `blur(${swap * 10}px)` : undefined }}>
            <Kinetic text="one Short vs. its channel's average" at={0.35} size={62} weight={700} color={C.textSecondary} stagger={0.012} />
          </div>
          <div style={{ position: "absolute", inset: 0 }}>
            <Kinetic text="In any niche." at={1.75} size={84} accent={["any"]} />
          </div>
        </div>
      </AbsoluteFill>
      <Sparks x={960} y={470} at={0.05} seed="stat" reach={520} count={26} />
    </Shot>
  );
}

/* ------------------------------------------------------------------ 7. Dashboard */

/** App thumbnails that lift off the dashboard as live Shorts: [app x, app y, clip]. */
const LIFT: [number, number, string][] = [
  [474, 440, "short-c"],
  [717, 440, "short-a"],
  [960, 440, "hoops-1"],
];

export function Dash({ dur }: { dur: number }) {
  const t = useTime();
  return (
    <Shot
      id="dash"
      duration={dur}
      enter="whipR"
      exit="blur"
      keys={[
        { t: 0, x: 960, y: 640, z: 0.9, rx: 36, ry: -8 },
        // The tilt settles to exactly flat, so the rest of the shot takes the jitter-free 2D path.
        { t: 1.35, x: 870, y: 600, z: 1.22, rx: 0, ry: 0, ramp: true },
        { t: 2.3, x: 880, y: 612, z: 1.27, rx: 0, ry: 0 },
        { t: 3.2, x: 1350, y: 590, z: 1.58, rx: 0, ry: 0, ramp: true },
        { t: 4.4, x: 1360, y: 628, z: 1.66, rx: 0, ry: 0 },
      ]}
    >
      <AppWindow glow={0.8}>
        <AppStill name="app-0.5" />
      </AppWindow>
      {LIFT.map(([ax, ay, clip], i) => {
        const [x, y] = app(ax, ay);
        const p = sp(t, 1.0 + i * 0.13, { damping: 12, stiffness: 120 });
        const w = 231 * 0.8193;
        const h = 287 * 0.8193;
        return (
          <div key={clip} style={{ position: "absolute", left: x, top: y - 46 * p + Math.sin(t * 1.3 + i) * 4 * p, transform: `scale(${1 + 0.2 * p})`, transformOrigin: "50% 60%", opacity: Math.min(1, p * 3), zIndex: 5 }}>
            <ShortCard clip={clip} w={w} h={h} live glow={0.9 * p} />
          </div>
        );
      })}
      <Callout x={app(474, 392)[0]} y={app(474, 392)[1] - 20} at={1.55} out={2.8} side="right">
        What's moving right now
      </Callout>
      <Callout x={app(1215, 398)[0]} y={app(1215, 398)[1]} at={3.35} side="right">
        Channels heating up
      </Callout>
      {t > 3.1 ? (
        <div style={{ position: "absolute", left: app(1205, 432)[0], top: app(1205, 432)[1], width: 495 * 0.8193, height: 290 * 0.8193, borderRadius: 16, border: `3px solid rgba(${LILAC},${sp(t, 3.3, firm)})`, boxShadow: `0 0 50px rgba(${VIOLET},${0.8 * sp(t, 3.3, firm)})` }} />
      ) : null}
    </Shot>
  );
}
