import cv2,numpy as np,json
R0=94
def fr(v): return cv2.imread('fr/%04d.jpg'%(v+R0))
def bbox(m):
    ys,xs=np.nonzero(m)
    return None if len(xs)<25 else [int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
rows=[]; prevbg=None
for v in range(105,276):
    f=fr(v); g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY); hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV)
    ink=g<70
    blue=((hsv[...,0]>95)&(hsv[...,0]<118)&(hsv[...,1]>110)&(hsv[...,2]>120))
    head=np.zeros_like(ink); head[380:640,620:1300]=True
    hi=ink&head
    # split headline into rows by y gap
    yy=np.where(hi.any(1))[0]; lines=[]
    if len(yy):
        s=yy[0]; pv=yy[0]
        for y in yy[1:]:
            if y-pv>10: lines.append((s,pv)); s=y
            pv=y
        lines.append((s,pv))
    L=[]
    for (a,b) in lines:
        if b-a<14: continue
        xs=np.where(hi[a:b+1].any(0))[0]
        # words by gap > 18
        ws=[]; s=xs[0]; pv=xs[0]
        for x in xs[1:]:
            if x-pv>18: ws.append([int(s),int(pv)]); s=x
            pv=x
        ws.append([int(s),int(pv)])
        L.append({'y':[int(a),int(b)],'words':ws})
    bl=bbox(blue&head)
    sub=bbox((g<110)&(np.indices(g.shape)[0]>585)&(np.indices(g.shape)[0]<625)&(np.indices(g.shape)[1]>760)&(np.indices(g.shape)[1]<1160))
    reg={'TL':(0,0,520,330),'TR':(1300,0,1920,330),'BR':(1300,560,1920,1080),'BL':(180,560,620,760),'TOP':(1040,180,1200,300)}
    sc={k:int(ink[y0:y1,x0:x1].sum()) for k,(x0,y0,x1,y1) in reg.items()}
    bgp=cv2.GaussianBlur(g[700:1050,120:560].astype(np.float32),(0,0),1.5)
    drift=None
    if prevbg is not None:
        (dx,dy),_=cv2.phaseCorrelate(prevbg,bgp); drift=[round(dx,2),round(dy,2)]
    prevbg=bgp
    rows.append({'v':v,'lines':L,'blue':bl,'sub':sub,'scr':sc,'drift':drift})
json.dump(rows,open('shot2.json','w'))
for r in rows:
    ls=' / '.join('y%d-%d %s'%(l['y'][0],l['y'][1],' '.join('%d-%d'%tuple(w) for w in l['words'])) for l in r['lines'])
    print(r['v'],ls,'| blue',r['blue'],'| sub',r['sub'],'| scr',' '.join('%s%d'%(k,x) for k,x in r['scr'].items()),'| drift',r['drift'])
