"""English king (c. 1340-1360) built only from code: 3D voxel body with joints (workshop only),
rendered as flat pixel sprites with a pose-true ground shadow. Animations: idle, march, jog,
block, counter, death. Direction SE first."""
import os, sys, math, json, time
os.environ.setdefault('KS', '1.4'); os.environ.setdefault('KOFF', '6'); os.environ.setdefault('FLAT', '1'); os.environ.setdefault('HS', '1.6')
sys.path.insert(0, '.'); sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vendor'))
import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing
import k3d6 as K
import forge_hibit as fh

S, N, C = K.S, K.N, K.C
WOFF = float(os.environ.get('KGRID', '128')) / 2 - 64
MI = K.MI
HS = float(os.environ.get('HS', '1.6'))
PHI = float(os.environ.get('PHI', '8'))
F = int(os.environ.get('KF', '3'))
OUT = os.environ.get('KOUT', 'king_out')
os.makedirs(OUT, exist_ok=True)

ar = (np.arange(N) / S).astype(np.float32)
GY = np.broadcast_to(ar.reshape(N, 1, 1), (N, N, N))
GZ = np.broadcast_to(ar.reshape(1, N, 1), (N, N, N))
GX = np.broadcast_to(ar.reshape(1, 1, N), (N, N, N))
Xg = Yg = Zg = None


def rot(lean=0.0, twist=0.0, roll=0.0):
    a, b, g = map(math.radians, (lean, twist, roll))
    Rx = np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])   # forward lean: +y -> +z
    Ry = np.array([[math.cos(b), 0, math.sin(b)], [0, 1, 0], [-math.sin(b), 0, math.cos(b)]])
    Rz = np.array([[math.cos(g), -math.sin(g), 0], [math.sin(g), math.cos(g), 0], [0, 0, 1]])
    return Ry @ Rx @ Rz


def set_space(xfs):
    """xfs: list of (R, pivot, t) applied model -> world in order. Grid gets model coordinates."""
    global Xg, Yg, Zg
    x, y, z = GX, GY, GZ
    for R, piv, t in reversed(xfs):          # invert last transform first
        px, py, pz = x - piv[0] - t[0], y - piv[1] - t[1], z - piv[2] - t[2]
        RT = R.T
        x = RT[0, 0] * px + RT[0, 1] * py + RT[0, 2] * pz + piv[0]
        y = RT[1, 0] * px + RT[1, 1] * py + RT[1, 2] * pz + piv[1]
        z = RT[2, 0] * px + RT[2, 1] * py + RT[2, 2] * pz + piv[2]
    Xg, Yg, Zg = (np.ascontiguousarray(v, dtype=np.float32) for v in (x, y, z))


def put(mask, m):
    K.PC[0] += 1
    K.occ[mask] = True; K.mat[mask] = MI[m]; K.pid[mask] = K.PC[0]


def V(*a): return np.array(a, np.float32)
def nrm(v): v = np.asarray(v, np.float32); return v / max(1e-6, float(np.linalg.norm(v)))


def ellipsoid(c, r, m):
    put(((Xg - c[0]) / r[0]) ** 2 + ((Yg - c[1]) / r[1]) ** 2 + ((Zg - c[2]) / r[2]) ** 2 <= 1, m)


def seg(A, B):
    A = np.array(A, np.float32); B = np.array(B, np.float32); d = B - A; L2 = max(float(d @ d), 1e-6)
    px, py, pz = Xg - A[0], Yg - A[1], Zg - A[2]
    t = np.clip((px * d[0] + py * d[1] + pz * d[2]) / L2, 0, 1)
    dx, dy, dz = px - t * d[0], py - t * d[1], pz - t * d[2]
    return t, np.sqrt(dx * dx + dy * dy + dz * dz)


def capsule(A, B, r0, r1, m):
    t, dist = seg(A, B); put(dist <= r0 + (r1 - r0) * t, m)


def band(A, B, t0, t1, rin, rout, m):
    t, dist = seg(A, B); put((t >= t0) & (t <= t1) & (dist >= rin) & (dist <= rout), m)


def loft(pts, m, cut=None):
    pts = sorted(pts, key=lambda p: p[0])
    ys = np.array([p[0] for p in pts], np.float32)
    col = lambda k, d: np.array([(p[k] if len(p) > k else d) for p in pts], np.float32)
    rx, rz, cx, cz = col(1, 1), col(2, 1), col(3, 64), col(4, 64)
    inside = (Yg >= ys[0]) & (Yg <= ys[-1])
    yv = Yg[inside]
    RX, RZ, CX, CZ = (np.interp(yv, ys, a) for a in (rx, rz, cx, cz))
    sub = ((Xg[inside] - CX) / RX) ** 2 + ((Zg[inside] - CZ) / RZ) ** 2 <= 1
    if cut is not None:
        sub &= cut(yv, Zg[inside], Xg[inside])
    mask = np.zeros(Xg.shape, bool); mask[inside] = sub
    put(mask, m)
    return mask


Lt, Ls = 24.0, 24.5


def leg(hip, a, b, sx, toe_lift=0.0):
    a = math.radians(a); b = math.radians(b)
    hip = np.array(hip, float)
    kn = hip + Lt * np.array([0, -math.cos(a), math.sin(a)])
    a2 = a - b
    an = kn + Ls * np.array([0, -math.cos(a2), math.sin(a2)])
    to = an + np.array([sx * 1.2, -5.6 + toe_lift, 11.5])
    return tuple(kn), tuple(an), tuple(to)


GUARD = dict(shR=(48.0, 90.0, 64.0), elR=(42.0, 75.0, 68.0), wrR=(52.0, 75.0, 76.0), swd=(0.05, 0.78, 0.62),
             shL=(80.0, 89.3, 64.0), elL=(85.0, 76.0, 72.0), wrL=(72.0, 77.5, 79.5))
REST = dict(GUARD, elR=(39.5, 76.0, 65.0), wrR=(49.5, 82.0, 73.5), swd=(-0.07, 0.85, -0.52))


def make(aL=0, bL=4, aR=0, bR=4, arms=None, base=None, lean=0, twist=0, ground=True, lift=0.0,
         root=None, sword=None, liftL=0.0, liftR=0.0, zpush=0.0):
    P = dict(base or REST)
    if arms: P.update(arms)
    hL = (72.0, 57.0, 64.0); hR = (56.0, 57.0, 64.0)
    kL, anL, tL = leg(hL, aL, bL, 1, liftL); kR, anR, tR = leg(hR, aR, bR, -1, liftR)
    P.update(hipL=hL, kneeL=kL, ankL=anL, toeL=tL, hipR=hR, kneeR=kR, ankR=anR, toeR=tR)
    P['lean'] = lean; P['twist'] = twist; P['sword'] = sword
    if root is not None:
        P['root'] = root
    else:
        dy = 8.0 - min(anL[1], anR[1]) if ground else 0.0
        P['root'] = (np.eye(3), V(64, 0, 64), V(0, dy + lift, zpush))
    return P


def build(P):
    K.occ[:] = False; K.mat[:] = 0; K.pid[:] = 0; K.PC[0] = 0
    ROOT = P['root']
    SH = (np.eye(3), V(0, 0, 0), V(WOFF, 0, WOFF))
    set_space([SH, ROOT])
    # ---------- legs (root space) ----------
    for side, sx in (('L', 1), ('R', -1)):
        hp, kn, an, to = V(*P['hip' + side]), V(*P['knee' + side]), V(*P['ank' + side]), V(*P['toe' + side])
        fwd = to - an; fwd[1] = 0; fwd = nrm(fwd)
        up_t = nrm(hp - kn); dn_s = nrm(an - kn)
        capsule(hp, kn + up_t * 2.0, 5.0, 4.2, 'mail')
        ellipsoid(kn + up_t * 2.6 + fwd * 0.6, (4.6, 1.4, 4.6), 'steel')
        ellipsoid(kn + fwd * 1.2, (4.4, 3.4, 4.5), 'steel')
        ellipsoid(kn + fwd * 3.6, (2.3, 2.8, 1.7), 'steel')
        ellipsoid(kn + dn_s * 2.8 + fwd * 0.6, (4.2, 1.3, 4.3), 'steel')
        wing = kn + V(sx * 4.4, 0.3, 0) + fwd * 0.4
        ellipsoid(wing, (1.1, 3.0, 2.7), 'steel'); ellipsoid(wing + V(sx * 0.8, 0, 0), (0.7, 0.7, 0.7), 'gold')
        mid = kn + (an - kn) * 0.42
        capsule(kn + dn_s * 3.6, mid, 3.5, 3.8, 'mail')
        ellipsoid(mid - fwd * 1.0, (3.7, 6.0, 4.0), 'mail')
        capsule(mid, an + nrm(kn - an) * 1.2, 3.6, 2.5, 'mail')
        capsule(kn + dn_s * 3.8 + fwd * 1.9, an + nrm(kn - an) * 3.0 + fwd * 1.6, 2.9, 2.2, 'steel')     # schynbald
        capsule(kn + dn_s * 4.2 + fwd * 4.0, an + nrm(kn - an) * 3.2 + fwd * 3.1, 0.8, 0.6, 'steel')
        ellipsoid(an + V(0, 0.4, 0), (2.9, 2.4, 3.1), 'mail')
        foot_d = nrm(to - an)
        ellipsoid(an - fwd * 2.6 + V(0, -3.2, 0), (2.6, 2.4, 2.8), 'mail')
        for k_ in range(6):
            t_ = k_ / 6.0
            c_ = an + (to - an) * (0.1 + 0.75 * t_) + V(0, 1.6 * (1 - t_), 0)
            ellipsoid(c_, (3.1 - 1.6 * t_, 2.6 - 1.3 * t_, 2.3), 'mail')
        capsule(an + (to - an) * 0.85, to + foot_d * 4.5, 1.4, 0.35, 'leather')
    # ---------- upper body (lean/twist about the pelvis) ----------
    piv = V(64, 57, 64)
    UP = (rot(P['lean'], P['twist']), piv, V(0, 0, 0))
    BODY = P.get('body', (np.eye(3), piv, V(0, 0, 0)))
    set_space([SH, ROOT, BODY, UP])
    def dag(y, Z2, X2):
        ang = np.arctan2(Z2 - 64, X2 - 64); return (y >= 46.0 + 2.4 * np.abs(np.sin(ang * 9)))
    loft([(52, 15.6, 11.2), (45.5, 16.0, 11.5)], 'mail', cut=dag)
    def hem(Z2): return 36.0 + 10.0 * np.clip((Z2 - 60.0) / 9.0, 0, 1)        # cyclas: long behind, short in front
    def cyc(y, Z2, X2): return y >= hem(Z2)
    jm = loft([(35, 18.6, 13.6), (46, 17.0, 12.0), (55, 15.0, 10.4), (62, 12.0, 8.6), (68, 11.0, 8.1, 64, 64.5), (76, 12.6, 9.4, 64, 65.6),
               (84, 13.7, 10.0, 64, 65.9), (90, 13.5, 9.3, 64, 64.9), (95, 10.2, 7.6)], 'gules', cut=cyc)
    yy, zz, xx = np.nonzero(jm)
    Xu = Xg[yy, zz, xx]; Yu = Yg[yy, zz, xx]; Zu = Zg[yy, zz, xx]
    m = lions(Xu - 64, 91.0 - Yu, 33.0, 1.2)
    m[Yu <= hem(Zu) + 1.3] = MI['or']                                      # gold border at the hem
    K.mat[yy, zz, xx] = m
    inner = ((Xg - 64) / 12.8) ** 2 + ((Zg - 64) / 9.0) ** 2
    belt = (Yg >= 55.5) & (Yg <= 59.5) & (inner >= 0.9) & (inner <= 1.45)
    put(belt, 'gold')
    ang = np.arctan2(Zg - 64, Xg - 64)
    K.mat[belt & ((np.floor(ang / 0.30).astype(int) % 2) == 1) & (inner > 1.2) & (np.abs(Yg - 57.5) < 1.1)] = MI['azure']
    capsule((64 - 11, 55, 64 + 6.5), (64 - 11.5, 41, 64 + 7.5), 1.3, 0.5, 'scab')
    capsule((64 - 11, 59, 64 + 6.3), (64 - 11, 55, 64 + 6.5), 0.9, 0.9, 'leather')
    ellipsoid((64 - 11, 59.8, 64 + 6.3), (1.3, 1.3, 1.3), 'gold')
    capsule((64 + 12.5, 56, 64 + 2), (64 + 19, 22, 64 - 9), 1.6, 1.2, 'scab')
    loft([(95, 8.6, 9.4, 64, 63.4), (91, 12.0, 9.8, 64, 64), (87.5, 14.6, 10.4, 64, 64.6)], 'mail')
    for side, sx in (('R', -1), ('L', 1)):
        sh, el, wr = V(*P['sh' + side]), V(*P['el' + side]), V(*P['wr' + side])
        ellipsoid(sh + V(sx * 0.8, 1.0, 0), (5.2, 4.6, 5.6), 'mail')
        capsule(sh + V(0, -2.5, 0), el, 3.3, 3.0, 'mail')
        ellipsoid(el, (3.7, 3.5, 3.8), 'steel')
        out = nrm(el - (sh + wr) / 2)
        ellipsoid(el + out * 3.3, (1.8, 2.3, 1.8), 'steel'); ellipsoid(el + out * 4.4, (0.8, 0.8, 0.8), 'gold')
        capsule(el, wr, 3.0, 2.4, 'steel')
        ellipsoid(wr + nrm(wr - el) * 1.0, (3.3, 2.8, 3.1), 'steel')
        ellipsoid(wr + nrm(wr - el) * 3.3, (2.7, 2.5, 2.5), 'steel')
    # sword in the hand (upper space) unless dropped
    LONG = P.get('loadout', 'shield') == 'long'
    if P.get('sword') is None:
        d = nrm(P['swd'])
        h = V(*P['grip']) if 'grip' in P else V(*P['wrR']) + nrm(V(*P['wrR']) - V(*P['elR'])) * 3.0
        for hs, ds in P.get('smear', []):
            sword_at(V(*hs), nrm(ds), LONG, 'smear', True)
        sword_at(h, d, LONG)
    # heater shield on the left forearm
    if not LONG:
      cen = V(*P['wrL']) + V(-1.0, -1.5, 4.5)
      sn = nrm(V(*P.get('shn', (-0.42, 0, 0.91)))); ua = nrm(np.cross(V(0, 1, 0), sn)); va = -np.cross(sn, ua)          # va points down: chief on top, point at the bottom
      px, py, pz = Xg - cen[0], Yg - cen[1], Zg - cen[2]
      us = px * ua[0] + py * ua[1] + pz * ua[2]; vs = px * va[0] + py * va[1] + pz * va[2]; ws = px * sn[0] + py * sn[1] + pz * sn[2]
      hw = np.where(vs <= 3, 12.0, 12.0 * np.sqrt(np.clip(1 - ((vs - 3) / 17.0) ** 2, 0, 1)))
      sm_ = (vs >= -11.0) & (vs <= 20.0) & (np.abs(us) <= hw) & (np.abs(ws + 0.035 * us ** 2) <= 1.3)
      put(sm_, 'gules')
      yy, zz, xx = np.nonzero(sm_)
      pu = us[yy, zz, xx]; pv = vs[yy, zz, xx]; pw = ws[yy, zz, xx] + 0.035 * pu ** 2
      m = lions(pu, pv + 11.0, 26.0, 1.1)
      hwp = hw[yy, zz, xx]
      m[pw < 0.45] = MI['wood']
      m[((np.abs(pu) >= hwp - 0.55) | (pv <= -10.5)) & (pw >= 0.45)] = MI['leather']
      K.mat[yy, zz, xx] = m
    # great helm, cap of maintenance, crowned lion crest, royal crown circlet
    loft([(92.5, 7.4, 8.4, 64, 64.0), (100, 7.8, 8.9, 64, 64.2), (108, 7.6, 8.6, 64, 64.0), (111.5, 6.6, 7.6, 64, 63.6),
          (114, 4.2, 4.8, 64, 63.4), (115.5, 1.2, 1.4, 64, 63.2)], 'steel')
    capsule((64, 93, 72.6), (64, 111, 71.6), 0.9, 0.7, 'steel')
    hel = (K.mat == MI['steel']) & (Yg >= 92) & (Yg <= 116) & (Zg >= 69.5)
    K.mat[hel & (np.abs(Yg - 104.2) <= 0.6) & (np.abs(Xg - 64) >= 1.0)] = MI['hole']
    br = hel & (Xg < 62.5) & (Xg > 57) & (Yg >= 95) & (Yg <= 101) & ((((Xg + Yg) % 1.6) < 0.6) & (((Xg - Yg) % 1.6) < 0.6))
    K.mat[br] = MI['hole']
    rr = ((Xg - 64) / 8.1) ** 2 + ((Zg - 64) / 9.2) ** 2
    put((Yg >= 102.8) & (Yg <= 103.9) & (rr <= 1.0) & (rr >= 0.78), 'gold')
    cr = ((Xg - 64) / 7.4) ** 2 + ((Zg - 63.6) / 8.4) ** 2
    put((Yg >= 110.0) & (Yg <= 112.0) & (cr <= 1.0) & (cr >= 0.72), 'gold')             # crown circlet
    for k_ in range(8):                                                                   # fleurons
        a_ = 2 * math.pi * k_ / 8
        ellipsoid((64 + 7.1 * math.cos(a_), 113.0, 63.6 + 8.0 * math.sin(a_)), (1.0, 1.4, 1.0), 'gold')
    # dropped sword lies on the ground in world space
    if P.get('sword') is not None:
        set_space([SH])
        pom, d = P['sword']
        sword_at(V(*pom) + nrm(V(*d)) * (10.4 if LONG else 7.2), nrm(V(*d)), LONG)


LIONB = np.array([[c == '#' for c in r] for r in ["#.....###", ".#....###", ".#######.", ".#.#..#.#", ".#.#..#.#"]])


def lions(u, v, H, s):
    """u: offset from the middle (negative = dexter, the bearer's right), v: down from the top of the field."""
    out = np.full(np.shape(u), MI['gules'], np.uint8)
    b = 0.95 * s
    for i in range(3):
        cy = H * (i + 0.5) / 3
        col = np.floor((u + 4.5 * b) / b).astype(int); rw = np.floor((v - (cy - 2.5 * b)) / b).astype(int)
        ok = (col >= 0) & (col < 9) & (rw >= 0) & (rw < 5)
        c2 = 8 - col                                                     # head toward dexter
        hit = np.zeros(np.shape(u), bool); hit[ok] = LIONB[rw[ok], np.clip(c2[ok], 0, 8)]
        out[hit] = MI['or']
    return out


def sword_at(h, d, long=False, bmat='blade', blade_only=False):
    cross_ax = nrm(np.cross(d, V(0, 0, 1))) if abs(d[2]) < 0.95 else nrm(np.cross(d, V(1, 0, 0)))
    gl, cl, Lb = (9.5, 10.0, 54.0) if long else (6.0, 8.5, 40.0)
    if not blade_only:
        capsule(h - d * gl, h + d * 2.0, 1.4, 1.4, 'leather'); ellipsoid(h - d * (gl + 1.2), (2.3, 2.3, 2.3), 'gold')
        capsule(h + d * 2.8 - cross_ax * cl, h + d * 2.8 + cross_ax * cl, 1.2, 1.2, 'gold')
    A = h + d * 3.4
    px, py, pz = Xg - A[0], Yg - A[1], Zg - A[2]
    tt = px * d[0] + py * d[1] + pz * d[2]; nrmax = np.cross(d, cross_ax)
    cw = px * cross_ax[0] + py * cross_ax[1] + pz * cross_ax[2]; cn = px * nrmax[0] + py * nrmax[1] + pz * nrmax[2]
    w = 2.2 - 1.7 * np.clip(tt / Lb, 0, 1)
    put((tt >= 0) & (tt <= Lb) & (np.abs(cw) <= w) & (np.abs(cn) <= 0.7 * (1 - np.abs(cw) / np.maximum(w, 0.1)) + 0.3), bmat)


# ---------------- animations ----------------
def gait(p, amp, flex, base_b=6):
    a = amp * math.sin(2 * math.pi * p)
    b = base_b + flex * max(0.0, math.cos(2 * math.pi * p)) ** 1.5
    return a, b


def anim_idle():
    out = []
    for i, br in enumerate([0, 0.35, 0.6, 0.35]):
        arms = {k: (v[0], v[1] + br, v[2]) for k, v in REST.items() if k in ('shR', 'elR', 'wrR', 'shL', 'elL', 'wrL')}
        out.append(make(2, 5, -2, 5, arms=arms, lean=0.5 * br))
    return out


def anim_march(n=8):
    out = []
    for i in range(n):
        p = i / n
        aL, bL = gait(p, 20, 38); aR, bR = gait(p + 0.5, 20, 38)
        sway = math.sin(2 * math.pi * p)
        arms = dict(wrL=(72.0 - 1.5 * sway, 77.5, 79.5 + 1.0 * sway), elL=(85.0, 76.0, 72.0 + 1.0 * sway))
        out.append(make(aL, bL, aR, bR, arms=arms, lean=3, twist=-4 * sway))
    return out


def anim_jog(n=8):
    out = []
    for i in range(n):
        p = i / n
        aL, bL = gait(p, 30, 70, 10); aR, bR = gait(p + 0.5, 30, 70, 10)
        sway = math.sin(2 * math.pi * p)
        flight = abs(math.sin(2 * math.pi * p)) < 0.4          # both feet off the ground near the passing phase
        arms = dict(elR=(41.0, 74.0, 66.0 - 3 * sway), wrR=(49.0, 72.0, 74.0 - 3 * sway), swd=(0.1, 0.45, 0.89),
                    elL=(85.0, 76.0, 72.0 + 3 * sway), wrL=(72.0, 78.0, 79.5 + 2.5 * sway))
        out.append(make(aL, bL, aR, bR, arms=arms, base=GUARD, lean=11, twist=-7 * sway, lift=1.6 if flight else 0.0))
    return out


def anim_block():
    keys = [  # (legs aL,bL,aR,bR), arms, lean, root push back z
        ((10, 12, -8, 10), dict(), 0, 0),
        ((12, 22, -10, 20), dict(elL=(83, 86, 72), wrL=(70, 90, 80), elR=(39, 80, 61), wrR=(47, 86, 66), swd=(0.05, 0.9, -0.42)), -2, 0),
        ((12, 26, -12, 24), dict(elL=(82, 89, 71), wrL=(69, 94, 79), elR=(38, 81, 60), wrR=(46, 87, 65), swd=(0.05, 0.9, -0.42)), -6, -1.5),
        ((12, 24, -12, 22), dict(elL=(83, 87, 72), wrL=(70, 92, 80), elR=(39, 80, 61), wrR=(47, 86, 66), swd=(0.05, 0.9, -0.42)), -3, -1.0),
        ((10, 14, -8, 12), dict(), 0, 0),
    ]
    out = []
    for (aL, bL, aR, bR), arms, lean, pz in keys:
        P = make(aL, bL, aR, bR, arms=arms, base=GUARD, lean=lean)
        R, piv, t = P['root']; P['root'] = (R, piv, t + V(0, 0, pz)); out.append(P)
    return out


def anim_counter():
    keys = [
        ((12, 24, -12, 22), dict(elL=(90, 84, 70), wrL=(84, 86, 80), shn=(0.35, 0, 0.94), elR=(36, 96, 60), wrR=(46, 103, 63), swd=(-0.2, 0.6, -0.78)), 0, 18),
        ((24, 30, -16, 14), dict(elL=(89, 82, 70), wrL=(83, 83, 79), shn=(0.3, 0, 0.95), elR=(37, 99, 62), wrR=(50, 106, 66), swd=(0.0, 0.35, -0.94)), 4, 10),
        ((28, 34, -20, 12), dict(elR=(44, 94, 72), wrR=(58, 96, 79), swd=(0.30, 0.55, 0.78)), 10, -10),
        ((30, 38, -22, 12), dict(elR=(47, 84, 74), wrR=(62, 82, 83), swd=(0.40, -0.20, 0.89)), 14, -24),
        ((30, 38, -22, 12), dict(elR=(48, 76, 72), wrR=(63, 70, 79), swd=(0.55, -0.70, 0.45)), 15, -30),
        ((20, 26, -14, 14), dict(elR=(44, 76, 70), wrR=(56, 74, 78), swd=(0.2, 0.5, 0.84)), 6, -12),
        ((10, 14, -8, 12), dict(), 0, 0),
    ]
    out = []
    for (aL, bL, aR, bR), arms, lean, tw in keys:
        P = make(aL, bL, aR, bR, arms=arms, base=GUARD, lean=lean, twist=tw)
        if 'shn' in arms: P['shn'] = arms['shn']
        out.append(P)
    return out


def anim_death():
    out = []
    out.append(make(-6, 14, 10, 8, base=GUARD, lean=-10, twist=12, zpush=-3,
                    arms=dict(elR=(38, 92, 58), wrR=(42, 102, 56), swd=(-0.2, 0.9, -0.38), elL=(86, 74, 68), wrL=(80, 66, 72))))
    out.append(make(-2, 30, 6, 28, base=GUARD, lean=-5, twist=6, zpush=-9,
                    arms=dict(elR=(40, 80, 60), wrR=(44, 70, 62), swd=(-0.1, -0.5, -0.86), elL=(86, 72, 68), wrL=(80, 62, 72))))
    dropped = ((36.0, 2.0, 62.0), (-0.45, -0.03, 0.89))
    out.append(make(6, 60, 6, 58, base=GUARD, lean=8, sword=dropped, zpush=-16,
                    arms=dict(elR=(42, 76, 62), wrR=(45, 64, 64), elL=(85, 72, 70), wrL=(79, 62, 74))))
    KZ = 36.0
    for topple, lean in [(0, 12), (22, 14), (50, 12), (74, 8), (84, 4)]:
        P = dict(GUARD); P.update(elR=(44, 74, 66), wrR=(47, 62, 70), elL=(84, 72, 70), wrL=(78, 62, 76))
        t = math.radians(topple)
        for side, x in (('L', 72.0), ('R', 56.0)):
            kn = (x, 4.0, KZ); an = (x + (0.5 if side == 'L' else -0.5), 3.4, KZ - 24.0)
            to = (an[0], 1.6, an[2] - 8.0)
            hip = (x, 4.0 + Lt * math.cos(t), KZ + Lt * math.sin(t))
            P.update({'hip' + side: hip, 'knee' + side: kn, 'ank' + side: an, 'toe' + side: to})
        P['lean'] = lean; P['twist'] = 0; P['sword'] = dropped
        P['root'] = (np.eye(3), V(64, 0, 64), V(0, 0, 0))
        pel = V(64, 4.0 + Lt * math.cos(t), KZ + Lt * math.sin(t))
        P['body'] = (rot(topple, 0), V(64, 57, 64), pel - V(64, 57, 64))
        out.append(P)
    return out


ANIMS = [('idle', anim_idle), ('march', anim_march), ('jog', anim_jog), ('block', anim_block),
         ('counter', anim_counter), ('death', anim_death)]
DIRS = {'S': 0, 'SE': 45, 'E': 90, 'NE': 135, 'N': 180, 'NW': -135, 'W': -90, 'SW': -45}


def shadow_mask(theta):
    """Project every occupied voxel along the sun onto the ground (y=0), then into the camera."""
    th = math.radians(theta); c, s_ = math.cos(th), math.sin(th)
    ph = math.radians(PHI); cp, sp = math.cos(ph), math.sin(ph); Yc = N * 0.42
    W_ = np.array([-s_ * cp, sp, c * cp]); U_ = np.array([s_ * sp, cp, -c * sp]); R_ = np.array([c, 0, s_])
    hvec = np.array([-s_, 0, c])                      # horizontal, toward the viewer
    Lv = np.array([-0.30, 0.93, -0.22])               # sun in view terms: upper left, a little behind
    Lw = Lv[0] * R_ + Lv[1] * np.array([0, 1, 0]) + Lv[2] * hvec
    sdir = -Lw / np.linalg.norm(Lw)
    yy, zz, xx = np.nonzero(K.occ)
    p = np.stack([xx, yy, zz], 1).astype(np.float32)   # grid index coords (x,y,z)
    tpar = p[:, 1] / -sdir[1]
    g = p + tpar[:, None] * sdir[None, :]
    g[:, 1] = 0.0
    O = np.array([C, Yc, C])
    q = g - O
    ux = q @ R_; vv = q @ U_
    OFF = float(os.environ.get('KOFF', '0')) * S
    colp = np.round(ux + C - 0.5).astype(int); rowp = np.round(N - 1 - (vv + Yc + OFF)).astype(int)
    ok = (colp >= 0) & (colp < N) & (rowp >= 0) & (rowp < N)
    m = np.zeros((N, N), bool); m[rowp[ok], colp[ok]] = True
    return binary_closing(m, iterations=2)


def downscale_mask(m, f):
    h, w = m.shape[0] // f, m.shape[1] // f
    b = m[:h * f, :w * f].reshape(h, f, w, f).mean(axis=(1, 3))
    return b >= 0.5


if __name__ == '__main__':
    dirs = os.environ.get('KDIRS', 'SE').split(',')
    t0 = time.time()
    raws = []
    for name, fn in ANIMS:
        for i, P in enumerate(fn()):
            build(P)
            bad = K.occ[:, :, :2].any() or K.occ[:, :, -2:].any() or K.occ[:, :2, :].any() or K.occ[:, -2:, :].any() or K.occ[-2:].any()
            for d in dirs:
                r = np.array(K.render(DIRS[d], outline=False, phi=PHI))
                sh = shadow_mask(DIRS[d])
                raws.append((name, i, d, r, sh))
            print(name, i, 'clipped' if bad else '', round(time.time() - t0), flush=True)
    sample = np.concatenate([r[..., :3][r[..., 3] >= 128] for _, _, _, r, _ in raws[::2]])
    pal = fh.kmeans_palette(sample, int(os.environ.get('KC', '22')), seed=1)
    pal2 = np.vstack([pal, np.array([fh.parse_hex('#1f1b16')], np.uint8)])
    meta = []
    for name, i, d, r, sh in raws:
        full = fh.index_rgba(r, pal)
        h = r.shape[0] // F
        small = fh.clean_isolated(fh.mode_downsample(full, h, h, len(pal), coverage=0.45), pal)
        small = np.pad(small, 1, constant_values=-1)
        ring = fh.outline_ring(small); small = np.where(ring, len(pal), small)
        Image.fromarray(fh.render(small, pal2), 'RGBA').save(f'{OUT}/{name}_{d}_{i}.png')
        shs = np.pad(downscale_mask(sh, F), 1)
        sa = np.zeros(shs.shape + (4,), np.uint8); sa[shs] = (24, 30, 14, 96)
        Image.fromarray(sa, 'RGBA').save(f'{OUT}/{name}_{d}_{i}_shadow.png')
        meta.append([name, d, i])
    json.dump(dict(palette=[fh.hex_of(c) for c in pal2], frames=meta, phi=PHI, cell=(N // F) + 2,
                   shadow_rgba=[24, 30, 14, 96]), open(f'{OUT}/meta.json', 'w'))
    print('done', round(time.time() - t0))
