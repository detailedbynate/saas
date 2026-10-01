import { Easing } from "remotion";
import { Shot } from "../components/Shot";
import { BACK, Counter, Cursor, Glass, OUT, SearchGlyph, Typed, prog, useTime } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";
import { Split, Stack } from "./Layouts";

const avatar = (hue: number, size = 64) => ({
  width: size,
  height: size,
  borderRadius: 99,
  flexShrink: 0,
  background: `linear-gradient(135deg, hsl(${hue},70%,70%), hsl(${hue + 30},60%,45%))`,
});

/* ------------------------------------------------------------------ Research */

const CHANNELS = [
  { name: "Mo Builds", subs: "4.2K subs", growth: "12.4×", hue: 265 },
  { name: "Blocky Bites", subs: "8.9K subs", growth: "8.7×", hue: 220 },
  { name: "Redstone Rae", subs: "6.1K subs", growth: "5.2×", hue: 300 },
];

function Chip({ label, at, active }: { label: string; at: number; active?: number }) {
  const t = useTime();
  const s = prog(t, at, 0.4, BACK);
  const on = active !== undefined ? prog(t, active, 0.2, Easing.linear) : 0;
  return (
    <span
      style={{
        padding: "12px 22px",
        borderRadius: 999,
        fontFamily: FONT.body,
        fontSize: 24,
        fontWeight: 500,
        border: `1px solid ${on > 0.5 ? "rgba(139,92,246,0.7)" : C.borderStrong}`,
        background: `rgba(139,92,246,${on})`,
        color: on > 0.5 ? "#fff" : C.textSecondary,
        transform: `scale(${s * (1 + 0.08 * Math.sin(Math.PI * on))})`,
        display: "inline-block",
        boxShadow: on > 0.5 ? "0 0 30px rgba(139,92,246,0.5)" : undefined,
      }}
    >
      {label}
    </span>
  );
}

function ChannelRow({ name, subs, growth, hue, at }: { name: string; subs: string; growth: string; hue: number; at: number }) {
  const p = prog(useTime(), at, 0.6);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 22px", borderRadius: 18, background: "rgba(255,255,255,0.035)", border: `1px solid ${C.border}`, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 80}px)` }}>
      <div style={avatar(hue)} />
      <div style={{ flex: 1, fontFamily: FONT.body }}>
        <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>{name}</div>
        <div style={{ color: C.muted, fontSize: 22 }}>{subs}</div>
      </div>
      <div style={{ color: C.good, fontFamily: FONT.display, fontWeight: 800, fontSize: 34 }}>↑ {growth}</div>
    </div>
  );
}

export function Research({ dur }: { dur: number }) {
  return (
    <Shot
      id="research"
      duration={dur}
      keys={[
        { t: 0, x: 960, y: 540, z: 1 },
        { t: 0.5, x: 1000, y: 520, z: 1.04 },
        { t: 1.2, x: 1290, y: 400, z: 1.28 },
        { t: 1.9, x: 1330, y: 560, z: 1.2 },
        { t: 2.8, x: 990, y: 540, z: 1.0 },
      ]}
    >
      <Split title="Find breakout Shorts channels in any niche" highlight={["breakout"]}>
        <Glass style={{ padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 26px", borderRadius: 18, background: C.control, border: `1px solid ${C.borderStrong}`, color: C.text, fontFamily: FONT.body, fontSize: 32 }}>
            <span style={{ color: C.muted }}>
              <SearchGlyph />
            </span>
            <Typed text="minecraft builds" at={0.45} cps={26} />
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
            <Chip label="subs < 10K" at={1.0} active={1.3} />
            <Chip label="avg views > 100K" at={1.05} active={1.5} />
            <Chip label="age < 90d" at={1.1} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
            {CHANNELS.map((c, i) => (
              <ChannelRow key={c.name} {...c} at={1.7 + i * 0.1} />
            ))}
          </div>
        </Glass>
      </Split>
      <Cursor
        path={[
          [1.0, 1500, 760],
          [1.28, 1085, 405],
          [1.48, 1300, 405],
          [2.4, 1450, 640],
        ]}
        clicks={[1.3, 1.5]}
      />
    </Shot>
  );
}

/* ------------------------------------------------------------------ Growth */

const CHART = "M0 104 C40 100 60 96 90 90 S150 84 180 70 S240 30 270 22 S310 10 320 8";

export function Growth({ dur }: { dur: number }) {
  const t = useTime();
  const draw = prog(t, 0.35, 1.1, Easing.bezier(0.5, 0, 0.2, 1));
  const pulse = 1 + 0.35 * Math.abs(Math.sin(t * 4));
  return (
    <Shot
      id="growth"
      duration={dur}
      enter="left"
      exit="up"
      keys={[
        { t: 0, x: 600, y: 520, z: 1.3 },
        { t: 0.9, x: 780, y: 540, z: 1.08 },
        { t: 3.0, x: 930, y: 540, z: 1.0 },
      ]}
    >
      <Split flip title="Catch channels in the middle of a breakout" highlight={["breakout"]}>
        <Glass style={{ padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={avatar(275, 72)} />
            <div style={{ flex: 1, fontFamily: FONT.body }}>
              <div style={{ color: C.text, fontSize: 30, fontWeight: 700 }}>Snack Lab</div>
              <div style={{ color: C.muted, fontSize: 22 }}>cooking hacks · 11.8K subs</div>
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(52,211,153,0.12)", color: C.good, fontFamily: FONT.body, fontWeight: 700, fontSize: 22 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: C.good, transform: `scale(${pulse})`, boxShadow: `0 0 12px ${C.good}` }} />
              Live
            </span>
          </div>
          <svg viewBox="0 0 320 120" preserveAspectRatio="none" style={{ width: "100%", height: 300, marginTop: 26, overflow: "visible" }}>
            <defs>
              <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.45" />
                <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <clipPath id="reveal">
                <rect x="-2" y="-10" width={324 * draw} height="140" />
              </clipPath>
            </defs>
            {[30, 60, 90].map((y) => (
              <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
            ))}
            <g clipPath="url(#reveal)">
              <path d={`${CHART} V120 H0 Z`} fill="url(#area)" />
              <path d={CHART} stroke="#a78bfa" strokeWidth="2.4" fill="none" vectorEffect="non-scaling-stroke" />
            </g>
            {draw > 0.98 ? <circle cx="320" cy="8" r={5 * pulse} fill="#fff" stroke="#8b5cf6" strokeWidth="2" /> : null}
          </svg>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 26 }}>
            {[
              { v: 1.2, s: "M", l: "views · 24h" },
              { v: 18.4, s: "K", l: "subs · 48h" },
            ].map((k, i) => (
              <div key={k.l} style={{ padding: "20px 24px", borderRadius: 18, background: "rgba(255,255,255,0.035)", border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 56, color: C.good }}>
                  <Counter value={k.v} at={0.6 + i * 0.12} dur={1.1} decimals={1} prefix="+" suffix={k.s} />
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted }}>{k.l}</div>
              </div>
            ))}
          </div>
        </Glass>
      </Split>
    </Shot>
  );
}

/* ------------------------------------------------------------------ Daily picks */

const PICKS = [
  { niche: "tech", title: "This $9 gadget replaced my desk lamp", views: "5.9M", x: "41×", hue: 210 },
  { niche: "comedy", title: "When the group project is due tomorrow", views: "3.4M", x: "33×", hue: 330 },
  { niche: "pets", title: "My cat learned to open the fridge", views: "2.5M", x: "27×", hue: 30 },
  { niche: "fitness", title: "The 4-minute stair workout", views: "1.8M", x: "22×", hue: 150 },
  { niche: "history", title: "The shortest war ever lasted 38 minutes", views: "1.3M", x: "19×", hue: 45 },
];

function PickCard({ p, i }: { p: (typeof PICKS)[number]; i: number }) {
  const t = useTime();
  const s = prog(t, 0.2 + i * 0.07, 0.8, OUT);
  return (
    <div
      style={{
        width: 300,
        borderRadius: 24,
        overflow: "hidden",
        background: C.surface,
        border: `1px solid ${C.glassBorder}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        transform: `translateY(${(1 - s) * 420}px) rotate(${(1 - s) * (i - 2) * 10}deg)`,
        opacity: Math.min(1, s * 3),
      }}
    >
      <div style={{ height: 300, position: "relative", background: `linear-gradient(160deg, hsl(${p.hue},55%,42%), hsl(${p.hue + 40},50%,14%))` }}>
        <span style={{ position: "absolute", left: 16, top: 16, padding: "6px 14px", borderRadius: 999, background: "rgba(0,0,0,0.5)", color: "#fff", fontFamily: FONT.body, fontSize: 20, fontWeight: 600 }}>{p.niche}</span>
        <span style={{ position: "absolute", right: 16, top: 16, padding: "6px 14px", borderRadius: 999, background: C.accent, color: "#fff", fontFamily: FONT.display, fontSize: 22, fontWeight: 800 }}>{p.x}</span>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 64, height: 64, borderRadius: 99, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
        </div>
      </div>
      <div style={{ padding: "18px 20px 22px" }}>
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 21, color: C.text, lineHeight: 1.3, height: 56 }}>{p.title}</div>
        <div style={{ marginTop: 10, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: C.good }}>{p.views} views</div>
      </div>
    </div>
  );
}

export function Picks({ dur }: { dur: number }) {
  return (
    <Shot
      id="picks"
      duration={dur}
      enter="up"
      exit="left"
      keys={[
        { t: 0, x: 960, y: 500, z: 1 },
        { t: 0.7, x: 560, y: 520, z: 1.2 },
        { t: 2.3, x: 1340, y: 540, z: 1.16 },
      ]}
    >
      <Stack title="Five breakout channels, picked every day" highlight={["Five"]} width={1640}>
        <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
          {PICKS.map((p, i) => (
            <PickCard key={p.niche} p={p} i={i} />
          ))}
        </div>
      </Stack>
    </Shot>
  );
}

/* ------------------------------------------------------------------ Analyze */

function KV({ label, value, at }: { label: string; value: React.ReactNode; at: number }) {
  const p = prog(useTime(), at, 0.6);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 26px", borderRadius: 18, background: "rgba(255,255,255,0.035)", border: `1px solid ${C.border}`, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 60}px)` }}>
      <span style={{ fontFamily: FONT.body, fontSize: 26, color: C.textSecondary }}>{label}</span>
      <span style={{ fontFamily: FONT.display, fontSize: 40, fontWeight: 800, color: C.text }}>{value}</span>
    </div>
  );
}

export function Analyze({ dur }: { dur: number }) {
  const t = useTime();
  const fill = prog(t, 1.05, 1.3, Easing.bezier(0.3, 0, 0.1, 1)) * 0.86;
  const circ = 2 * Math.PI * 50;
  const pasted = t >= 0.55;
  return (
    <Shot
      id="analyze"
      duration={dur}
      keys={[
        { t: 0, x: 960, y: 520, z: 1 },
        { t: 0.45, x: 1150, y: 420, z: 1.3 },
        { t: 1.0, x: 1150, y: 420, z: 1.3 },
        { t: 1.6, x: 760, y: 680, z: 1.22 },
        { t: 3.0, x: 960, y: 560, z: 1.02 },
      ]}
    >
      <Stack title="See exactly how far a video beat its channel" highlight={["beat"]}>
        <Glass style={{ padding: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", borderRadius: 18, background: C.control, border: `1px solid ${pasted ? "rgba(139,92,246,0.6)" : C.borderStrong}`, color: C.text, fontFamily: FONT.body, fontSize: 28 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
            <span style={{ flex: 1 }}>{pasted ? "youtube.com/shorts/c1tyIn60s" : <span style={{ color: C.muted }}>Paste any video link…</span>}</span>
            <span style={{ padding: "10px 22px", borderRadius: 999, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 24 }}>Analyze</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 36 }}>
            <div style={{ position: "relative", width: 320, height: 320 }}>
              <svg viewBox="0 0 120 120" style={{ width: 320, height: 320, transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(139,92,246,0.18)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - fill)} />
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#c4b5fd" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", ...GRADIENT_TEXT }}>
                  <Counter value={79} at={1.05} dur={1.3} suffix="×" />
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted }}>outlier score</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <KV label="Views / day" at={1.15} value={<Counter value={586} at={1.15} dur={1.1} suffix="K" />} />
              <KV label="Engagement" at={1.22} value={<Counter value={7.4} at={1.22} dur={1.1} decimals={1} suffix="%" />} />
              <KV label="Channel median" at={1.29} value={<Counter value={52} at={1.29} dur={1.1} suffix="K" />} />
            </div>
          </div>
        </Glass>
      </Stack>
      <Cursor
        path={[
          [0.2, 1250, 700],
          [0.5, 1405, 392],
          [1.4, 1560, 600],
        ]}
        clicks={[0.52]}
      />
    </Shot>
  );
}

/* ------------------------------------------------------------------ Script writer */

const SCRIPT = [
  { tag: "HOOK", text: "I gave myself 60 seconds to build an entire city…" },
  { tag: "BEAT 1", text: "Roads first. Always roads first." },
  { tag: "BEAT 2", text: "Then the skyline — watch the timer." },
  { tag: "PAYOFF", text: "Comment which district I should build next." },
];

function ScriptLine({ tag, text, at }: { tag: string; text: string; at: number }) {
  const t = useTime();
  const p = prog(t, at - 0.05, 0.4);
  return (
    <div style={{ display: "flex", gap: 22, alignItems: "baseline", opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <span style={{ flexShrink: 0, width: 130, fontFamily: FONT.body, fontWeight: 700, fontSize: 20, letterSpacing: "0.08em", color: C.accentText }}>{tag}</span>
      <span style={{ fontFamily: FONT.body, fontSize: 32, color: C.text, lineHeight: 1.35 }}>
        <Typed text={text} at={at} cps={70} caret={false} />
      </span>
    </div>
  );
}

export function Script({ dur }: { dur: number }) {
  return (
    <Shot
      id="script"
      duration={dur}
      exit="zoom"
      keys={[
        { t: 0, x: 960, y: 540, z: 1 },
        { t: 0.6, x: 1300, y: 480, z: 1.16 },
        { t: 2.4, x: 1320, y: 590, z: 1.14 },
        { t: 3.5, x: 1200, y: 560, z: 1.1 },
      ]}
    >
      <Split title="Then turn the idea into a script" highlight={["script"]}>
        <Glass style={{ padding: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <span style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted }}>Based on: “I built a whole city in 60 seconds”</span>
            <span style={{ padding: "8px 16px", borderRadius: 999, background: C.accentWash, color: C.accentText, fontFamily: FONT.body, fontWeight: 700, fontSize: 20 }}>0:42</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: 360 }}>
            {SCRIPT.map((l, i) => (
              <ScriptLine key={l.tag} {...l} at={0.55 + i * 0.5} />
            ))}
          </div>
        </Glass>
      </Split>
    </Shot>
  );
}
