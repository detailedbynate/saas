import cv2,numpy as np,json
R0=94
def fr(v): return cv2.imread('fr/%04d.jpg'%(v+R0))
hx=lambda b:'#%02x%02x%02x'%(int(b[2]),int(b[1]),int(b[0]))
med=lambda f,x,y,r=12: np.median(f[y-r:y+r,x-r:x+r].reshape(-1,3),0)
print('== colours ==')
f=fr(80)
print('shot1 bg: centre',hx(med(f,960,300)),'TL',hx(med(f,60,60)),'TR',hx(med(f,1860,60)),'BL',hx(med(f,60,1020)),'BR',hx(med(f,1860,1020)),'right-mid',hx(med(f,1800,800)))
g=cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
# text colour gradient: brightest pixel per row inside 'this'
for y in (510,520,530,540,550,555):
    row=f[y,826:954]; i=row.sum(1).argmax(); print(' text row',y,hx(row[i]))
hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV); lime=((hsv[...,0]>25)&(hsv[...,0]<45)&(hsv[...,1]>120)&(hsv[...,2]>150))
print(' icon lime median',hx(np.median(f[lime],0)), 'brightest',hx(f[lime][f[lime].sum(1).argmax()]))
f=fr(250)
print('shot2 bg: centre-left',hx(med(f,300,540)),'TL',hx(med(f,60,60)),'BR',hx(med(f,1860,1020)),' bg-lorem darkest sample',hx(f[100:400,100:600].reshape(-1,3)[f[100:400,100:600].reshape(-1,3).sum(1).argmin()]))
print(' headline ink darkest',hx(f[430:620,640:1280].reshape(-1,3)[f[430:620,640:1280].reshape(-1,3).sum(1).argmin()]))
hsv=cv2.cvtColor(fr(165),cv2.COLOR_BGR2HSV); ff=fr(165); blue=((hsv[...,0]>95)&(hsv[...,0]<115)&(hsv[...,1]>120))
print(' blue (typing highlight) median',hx(np.median(ff[blue],0)) if blue.sum() else None, blue.sum())
f=fr(340)
print('shot3 bg: centre',hx(med(f,960,200)),'TL',hx(med(f,60,60)),'BR',hx(med(f,1860,1020)),' button fill',hx(med(f,330,440,5)),' button text',hx(f[420:470,180:300].reshape(-1,3)[f[420:470,180:300].reshape(-1,3).sum(1).argmax()]))
print('== transition brightness (video frame: mean luma 0-255) ==')
for a,b in ((95,115),(270,292)):
    print(' '.join('%d:%.0f'%(v,cv2.cvtColor(fr(v),cv2.COLOR_BGR2GRAY).mean()) for v in range(a,b)))
