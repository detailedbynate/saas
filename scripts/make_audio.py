"""Synthesizes the launch video's music bed and sound effects from scratch.

Everything here is generated from oscillators and noise, so the audio is
original and free to use anywhere. Output goes to public/audio/.

    python3 scripts/make_audio.py
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
LENGTH = 34.5  # seconds; the video is 33.5s, plus a little tail

OUT = Path(__file__).resolve().parent.parent / "public" / "audio"
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, min(hz, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], "band", fs=SR, output="sos"), x)


def sweep_filter(x, start_hz, end_hz, kind="low", block=512, curve=2.0):
    """Filter whose cutoff glides from start_hz to end_hz (exponentially)."""
    out = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, block):
        p = (i / max(n - 1, 1)) ** (1 / curve) if end_hz > start_hz else i / max(n - 1, 1)
        hz = start_hz * (end_hz / start_hz) ** p
        if kind == "band":
            sos = butter(2, [hz * 0.7, min(hz * 1.4, SR / 2 - 100)], "band", fs=SR, output="sos")
        else:
            sos = butter(2, min(hz, SR / 2 - 100), kind, fs=SR, output="sos")
        if zi is None or zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        out[i : i + block], zi = sosfilt(sos, x[i : i + block], zi=zi)
    return out


def saw(freq, t, detune_cents=(0,)):
    out = np.zeros_like(t)
    for c in detune_cents:
        f = freq * 2 ** (c / 1200)
        phase = rng.random()
        out += 2 * ((f * t + phase) % 1.0) - 1
    return out / len(detune_cents)


def env_adsr(n, a, d, s, r, total=None):
    total = total or n / SR
    t = np.arange(n) / SR
    e = np.ones(n) * s
    e[t < a] = t[t < a] / max(a, 1e-4)
    mask = (t >= a) & (t < a + d)
    e[mask] = 1 - (1 - s) * (t[mask] - a) / max(d, 1e-4)
    rel = t > total - r
    e[rel] *= np.clip((total - t[rel]) / max(r, 1e-4), 0, 1)
    return e


def reverb(x, seconds=2.2, mix=0.25, bright=6000):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, bright)
    ir /= np.sqrt(np.sum(ir**2))
    wet = fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


def delay(x, seconds, feedback=0.35, mix=0.3, repeats=5):
    out = x.copy()
    d = int(seconds * SR)
    g = 1.0
    for k in range(1, repeats + 1):
        g *= feedback
        shifted = np.zeros_like(x)
        shifted[d * k :] = x[: len(x) - d * k]
        out += lp(shifted, 4500) * g * mix / feedback
    return out


def place(track, sound, at, gain=1.0):
    i = int(at * SR)
    if i >= len(track):
        return
    j = min(len(track), i + len(sound))
    track[i:j] += sound[: j - i] * gain


def norm(x, peak=0.9):
    m = np.max(np.abs(x))
    return x if m == 0 else x / m * peak


def write(name, x, peak=0.9):
    OUT.mkdir(parents=True, exist_ok=True)
    x = norm(x, peak)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    wavfile.write(OUT / name, SR, (x * 32767).astype(np.int16))
    print(f"wrote {name} ({len(x) / SR:.2f}s)")


# ---------------------------------------------------------------- drums


def kick():
    t = t_axis(0.45)
    f = 45 + 120 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * 0.3
    return np.tanh((body + click) * 1.6)


def clap():
    t = t_axis(0.35)
    noise = bp(rng.standard_normal(len(t)), 900, 5000)
    e = np.zeros_like(t)
    for off in (0, 0.011, 0.022):
        e += (t >= off) * np.exp(-np.clip(t - off, 0, None) * 60) * 0.6
    e += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) * 14)
    return reverb(noise * e, 0.8, 0.3)


def hat(open_=False):
    t = t_axis(0.25 if open_ else 0.06)
    noise = hp(rng.standard_normal(len(t)), 8000, 4)
    return noise * np.exp(-t * (14 if open_ else 70))


# ---------------------------------------------------------------- instruments

# A minor, uplifting loop: Am – F – C – G (one bar each)
CHORDS = [
    (57, [57, 60, 64, 69]),  # Am
    (53, [53, 57, 60, 65]),  # F
    (48, [55, 60, 64, 67]),  # C
    (55, [55, 59, 62, 67]),  # G
]


def chord_at(time):
    return CHORDS[int(time // BAR) % 4]


def pad_bar(notes, dur):
    t = t_axis(dur)
    x = sum(saw(midi(n), t, (-9, -3, 4, 10)) for n in notes) / len(notes)
    x = lp(x, 2200)
    return x * env_adsr(len(t), 0.35, 0.3, 0.8, 0.5)


def bass_note(root, dur):
    t = t_axis(dur)
    f = midi(root - 12)
    x = saw(f, t, (-4, 4)) * 0.6 + np.sin(2 * np.pi * f * t) * 0.8
    x = sweep_filter(x, 1400, 260, "low")
    return np.tanh(x * 1.4) * env_adsr(len(t), 0.005, 0.1, 0.8, 0.05)


def pluck(note, dur=0.3):
    t = t_axis(dur)
    x = saw(midi(note + 12), t, (-6, 6)) + 0.5 * np.sin(2 * np.pi * midi(note + 24) * t)
    x = sweep_filter(x, 6000, 500, "low")
    return x * np.exp(-t * 11)


def sidechain(n, kick_times, depth=0.6, release=0.22):
    g = np.ones(n)
    for kt in kick_times:
        i = int(kt * SR)
        m = int(release * SR)
        if i >= n:
            continue
        seg = np.linspace(0, 1, m) ** 0.6
        j = min(n, i + m)
        g[i:j] = np.minimum(g[i:j], 1 - depth * (1 - seg[: j - i]))
    return g


# ---------------------------------------------------------------- sound effects


def whoosh(dur=0.7, lo=300, hi=6000, reverse=False):
    t = t_axis(dur)
    noise = rng.standard_normal(len(t))
    x = sweep_filter(noise, lo, hi, "band", curve=1.0)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    e *= np.linspace(0.6, 1, len(t)) if not reverse else np.linspace(1, 0.6, len(t))
    return reverb(x * e, 1.0, 0.2)


def riser(dur=2.0):
    t = t_axis(dur)
    noise = sweep_filter(rng.standard_normal(len(t)), 200, 9000, "band", curve=0.6)
    f = 180 * (8 ** (t / dur) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    e = (t / dur) ** 2.2
    return reverb((noise + tone) * e, 1.2, 0.2)


def impact():
    t = t_axis(2.6)
    f = 32 + 90 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    crack = lp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 18) * 0.7
    shimmer = hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 3) * 0.08
    return reverb(np.tanh((boom + crack + shimmer) * 1.8), 2.5, 0.3)


def subhit():
    """Layered hit for drops and big moves: a deep sub drop, a soft thump and a short airy tail."""
    t = t_axis(1.6)
    f = 38 + 70 * np.exp(-t * 14)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    thump = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 26) * 0.6
    air = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 7) * 0.06
    return reverb(np.tanh((sub + thump) * 1.6) + air, 1.6, 0.22)


def shimmer():
    """A soft bright swell: a stack of detuned high partials fading in and out, for text landing."""
    t = t_axis(1.4)
    x = sum(np.sin(2 * np.pi * midi(n) * t + i) for i, n in enumerate((81, 84, 88, 93, 96))) / 5
    e = np.sin(np.pi * np.clip(t / 1.4, 0, 1)) ** 2 * np.exp(-t * 1.2)
    air = hp(rng.standard_normal(len(t)), 7000) * e * 0.12
    return reverb(x * e * 0.6 + air, 2.0, 0.45)


def click():
    t = t_axis(0.06)
    blip = np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 160)
    tick = hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 400) * 0.5
    return blip + tick


def key_tap():
    t = t_axis(0.05)
    x = bp(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t * 220)
    return x + np.sin(2 * np.pi * 320 * t) * np.exp(-t * 120) * 0.3


def typing(dur, cps=16):
    out = np.zeros(int((dur + 0.1) * SR))
    k = 0
    tt = 0.0
    while tt < dur:
        place(out, key_tap(), tt, 0.6 + 0.4 * rng.random())
        tt += (1 / cps) * (0.7 + 0.6 * rng.random())
        k += 1
    return out


def pop():
    t = t_axis(0.25)
    f = 520 + 380 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)


def ding():
    t = t_axis(1.6)
    x = sum(np.sin(2 * np.pi * midi(n) * t) * a * np.exp(-t * d) for n, a, d in [(88, 1, 3), (95, 0.5, 4), (100, 0.25, 6)])
    return reverb(x, 1.5, 0.3)


def ticker(dur, start_rate=8, end_rate=30):
    """Counter ticking that speeds up."""
    out = np.zeros(int((dur + 0.1) * SR))
    tt = 0.0
    while tt < dur:
        p = tt / dur
        place(out, click() * 0.5, tt, 0.5 + 0.5 * p)
        tt += 1 / (start_rate + (end_rate - start_rate) * p)
    return out


def swoosh_up():
    return whoosh(0.45, 600, 9000)


def cash():
    """Bright two-note chime for the price drop."""
    t = t_axis(1.2)
    a = np.sin(2 * np.pi * midi(84) * t) * np.exp(-t * 6)
    b = np.zeros_like(t)
    s = int(0.09 * SR)
    b[s:] = np.sin(2 * np.pi * midi(91) * t[: len(t) - s]) * np.exp(-t[: len(t) - s] * 4)
    return reverb(a + b, 1.2, 0.3)


# ---------------------------------------------------------------- arrangement

# Section boundaries in seconds; these match SHOTS in src/timeline.ts.
DROP = 8.0         # logo hit
BREAK = 28.0       # tagline: drums drop out
FINAL = 30.5       # end card
END = 33.0         # last chord


def build_music():
    n = int(LENGTH * SR)
    drums = np.zeros(n)
    bass = np.zeros(n)
    pad = np.zeros(n)
    plk = np.zeros(n)
    fx = np.zeros(n)

    def full(time):
        return (DROP <= time < BREAK) or (FINAL <= time < END)

    kicks = []
    beat_i = 0
    time = 0.0
    while time < END:
        if full(time):
            place(drums, kick(), time, 1.0)
            kicks.append(time)
            if beat_i % 2 == 1:
                place(drums, clap(), time, 0.5)
            for s in range(4):
                place(drums, hat(open_=(s == 2)), time + s * BEAT / 4, 0.18 if s == 2 else 0.12 + 0.05 * (s % 2))
        elif time < DROP:
            # Intro: a muted pulse from the first frame, hats from bar 2
            place(drums, lp(kick(), 400), time, 0.55)
            if time >= 2.0:
                place(drums, hat(), time + BEAT / 2, 0.12)
        else:
            # Breakdown: just offbeat hats
            place(drums, hat(), time + BEAT / 2, 0.08)
        time += BEAT
        beat_i += 1

    # Pads, bass, plucks per bar
    bar_t = 0.0
    while bar_t < END:
        root, notes = chord_at(bar_t)
        p = pad_bar(notes, BAR + 0.5)
        if bar_t < DROP:
            p = lp(p, 900)
        place(pad, p, bar_t, 0.5 if bar_t < DROP else 0.42)
        if full(bar_t) or bar_t >= BREAK:
            if full(bar_t):
                for e in range(8):
                    place(bass, bass_note(root, BEAT / 2 - 0.02), bar_t + e * BEAT / 2, 0.55 if e % 2 else 0.7)
            arp = [notes[i] for i in (0, 1, 2, 3, 2, 1, 2, 3)]
            for s in range(16 if full(bar_t) else 8):
                step = BEAT / 4 if full(bar_t) else BEAT / 2
                place(plk, pluck(arp[s % 8]), bar_t + s * step, 0.3)
        bar_t += BAR

    # Final sustained Am chord ringing out
    tail = pad_bar([57, 60, 64, 69, 72], LENGTH - END)
    place(pad, tail, END, 0.55)
    place(fx, impact(), END, 0.4)

    # Risers into the drop and the final section, impacts on them
    place(fx, riser(2.0), DROP - 2.0, 0.5)
    place(fx, riser(2.0), FINAL - 2.0, 0.5)
    place(fx, impact(), DROP, 0.8)
    place(fx, impact(), FINAL, 0.7)

    sc = sidechain(n, kicks)
    plk = delay(plk, BEAT * 0.75, 0.4, 0.35)
    music = drums * 0.9 + bass * sc * 0.65 + reverb(pad, 2.5, 0.35) * sc * 0.7 + reverb(plk, 1.8, 0.25) * sc * 0.45 + fx
    music = hp(music, 28)

    # Gentle fade-in and out
    fade_in = np.clip(t_axis(LENGTH) / 0.4, 0, 1)
    fade_out = np.clip((LENGTH - t_axis(LENGTH)) / 1.5, 0, 1)
    music *= fade_in[:n] * fade_out[:n]
    # Soft limiter
    music = np.tanh(norm(music, 1.0) * 1.3)
    return music


if __name__ == "__main__":
    write("music.wav", build_music(), 0.89)
    write("whoosh.wav", whoosh(), 0.8)
    write("whoosh-fast.wav", swoosh_up(), 0.8)
    write("click.wav", click(), 0.7)
    write("typing.wav", typing(0.65, 26), 0.6)
    write("typing-long.wav", typing(2.1, 30), 0.6)
    write("pop.wav", pop(), 0.7)
    write("ding.wav", ding(), 0.7)
    write("ticker.wav", ticker(1.0, 12, 34), 0.6)
    write("cash.wav", cash(), 0.7)
    write("subhit.wav", subhit(), 0.85)
    write("shimmer.wav", shimmer(), 0.6)
    write("riser.wav", riser(1.5), 0.7)
