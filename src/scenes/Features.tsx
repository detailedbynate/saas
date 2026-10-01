import { interpolate, useCurrentFrame } from "remotion";
import { Counter, Cursor, Glass, SearchGlyph, Typed, clamp, easeOut, useProgress, useSpring } from "../components/ui";
import { C, FONT, GRADIENT_TEXT } from "../theme";
import { SplitFeature, StackFeature } from "./Feature";

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

function Chip({ label, start, active }: { label: string; start: number; active?: number }) {
  const frame = useCurrentFrame();
  const s = useSpring(start, 12, 0.6);
  const on = active !== undefined && frame >= active;
  return (
    <span
      style={{
        padding: "12px 22px",
        borderRadius: 999,
        fontFamily: FONT.body,
        fontSize: 24,
        fontWeight: 500,
        border: `1px solid ${on ? "rgba(139,92,246,0.7)" : C.borderStrong}`,
        background: on ? C.accent : "rgba(255,255,255,0.04)",
        color: on ? "#fff" : C.textSecondary,
        transform: `scale(${s})`,
        boxShadow: on ? "0 0 30px rgba(139,92,246,0.5)" : undefined,
      }}
    >
      {label}
    </span>
  );
}

function ResearchPanel() {
  return (
    <Glass style={{ padding: 36, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 26px", borderRadius: 18, background: C.control, border: `1px solid ${C.borderStrong}`, color: C.text, fontFamily: FONT.body, fontSize: 32 }}>
        <span style={{ color: C.muted }}>
          <SearchGlyph />
        </span>
        <Typed text="minecraft builds" start={26} cps={16} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
        <Chip label="subs < 10K" start={52} active={64} />
        <Chip label="avg views > 100K" start={56} active={72} />
        <Chip label="age < 90d" start={60} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
        {CHANNELS.map((c, i) => (
          <ChannelRow key={c.name} {...c} start={84 + i * 9} />
        ))}
      </div>
    </Glass>
  );
}

function ChannelRow({ name, subs, growth, hue, start }: { name: string; subs: string; growth: string; hue: number; start: number }) {
  const p = useProgress(start, 16);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 22px", borderRadius: 18, background: "rgba(255,255,255,0.035)", border: `1px solid ${C.border}`, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={avatar(hue)} />
      <div style={{ flex: 1, fontFamily: FONT.body }}>
        <div style={{ color: C.text, fontSize: 28, fontWeight: 700 }}>{name}</div>
        <div style={{ color: C.muted, fontSize: 22 }}>{subs}</div>
      </div>
      <div style={{ color: C.good, fontFamily: FONT.display, fontWeight: 800, fontSize: 34 }}>↑ {growth}</div>
    </div>
  );
}

export function Research({ duration }: { duration: number }) {
  return (
    <>
      <SplitFeature
        duration={duration}
        eyebrow="Shorts research"
        title="Find breakout Shorts channels in any niche"
        highlight={["breakout"]}
        points={["Search by niche keywords", "Small channels with big views", "Filter by size, age and pace"]}
      >
        <ResearchPanel />
      </SplitFeature>
      <Cursor
        path={[
          [50, 1500, 900],
          [62, 1086, 408],
          [70, 1306, 408],
          [130, 1420, 640],
        ]}
        clicks={[64, 72]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ Growth */

const CHART = "M0 104 C40 100 60 96 90 90 S150 84 180 70 S240 30 270 22 S310 10 320 8";

function GrowthPanel() {
  const frame = useCurrentFrame();
  const draw = useProgress(24, 60, easeOut);
  const pulse = 1 + 0.4 * Math.abs(Math.sin(frame / 8));
  return (
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
            <rect x="0" y="-10" width={320 * draw} height="140" />
          </clipPath>
        </defs>
        {[30, 60, 90].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        ))}
        <g clipPath="url(#reveal)">
          <path d={`${CHART} V120 H0 Z`} fill="url(#area)" />
          <path d={CHART} stroke="#a78bfa" strokeWidth="2.4" fill="none" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.9))" }} />
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
              <Counter value={k.v} start={40 + i * 8} dur={50} decimals={1} prefix="+" suffix={k.s} />
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted }}>{k.l}</div>
          </div>
        ))}
      </div>
    </Glass>
  );
}

export function Growth({ duration }: { duration: number }) {
  return (
    <SplitFeature
      duration={duration}
      flip
      eyebrow="Realtime growth"
      title="Catch channels in the middle of a breakout"
      highlight={["breakout"]}
      points={["Views gained in 24h and 48h", "Subscriber growth", "Fresh snapshots every few hours"]}
    >
      <GrowthPanel />
    </SplitFeature>
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
  const s = useSpring(22 + i * 10, 14, 0.7);
  return (
    <div
      style={{
        width: 300,
        borderRadius: 24,
        overflow: "hidden",
        background: C.surface,
        border: `1px solid ${C.glassBorder}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        transform: `translateY(${(1 - s) * 260}px) rotate(${(1 - s) * (i - 2) * 8}deg) scale(${0.8 + 0.2 * s})`,
        opacity: Math.min(1, s * 1.5),
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

export function Picks({ duration }: { duration: number }) {
  return (
    <StackFeature duration={duration} eyebrow="Daily picks" title="Five breakout channels, picked every day" highlight={["Five"]} width={1640}>
      <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
        {PICKS.map((p, i) => (
          <PickCard key={p.niche} p={p} i={i} />
        ))}
      </div>
    </StackFeature>
  );
}

/* ------------------------------------------------------------------ Analyze */

function AnalyzePanel() {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [52, 112], [0, 0.86], { ...clamp, easing: easeOut });
  const circ = 2 * Math.PI * 50;
  return (
    <Glass style={{ padding: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", borderRadius: 18, background: C.control, border: `1px solid ${C.borderStrong}`, color: C.text, fontFamily: FONT.body, fontSize: 28 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
        <span style={{ flex: 1 }}>{frame >= 32 ? "youtube.com/shorts/c1tyIn60s" : <span style={{ color: C.muted }}>Paste any video link…</span>}</span>
        <span style={{ padding: "10px 22px", borderRadius: 999, background: C.accent, color: "#fff", fontWeight: 700, fontSize: 24 }}>Analyze</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 36 }}>
        <div style={{ position: "relative", width: 320, height: 320 }}>
          <svg viewBox="0 0 120 120" style={{ width: 320, height: 320, transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(139,92,246,0.18)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - fill)} style={{ filter: "drop-shadow(0 0 4px rgba(139,92,246,0.9))" }} />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#c4b5fd" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", ...GRADIENT_TEXT }}>
              <Counter value={79} start={52} dur={60} suffix="×" />
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted }}>outlier score</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { l: "Views / day", v: <Counter value={586} start={60} dur={50} suffix="K" /> },
            { l: "Engagement", v: <Counter value={7.4} start={66} dur={50} decimals={1} suffix="%" /> },
            { l: "Channel median", v: <Counter value={52} start={72} dur={50} suffix="K" /> },
          ].map((k, i) => (
            <KV key={k.l} label={k.l} value={k.v} start={54 + i * 6} />
          ))}
        </div>
      </div>
    </Glass>
  );
}

function KV({ label, value, start }: { label: string; value: React.ReactNode; start: number }) {
  const p = useProgress(start, 14);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "20px 26px", borderRadius: 18, background: "rgba(255,255,255,0.035)", border: `1px solid ${C.border}`, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
      <span style={{ fontFamily: FONT.body, fontSize: 26, color: C.textSecondary }}>{label}</span>
      <span style={{ fontFamily: FONT.display, fontSize: 40, fontWeight: 800, color: C.text }}>{value}</span>
    </div>
  );
}

export function Analyze({ duration }: { duration: number }) {
  return (
    <>
      <StackFeature duration={duration} eyebrow="Video analysis" title="See exactly how far a video beat its channel" highlight={["beat"]} width={1180}>
        <AnalyzePanel />
      </StackFeature>
      <Cursor
        path={[
          [20, 1300, 1000],
          [40, 1416, 395],
          [80, 1600, 760],
        ]}
        clicks={[44]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ Script writer */

const SCRIPT = [
  { tag: "HOOK", text: "I gave myself 60 seconds to build an entire city…" },
  { tag: "BEAT 1", text: "Roads first. Always roads first." },
  { tag: "BEAT 2", text: "Then the skyline — watch the timer." },
  { tag: "PAYOFF", text: "Comment which district I should build next." },
];

function ScriptLine({ tag, text, start }: { tag: string; text: string; start: number }) {
  const frame = useCurrentFrame();
  if (frame < start - 2) return null;
  return (
    <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
      <span style={{ flexShrink: 0, width: 130, fontFamily: FONT.body, fontWeight: 700, fontSize: 20, letterSpacing: "0.08em", color: C.accentText }}>{tag}</span>
      <span style={{ fontFamily: FONT.body, fontSize: 32, color: C.text, lineHeight: 1.35 }}>
        <Typed text={text} start={start} cps={34} caret={false} />
      </span>
    </div>
  );
}

export function Script({ duration }: { duration: number }) {
  return (
    <SplitFeature
      duration={duration}
      eyebrow="Shorts Script Writer"
      title="Then turn the idea into a script"
      highlight={["script"]}
      points={["Built from what's working now", "Hook, beats and payoff", "A fresh script every 6 hours"]}
    >
      <Glass style={{ padding: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <span style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted }}>Based on: “I built a whole city in 60 seconds”</span>
          <span style={{ padding: "8px 16px", borderRadius: 999, background: C.accentWash, color: C.accentText, fontFamily: FONT.body, fontWeight: 700, fontSize: 20 }}>0:42</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minHeight: 360 }}>
          {SCRIPT.map((l, i) => (
            <ScriptLine key={l.tag} {...l} start={26 + i * 22} />
          ))}
        </div>
      </Glass>
    </SplitFeature>
  );
}

