"""King animation sets after the KCD2 references: sword-and-shield and longsword.
Poses are authored as body + weapon keys (grip, blade direction, shield wrist); arms follow by two-bone IK."""
import os, sys, math, json, time
os.environ.setdefault('KGRID', '160'); os.environ.setdefault('KS', '1.4')
sys.path.insert(0, '.')
import numpy as np
from PIL import Image
import king as KG
from king import V, nrm, make, Lt
import forge_hibit as fh

SHR = np.array([48.0, 90.0, 64.0]); SHL = np.array([80.0, 89.3, 64.0])
L1, L2 = 15.5, 14.5


def ik(S, H, pole):
    S = np.array(S, float); H = np.array(H, float); d = H - S; dist = np.linalg.norm(d)
    dist = min(dist, L1 + L2 - 0.05); u = d / max(np.linalg.norm(d), 1e-6)
    a = (L1 ** 2 - L2 ** 2 + dist ** 2) / (2 * dist); h = math.sqrt(max(L1 ** 2 - a ** 2, 0))
    p = np.array(pole, float); p = p - (p @ u) * u; p = p / max(np.linalg.norm(p), 1e-6)
    el = S + u * a + p * h; wr = S + u * dist
    return tuple(el), tuple(wr)


def arms_for(key, loadout):
    g = np.array(key['g'], float); d = nrm(key['d'])
    out = dict(grip=tuple(g), swd=tuple(d))
    wrist_r = g - d * 0.5 + nrm(SHR - g) * 2.6
    out['elR'], out['wrR'] = ik(SHR, wrist_r, key.get('poleR', (-1, -0.7, -0.2)))
    if loadout == 'long':
        gl = g - d * 5.0
        wrist_l = gl + nrm(SHL - gl) * 2.6
        out['elL'], out['wrL'] = ik(SHL, wrist_l, key.get('poleL', (1, -0.7, -0.2)))
    else:
        out['elL'], out['wrL'] = ik(SHL, key['wL'], key.get('poleL', (1, -0.4, 0.2)))
        out['shn'] = tuple(nrm(key.get('shn', (-0.2, 0, 1))))
    out['shR'] = tuple(SHR); out['shL'] = tuple(SHL)
    return out


PIV = np.array([64.0, 88.0, 64.0])


def slerp(u, v, t):
    u = nrm(u); v = nrm(v); dot = float(np.clip(u @ v, -1, 1)); om = math.acos(dot)
    if om < 1e-4: return u
    return (math.sin((1 - t) * om) * u + math.sin(t * om) * v) / math.sin(om)


def lerp_key(a, b, t):
    out = {}
    if 'g' in a and 'g' in b:            # the hilt travels on an arc around the shoulders, the blade turns (no straight-line swings)
        ra, rb = np.array(a['g'], float) - PIV, np.array(b['g'], float) - PIV
        la, lb = np.linalg.norm(ra), np.linalg.norm(rb)
        out['g'] = tuple(PIV + slerp(ra, rb, t) * (la + (lb - la) * t))
        out['d'] = tuple(slerp(np.array(a['d'], float), np.array(b['d'], float), t))
    for k in a:
        if k in ('g', 'd') and 'g' in out: continue
        if k in ('fL', 'fR') and k in b:                 # a stepping foot lifts on its way
            pa, pb = np.array(a[k], float), np.array(b[k], float)
            p = pa + (pb - pa) * t
            if np.linalg.norm((pb - pa)[[0, 2]]) > 2.0: p[1] += 4.5 * math.sin(math.pi * t)
            out[k] = tuple(p); continue
        if k in ('wL', 'shn') and k in b:                # the shield follows a little later (overlap)
            tl = max(0.0, min(1.0, (t - 0.2) / 0.8))
            out[k] = tuple(np.array(a[k], float) + (np.array(b[k], float) - np.array(a[k], float)) * tl); continue
        if k not in b: out[k] = a[k]; continue
        va, vb = a[k], b[k]
        if isinstance(va, (int, float)): out[k] = va + (vb - va) * t
        else: out[k] = tuple(np.array(va, float) + (np.array(vb, float) - np.array(va, float)) * t)
    return out


def ease(t): return t * t * (3 - 2 * t)


def seq(keys, counts, loadout, fast=()):
    """keys: key dicts; counts: frames from key i to key i+1. Segments in `fast` are the cut itself:
    linear timing (no easing) and a smear of the blade between the previous and the current frame."""
    frames, smear = [], []
    for i, n in enumerate(counts):
        for j in range(n):
            if i in fast:
                t = (j + 1) / n if j + 1 < n else 1.0
                t = min(t, 0.999) if j + 1 == n else t
                t = j / n + 1.0 / n * 0.85
            else:
                t = ease(j / n)
            frames.append(lerp_key(keys[i], keys[i + 1], t)); smear.append(i in fast)
    frames.append(keys[-1]); smear.append(False)
    out = []
    for f, (k, sm) in enumerate(zip(frames, smear)):
        P = pose_from(k, loadout)
        if sm and f > 0:
            prev = frames[f - 1]; trail = []
            for tt in (0.3, 0.6, 0.85):
                m = lerp_key(prev, k, tt); trail.append((m['g'], m['d']))
            P['smear'] = trail
        out.append(P)
    return out


def leg_ik(hip, ank, toedir):
    hip = np.array(hip, float); ank = np.array(ank, float)
    d = ank - hip; dist = min(np.linalg.norm(d), Lt + KG.Ls - 0.05); u = d / max(np.linalg.norm(d), 1e-6)
    a = (Lt ** 2 - KG.Ls ** 2 + dist ** 2) / (2 * dist); h = math.sqrt(max(Lt ** 2 - a ** 2, 0))
    pole = np.array([0.08 * np.sign(hip[0] - 64), 0.0, 1.0]); pole = pole - (pole @ u) * u; pole /= max(np.linalg.norm(pole), 1e-6)
    kn = hip + u * a + pole * h; an = hip + u * dist
    td = nrm(toedir); to = an + np.array([td[0] * 11.5, -5.6, td[2] * 11.5])
    return tuple(kn), tuple(an), tuple(to)


def pose_from(k, loadout):
    arms = arms_for(k, loadout)
    P = make(k.get('aL', 0), k.get('bL', 4), k.get('aR', 0), k.get('bR', 4), arms=arms, base=arms, lean=k.get('lean', 0), twist=k.get('tw', 0),
             zpush=k.get('z', 0))
    if 'fL' in k:                                        # planted feet: legs by IK, the pelvis carries the weight
        pel = np.array(k.get('pel', (0, -2, 0)), float)
        for side, hx, f, td in (('L', 72.0, k['fL'], k.get('tL', (0.25, 0, 1))), ('R', 56.0, k['fR'], k.get('tR', (-0.5, 0, 0.85)))):
            hip = np.array([hx, 57.0, 64.0]) + pel
            kn, an, to = leg_ik(hip, f, td)
            P.update({'hip' + side: tuple(hip), 'knee' + side: kn, 'ank' + side: an, 'toe' + side: to})
        P['root'] = (np.eye(3), V(64, 0, 64), V(0, 0, 0))
        P['body'] = (np.eye(3), V(64, 57, 64), V(*pel))
    P['loadout'] = loadout
    if 'shn' in arms: P['shn'] = arms['shn']
    return P


def K_(**kw):
    base = dict(aL=12, bL=16, aR=-10, bR=14, lean=4, tw=0, z=0)
    base.update(kw); return base


# ---------------- sword and shield (KCD2: low guard behind a raised shield) ----------------
GUARDF = dict(fL=(73, 8, 72), fR=(54, 8, 56), pel=(0.5, -4.5, 0.5))
LUNGEF = dict(fL=(74, 8, 84), fR=(54, 8, 56), pel=(1.0, -7.5, 8.0))
BACKF = dict(fL=(73, 8, 72), fR=(54, 8, 56), pel=(-1.0, -3.5, -3.0))
CROUCHF = dict(fL=(73, 8, 72), fR=(54, 8, 56), pel=(0.0, -8.0, -1.0))
SG = K_(g=(55, 70, 74), d=(0.12, 0.30, 0.95), wL=(70, 85, 81), shn=(-0.15, 0.05, 1), tw=-8, **GUARDF)


def shield_sets():
    sets = {}
    # idle in guard, breathing
    sets['idle'] = [pose_from(K_(**{**SG, 'g': (55, 70 + b, 74), 'wL': (70, 85 + b, 81), 'lean': 4 + b}), 'shield') for b in (0, 0.4, 0.7, 0.4)]
    # block: shield punched up and forward, crouch, recoil
    BL1 = K_(**{**SG, **CROUCHF, 'wL': (68, 95, 84), 'shn': (-0.1, -0.25, 1), 'bL': 26, 'bR': 24, 'lean': 2, 'g': (54, 76, 70)})
    BL2 = K_(**{**BL1, 'lean': -4, 'pel': (-0.5, -8.0, -3.0), 'wL': (68, 97, 82)})
    sets['block'] = seq([SG, BL1, BL2, BL1, SG], [2, 1, 1, 2], 'shield')
    # counter: thrust from behind the shield with a lunge, then the cut over the shield (chain)
    T1 = K_(**{**SG, **BACKF, 'g': (52, 72, 66), 'd': (0.08, 0.25, 0.97), 'tw': 10, 'lean': 2})                       # draw back
    T2 = K_(**LUNGEF, aL=28, bL=30, aR=-18, bR=10, g=(60, 80, 96), d=(0.0, 0.05, 1.0), wL=(76, 84, 82), shn=(0.3, 0, 1), tw=-22, lean=14, z=3)   # thrust
    O1 = K_(**BACKF, aL=18, bL=20, aR=-14, bR=12, g=(50, 106, 64), d=(-0.05, 0.55, -0.83), wL=(70, 88, 83), shn=(-0.1, 0, 1), tw=12, lean=2, z=2)  # wind over head
    O2 = K_(**LUNGEF, aL=26, bL=30, aR=-18, bR=10, g=(60, 98, 86), d=(0.05, 0.25, 0.97), wL=(70, 84, 84), tw=-10, lean=12, z=3)    # cut over the shield
    O3 = K_(**LUNGEF, aL=26, bL=32, aR=-18, bR=10, g=(64, 78, 88), d=(0.15, -0.55, 0.82), wL=(72, 82, 83), tw=-24, lean=16, z=3)   # through
    sets['counter'] = seq([SG, T1, T2, O1, O2, O3, SG], [1, 2, 2, 1, 1, 2], 'shield', fast=(1, 4))
    # single attacks for variety
    sets['thrust'] = seq([SG, T1, T2, SG], [2, 2, 2], 'shield', fast=(1,))
    sets['overcut'] = seq([SG, O1, O2, O3, SG], [2, 1, 2, 2], 'shield', fast=(1, 2))
    L1_ = K_(**BACKF, aL=16, bL=24, aR=-12, bR=16, g=(50, 66, 60), d=(-0.1, -0.35, -0.93), wL=(70, 86, 82), tw=14, lean=4)          # wind low behind
    L2_ = K_(**LUNGEF, aL=26, bL=34, aR=-18, bR=10, g=(60, 60, 90), d=(0.15, -0.05, 0.99), wL=(71, 90, 82), shn=(-0.1, -0.2, 1), tw=-16, lean=16, z=3)  # low cut under the shield
    L3_ = K_(**LUNGEF, aL=26, bL=34, aR=-18, bR=10, g=(66, 74, 86), d=(0.45, 0.45, 0.77), wL=(71, 88, 82), tw=-26, lean=12, z=3)
    sets['lowcut'] = seq([SG, L1_, L2_, L3_, SG], [2, 1, 2, 2], 'shield', fast=(1, 2))
    B1 = K_(**{**SG, 'wL': (72, 84, 74), 'tw': 14, 'lean': 0})                                                              # load the shield
    B2 = K_(**LUNGEF, aL=28, bL=30, aR=-18, bR=8, g=(52, 72, 70), d=(0.1, 0.4, 0.91), wL=(68, 84, 96), shn=(-0.1, 0, 1), tw=-12, lean=14, z=4)    # bash
    sets['bash'] = seq([SG, B1, B2, SG], [2, 1, 3], 'shield', fast=(1,))
    return sets


# ---------------- longsword (KCD2: Pflug guard, vom Tag, Oberhau, Unterhau, Stich) ----------------
PF = K_(**GUARDF, aL=14, bL=18, aR=-12, bR=14, g=(58, 68, 82), d=(0.05, 0.42, 0.91), tw=-6, lean=4)                       # Pflug
TAG = K_(**BACKF, aL=14, bL=16, aR=-12, bR=14, g=(54, 100, 66), d=(-0.12, 0.90, -0.42), tw=14, lean=0)                   # vom Tag
OB1 = K_(**GUARDF, aL=24, bL=26, aR=-16, bR=10, g=(60, 98, 82), d=(0.30, 0.55, 0.78), tw=-4, lean=8, z=2)
OB2 = K_(**LUNGEF, aL=30, bL=32, aR=-18, bR=8, g=(66, 80, 92), d=(0.35, -0.10, 0.93), tw=-20, lean=14, z=4)
OB3 = K_(**LUNGEF, aL=30, bL=34, aR=-18, bR=8, g=(70, 66, 84), d=(0.50, -0.70, 0.50), tw=-30, lean=16, z=4)              # Alber, low left
UN1 = K_(**LUNGEF, aL=28, bL=32, aR=-18, bR=10, g=(68, 66, 84), d=(0.45, -0.75, 0.48), tw=-28, lean=14, z=4)
UN2 = K_(**LUNGEF, aL=24, bL=26, aR=-16, bR=10, g=(60, 80, 92), d=(-0.20, 0.40, 0.89), tw=0, lean=8, z=3)               # rising cut
UN3 = K_(**GUARDF, aL=18, bL=20, aR=-14, bR=12, g=(54, 96, 76), d=(-0.35, 0.85, 0.40), tw=14, lean=2, z=2)
ST1 = K_(**BACKF, aL=16, bL=20, aR=-12, bR=14, g=(56, 82, 74), d=(0.0, 0.10, 0.99), tw=6, lean=4, z=0)                   # Ochs/draw for the thrust
ST2 = K_(**LUNGEF, aL=32, bL=34, aR=-20, bR=8, g=(62, 82, 98), d=(0.02, 0.02, 1.0), tw=-14, lean=16, z=4)                # Stich, lunge
BLK1 = K_(**CROUCHF, aL=12, bL=22, aR=-12, bR=20, g=(56, 102, 76), d=(0.85, 0.15, 0.50), poleL=(1, -0.3, 0.3), tw=-4, lean=-2)   # Krone: hilt high, blade across
BLK2 = K_(**{**BLK1, 'lean': -6, 'pel': (-0.5, -8.0, -3.0), 'g': (56, 100, 74)})
ZW1 = K_(**BACKF, aL=20, bL=24, aR=-14, bR=12, g=(50, 100, 72), d=(-0.95, 0.10, 0.30), tw=24, lean=4, z=2)                # Zwerch wind (crosswise, thumb under)
ZW2 = K_(**LUNGEF, aL=28, bL=30, aR=-18, bR=8, g=(64, 98, 88), d=(0.97, 0.05, 0.25), tw=-24, lean=10, z=4)                 # Zwerchhau through


def long_sets():
    sets = {}
    sets['idle'] = [pose_from(K_(**{**PF, 'g': (58, 68 + b, 82), 'lean': 4 + b}), 'long') for b in (0, 0.4, 0.7, 0.4)]
    sets['chain'] = seq([PF, TAG, OB1, OB2, OB3, UN2, UN3, ST1, ST2, PF], [2, 1, 1, 1, 2, 1, 1, 1, 2], 'long', fast=(2, 3, 4, 5, 7))   # Oberhau, Unterhau, Stich
    sets['block'] = seq([PF, BLK1, BLK2, BLK1, PF], [2, 1, 1, 2], 'long')
    sets['counter'] = seq([BLK1, ZW1, ZW2, PF], [1, 2, 2], 'long', fast=(1,))
    sets['overcut'] = seq([PF, TAG, OB1, OB2, OB3, PF], [2, 1, 1, 2, 2], 'long', fast=(2, 3))
    sets['thrust'] = seq([PF, ST1, ST2, PF], [2, 2, 2], 'long', fast=(1,))
    return sets


def loco(loadout):
    """march and jog for both loadouts; the longsword is carried on the right shoulder."""
    sets = {}
    for name, n, amp, flex, lean, tw, liftk in (('march', 8, 20, 38, 3, 4, 0), ('jog', 8, 30, 70, 11, 7, 1)):
        fr = []
        for i in range(n):
            p = i / n
            aL, bL = KG.gait(p, amp, flex, 6 if name == 'march' else 10); aR, bR = KG.gait(p + 0.5, amp, flex, 6 if name == 'march' else 10)
            sway = math.sin(2 * math.pi * p)
            if loadout == 'shield':
                k = K_(aL=aL, bL=bL, aR=aR, bR=bR, g=(52, 72 if name == 'jog' else 82, 74), d=(0.1, 0.45, 0.89) if name == 'jog' else (-0.07, 0.85, -0.52),
                       wL=(71 + 1.5 * sway, 80, 80 + 2 * sway), shn=(-0.25, 0, 1), lean=lean, tw=-tw * sway)
            else:
                k = K_(aL=aL, bL=bL, aR=aR, bR=bR, g=(50, 84, 70), d=(-0.05, 0.80, -0.60), lean=lean, tw=-tw * sway)
            P = pose_from(k, loadout)
            if loadout == 'long':            # left arm swings free
                el, wr = ik(SHL, (79 + 1.0 * sway, 66, 66 + 6 * sway), (1, -0.3, -0.6)); P['elL'], P['wrL'] = el, wr
            if name == 'jog' and abs(math.sin(2 * math.pi * p)) < 0.4:
                R, piv, t = P['root']; P['root'] = (R, piv, t + V(0, 1.6, 0))
            fr.append(P)
        sets[name] = fr
    return sets


def advance(loadout):
    """short guarded steps toward the enemy"""
    fr = []
    G = SG if loadout == 'shield' else PF
    for i in range(6):
        p = i / 6
        aL, bL = KG.gait(p, 12, 22, 16); aR, bR = KG.gait(p + 0.5, 12, 22, 14)
        k = {kk: vv for kk, vv in G.items() if kk not in ('fL', 'fR', 'pel')}; k.update(aL=aL + 8, bL=bL, aR=aR - 6, bR=bR, lean=G['lean'] + 1.5 * abs(math.sin(2 * math.pi * p)))
        fr.append(pose_from(k, loadout))
    return fr


def death(loadout):
    fr = KG.anim_death()
    for P in fr:
        P['loadout'] = loadout
        if loadout == 'long':
            P['sword'] = ((32.0, 2.0, 58.0), (-0.3, -0.02, 0.95)) if P.get('sword') is not None else None
    if loadout == 'long':      # in the first two frames the hands still hold the hilt
        for P in fr[:2]:
            P['grip'] = tuple(np.array(P['wrR']) + nrm(np.array(P['wrR']) - np.array(P['elR'])) * 3.0)
    return fr


if __name__ == '__main__':
    OUT = os.environ.get('KOUT', 'king2_out'); os.makedirs(OUT, exist_ok=True)
    only = os.environ.get('KONLY', '')
    jobs = []
    for lo in os.environ.get('KLO', 'shield,long').split(','):
        sets = {}
        sets.update(loco(lo))
        sets.update(shield_sets() if lo == 'shield' else long_sets())
        sets['advance'] = advance(lo)
        sets['death'] = death(lo)
        for name, frames in sets.items():
            if only and name not in only.split(','): continue
            for i, P in enumerate(frames): jobs.append((lo, name, i, P))
    t0 = time.time(); raws = []
    for lo, name, i, P in jobs:
        KG.build(P)
        r = np.array(KG.K.render(45, outline=False, phi=KG.PHI)); sh = KG.shadow_mask(45)
        raws.append((lo, name, i, r, sh)); print(lo, name, i, round(time.time() - t0), flush=True)
    sample = np.concatenate([r[..., :3][r[..., 3] >= 128] for *_, r, _ in raws[::2]])
    pal = fh.kmeans_palette(sample, int(os.environ.get('KC', '24')), seed=1)
    pal2 = np.vstack([pal, np.array([fh.parse_hex('#1f1b16')], np.uint8)])
    F = KG.F; meta = []
    for lo, name, i, r, sh in raws:
        full = fh.index_rgba(r, pal); h = r.shape[0] // F
        small = fh.clean_isolated(fh.mode_downsample(full, h, h, len(pal), coverage=0.45), pal)
        small = np.pad(small, 1, constant_values=-1); small = np.where(fh.outline_ring(small), len(pal), small)
        Image.fromarray(fh.render(small, pal2), 'RGBA').save(f'{OUT}/{lo}_{name}_SE_{i}.png')
        shs = np.pad(KG.downscale_mask(sh, F), 1); sa = np.zeros(shs.shape + (4,), np.uint8); sa[shs] = (24, 30, 14, 96)
        Image.fromarray(sa, 'RGBA').save(f'{OUT}/{lo}_{name}_SE_{i}_shadow.png')
        meta.append([lo, name, 'SE', i])
    json.dump(dict(palette=[fh.hex_of(c) for c in pal2], frames=meta), open(f"{OUT}/meta_{os.environ.get('KLO','all')}.json", 'w'))
    print('done', round(time.time() - t0))
