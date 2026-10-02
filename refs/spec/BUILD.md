## Build: where the Outlier intro differs from the reference

Built in `src/film/intro.tsx` (f0–f419). The big moves are driven by the measured curves themselves
(`src/film/introData.ts`, generated from `refs/spec/*.json`), and every frame is a pure function of the frame number.

### Checked against the reference, frame by frame (my render measured with the same code)

| Move | Frames | Result |
|---|---|---|
| Shot 1 first word drop (top edge) | f0–f25 | within 1 px on every frame, after a constant 1 px offset |
| Shot 1 icon, top edge | f39–f98 | mean 0.3 px off (f39 reads 18 px off: the leaving word overlaps the icon there) |
| Shot 1 icon, width | f39–f98 | within 1 px on every frame |
| Shot 2 headline drop and lift (top edge) | f112–f181 | mean 0.7 px off, worst 7 px at f114 (the frame the second word appears) |
| Shot 2 typed word sliding left (left edge) | f152–f178 | within 3 px after a constant 8 px offset (letter side-bearing) |
| Shot 3 bounce label (top edge) | f300–f340 | mean 0.4 px off after a constant 8 px offset (smaller type, see below) |
| Dissolve 1 and 2 (frame brightness) | f98–f110, f274–f289 | straight ramps, within 2% |

### Differences

| # | Frames | Reference | Outlier build | Why |
|---|---|---|---|---|
| 1 | f0–f419 | its own words | "find viral shorts" → icon; "Viral Shorts / Research / in [logo] Outlier"; Niche Finder, Viral Videos, Analyze Video, Script Writer, Tracked Channels | your product and words. I first proposed "Outlier Finder" for shot 2; it is too long to fit the reference's line at its size, so I used "Viral Shorts / Research" |
| 2 | f0–f419 | dark stage / paper stage / dark stage | your gradient throughout, pushed toward purple and slowly moving; it darkens slightly for shots 1 and 3 and lightens for shot 2 on the dissolve frames | your background. No blurred body text behind shot 2, no corner glows |
| 3 | f0–f419 | SF/Inter-style typefaces | Schibsted Grotesk (500 and 800) | the project's brand font |
| 4 | f39–f98 | lime camera icon | white camera tile with a violet play triangle; simpler lens shape; same box on every frame | your colours |
| 5 | f35–f41 | third word collapses from the right | clipped from the right, sags 26 px and fades; gone at f42 as in the reference | approximation of the collapse |
| 6 | f105–f274 | headline est. 114 px, black | 106 px (line 1) and 132 px (line 2), navy; both fill the reference's 597 px width | text adapts to the reference's boxes |
| 7 | f151–f177 | 9 letters, last at ≈ f177, newest letters blue | 8 letters at the same 2.9 frames per letter, last at f171; newest letters violet | shorter word, same typing speed |
| 8 | f160–f274 | its hand-drawn arrows | my own strokes in the same places, drawn on over the same frames, re-drawn every 8 frames; shapes are not traced | can't lift their artwork |
| 9 | f209–f236 | subtitle in four pieces (f209, f212, f215, f221) | three pieces (f209, f212, f215); the last still slides in from the right | "in [logo] Outlier" has one word fewer |
| 10 | f289–f419 | labels est. 80 px | 50 px, sitting 8 px lower | your feature names are longer than the button |
| 11 | f293–f378 | label animations finish by f336, then hold 43 frames | same per-letter speeds, so they finish later: colour wipe ≈ f357, mix ≈ f336, typewriter ≈ f350, snapping ≈ f358; hold ≈ 20 frames | longer labels at locked speeds |
| 12 | f322–f324 | last "Mix" letter stays blue until here | the last letter of "Analyze Video" arrives at f330 and goes white 5 frames later | follows from #11 |
| 13 | f290–f419 | button fill `#1b1b19`, radius unmeasured | translucent navy with a hairline border, 8 px radius | sits on the gradient |
| 14 | f408–f419 | (the loop carries on) | 12-frame fade into the rest of the film | the intro has to hand over at 7.0 s |
| 15 | f42, f165, f265, f386 | its sound effects under a voice-over | my own tick / tick / hit / tick on the same frames, no voice | no access to its audio stems |
| 16 | all | soft edges on fast moves (amount unmeasurable) | no motion blur in the draft; the final render adds blur to every frame | draft setting |
