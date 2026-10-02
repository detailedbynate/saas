"""Builds SPEC.md from the per-frame measurements in this folder (shot*.json)."""
import json, os
D=os.path.dirname(__file__)
s1=json.load(open(f'{D}/shot1.json')); s2=json.load(open(f'{D}/shot2.json')); s2b=json.load(open(f'{D}/shot2b.json')); s3=json.load(open(f'{D}/shot3.json'))
o=[]; w=o.append
def tbl(head, rows):
    w('| '+' | '.join(head)+' |'); w('|'+'|'.join('---' for _ in head)+'|')
    for r in rows: w('| '+' | '.join(str(x) for x in r)+' |')
    w('')
T=lambda f:'%.3f'%(f/60)

w('''# SPEC: reference intro, first 10 seconds

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
''')
tbl(['#','Frames','Time (s)','Length','What happens','How it ends'],[
 ['1','f0–f98','0.000–1.633','99 f','Dark stage. "in this video" drops in word by word; "video" is swapped for a lime camera icon; the line slowly shrinks','12-frame linear dissolve (f99–f110)'],
 ['2','f111–f274','1.850–4.567','164 f','Light paper stage. "Clean" then "Text" drop in; the line lifts; "Animation" types in under it inside a dashed box; hand-drawn arrows scribble on; quote marks and corner handles; small subtitle "in [Ae] After Effects"','15-frame linear dissolve (f275–f289)'],
 ['3a','f290–f378','4.833–6.300','89 f','Dark stage again. Five buttons, each label arriving with a different text animation (colour wipe, bounce, mix, typewriter, snapping)','hard cut (f379)'],
 ['3b','f379–f495','6.317–8.250','117 f','The same button animation, replayed from its first frame','hard cut (f496)'],
 ['3c','f496–f545+','8.267–9.1+','≥ 50 f','The same animation a third time; recording stops during it','(not captured)'],
])
w('Frame-difference evidence: dissolve 1 = 12 consecutive frames of mean change 14–21 (of 255); dissolve 2 = 15 frames of 11–18; the two hard cuts are single-frame spikes of 2.97 (f379) and 3.14 (f496) on an otherwise < 0.1 hold. Shot 3b matches 3a to within a mean difference of 1.1–1.6 at equal offsets, i.e. it is the same animation.\n')
w('For the first 7 seconds (f0–f419) the build therefore needs: shot 1, dissolve, shot 2, dissolve, shot 3a, and the first 41 frames of 3b.\n')

w('''## Colours (sampled)

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
''')
tbl(['Dissolve 1','f98','f99','f100','f101','f102','f103','f104','f105','f106','f107','f108','f109','f110'],[['brightness',21,36,51,66,83,98,116,134,153,173,192,213,234]])
tbl(['Dissolve 2','f274','f275','f276','f277','f278','f279','f280','f281','f282','f283','f284','f285','f286','f287','f288','f289'],[['brightness',225,209,194,178,163,148,133,120,105,92,84,72,54,42,31,21]])
w('Both are straight (linear) cross-dissolves: about +17 per frame for 12 frames, then about −14 per frame for 15 frames. The incoming shot is already animating underneath: "Clean" starts dropping at f105, inside dissolve 1.\n')

# ---------- shot 1
w('## Shot 1 (f0–f98): "in this video" → icon\n')
w('Three words, one line. Estimated font size 81 px at the start (ascender-to-baseline 59 px), a light/regular grotesque. Each word **drops in from above**: about 70 px of travel in 12 frames, decelerating, overshooting its rest position by 2–5 px and easing back.\n')
w('### Word drops: top edge of each word (y), per frame\n')
rows=[]
for r in s1[:26]:
    ws=r['words']; get=lambda i: ws[i][1] if len(ws)>i else '–'
    rows.append([f"f{r['v']}",get(0),get(1),get(2)])
tbl(['frame','"in" y0','"this" y0','"video" y0'],rows)
w('- Stagger: "in" starts f0, "this" f3, "video" f5.\n- "in": 439 → 509 (f12–13, lowest point) → back up to ~502 (f22). Overshoot 7 px.\n- "this": 439 → 509 (f14–16) → ~503. "video": 436 → 509 (f17–19) → ~504.\n- Speed while falling ≈ 9–10 px/frame for the first 6 frames, then 6, 4, 3, 2, 1.\n')
w('### The line shrinks the whole time (no cut, no camera move, the text itself scales)\n')
rows=[]
for v in (8,15,20,25,30,35,40,50,60,70,80,90,98):
    ws=s1[v]['words']
    if len(ws)>=2: rows.append([f'f{v}',ws[0][0],f'{ws[1][0]}–{ws[1][2]}',ws[1][3]-ws[1][1], '%.2f'%((ws[1][3]-ws[1][1])/59)])
tbl(['frame','"in" left edge','"this" x0–x1','"this" height','scale vs start'],rows)
w('The right edge of "this" stays at x≈953–954 while everything left of it slides right and the letters get shorter: the line scales down about a point near **x≈965, y≈533** (the gap between "this" and the third word), from 1.00 to ≈0.81. Most of it happens between f15 and f40; it is still creeping at f98.\n')
w('### "video" leaves, the icon arrives (f36–f77)\n')
rows=[]
for v in list(range(34,62))+[65,71,77,89]:
    r=s1[v]; ws=r['words']; vid=ws[2] if len(ws)>2 else None; li=r['lime']
    rows.append([f'f{v}', f'{vid[0]}–{vid[2]}, y{vid[1]}–{vid[3]}' if vid and vid[2]-vid[0]>40 else '–', f'{li[0]},{li[1]}–{li[2]},{li[3]}' if li else '–', (li[2]-li[0]) if li else '–', (li[3]-li[1]) if li else '–'])
tbl(['frame','"video" ink box','icon box','icon w','icon h'],rows)
w('''- "video" collapses from the right (right edge 1189 → 1081 over f35–f41) while sagging downward, and is gone by f42.
- The icon starts as a **lime rounded square, 70×63**, appearing at f39 with its top at y=549 (below the line) and rising: 549, 536, 529, 522, 514, 508, 503, 499, 497, 495, **494 (f49–f51, highest)**, then settling back to 505 by f65. Overshoot 11 px.
- From f44 the camera "lens" pushes out of the right side: icon width 70 → 94 (f44) → 122 (f49) → **134 (f59–f61, widest)** → 121 settled (f77). Overshoot 13 px.
- Settled icon: x 971–1092, y 505–574 (121×69), white play triangle inside the square part.
- The icon has a soft lime glow around it while it moves (visible f39–f47), none once settled.
''')

# ---------- shot 2
w('## Shot 2 (f111–f274): "Clean Text / Animation"\n')
w('Headline is a heavy grotesque, black, estimated 114 px (letter height 83 px). Background is flat `#eaeaea` with faint blurred serif paragraphs; measured background drift is 0.00 px/frame, so **there is no camera move in this shot**.\n')
w('### "Clean" and "Text" drop in (top edge y of the line)\n')
rows=[]
for r in s2:
    if 105<=r['v']<=128:
        l=r['lines'][0] if r['lines'] else None
        rows.append([f"f{r['v']}", l['y'][0] if l else '–', ', '.join(f'{a}–{b}' for a,b in l['words']) if l else '–'])
tbl(['frame','line top y','words on the line (x0–x1)'],rows)
w('- "Clean" (x 664–991) starts at f105, during the dissolve, top at y=440, and falls 8, 8, 8, 6, 6, 4, 4, 2 px per frame to 486 (f113), then eases back to 482.\n- "Text" (x 1023–1261) starts at f114 with its top at y=444 and lands by f121 (485), settling to 482 by f126. Nine frames after "Clean".\n- Rest position of the line: y 482–565.\n')
w('### The line lifts to make room (f139–f177)\n')
tbl(['frame','line top y'],[[f'f{r[0]}',r[1][1]] for r in s2b if 138<=r[0]<=180 and r[1]])
w('Up 108 px in 12 frames (≈12.5 px/frame, straight, for f140–f146, then slowing), **overshoots to 374 at f151–f152**, comes back down past its target to 398 (f165–f169), and settles at 393 by f177. A soft spring: 19 px over, 5 px under.\n')
w('### "Animation" types in on line 2 (f151–f184)\n')
tbl(['frame','line-2 ink box (black + blue)'],[[f'f{r[0]}',f'{r[2][0]},{r[2][1]}–{r[2][2]},{r[2][3]}'] for r in s2b if 151<=r[0]<=185 and r[2]])
w('''- The first letter "A" appears at f151 at the **right** of the line (x≈1125–1212), blue (`#209dec`), slightly oversized and blurred.
- New letters keep arriving at the right while the word slides **left**: left edge 1125 (f151) → 1075 (f156) → 939 (f160) → 786 (f163) → 688 (f168) → 664 (f177). The newest one or two letters are blue; older ones are black.
- A dashed grey box (the text-box outline) is on screen from f157, spanning the line-2 area.
- Finished word: x 663–1258, the same width as "Clean Text" above it. Last blue letters turn black by ≈ f184.
- From f177 four blue corner handles sit on the box: box 649,512–1273,645.
''')
w('### Scribbles, quotes, subtitle: when each one draws on\n')
tbl(['element','where','starts','finished','notes'],[
 ['Arrow, bottom right (curved, pointing up-left at the headline)','x 1300–1560, y 560–1080','f160','f178','draws on as a stroke'],
 ['Squiggle + arrow, top right','x 1300–1700, y 20–300','f164','f204','two strokes'],
 ['Long arrow, top left','x 0–480, y 20–300','f167','f177 (arrowhead f184–f188)','enters from the left edge'],
 ['Small arrow, bottom left','x 280–400, y 730–790','f180','≈ f224','small'],
 ['Tiny triangle, top centre','x≈1125, y≈245','f192','f192','pops on'],
 ['Opening quote mark, left of "Clean"','x 636–660, y 366–384','f188','f200',''],
 ['Closing quote mark, right of "Text"','x 1270–1297, y 366–384','f194','f212',''],
 ['Subtitle "in [Ae] After Effects"','settled x 814–1109, y 683–718 (≈38 px type)','f209 ("in"), f212 (icon), f215 ("After"), f221 ("Effects")','f236','words arrive left to right; "Effects" slides in from the right (x1 1143 → 1109)'],
])
w('All the hand-drawn marks **boil**: their shapes re-draw about every 8 frames (≈7.5 times a second) for the rest of the shot. Measured as the ink area changing in steps and holding for 4–8 frames in between.\n')

# ---------- shot 3
b=s3['buttons']
w('## Shot 3 (f290–f378, then replayed): five buttons\n')
tbl(['button','box x0,y0–x1,y1','size'],[[k,f'{v[0]},{v[1]}–{v[2]},{v[3]}',f'{v[2]-v[0]+1}×{v[3]-v[1]+1}'] for k,v in b.items()])
w('Row 1 has three buttons with 20 px gaps; row 2 has two, centred under them, 16 px below. Small corner radius (a few px; too small to measure through the compression). The buttons themselves do not animate: they are fully there on the first frame after the dissolve. Labels are white, estimated 80 px (letter height 59 px), regular weight.\n')
w('### What each label does, per frame\n')
rows=[]
for r in s3['rows']:
    v=r['v']
    if v<289 or v>336: continue
    c=r['Colors']; bo=r['Bounce']; m=r['Mix']; t=r['Typewriter']; sn=r['Snapping']
    rows.append([f'f{v}', f"{c[4]}%" if c else '–', bo[1] if bo and bo[5]>100 else ('(fading in) %d'%bo[1] if bo else '–'), f'{m[0]}–{m[2]}' if m else '–', t[2] if t and t[2]-t[0]<420 and not (v<300 and t[2]>700) else '–', f'{sn[0]}–{sn[2]}' if sn and sn[2]-sn[0]<400 and sn[1]>590 else '–'])
tbl(['frame','Colors: % of letters still blue','Bounce: top edge y','Mix: x0–x1','Typewriter: right edge x','Snapping: x0–x1'],rows)
w('''- **Colors** (x 352–576, y 416–475): on screen from f289, all blue (`#4098e7`), fading up to full brightness by f295. Then it turns white **one letter at a time, left to right**: steps at f293, f298, f304, f310, f316, f322 (one letter every ≈ 6 frames).
- **Bounce** (x 830–1091): fades in from f293 while rising from y=490 at a steady ≈ 6 px/frame, reaches y=403 at f311–f312 (**15 px above** its rest), then eases down to rest at 418 by ≈ f333.
- **Mix** (rest x 1385–1505): letters arrive one after another from the right, each starting small, blue and soft: "M" f294, "i" f297, "x" f300. The word slides left as it grows (x0 1428 → 1369 at f305, 16 px past its rest, → 1385). "x" stays blue until f322–f324.
- **Typewriter** (starts x 543): typed left-aligned, one character every ≈ 4.7 frames (≈ 12.8 characters a second): T f291, y f295, p f300, e f305, w f310, r f314, i f320, t f324, e f329, r f333–f336. Each new character appears grey and brightens to white over ≈ 3 frames. Full word x 543–909.
- **Snapping** (rest x 1055–1384): centred; a new letter comes up from below the baseline about every 4 frames and snaps into place (S f298, n f300, a f305, p f308, p f312, i f316, n f320, g f324) while the word re-centres smoothly (left edge moves ≈ 6 px/frame). Settled by f331.
- Everything is at rest from ≈ f336 to the cut at f379 (43 frames of hold).
''')

w('''## Sound

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
''')
open(os.path.join(D,'..','..','SPEC.md'),'w').write('\n'.join(o))
print('lines',len(o))
