import os
import numpy as np, math, sys
from PIL import Image
from scipy.ndimage import gaussian_filter, uniform_filter
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'vendor'))
import pixelstudio as ps
import os
FLAT=os.environ.get('FLAT','0')=='1'
S=float(os.environ.get('KS','1.5')); N=int(round(float(os.environ.get('KGRID','128'))*S)); C=N/2            # grid index = model unit * S ; model unit 64 = centre
occ=np.zeros((N,N,N),bool); mat=np.zeros((N,N,N),np.uint8); pid=np.zeros((N,N,N),np.uint16); PC=[0]   # [y,z,x]
ar=(np.arange(N)/S).astype(np.float32)
Yg=ar.reshape(N,1,1); Zg=ar.reshape(1,N,1); Xg=ar.reshape(1,1,N)
MATS=['none','steel','mail','leather','gold','field','trim','stitch','hole','blade','dark','stitch2','strap','scab','azure','gules','or','ermine','espot','cap','wood','smear']
MI={m:i for i,m in enumerate(MATS)}
def put(mask,m):
    PC[0]+=1; occ[mask]=True; mat[mask]=MI[m]; pid[mask]=PC[0]
def ellipsoid(c,r,m): put(((Xg-c[0])/r[0])**2+((Yg-c[1])/r[1])**2+((Zg-c[2])/r[2])**2<=1,m)
def seg(A,B):
    A=np.array(A,np.float32);B=np.array(B,np.float32);d=B-A;L2=max(float(d@d),1e-6)
    px,py,pz=Xg-A[0],Yg-A[1],Zg-A[2]
    t=np.clip((px*d[0]+py*d[1]+pz*d[2])/L2,0,1)
    dx,dy,dz=px-t*d[0],py-t*d[1],pz-t*d[2]
    return t,np.sqrt(dx*dx+dy*dy+dz*dz)
def capsule(A,B,r0,r1,m):
    t,dist=seg(A,B); put(dist<=r0+(r1-r0)*t,m)
def band(A,B,t0,t1,rin,rout,m):
    t,dist=seg(A,B); put((t>=t0)&(t<=t1)&(dist>=rin)&(dist<=rout),m)
def loft(pts,m,cut=None):
    pts=sorted(pts,key=lambda p:p[0]); PC[0]+=1
    y0=int(min(p[0] for p in pts)*S); y1=int(max(p[0] for p in pts)*S)
    X2=Xg[0,0,:][None,:]; Z2=Zg[0,:,0][:,None]
    for yi in range(max(0,y0),min(N,y1+1)):
        y=yi/S
        for i in range(len(pts)-1):
            a,b=pts[i],pts[i+1]
            if a[0]<=y<=b[0]:
                t=(y-a[0])/(b[0]-a[0]) if b[0]!=a[0] else 0
                g=lambda k,dflt: (a[k] if len(a)>k else dflt)*(1-t)+(b[k] if len(b)>k else dflt)*t
                rx=g(1,1);rz=g(2,1);cx=g(3,64);cz=g(4,64)
                m2=((X2-cx)/rx)**2+((Z2-cz)/rz)**2<=1
                if cut is not None: m2&=cut(y,Z2,X2)
                occ[yi][m2]=True; mat[yi][m2]=MI[m]; pid[yi][m2]=PC[0]; break

def V(*a): return np.array(a,np.float32)
def nrm(v): v=np.asarray(v,np.float32); return v/max(1e-6,float(np.linalg.norm(v)))
def sleeve(A,B,t1,r,m,ndag,dlen):
    """cloth tube around segment A-B from t=0..t1, dagged lower edge"""
    A=V(*A);B=V(*B);d=B-A;Ld=float(np.linalg.norm(d));u=d/Ld
    p=np.cross(u,V(0,0,1)); p=p/ max(1e-6,float(np.linalg.norm(p))) if np.linalg.norm(p)>1e-3 else V(1,0,0); q=np.cross(u,p)
    px,py,pz=Xg-A[0],Yg-A[1],Zg-A[2]
    t=(px*u[0]+py*u[1]+pz*u[2])/Ld
    ex,ey,ez=px-t*Ld*u[0],py-t*Ld*u[1],pz-t*Ld*u[2]
    dist=np.sqrt(ex*ex+ey*ey+ez*ez)
    ang=np.arctan2(ex*q[0]+ey*q[1]+ez*q[2],ex*p[0]+ey*p[1]+ez*p[2])
    lim=t1-(dlen/Ld)*(1-np.abs(np.sin(ang*ndag/2)))
    put((t>=-0.05)&(t<=lim)&(dist<=r)&(dist>=r-1.6),m)

HS=float(os.environ.get('HS','1.0'))

FLEUR=["..#..",".###.","#.#.#","#####","..#..",".#.#."]
LION=["#.....###",".#....###",".#######.",".#.#..#.#",".#.#..#.#"]
def herald(du,dv,france,dexter,W,H,s=1.0):
    out=np.full(du.shape,MI['azure' if france else 'gules'],np.uint8)
    if france:
        b=0.62*s; Cc=4.8*s
        row=np.floor(dv/Cc); sh=(row%2)*Cc/2
        lu=(du+sh)%Cc-(Cc-5*b)/2; lv=dv%Cc-(Cc-6*b)/2
        col=np.floor(lu/b).astype(int); rw=np.floor(lv/b).astype(int)
        ok=(col>=0)&(col<5)&(rw>=0)&(rw<6)
        bm=np.array([[c=='#' for c in r] for r in FLEUR])
        hit=np.zeros(du.shape,bool); hit[ok]=bm[rw[ok],col[ok]]
        out[hit]=MI['or']
    else:
        b=0.72*s; bm=np.array([[c=='#' for c in r] for r in LION])
        for i in range(3):
            cy=H*(i+0.5)/3
            col=np.floor((du-(W/2-4.5*b))/b).astype(int); rw=np.floor((dv-(cy-2.5*b))/b).astype(int)
            ok=(col>=0)&(col<9)&(rw>=0)&(rw<5)
            c2=np.where(dexter,col,8-col)
            hit=np.zeros(du.shape,bool); hit[ok]=bm[rw[ok],np.clip(c2[ok],0,8)]
            out[hit]=MI['or']
    return out
POSE=dict(
  hipL=(72.0,57.0,64.8), kneeL=(75.5,33.0,73.0), ankL=(77.5,8.0,69.5), toeL=(80.0,2.0,80.0),
  hipR=(56.0,57.0,63.2), kneeR=(51.5,32.0,57.5), ankR=(47.5,8.0,51.5), toeR=(44.5,2.0,61.0),
  shR=(48.0,90.0,64.0), elR=(34.5,95.0,63.0), wrR=(40.0,106.0,68.0),
  shL=(80.0,89.3,64.0), elL=(85.0,76.0,72.0), wrL=(72.0,77.5,79.5),
  swd=(-0.55,0.45,-0.70),
)
def build(P=POSE):
    occ[:]=False; mat[:]=0; pid[:]=0; PC[0]=0
    # legs: cuisse, articulated poleyn, shaped greave, laminated sabaton
    for side,sx in (('L',1),('R',-1)):
        hp,kn,an,to=V(*P['hip'+side]),V(*P['knee'+side]),V(*P['ank'+side]),V(*P['toe'+side])
        fwd=to-an; fwd[1]=0; fwd=nrm(fwd)
        up_t=nrm(hp-kn); dn_s=nrm(an-kn)
        # thigh: cuisse with ridge
        capsule(hp,kn+up_t*2.0,5.0,4.2,'steel')
        capsule(hp+dn_s*0+up_t*-4+fwd*4.2,kn+up_t*3.2+fwd*3.8,1.1,0.9,'steel')
        # poleyn: lame above, cop, lame below, side wing
        ellipsoid(kn+up_t*2.6+fwd*0.6,(4.6,1.4,4.6),'steel')
        ellipsoid(kn+fwd*1.2,(4.4,3.4,4.5),'steel')
        ellipsoid(kn+fwd*3.6,(2.3,2.8,1.7),'steel')
        ellipsoid(kn+dn_s*2.8+fwd*0.6,(4.2,1.3,4.3),'steel')
        wing=kn+V(sx*4.4,0.3,0)+fwd*0.4
        ellipsoid(wing,(1.1,3.0,2.7),'steel'); ellipsoid(wing+V(sx*0.8,0,0),(0.7,0.7,0.7),'gold')
        # greave: calf swells behind, narrows to the ankle
        mid=kn+(an-kn)*0.42
        capsule(kn+dn_s*3.6,mid,3.6,4.0,'steel')
        ellipsoid(mid-fwd*1.0,(3.9,6.0,4.2),'steel')
        capsule(mid,an+V(0,1.2,0),3.8,2.5,'steel')
        capsule(kn+dn_s*4.2+fwd*3.2,an+V(0,2.6,0)+fwd*2.3,0.9,0.7,'steel')          # shin ridge
        for k_ in range(3):
            t_=0.25+k_*0.25
            ellipsoid(kn+(an-kn)*t_+V(sx*3.6,0,0)-fwd*0.2,(0.5,0.5,0.5),'gold')         # hinge rivets
        # ankle and laminated sabaton, sole on the ground
        ellipsoid(an+V(0,0.4,0),(2.9,2.4,3.1),'steel')
        ellipsoid(an+V(0,-3.2,0)-fwd*2.6,(2.6,2.4,2.8),'steel')                          # heel
        for k_ in range(6):
            t_=k_/6.0
            c_=an+fwd*(1.0+t_*10.0)+V(0,-3.6-t_*0.9+1.7*(1-t_),0)
            ellipsoid(c_,(3.1-1.6*t_,2.6-1.3*t_,2.3),'steel')
        capsule(an+fwd*10.5+V(0,-4.0,0),an+fwd*16.0+V(0,-5.4,0),1.4,0.35,'steel')        # pointed toe
    # mail skirt + jupon with the quartered arms
    def dag(y,Z2,X2):
        ang=np.arctan2(Z2-64,X2-64); return (y>=46.0+2.4*np.abs(np.sin(ang*9)))
    loft([(52,15.6,11.2),(45.5,16.0,11.5)],'mail',cut=dag)
    def jdag(y,Z2,X2):
        ang=np.arctan2(Z2-64,X2-64); return (y>=50.0+3.6*(1-np.abs(np.sin(ang*10))))
    loft([(50,16.4,11.7),(55,15.0,10.4),(62,12.0,8.6),(68,11.0,8.1,64,64.5),(76,12.6,9.4,64,65.6),(84,13.7,10.0,64,65.9),(90,13.5,9.3,64,64.9),(95,10.2,7.6)],'field',cut=jdag)
    yy,zz,xx=np.nonzero(mat==MI['field'])
    Xu=xx/S; Yu=yy/S
    u=Xu-64; split=72.0
    dexter=u<0; chief=Yu>=split
    france=(dexter&chief)|(~dexter&~chief)
    du=np.abs(u); dv=np.where(chief,95-Yu,split-Yu)
    m=np.empty(len(xx),np.uint8)
    for fr in (True,False):
        sel=france==fr
        m[sel]=herald(du[sel],dv[sel],fr,dexter[sel],14.0,22.0,HS)
    m[Yu<=52.4]=MI['or']
    mat[yy,zz,xx]=m
    # knightly belt of plaques
    inner=((Xg-64)/12.8)**2+((Zg-64)/9.0)**2
    belt=(Yg>=55.5)&(Yg<=59.5)&(inner>=0.9)&(inner<=1.45)
    put(belt,'gold')
    ang=np.arctan2(Zg-64,Xg-64)
    mat[belt&((np.floor(ang/0.30).astype(int)%2)==1)&(inner>1.2)&(np.abs(Yg-57.5)<1.1)]=MI['azure']
    # dagger right hip, empty scabbard left hanging back
    capsule((64-11,55,64+6.5),(64-11.5,41,64+7.5),1.3,0.5,'scab'); capsule((64-11,59,64+6.3),(64-11,55,64+6.5),0.9,0.9,'leather')
    ellipsoid((64-11,59.8,64+6.3),(1.3,1.3,1.3),'gold'); capsule((64-13.2,55,64+6.5),(64-8.8,55,64+6.5),0.7,0.7,'gold')
    capsule((64+12.5,56,64+2),(64+21,16,64-11),1.6,1.2,'scab')
    band((64+12.5,56,64+2),(64+21,16,64-11),0,0.06,0,2.1,'gold'); band((64+12.5,56,64+2),(64+21,16,64-11),0.93,1.0,0,1.8,'gold')
    # mail collar below the helm
    loft([(95,8.6,9.4,64,63.4),(91,12.0,9.8,64,64),(87.5,14.6,10.4,64,64.6)],'mail')
    # arms
    for side,sx in (('R',-1),('L',1)):
        sh,el,wr=V(*P['sh'+side]),V(*P['el'+side]),V(*P['wr'+side])
        ellipsoid(sh+V(sx*0.8,1.6,0),(5.6,5.0,6.0),'steel')
        ellipsoid(sh+V(sx*1.1,-2.4,0),(5.0,2.6,5.4),'steel')
        ellipsoid(sh+V(sx*1.3,-5.4,0),(4.5,2.2,4.9),'steel')
        capsule(sh+V(0,-2.5,0),el,3.3,3.0,'steel')
        ellipsoid(el,(3.7,3.5,3.8),'steel')
        out=nrm(el-(sh+wr)/2)
        ellipsoid(el+out*3.3,(1.8,2.3,1.8),'steel'); ellipsoid(el+out*4.4,(0.8,0.8,0.8),'gold')
        capsule(el,wr,3.0,2.4,'steel')
        ellipsoid(wr+nrm(wr-el)*1.0,(3.3,2.8,3.1),'steel')
        ellipsoid(wr+nrm(wr-el)*3.3,(2.7,2.5,2.5),'steel')
        band(el,wr,0.80,0.88,2.5,3.5,'leather')
    # sword raised
    d=nrm(P['swd']); h=V(*P['wrR'])+nrm(V(*P['wrR'])-V(*P['elR']))*3.0
    cross_ax=nrm(np.cross(d,V(0,0,1)))
    capsule(h-d*6.0,h+d*2.0,1.4,1.4,'leather'); ellipsoid(h-d*7.2,(2.3,2.3,2.3),'gold')
    capsule(h+d*2.8-cross_ax*8.5,h+d*2.8+cross_ax*8.5,1.2,1.2,'gold')
    A=h+d*3.4; Lb=40.0
    px,py,pz=Xg-A[0],Yg-A[1],Zg-A[2]
    tt=px*d[0]+py*d[1]+pz*d[2]; nrmax=np.cross(d,cross_ax)
    cw=px*cross_ax[0]+py*cross_ax[1]+pz*cross_ax[2]; cn=px*nrmax[0]+py*nrmax[1]+pz*nrmax[2]
    w=2.2-1.7*np.clip(tt/Lb,0,1)
    put((tt>=0)&(tt<=Lb)&(np.abs(cw)<=w)&(np.abs(cn)<=0.7*(1-np.abs(cw)/np.maximum(w,0.1))+0.3),'blade')
    # heater shield on the left arm
    cen=V(*P['wrL'])+V(-1.0,-1.5,4.5); nrm_s=nrm(V(-0.42,0,0.91)); ua=nrm(V(0.91,0,0.42)); va=V(0,-1,0)
    px,py,pz=Xg-cen[0],Yg-cen[1],Zg-cen[2]
    us=px*ua[0]+py*ua[1]+pz*ua[2]; vs=px*va[0]+py*va[1]+pz*va[2]; ws=px*nrm_s[0]+py*nrm_s[1]+pz*nrm_s[2]
    hw=np.where(vs<=3,12.0,12.0*np.sqrt(np.clip(1-((vs-3)/17.0)**2,0,1)))
    sm_=(vs>=-11.0)&(vs<=20.0)&(np.abs(us)<=hw)&(np.abs(ws+0.035*us**2)<=1.3)
    put(sm_,'gules')
    yy,zz,xx=np.nonzero(sm_)
    pu=(xx/S-cen[0])*ua[0]+(zz/S-cen[2])*ua[2]; pv=-(yy/S-cen[1])
    sdex=pu<0; schief=pv<3.0
    sfr=(sdex&schief)|(~sdex&~schief)
    sdu=np.abs(pu); sdv=np.where(schief,pv+11.0,pv-3.0)
    m=np.empty(len(xx),np.uint8)
    for fr in (True,False):
        sel=sfr==fr; m[sel]=herald(sdu[sel],sdv[sel],fr,sdex[sel],12.0,14.0,1.25*HS)
    hwp=hw[yy,zz,xx]
    pw=(xx/S-cen[0])*nrm_s[0]+(zz/S-cen[2])*nrm_s[2]+0.035*pu**2
    m[pw<0.45]=MI['wood']                                   # wooden core shows at the edge and back
    m[((np.abs(pu)>=hwp-0.55)|(pv<=-10.5))&(pw>=0.45)]=MI['leather']   # leather-bound edge
    mat[yy,zz,xx]=m
    # great helm with crest
    loft([(92.5,7.4,8.4,64,64.0),(100,7.8,8.9,64,64.2),(108,7.6,8.6,64,64.0),(111.5,6.6,7.6,64,63.6),(114,4.2,4.8,64,63.4),(115.5,1.2,1.4,64,63.2)],'steel')
    capsule((64,93,72.6),(64,111,71.6),0.9,0.7,'steel')
    hel=(mat==MI['steel'])&(Yg>=92)&(Yg<=116)&(Zg>=69.5)
    mat[hel&(np.abs(Yg-104.2)<=0.55)&(np.abs(Xg-64)>=1.0)]=MI['hole']
    br=hel&(Xg<62.5)&(Xg>57)&(Yg>=95)&(Yg<=101)&((((Xg+Yg)%1.6)<0.6)&(((Xg-Yg)%1.6)<0.6))
    mat[br]=MI['hole']
    rr=((Xg-64)/8.1)**2+((Zg-64)/9.2)**2
    put((Yg>=103.0)&(Yg<=103.8)&(rr<=1.0)&(rr>=0.8),'gold')
    for rx_ in (-1,1):
        for ry_ in (96,99,102,107,110):
            ellipsoid((64+rx_*7.6,ry_,66.8),(0.6,0.6,0.6),'gold')
    loft([(113.0,5.6,6.4,64,63.4),(117.5,5.0,5.8,64,63.2)],'cap')
    loft([(113.0,6.3,7.1,64,63.4),(114.6,6.3,7.1,64,63.4)],'ermine')
    yy,zz,xx=np.nonzero(mat==MI['ermine'])
    sp=((xx//3+zz//3)%3==0)&((yy//2)%2==0)
    mat[yy[sp],zz[sp],xx[sp]]=MI['espot']
    ellipsoid((64,120.0,62.5),(2.2,2.0,4.6),'or')
    ellipsoid((64,122.6,67.0),(1.7,1.8,1.8),'or')
    for lx in (-1.2,1.2):
        for lz in (-3.0,2.6):
            capsule((64+lx,119.5,62.5+lz),(64+lx,117.6,62.5+lz),0.6,0.6,'or')
    capsule((64,121,58.2),(64,124,57.2),0.5,0.5,'or')
    ellipsoid((64,124.4,67.0),(1.2,0.5,1.2),'or')
build()
def render(theta=45,outline=True,phi=0.0):
    th=math.radians(theta); c,s_=math.cos(th),math.sin(th)
    sm=gaussian_filter(occ.astype(np.float32),0.9*S)
    gy,gz,gx=np.gradient(sm)
    dens=uniform_filter(occ.astype(np.float32),int(7*S)|1)
    depth=np.full((N,N),-9e9,np.float32); mid=np.zeros((N,N),np.uint8); pos=np.zeros((N,N,3),np.int32); pp=np.zeros((N,N),np.int32)
    ux=(np.arange(N)-C+0.5)[None,:].repeat(N,0); vy=(N-1-np.arange(N)+0.0)[:,None].repeat(N,1)
    ph=math.radians(phi); cp,sp=math.cos(ph),math.sin(ph); Yc=N*0.42
    W_=np.array([-s_*cp,sp,c*cp]); U_=np.array([s_*sp,cp,-c*sp]); R_=np.array([c,0,s_])
    OFF=float(os.environ.get('KOFF','0'))*S
    vv=vy-Yc-OFF
    for vz in np.arange(0.75*N,-0.75*N,-0.5):
        xi=np.rint(C+ux*R_[0]+vv*U_[0]+vz*W_[0]).astype(int); zi=np.rint(C+ux*R_[2]+vv*U_[2]+vz*W_[2]).astype(int); yi=np.rint(Yc+vv*U_[1]+vz*W_[1]).astype(int)
        ok=(xi>=0)&(xi<N)&(zi>=0)&(zi<N)&(yi>=0)&(yi<N)
        xc=np.clip(xi,0,N-1); zc=np.clip(zi,0,N-1); yc=np.clip(yi,0,N-1)
        hit=ok&occ[yc,zc,xc]&(depth<-1e9)
        depth[hit]=vz; mid[hit]=mat[yc,zc,xc][hit]; pp[hit]=pid[yc,zc,xc][hit]; pos[hit]=np.stack([yc[hit],zc[hit],xc[hit]],1)
    def Rm(h,n): r=ps.ramp(h,n); return [tuple(int(q[i:i+2],16) for i in (1,3,5)) for q in r[::-1]]
    PAL={'steel':Rm('#7d889c',6),'blade':Rm('#a9b6cc',6),'mail':Rm('#565c6a',5),'leather':Rm('#5e3d26',5),'gold':Rm('#cf9b38',5),
         'field':Rm('#bf3a35',5),'trim':Rm('#e2d6b8',5),'stitch':Rm('#93302f',5),'stitch2':Rm('#b4a68a',5),'hole':Rm('#262230',5),
         'dark':Rm('#2c2830',5),'strap':Rm('#953a2b',5),'scab':Rm('#862d26',5),'azure':Rm('#24408c',5),'gules':Rm('#a3221f',5),'or':Rm('#cf9a2c',5),'wood':Rm('#6b4a2c',5),'smear':Rm('#c9d3e2',5),'ermine':Rm('#ece6da',5),'espot':Rm('#26222a',5),'cap':Rm('#a8282a',5)}
    L=np.array([-0.55,0.62,0.56]); L/=np.linalg.norm(L)
    H=np.array([L[0],L[1],L[2]+1]); H/=np.linalg.norm(H)
    RIM=np.array([0.85,0.15,-0.5]); RIM/=np.linalg.norm(RIM)
    def env(ry):
        if ry>0.22: return 0.58+0.42*min(1,(ry-0.22)/0.5)
        if ry>0.02: return 0.30+(ry-0.02)*1.2
        if ry>-0.14: return 0.08
        return 0.34
    TH={'metal':[0.93,0.70,0.50,0.33,0.20],'cloth':[0.74,0.50,0.30,0.16]}
    tone=np.full((N,N),-1,np.int32); rimm=np.zeros((N,N),bool)
    for y in range(N):
        for x in range(N):
            m=mid[y,x]
            if not m: continue
            py,pz,px=pos[y,x]
            nx,ny,nz=-gx[py,pz,px],-gy[py,pz,px],-gz[py,pz,px]
            nw=np.array([nx,ny,nz]); nv=np.array([nw@R_,nw@U_,nw@W_]); ln=np.linalg.norm(nv)
            n=nv/ln if ln>1e-6 else np.array([0,0,1.0])
            d=max(0,float(n@L)); ao=1-0.8*max(0,dens[py,pz,px]-0.30)
            name=MATS[m]
            if name in('steel','blade','gold'):
                ry=2*n[2]*n[1]
                val=(0.62*env(ry)+0.38*d)*ao+0.65*max(0,float(n@H))**60
                hsh=((int(px)*73856093)^(int(py)*19349663)^(int(pz)*83492791))%1000/1000.0
                val-=0.07*hsh*(1-d)*(0 if FLAT else 1)
                th_=TH['metal']
            else:
                val=(0.08+0.80*d)*ao; th_=TH['cloth']
                hsh=((int(px)*73856093)^(int(py)*19349663)^(int(pz)*83492791))%1000/1000.0
                val-=0.06*hsh*(0 if FLAT else 1)
                if name in('azure','gules','or') and pz/S<77.5 and 50<py/S<95 and ((px/S)%3.3)<0.55 and not FLAT: val*=0.78
            k=len(th_)
            for i,t_ in enumerate(th_):
                if val>t_: k=i; break
            q=max(1,int(round(S*1.33)))
            if name=='mail' and ((px//q+py//q+pz//q)%2==0): k=k+1
            if FLAT:
                if name in('steel','blade','gold'): k=0 if k==0 else (1 if k<=2 else 3)
                else: k=1 if k<=1 else 3
            k=min(k,len(PAL[name])-1)
            tone[y,x]=k
            if float(n@RIM)>0.55 and not FLAT: rimm[y,x]=True
    # clean orphan tone pixels inside one part
    t2=tone.copy()
    for y in range(1,N-1):
        for x in range(1,N-1):
            if tone[y,x]<0: continue
            p=pp[y,x]; nb=[(tone[y+dy,x+dx]) for dy,dx in ((0,1),(0,-1),(1,0),(-1,0)) if pp[y+dy,x+dx]==p and tone[y+dy,x+dx]>=0]
            if len(nb)>=3 and all(v!=tone[y,x] for v in nb):
                t2[y,x]=max(set(nb),key=nb.count)
    tone=t2
    out=np.zeros((N,N,4),np.uint8)
    alpha=mid>0
    # distance to silhouette (for rim light)
    edge2=np.zeros_like(alpha)
    for dy,dx in [(a_*k_,b_*k_) for a_,b_ in ((0,1),(0,-1),(1,0),(-1,0)) for k_ in range(1,int(1.4*S)+1)]:
        edge2|=~np.roll(np.roll(alpha,dy,0),dx,1)
    for y in range(N):
        for x in range(N):
            if not alpha[y,x]: continue
            name=MATS[mid[y,x]]; col=np.array(PAL[name][min(tone[y,x],len(PAL[name])-1)],float)
            if rimm[y,x] and edge2[y,x] and name not in('hole','dark'):
                col=col*0.55+np.array([255,226,180])*0.45
            out[y,x]=(*np.clip(col,0,255).astype(np.uint8),255)
    # inner contour lines between parts (the one behind gets the line)
    for dy,dx in ((0,1),(1,0),(0,-1),(-1,0)):
        nb_p=np.roll(np.roll(pp,-dy,0),-dx,1); nb_d=np.roll(np.roll(depth,-dy,0),-dx,1); nb_a=np.roll(np.roll(alpha,-dy,0),-dx,1)
        line=alpha&nb_a&(nb_p!=pp)&(nb_d>depth+0.6)
        out[line,:3]=(out[line,:3]*0.52).astype(np.uint8)
    if not outline: return Image.fromarray(out,'RGBA')
    # selective outer outline
    o=np.zeros_like(alpha); o[1:]|=alpha[:-1]; o[:-1]|=alpha[1:]; o[:,1:]|=alpha[:,:-1]; o[:,:-1]|=alpha[:,1:]; o&=~alpha
    res=out.copy()
    for y,x in zip(*np.nonzero(o)):
        for dy,dx in ((1,0),(0,1),(-1,0),(0,-1)):
            yy,xx=y+dy,x+dx
            if 0<=yy<N and 0<=xx<N and alpha[yy,xx]:
                b=out[yy,xx,:3].astype(float); f=0.48 if (dy>0 or dx>0) else 0.26
                res[y,x]=(int(b[0]*f),int(b[1]*f*0.95),min(255,int(b[2]*f*1.15)),255); break
    return Image.fromarray(res,'RGBA')
if __name__=='__main__':
    sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'vendor'))
    import forge_hibit as fh, time
    t0=time.time()
    raw=render(45,outline=False); raw.save('k3d6_raw_hi.png')
    arr=np.array(raw)
    ys,xs=np.nonzero(arr[...,3]>0); hb=ys.max()-ys.min()+1
    target=int(os.environ.get('KH','180'))
    idx,pal,info=fh.pixelize_rgba(arr,target,colors=int(os.environ.get('KC','32')),outline='auto')
    rgba=fh.render(idx,pal)
    im=Image.fromarray(rgba,'RGBA'); im.save('k3d6_px.png')
    bg=Image.new('RGBA',im.size,(86,118,70,255)); bg.alpha_composite(im)
    bg.resize((im.width*4,im.height*4),Image.NEAREST).save('k3d6_big.png')
    print('src h',hb,'out',im.size,'colours',info['colors'],'outline',info['outline'],'t',round(time.time()-t0,1))
