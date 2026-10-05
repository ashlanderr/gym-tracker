# Готовит картинку от Nano Banana: квадратный кадр с зазором 6% по содержимому и прозрачный фон.
# python art/prep.py <исходник.png> <имя>  ->  art/<имя>.png, art/<имя>-cut.png, proto/img/<имя>.webp
import sys
import numpy as np
from PIL import Image

src, name = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.int32)

# иногда модель обводит картинку светлой рамкой: обрезаем по границе тёмного фона
inner = a[a.shape[0] // 10, a.shape[1] // 10]
if a[0, 0].sum() - inner.sum() > 200:
    dark = np.sqrt(((a - inner) ** 2).sum(axis=2)) < 40
    rows, cols = np.where(dark.mean(axis=1) > 0.5)[0], np.where(dark.mean(axis=0) > 0.5)[0]
    im = im.crop((cols.min() + 6, rows.min() + 6, cols.max() - 5, rows.max() - 5))
    a = np.asarray(im).astype(np.int32)
    print('frame trimmed', im.size)
bg = np.median(np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3)]), axis=0)
d = np.sqrt(((a - bg) ** 2).sum(axis=2))

ys, xs = np.where(d > 28)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
side = max(x1 - x0, y1 - y0)
S = round(side * 1.12)
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
L, T = round(cx - S / 2), round(cy - S / 2)
canvas = Image.new('RGB', (S, S), tuple(int(v) for v in bg))
canvas.paste(im.crop((max(L, 0), max(T, 0), min(L + S, im.width), min(T + S, im.height))), (max(-L, 0), max(-T, 0)))

c = np.asarray(canvas).astype(np.int32)
dist = np.sqrt(((c - bg) ** 2).sum(axis=2))
alpha = np.clip((dist - 10) * 14, 0, 255).astype(np.uint8)
cut = Image.fromarray(np.dstack([c.astype(np.uint8), alpha]), 'RGBA')

im.save(f'art/{name}.png')
cut.save(f'art/{name}-cut.png')
cut.resize((256, 256), Image.LANCZOS).save(f'proto/img/{name}.webp', quality=92)
print('bg', bg, 'bbox', (x0, y0, x1, y1), 'square', S)
