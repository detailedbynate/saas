import cv2,numpy as np,json
R0=94
def fr(v): return cv2.imread('fr/%04d.jpg'%(v+R0))
def bb(m,x0=0,y0=0):
    ys,xs=np.nonzero(m)
    return None if len(xs)<12 else (int(xs.min())+x0,int(ys.min())+y0,int(xs.max())+x0,int(ys.max())+y0)
print('v | line1 (Clean Text) bbox | line2 ink+blue bbox | subtitle bbox | BL-arrow ink | quotes L/R ink')
out=[]
for v in list(range(136,182))+list(range(182,276,3)):
    f=fr(v); g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY); hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV)
    ink=g<70; blue=((hsv[...,0]>95)&(hsv[...,0]<118)&(hsv[...,1]>110)&(hsv[...,2]>120))
    h=ink[280:660,655:1270]; yy=np.where(h.sum(1)>6)[0]
    l1=None
    if len(yy):
        # first run of rows
        a=yy[0]; b=a
        for y in yy[1:]:
            if y-b>8: break
            b=y
        xs=np.where(h[a:b+1].any(0))[0]; l1=(int(xs.min())+655,int(a)+280,int(xs.max())+655,int(b)+280)
    l2=bb((ink|blue)[500:650,620:1300],620,500)
    sub=bb((g<120)[672:730,740:1180],740,672)
    bl=int(ink[700:830,230:480].sum())
    ql=int(ink[470:510,620:660].sum()) if l1 is None else int(ink[l1[1]-20:l1[1]+25,l1[0]-40:l1[0]-6].sum())
    qr=0 if l1 is None else int(ink[l1[1]-20:l1[1]+25,l1[2]+6:l1[2]+45].sum())
    out.append((v,l1,l2,sub,bl,ql,qr)); print(v,l1,l2,sub,bl,ql,qr)
json.dump(out,open('shot2b.json','w'))
