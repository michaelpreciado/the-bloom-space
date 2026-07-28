#!/usr/bin/env python3
"""
Cuts the gallery tiles out of the master storefront photograph.

assets/venue-exterior.jpg is the full-resolution photo of 316 S Bridge St.
Everything the gallery shows is a crop of it, so the gallery is real
photography of the real building rather than stock or generated stand-ins.

Each crop is framed on one thing — the awning, the window decal, the planter,
the services banner — and written at the aspect ratio its tile uses, so the
browser's object-fit has nothing left to throw away.

    python3 tools/make-venue-crops.py

Run this only if the master photo is replaced or the framing needs changing.
The outputs are committed; the site does not run this.
"""

import pathlib

from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
MASTER = ROOT / 'assets' / 'venue-exterior.jpg'
OUT = ROOT / 'assets'

# (left, top, right, bottom) as fractions of the master, then fitted to the
# target ratio about the box centre. Fractions rather than pixels so the
# framing survives the master being re-exported at another size.
CROPS = [
    # name,                 box,                            ratio, width
    ('venue-storefront',   (0.00, 0.00, 1.00, 0.94),        16 / 9, 1440),
    ('venue-entrance-wide',(0.36, 0.08, 0.86, 0.66),         4 / 3,  800),
    ('venue-windows',      (0.02, 0.30, 0.48, 0.76),         4 / 3,  800),
    ('venue-planter',      (0.06, 0.75, 0.35, 1.00),         4 / 3,  800),
    ('venue-banner',       (0.68, 0.06, 0.99, 0.34),         4 / 3,  800),
    ('venue-address',      (0.60, 0.28, 1.00, 0.74),         4 / 3,  800),
    ('venue-westwall',     (0.00, 0.16, 0.42, 0.80),         4 / 3,  800),
]


def fit(box, ratio, size):
    """Grow or shrink the box about its centre until it matches `ratio`,
    then slide it back inside the image if that pushed it over an edge."""
    w, h = size
    l, t, r, b = (box[0] * w, box[1] * h, box[2] * w, box[3] * h)
    cx, cy = (l + r) / 2, (t + b) / 2
    bw, bh = r - l, b - t

    if bw / bh < ratio:
        bw = bh * ratio          # too tall — widen
    else:
        bh = bw / ratio          # too wide — heighten

    bw, bh = min(bw, w), min(bh, h)
    bw = min(bw, bh * ratio)
    bh = bw / ratio

    l = min(max(cx - bw / 2, 0), w - bw)
    t = min(max(cy - bh / 2, 0), h - bh)
    return (round(l), round(t), round(l + bw), round(t + bh))


def main():
    master = Image.open(MASTER).convert('RGB')
    print(f'master {master.size[0]}x{master.size[1]}')

    for name, box, ratio, width in CROPS:
        crop = master.crop(fit(box, ratio, master.size))
        height = round(width / ratio)

        # Only ever a modest upscale — the tiles render around 350 CSS px, so
        # 800px covers a 2x screen. Anything more would be invented detail.
        crop = crop.resize((width, height), Image.LANCZOS)
        if crop.width > box[2] * master.width - box[0] * master.width:
            crop = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=3))

        path = OUT / f'{name}.jpg'
        crop.save(path, 'JPEG', quality=86, optimize=True, progressive=True)
        print(f'  {path.name:26s} {width}x{height}  {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
