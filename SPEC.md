# SPEC: reference intro, first 10 seconds

Reference: https://youtu.be/zEZqDXClPe4 ("How to Make Clean Text Animation in After Effects"), measured from
the client's screen recording (`refs/src/cleantext.mp4`, the video area cropped out of the phone recording).

**All numbers below were measured by code from the frames** (`refs/spec/*.py` → `refs/spec/*.json`); nothing is eyeballed.
Where a number is an estimate rather than a measurement it says so.

## How to read this

- **Frames** are at 60 fps. `f0` is the first frame of the video; time = frame / 60.
- **Coordinates** are pixels in a 1920×1080 frame, origin top-left. Boxes are `x0,y0–x1,y1` of the visible ink.
- Colours are sampled from pixels (a screen recording of a YouTube stream, so ±3 per channel).

## Limits of the source (read before trusting a number)

| Limit | Effect |
|---|---|
| Phone screen recording, video area 2098×1180 scaled to 1920×1080 | positions ±1 px; fine detail softened |
| The recording starts mid-video, then is rewound; `f0` = recording frame 94 (first frame that moves after the rewind) | frame numbers ±1 |
| YouTube's player overlay is on screen for f0–f27 | picture dimmed there; text positions still measurable, colours not sampled there |
| Playback was paused at ≈ f545 (9.1 s) | f545–f600 (9.1–10 s) is not in the recording |
| The audio is narration mixed with sound effects | only clearly non-speech hits are listed; speech syllables are ignored |
| Font sizes | estimated from letter heights (ascender height ÷ 0.73), not read from the file |

## Shot list

Cuts were found from frame-difference spikes, then each was confirmed by looking at the frames (`refs/spec/frames-*.jpg`).

| # | Frames | Time (s) | Length | What happens | How it ends |
|---|---|---|---|---|---|
| 1 | f0–f98 | 0.000–1.633 | 99 f | Dark stage. "in this video" drops in word by word; "video" is swapped for a lime camera icon; the line slowly shrinks | 12-frame linear dissolve (f99–f110) |
| 2 | f111–f274 | 1.850–4.567 | 164 f | Light paper stage. "Clean" then "Text" drop in; the line lifts; "Animation" types in under it inside a dashed box; hand-drawn arrows scribble on; quote marks and corner handles; small subtitle "in [Ae] After Effects" | 15-frame linear dissolve (f275–f289) |
| 3a | f290–f378 | 4.833–6.300 | 89 f | Dark stage again. Five buttons, each label arriving with a different text animation (colour wipe, bounce, mix, typewriter, snapping) | hard cut (f379) |
| 3b | f379–f495 | 6.317–8.250 | 117 f | The same button animation, replayed from its first frame | hard cut (f496) |
| 3c | f496–f545+ | 8.267–9.1+ | ≥ 50 f | The same animation a third time; recording stops during it | (not captured) |

Frame-difference evidence: dissolve 1 = 12 consecutive frames of mean change 14–21 (of 255); dissolve 2 = 15 frames of 11–18; the two hard cuts are single-frame spikes of 2.97 (f379) and 3.14 (f496) on an otherwise < 0.1 hold. Shot 3b matches 3a to within a mean difference of 1.1–1.6 at equal offsets, i.e. it is the same animation.

For the first 7 seconds (f0–f419) the build therefore needs: shot 1, dissolve, shot 2, dissolve, shot 3a, and the first 41 frames of 3b.

## Colours (sampled)

| Thing | Colour |
|---|---|
| Shot 1 and 3 stage, centre | `#121211` |
| Shot 1 and 3 stage, top-left corner glow | `#212315` → `#222514` |
| Shot 1 and 3 stage, bottom-right corner glow | `#252817` → `#252a16` |
| Shot 1 text, top of letters | `#fefefe` |
| Shot 1 text, fading down the letter | `#e8e7ec` (y+20) → `#acacac` (y+30) → `#666664` (y+40) → `#484846` (baseline) |
| Camera icon | `#cbf331` (body), `#e7ff85` (brightest), white play triangle |
| Shot 2 stage | `#eaeaea` (with very faint blurred serif body text behind, no movement) |
| Shot 2 headline ink | `#000000`, fading to grey toward the bottom of each letter (same top-to-bottom fade as shot 1, inverted) |
| Shot 2 typing highlight, handles | `#209dec` |
| Shot 3 button fill | `#1b1b19` on the `#131311` stage |
| Shot 3 label | `#ffffff`; the "Colors" blue is `#4098e7` |

Every headline in all three shots has the same treatment: solid at the top of the letters, fading out toward the baseline.

## Dissolves (mean brightness of the whole frame, 0–255)

| Dissolve 1 | f98 | f99 | f100 | f101 | f102 | f103 | f104 | f105 | f106 | f107 | f108 | f109 | f110 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| brightness | 21 | 36 | 51 | 66 | 83 | 98 | 116 | 134 | 153 | 173 | 192 | 213 | 234 |

| Dissolve 2 | f274 | f275 | f276 | f277 | f278 | f279 | f280 | f281 | f282 | f283 | f284 | f285 | f286 | f287 | f288 | f289 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| brightness | 225 | 209 | 194 | 178 | 163 | 148 | 133 | 120 | 105 | 92 | 84 | 72 | 54 | 42 | 31 | 21 |

Both are straight (linear) cross-dissolves: about +17 per frame for 12 frames, then about −14 per frame for 15 frames. The incoming shot is already animating underneath: "Clean" starts dropping at f105, inside dissolve 1.

## Shot 1 (f0–f98): "in this video" → icon

Three words, one line. Estimated font size 81 px at the start (ascender-to-baseline 59 px), a light/regular grotesque. Each word **drops in from above**: about 70 px of travel in 12 frames, decelerating, overshooting its rest position by 2–5 px and easing back.

### Word drops: top edge of each word (y), per frame

| frame | "in" y0 | "this" y0 | "video" y0 |
|---|---|---|---|
| f0 | 439 | – | – |
| f1 | 448 | – | – |
| f2 | 458 | – | – |
| f3 | 468 | 439 | – |
| f4 | 477 | 448 | – |
| f5 | 486 | 458 | 436 |
| f6 | 492 | 468 | 437 |
| f7 | 498 | 477 | 448 |
| f8 | 502 | 486 | 458 |
| f9 | 505 | 493 | 469 |
| f10 | 507 | 498 | 478 |
| f11 | 508 | 503 | 486 |
| f12 | 509 | 505 | 493 |
| f13 | 509 | 507 | 499 |
| f14 | 508 | 509 | 503 |
| f15 | 507 | 509 | 506 |
| f16 | 506 | 509 | 508 |
| f17 | 505 | 508 | 509 |
| f18 | 504 | 507 | 509 |
| f19 | 503 | 506 | 509 |
| f20 | 503 | 505 | 509 |
| f21 | 502 | 504 | 508 |
| f22 | 502 | 504 | 507 |
| f23 | 501 | 503 | 506 |
| f24 | 501 | 503 | 505 |
| f25 | 501 | 503 | 504 |

- Stagger: "in" starts f0, "this" f3, "video" f5.
- "in": 439 → 509 (f12–13, lowest point) → back up to ~502 (f22). Overshoot 7 px.
- "this": 439 → 509 (f14–16) → ~503. "video": 436 → 509 (f17–19) → ~504.
- Speed while falling ≈ 9–10 px/frame for the first 6 frames, then 6, 4, 3, 2, 1.

### The line shrinks the whole time (no cut, no camera move, the text itself scales)

| frame | "in" left edge | "this" x0–x1 | "this" height | scale vs start |
|---|---|---|---|---|
| f8 | 692 | 788–952 | 59 | 1.00 |
| f15 | 695 | 791–952 | 59 | 1.00 |
| f20 | 700 | 794–953 | 59 | 1.00 |
| f25 | 708 | 799–953 | 57 | 0.97 |
| f30 | 718 | 805–953 | 54 | 0.92 |
| f35 | 726 | 810–953 | 53 | 0.90 |
| f40 | 731 | 814–954 | 54 | 0.92 |
| f50 | 739 | 818–954 | 50 | 0.85 |
| f60 | 744 | 822–954 | 49 | 0.83 |
| f70 | 747 | 824–954 | 48 | 0.81 |
| f80 | 749 | 825–954 | 48 | 0.81 |
| f90 | 751 | 826–954 | 48 | 0.81 |
| f98 | 752 | 827–954 | 47 | 0.80 |

The right edge of "this" stays at x≈953–954 while everything left of it slides right and the letters get shorter: the line scales down about a point near **x≈965, y≈533** (the gap between "this" and the third word), from 1.00 to ≈0.81. Most of it happens between f15 and f40; it is still creeping at f98.

### "video" leaves, the icon arrives (f36–f77)

| frame | "video" ink box | icon box | icon w | icon h |
|---|---|---|---|---|
| f34 | 974–1192, y504–557 | – | – | – |
| f35 | 974–1189, y504–556 | – | – | – |
| f36 | 974–1184, y504–557 | – | – | – |
| f37 | 974–1177, y505–556 | – | – | – |
| f38 | 974–1168, y505–620 | – | – | – |
| f39 | 973–1151, y506–615 | 981,549–1050,612 | 69 | 63 |
| f40 | 972–1119, y506–613 | 981,536–1051,607 | 70 | 71 |
| f41 | 970–1081, y507–605 | 980,529–1051,599 | 71 | 70 |
| f42 | – | 981,522–1051,593 | 70 | 71 |
| f43 | – | 980,514–1051,587 | 71 | 73 |
| f44 | – | 979,508–1073,583 | 94 | 75 |
| f45 | – | 977,503–1079,579 | 102 | 76 |
| f46 | – | 976,499–1083,577 | 107 | 78 |
| f47 | – | 975,497–1087,575 | 112 | 78 |
| f48 | – | 973,495–1090,574 | 117 | 79 |
| f49 | – | 972,494–1094,573 | 122 | 79 |
| f50 | – | 971,494–1096,572 | 125 | 78 |
| f51 | – | 970,494–1097,572 | 127 | 78 |
| f52 | – | 969,495–1098,573 | 129 | 78 |
| f53 | – | 969,496–1098,573 | 129 | 77 |
| f54 | – | 969,497–1098,573 | 129 | 76 |
| f55 | – | 968,498–1098,574 | 130 | 76 |
| f56 | – | 968,499–1100,574 | 132 | 75 |
| f57 | – | 969,501–1101,574 | 132 | 73 |
| f58 | – | 969,502–1102,575 | 133 | 73 |
| f59 | – | 969,502–1103,575 | 134 | 73 |
| f60 | – | 970,502–1103,575 | 133 | 73 |
| f61 | – | 970,502–1103,575 | 133 | 73 |
| f65 | – | 972,505–1099,574 | 127 | 69 |
| f71 | – | 973,505–1094,574 | 121 | 69 |
| f77 | – | 972,504–1092,574 | 120 | 70 |
| f89 | – | 971,505–1092,574 | 121 | 69 |

- "video" collapses from the right (right edge 1189 → 1081 over f35–f41) while sagging downward, and is gone by f42.
- The icon starts as a **lime rounded square, 70×63**, appearing at f39 with its top at y=549 (below the line) and rising: 549, 536, 529, 522, 514, 508, 503, 499, 497, 495, **494 (f49–f51, highest)**, then settling back to 505 by f65. Overshoot 11 px.
- From f44 the camera "lens" pushes out of the right side: icon width 70 → 94 (f44) → 122 (f49) → **134 (f59–f61, widest)** → 121 settled (f77). Overshoot 13 px.
- Settled icon: x 971–1092, y 505–574 (121×69), white play triangle inside the square part.
- The icon has a soft lime glow around it while it moves (visible f39–f47), none once settled.

## Shot 2 (f111–f274): "Clean Text / Animation"

Headline is a heavy grotesque, black, estimated 114 px (letter height 83 px). Background is flat `#eaeaea` with faint blurred serif paragraphs; measured background drift is 0.00 px/frame, so **there is no camera move in this shot**.

### "Clean" and "Text" drop in (top edge y of the line)

| frame | line top y | words on the line (x0–x1) |
|---|---|---|
| f105 | 440 | 664–991 |
| f106 | 448 | 663–992 |
| f107 | 456 | 664–991 |
| f108 | 464 | 664–991 |
| f109 | 470 | 664–991 |
| f110 | 476 | 664–991 |
| f111 | 480 | 664–991 |
| f112 | 484 | 664–991 |
| f113 | 486 | 664–991 |
| f114 | 444 | 664–991, 1040–1259 |
| f115 | 450 | 664–991, 1023–1261 |
| f116 | 458 | 664–991, 1023–1261 |
| f117 | 466 | 664–991, 1023–1261 |
| f118 | 472 | 664–991, 1023–1261 |
| f119 | 477 | 664–991, 1023–1261 |
| f120 | 482 | 664–991, 1023–1261 |
| f121 | 485 | 664–991, 1023–1261 |
| f122 | 485 | 664–991, 1023–1261 |
| f123 | 484 | 664–991, 1023–1261 |
| f124 | 483 | 664–991, 1023–1261 |
| f125 | 483 | 664–991, 1023–1261 |
| f126 | 482 | 664–991, 1023–1261 |
| f127 | 482 | 664–991, 1023–1261 |
| f128 | 482 | 664–991, 1023–1261 |

- "Clean" (x 664–991) starts at f105, during the dissolve, top at y=440, and falls 8, 8, 8, 6, 6, 4, 4, 2 px per frame to 486 (f113), then eases back to 482.
- "Text" (x 1023–1261) starts at f114 with its top at y=444 and lands by f121 (485), settling to 482 by f126. Nine frames after "Clean".
- Rest position of the line: y 482–565.

### The line lifts to make room (f139–f177)

| frame | line top y |
|---|---|
| f138 | 482 |
| f139 | 480 |
| f140 | 467 |
| f141 | 455 |
| f142 | 442 |
| f143 | 429 |
| f144 | 417 |
| f145 | 404 |
| f146 | 392 |
| f147 | 385 |
| f148 | 380 |
| f149 | 377 |
| f150 | 375 |
| f151 | 374 |
| f152 | 374 |
| f153 | 375 |
| f154 | 377 |
| f155 | 379 |
| f156 | 382 |
| f157 | 385 |
| f158 | 387 |
| f159 | 390 |
| f160 | 392 |
| f161 | 394 |
| f162 | 395 |
| f163 | 397 |
| f164 | 397 |
| f165 | 398 |
| f166 | 398 |
| f167 | 398 |
| f168 | 398 |
| f169 | 398 |
| f170 | 397 |
| f171 | 396 |
| f172 | 396 |
| f173 | 395 |
| f174 | 395 |
| f175 | 394 |
| f176 | 394 |
| f177 | 393 |
| f178 | 393 |
| f179 | 393 |
| f180 | 393 |

Up 108 px in 12 frames (≈12.5 px/frame, straight, for f140–f146, then slowing), **overshoots to 374 at f151–f152**, comes back down past its target to 398 (f165–f169), and settles at 393 by f177. A soft spring: 19 px over, 5 px under.

### "Animation" types in on line 2 (f151–f184)

| frame | line-2 ink box (black + blue) |
|---|---|
| f151 | 1125,505–1212,612 |
| f152 | 1120,501–1214,616 |
| f153 | 1113,502–1209,617 |
| f154 | 1105,506–1201,619 |
| f155 | 1093,512–1185,620 |
| f156 | 1075,520–1193,621 |
| f157 | 1053,527–1203,623 |
| f158 | 1023,533–1183,625 |
| f159 | 986,521–1170,628 |
| f160 | 939,528–1228,627 |
| f161 | 883,534–1241,628 |
| f162 | 829,531–1230,632 |
| f163 | 786,534–1209,632 |
| f164 | 754,522–1198,632 |
| f165 | 729,528–1178,632 |
| f166 | 710,532–1214,633 |
| f167 | 695,534–1213,632 |
| f168 | 688,532–1206,632 |
| f169 | 682,531–1200,632 |
| f170 | 679,530–1236,632 |
| f171 | 675,528–1241,632 |
| f172 | 672,527–1244,631 |
| f173 | 670,526–1247,631 |
| f174 | 668,526–1251,630 |
| f175 | 666,526–1254,629 |
| f176 | 665,527–1255,628 |
| f177 | 664,516–1257,641 |
| f178 | 664,515–1258,642 |
| f179 | 661,515–1261,642 |
| f180 | 659,514–1263,643 |
| f181 | 657,514–1265,643 |
| f182 | 655,513–1267,643 |
| f185 | 652,513–1270,644 |

- The first letter "A" appears at f151 at the **right** of the line (x≈1125–1212), blue (`#209dec`), slightly oversized and blurred.
- New letters keep arriving at the right while the word slides **left**: left edge 1125 (f151) → 1075 (f156) → 939 (f160) → 786 (f163) → 688 (f168) → 664 (f177). The newest one or two letters are blue; older ones are black.
- A dashed grey box (the text-box outline) is on screen from f157, spanning the line-2 area.
- Finished word: x 663–1258, the same width as "Clean Text" above it. Last blue letters turn black by ≈ f184.
- From f177 four blue corner handles sit on the box: box 649,512–1273,645.

### Scribbles, quotes, subtitle: when each one draws on

| element | where | starts | finished | notes |
|---|---|---|---|---|
| Arrow, bottom right (curved, pointing up-left at the headline) | x 1300–1560, y 560–1080 | f160 | f178 | draws on as a stroke |
| Squiggle + arrow, top right | x 1300–1700, y 20–300 | f164 | f204 | two strokes |
| Long arrow, top left | x 0–480, y 20–300 | f167 | f177 (arrowhead f184–f188) | enters from the left edge |
| Small arrow, bottom left | x 280–400, y 730–790 | f180 | ≈ f224 | small |
| Tiny triangle, top centre | x≈1125, y≈245 | f192 | f192 | pops on |
| Opening quote mark, left of "Clean" | x 636–660, y 366–384 | f188 | f200 |  |
| Closing quote mark, right of "Text" | x 1270–1297, y 366–384 | f194 | f212 |  |
| Subtitle "in [Ae] After Effects" | settled x 814–1109, y 683–718 (≈38 px type) | f209 ("in"), f212 (icon), f215 ("After"), f221 ("Effects") | f236 | words arrive left to right; "Effects" slides in from the right (x1 1143 → 1109) |

All the hand-drawn marks **boil**: their shapes re-draw about every 8 frames (≈7.5 times a second) for the rest of the shot. Measured as the ink area changing in steps and holding for 4–8 frames in between.

## Shot 3 (f290–f378, then replayed): five buttons

| button | box x0,y0–x1,y1 | size |
|---|---|---|
| Colors | 226,359–703,531 | 478×173 |
| Bounce | 724,359–1200,531 | 477×173 |
| Mix | 1219,359–1695,531 | 477×173 |
| Typewriter | 489,547–965,718 | 477×172 |
| Snapping | 985,548–1461,718 | 477×171 |

Row 1 has three buttons with 20 px gaps; row 2 has two, centred under them, 16 px below. Small corner radius (a few px; too small to measure through the compression). The buttons themselves do not animate: they are fully there on the first frame after the dissolve. Labels are white, estimated 80 px (letter height 59 px), regular weight.

### What each label does, per frame

| frame | Colors: % of letters still blue | Bounce: top edge y | Mix: x0–x1 | Typewriter: right edge x | Snapping: x0–x1 |
|---|---|---|---|---|---|
| f289 | 99% | – | – | – | – |
| f290 | 99% | – | – | – | – |
| f291 | 98% | – | – | 586 | – |
| f292 | 89% | – | – | 587 | – |
| f293 | 73% | (fading in) 490 | – | – | – |
| f294 | 73% | 482 | 1428–1472 | – | – |
| f295 | 72% | 476 | 1419–1468 | 613 | – |
| f296 | 73% | 470 | 1409–1464 | 620 | – |
| f297 | 71% | 464 | 1401–1501 | 621 | – |
| f298 | 54% | 458 | 1394–1499 | 621 | 1206–1249 |
| f299 | 53% | 452 | 1388–1493 | 621 | 1202–1246 |
| f300 | 53% | 446 | 1382–1528 | 664 | 1197–1267 |
| f301 | 53% | 440 | 1377–1524 | 665 | 1192–1268 |
| f302 | 53% | 434 | 1374–1528 | 665 | 1186–1269 |
| f303 | 52% | 428 | 1371–1524 | 665 | 1181–1268 |
| f304 | 43% | 423 | 1370–1518 | 666 | 1175–1262 |
| f305 | 43% | 417 | 1369–1513 | 707 | 1169–1287 |
| f306 | 42% | 412 | 1370–1508 | 708 | 1163–1288 |
| f307 | 42% | 409 | 1371–1503 | 708 | 1156–1286 |
| f308 | 42% | 406 | 1373–1501 | 708 | 1150–1310 |
| f309 | 38% | 405 | 1376–1500 | 709 | 1144–1312 |
| f310 | 26% | 404 | 1378–1499 | 769 | 1137–1312 |
| f311 | 24% | 403 | 1379–1498 | 770 | 1131–1308 |
| f312 | 24% | 403 | 1381–1498 | 770 | 1124–1334 |
| f313 | 24% | 404 | 1382–1498 | 770 | 1118–1335 |
| f314 | 24% | 405 | 1384–1499 | 795 | 1112–1334 |
| f315 | 21% | 405 | 1385–1499 | 796 | 1106–1329 |
| f316 | 15% | 406 | 1385–1500 | 797 | 1100–1327 |
| f317 | 15% | 408 | 1386–1500 | 797 | 1094–1328 |
| f318 | 15% | 409 | 1386–1501 | 797 | 1088–1327 |
| f319 | 15% | 410 | 1386–1502 | 797 | 1082–1322 |
| f320 | 15% | 411 | 1386–1502 | 811 | 1077–1349 |
| f321 | 13% | 411 | 1386–1503 | 812 | 1072–1349 |
| f322 | 0% | 413 | 1386–1503 | 812 | 1068–1350 |
| f323 | 0% | 413 | 1386–1504 | 812 | 1065–1348 |
| f324 | 0% | 414 | 1386–1505 | 838 | 1063–1373 |
| f325 | 0% | 415 | 1385–1505 | 839 | 1061–1377 |
| f326 | 0% | 415 | 1385–1505 | 839 | 1060–1379 |
| f327 | 0% | 416 | 1385–1505 | 839 | 1058–1380 |
| f328 | 0% | 416 | 1385–1505 | 839 | 1057–1382 |
| f329 | 0% | 417 | 1385–1505 | 880 | 1056–1383 |
| f330 | 0% | 417 | 1385–1505 | 881 | 1056–1383 |
| f331 | 0% | 417 | 1385–1505 | 881 | 1055–1384 |
| f332 | 0% | 418 | 1385–1505 | 882 | 1055–1384 |
| f333 | 0% | 418 | 1385–1504 | 881 | 1055–1384 |
| f334 | 0% | 418 | 1385–1504 | 909 | 1055–1384 |
| f335 | 0% | 418 | 1385–1504 | 909 | 1055–1384 |
| f336 | 0% | 418 | 1385–1504 | 909 | 1055–1384 |

- **Colors** (x 352–576, y 416–475): on screen from f289, all blue (`#4098e7`), fading up to full brightness by f295. Then it turns white **one letter at a time, left to right**: steps at f293, f298, f304, f310, f316, f322 (one letter every ≈ 6 frames).
- **Bounce** (x 830–1091): fades in from f293 while rising from y=490 at a steady ≈ 6 px/frame, reaches y=403 at f311–f312 (**15 px above** its rest), then eases down to rest at 418 by ≈ f333.
- **Mix** (rest x 1385–1505): letters arrive one after another from the right, each starting small, blue and soft: "M" f294, "i" f297, "x" f300. The word slides left as it grows (x0 1428 → 1369 at f305, 16 px past its rest, → 1385). "x" stays blue until f322–f324.
- **Typewriter** (starts x 543): typed left-aligned, one character every ≈ 4.7 frames (≈ 12.8 characters a second): T f291, y f295, p f300, e f305, w f310, r f314, i f320, t f324, e f329, r f333–f336. Each new character appears grey and brightens to white over ≈ 3 frames. Full word x 543–909.
- **Snapping** (rest x 1055–1384): centred; a new letter comes up from below the baseline about every 4 frames and snaps into place (S f298, n f300, a f305, p f308, p f312, i f316, n f320, g f324) while the word re-centres smoothly (left edge moves ≈ 6 px/frame). Settled by f331.
- Everything is at rest from ≈ f336 to the cut at f379 (43 frames of hold).

## Sound

The recording's audio is the tutorial's voice-over with effects underneath, so most onsets are syllables. These are the hits that are clearly not speech (short, mostly high-frequency, or far louder than their surroundings):

| Frame | Time (s) | What | Lines up with |
|---|---|---|---|
| f42 | 0.70 | short high tick (70% of its energy above 4 kHz); the same tick is in the first, pre-rewind playthrough at the same video frame | the icon popping in (f39–f44) |
| f165 | 2.75 | short high tick | "Animation" typing / first scribble (f160–f165) |
| f265–f269 | 4.42–4.48 | the loudest hit in the clip, broadband | 6–10 frames before dissolve 2 starts (f275) |
| f386 | 6.43 | short high tick | 7 frames into the replay of the buttons (shot 3b) |

Confidence is moderate: I can time these to ±1 frame, but I cannot separate quieter effects from the voice.

## Things I could not measure

- Exact typeface names and weights (they look like SF Pro / Inter-style grotesques: light-to-regular in shot 1, bold in shot 2, regular in shot 3).
- Button corner radius and any 1-px button border.
- Anything after f545 (9.1 s).
- Motion blur: frames mid-move show soft edges on the dropping words and on "A", but the screen recording's own compression blurs too, so I can't give a shutter value.

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
