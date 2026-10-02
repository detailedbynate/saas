import cv2,numpy as np,json
R0=94
def fr(v): return cv2.imread('fr/%04d.jpg'%(v+R0))
hx=lambda b:'#%02x%02x%02x'%(int(b[2]),int(b[1]),int(b[0]))
f=fr(360); g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
# exact button edges: scan rows/cols for fill (>=24) vs bg (<=21)
def edges(xa,ya,xb,yb):
    sub=g[ya:yb,xa:xb]; m=sub>=23
    cols=np.where(m.mean(0)>0.6)[0]; rows=np.where(m.mean(1)>0.6)[0]
    return (int(cols.min())+xa,int(rows.min())+ya,int(cols.max())+xa,int(rows.max())+ya)
approx={'Colors':(200,340,715,540),'Bounce':(715,340,1208,540),'Mix':(1208,340,1710,540),'Typewriter':(470,538,975,730),'Snapping':(975,538,1480,730)}
btn={k:edges(*v) for k,v in approx.items()}
print('buttons x0,y0,x1,y1:',btn)
print('gaps: row1',btn['Bounce'][0]-btn['Colors'][2],btn['Mix'][0]-btn['Bounce'][2],'row gap',btn['Typewriter'][1]-btn['Colors'][3])
x0,y0,x1,y1=btn['Colors']; 
# corner radius: first row where leftmost fill col == x0
sub=(g[y0:y1,x0:x1]>=23); rad=next(i for i in range(40) if sub[i,0]); print('corner radius ~',rad,'px')
print('label colours settled:', {k:hx(f[b[1]:b[3],b[0]:b[2]].reshape(-1,3)[f[b[1]:b[3],b[0]:b[2]].reshape(-1,3).sum(1).argmax()]) for k,b in btn.items()})
ff=fr(292); hs=cv2.cvtColor(ff,cv2.COLOR_BGR2HSV); b=btn['Colors']; reg=ff[b[1]:b[3],b[0]:b[2]]; m=(hs[b[1]:b[3],b[0]:b[2]][...,1]>100)&(reg.max(2)>150); print('Colors blue',hx(np.median(reg[m],0)))
rows=[]
for v in range(284,380):
    f=fr(v); g2=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY); hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV); r={'v':v}
    for nm,(a,b_,c,d) in btn.items():
        pad=40 if nm in('Bounce','Snapping') else 0
        sub=g2[b_-0:d+pad,a:c]; txt=sub>80
        ys,xs=np.nonzero(txt)
        if len(xs)<15: r[nm]=None; continue
        hs=hsv[b_:d+pad,a:c]; bl=txt&(hs[...,0]>95)&(hs[...,0]<120)&(hs[...,1]>90)
        r[nm]=[int(xs.min())+a,int(ys.min())+b_,int(xs.max())+a,int(ys.max())+b_,int(bl.sum()*100/max(1,txt.sum())),int(sub[txt].max())]
    r['fill']=int(np.median(g2[btn['Colors'][1]+8:btn['Colors'][1]+20,btn['Colors'][0]+14:btn['Colors'][0]+60]))
    rows.append(r)
json.dump({'buttons':btn,'rows':rows},open('shot3.json','w'))
print('v fill | per label: x0,y0-x1,y1 blue% maxLuma')
for r in rows:
    if r['v']>332 and r['v']%8: continue
    print(r['v'],r['fill'],' | '.join('%s %s'%(nm[:3],'-' if r[nm] is None else '%d,%d-%d,%d b%d L%d'%tuple(r[nm])) for nm in btn))
