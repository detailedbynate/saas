/**
 * Shot timing in seconds. 25s, structured 1:1 on the Algrow launch film
 * (refs/src/algrow.mp4, see refs/NOTES.md "v5"): a typed prompt, a "scanning"
 * beat, six feature beats of ~3s, and a short end card. Neighbouring shots
 * overlap by TRANSITION (0.5s). Music (scripts/make_audio.py) is 120 BPM and
 * every boundary sits on a half-beat; the drop lands on the first feature (3.5s).
 */
export const FPS = 60;

export const SHOTS = {
  prompt: { at: 0, dur: 2.5 }, // ≈ Algrow 0–2.65  prompt bar
  scan: { at: 2.5, dur: 1 }, // ≈ 2.65–3.55       "Scanning and analyzing content"
  finder: { at: 3.5, dur: 3 }, // ≈ 3.55–6.7      Niche Finding: collage + views counter
  picks: { at: 6.5, dur: 3 }, // ≈ 6.7–10         AI Video Generator: title, card, collage
  score: { at: 9.5, dur: 4 }, // ≈ 10–16          AI Voice Generator: glowing card, type, generate, collapse
  tracker: { at: 13.5, dur: 3.5 }, // ≈ 16–22.2   AI Video Automation: URL + box, analyse, fan of cards
  script: { at: 17, dur: 3.5 }, // ≈ 22.2–28.7    AI Image Generation: prompt, reference, generate, results
  compare: { at: 20.5, dur: 3 }, // ≈ 28.7–34.8   Caption Remover: before/after wipe
  end: { at: 23.5, dur: 1.5 }, // end card (Algrow's film has none; ours needs the URL)
} as const;

export const TOTAL_SECONDS = SHOTS.end.at + SHOTS.end.dur;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
