# Выравнивает картинки упражнений по визуальному весу, а не по рамке.
# Визуальный размер = среднее геометрическое корней залитой площади и площади габарита.
# Каждый рисунок масштабируется внутри кадра к медиане серии. Читает art/<имя>-cut.png, пишет proto/img/<имя>.webp
import sys
import numpy as np
from PIL import Image

names = sys.argv[1:] or ['bench', 'pulldown', 'chestpress', 'row', 'curl', 'crunch']

def visual(a):
    S = a.shape[0]
    ys, xs = np.where(a > 0.5)
    box = (xs.max() - xs.min()) / S * (ys.max() - ys.min()) / S
    return np.sqrt(np.sqrt(a.mean()) * np.sqrt(box))

imgs = {n: Image.open(f'art/{n}-cut.png').convert('RGBA') for n in names}
vis = {n: visual(np.asarray(im)[:, :, 3] / 255.0) for n, im in imgs.items()}
target = float(np.median(list(vis.values())))

for n, im in imgs.items():
    f = target / vis[n]
    S = im.width
    k = round(S * f)
    scaled = im.resize((k, k), Image.LANCZOS)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    out.alpha_composite(scaled.crop(((k - S) // 2, (k - S) // 2, (k - S) // 2 + S, (k - S) // 2 + S)) if k > S else scaled,
                        (0, 0) if k > S else ((S - k) // 2, (S - k) // 2))
    out.resize((256, 256), Image.LANCZOS).save(f'proto/img/{n}.webp', quality=92)
    print(f'{n:11s} vis={vis[n]:.3f} scale={f:.3f}')
