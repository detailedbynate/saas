## How this spec is used in the Outlier video

The client asked for the reference's **text animations**, not a shot-for-shot copy. The intro
(`src/film/intro.tsx`, f0–f419) is an original Outlier opening that borrows these measured moves:

| Move from the reference | Where it is used |
|---|---|
| Word drop: falls in from above, a few px past its rest, eases back | "Find", "outliers", "Introducing" |
| Spring lift: 108 px up in 12 frames, 19 px over, 5 px back under | the headline making room for the typed line |
| Typing inside a dashed text box, one letter every 2.9 frames, newest letters highlighted, line sliding in from the right, corner handles at the end | "before they blow up" |
| Icon pop: up from below, 11 px past, settle, with a glow | the Outlier logo |
| Snapping: letters come up from below one at a time while the word re-centres | "Outlier" |
| Colour wipe: the line arrives in the accent colour and turns to ink letter by letter | "The outlier finder for YouTube Shorts" |
| Colour wipe, bounce, mix, typewriter, snapping on five buttons | the five feature labels |
| Hand-drawn marks that draw on and re-draw every 8 frames | arrows, quote marks, underline |
| Straight 12- and 15-frame dissolves | between the three beats |

The measured curves themselves are in `src/film/introData.ts` (generated from `refs/spec/*.json`).
Every frame is a pure function of the frame number.
