import json, os, glob
from PIL import Image
OUT = 'king2_out'; Z = 2
GP = os.environ.get('KGROUND', '')
ground = Image.open(GP).convert('RGBA') if GP else Image.new('RGBA', (1280, 310), (112, 128, 86, 255))


def frames_of(lo, an):
    n = len(glob.glob(f'{OUT}/{lo}_{an}_SE_*_shadow.png'))
    return [(Image.open(f'{OUT}/{lo}_{an}_SE_{i}.png'), Image.open(f'{OUT}/{lo}_{an}_SE_{i}_shadow.png')) for i in range(n)]


def up(im): return im.resize((im.width * Z, im.height * Z), Image.NEAREST)


TIM = {'march': 110, 'jog': 80, 'idle': 170, 'advance': 120, 'block': 100, 'death': 120}
STRIKE = {'thrust', 'overcut', 'lowcut', 'bash', 'counter', 'chain'}


def gif(lo, order, name):
    x = 30.0; frames, durs = [], []
    for an, reps, dx in order:
        fr = frames_of(lo, an)
        for _ in range(reps):
            for i, (s, sh) in enumerate(fr):
                c = ground.copy(); S, SH = up(s), up(sh)
                px, py = int(x), ground.height - S.height - 6
                c.alpha_composite(SH, (px, py)); c.alpha_composite(S, (px, py))
                frames.append(c.convert('RGB'))
                if an in STRIKE:
                    durs.append(150 if i == 0 else 75)
                else:
                    durs.append(TIM.get(an, 100))
                x += dx
    durs[-1] = 1200
    frames[0].save(name, save_all=True, append_images=frames[1:], duration=durs, loop=0, optimize=True)


def sheet(lo, names, path):
    rows = []
    for an in names:
        fr = frames_of(lo, an)
        if not fr: continue
        w, h = fr[0][0].width, fr[0][0].height
        strip = Image.new('RGBA', (w * len(fr), h), (110, 128, 86, 255))
        for i, (s, sh) in enumerate(fr): strip.alpha_composite(sh, (i * w, 0)); strip.alpha_composite(s, (i * w, 0))
        rows.append(strip)
    W = max(r.width for r in rows); H = sum(r.height for r in rows)
    out = Image.new('RGBA', (W, H), (60, 70, 50, 255)); y = 0
    for r in rows: out.alpha_composite(r, (0, y)); y += r.height
    out.resize((out.width * Z, out.height * Z), Image.NEAREST).save(path)


if __name__ == '__main__':
    import sys
    lo = sys.argv[1]
    if lo == 'shield':
        gif('shield', [('march', 1, 4.5), ('jog', 2, 8.0), ('advance', 1, 2.5), ('idle', 1, 0), ('block', 1, 0), ('counter', 1, 0),
                       ('thrust', 1, 0), ('overcut', 1, 0), ('lowcut', 1, 0), ('bash', 1, 0), ('idle', 1, 0), ('death', 1, 0)], 'koenig_schild.gif')
        sheet('shield', ['idle', 'march', 'jog', 'advance', 'block', 'counter', 'thrust', 'overcut', 'lowcut', 'bash', 'death'], 'koenig_schild_alle.png')
    else:
        gif('long', [('march', 1, 4.5), ('jog', 2, 8.0), ('advance', 1, 2.5), ('idle', 1, 0), ('chain', 1, 0), ('block', 1, 0),
                     ('counter', 1, 0), ('overcut', 1, 0), ('thrust', 1, 0), ('idle', 1, 0), ('death', 1, 0)], 'koenig_langschwert.gif')
        sheet('long', ['idle', 'march', 'jog', 'advance', 'chain', 'block', 'counter', 'overcut', 'thrust', 'death'], 'koenig_langschwert_alle.png')
    print('ok')
