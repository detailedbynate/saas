import cv2,numpy as np,json
R0=94
def fr(v): return cv2.imread('fr/%04d.jpg'%(v+R0))
rows=[]
for v in range(0,100):
    f=fr(v); g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY); hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV)
    lime=((hsv[...,0]>25)&(hsv[...,0]<45)&(hsv[...,1]>120)&(hsv[...,2]>150))
    bg=np.median(g[400:700,1500:1800])
    txt=(g>bg+45); txt[:380]=0; txt[720:]=0; txt[:,:560]=0; txt[:,1400:]=0
    txt&=~cv2.dilate(lime.astype(np.uint8),np.ones((9,9))).astype(bool)
    # split by x gaps into words (columns with ink), merging gaps < 14px
    cols=np.where(txt.any(0))[0]; words=[]
    if len(cols):
        s=cols[0]; p=cols[0]
        for c in cols[1:]:
            if c-p>14: words.append((s,p)); s=c
            p=c
        words.append((s,p))
    tb=[]
    for (a,b) in words:
        ys=np.where(txt[:,a:b+1].any(1))[0]
        if b-a<8: continue
        tb.append([int(a),int(ys.min()),int(b),int(ys.max())])
    li=None
    if lime.sum()>60:
        ys,xs=np.nonzero(lime); li=[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max()),int(lime.sum())]
    rows.append({'v':v,'words':tb,'lime':li})
json.dump(rows,open('shot1.json','w'))
for r in rows:
    w=r['words']; print(r['v'], ' | '.join('%d,%d-%d,%d'%tuple(b) for b in w), ' LIME', r['lime'])
