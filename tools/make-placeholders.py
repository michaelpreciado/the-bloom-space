#!/usr/bin/env python3
"""
Generates the placeholder photography in assets/placeholders/.

These are ATMOSPHERIC PLACEHOLDERS, not photographs of the venue. They read as
styling detail shots — florals, linen, candlelight, a balloon arch — because
that is what can be produced convincingly without a camera. Deliberately no
attempt at rooms or architecture: procedural interiors look like diagrams, not
photographs. Every one is replaced by a real photo of 316 S Bridge St before
launch — see RC_NOTES.md.

They are generated rather than sourced so the build has no dependency on a
remote image host, and so the palette matches the brand exactly: the blush,
sage, cream and gold from data/rates.js and the logo.

    python3 tools/make-placeholders.py
"""

import math
import pathlib

import numpy as np
from PIL import Image, ImageFilter

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'placeholders'
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1200, 900
AR = W / H

# Brand palette, sampled from the wordmark (see data/rates.js commentary).
CREAM   = (250, 245, 238)
IVORY   = (243, 236, 225)
WARM    = (255, 250, 240)
BLUSH   = (238, 205, 196)
ROSE    = (214, 156, 150)
DROSE   = (186, 122, 118)
SAGE    = (143, 156, 136)
SAGED   = (93, 111, 97)
SAGEL   = (196, 208, 190)
GOLD    = (213, 160, 68)
GOLDL   = (233, 200, 138)
WOOD    = (188, 160, 128)
WOODD   = (150, 120, 92)
CHAR    = (44, 49, 48)


def canvas(top, bottom):
    """Vertical gradient base."""
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    return np.array(top, np.float32) * (1 - yy) + np.array(bottom, np.float32) * yy


def blob(img, col, cx, cy, sx, sy, rot=0.0, alpha=0.6):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    dx, dy = (x / W - cx) * AR, (y / H - cy)
    c, s = math.cos(rot), math.sin(rot)
    u, v = dx * c + dy * s, -dx * s + dy * c
    a = (np.exp(-((u / sx) ** 2 + (v / sy) ** 2) / 2) * alpha)[..., None]
    return img * (1 - a) + np.array(col, np.float32) * a


def band(img, col, centre, width, angle=0.0, alpha=0.5):
    """Soft diagonal light shaft."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    xn, yn = x / W, y / H
    proj = xn * math.cos(angle) + yn * math.sin(angle)
    a = (np.exp(-((proj - centre) ** 2) / (2 * width * width)) * alpha)[..., None]
    return img * (1 - a) + np.array(col, np.float32) * a


def rect(img, col, cx, cy, w, h, alpha=0.6, soft=0.02):
    """Soft-edged rectangle. Windows and furniture need edges a blob can't give."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    xn, yn = x / W, y / H
    fx = np.clip((w / 2 - np.abs(xn - cx)) / soft, 0, 1)
    fy = np.clip((h / 2 - np.abs(yn - cy)) / soft, 0, 1)
    a = (fx * fy * alpha)[..., None]
    return img * (1 - a) + np.array(col, np.float32) * a


def floor(img, horizon, col_near, col_far):
    """Perspective floor below a horizon line."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    yn = y / H
    mask = np.clip((yn - horizon) / (1 - horizon), 0, 1)
    mask = np.clip(mask * 6, 0, 1) * mask ** 0.25   # feather the join
    depth = mask ** 0.6
    grad = (np.array(col_far, np.float32) * (1 - depth[..., None])
            + np.array(col_near, np.float32) * depth[..., None])
    a = (mask > 0).astype(np.float32)[..., None]
    return img * (1 - a) + grad * a


def bokeh(img, cols, n, seed, rmin=0.02, rmax=0.07, alpha=0.5, band_y=(0.0, 1.0)):
    rng = np.random.RandomState(seed)
    for i in range(n):
        col = cols[i % len(cols)]
        cx = rng.uniform(-0.05, 1.05)
        cy = rng.uniform(*band_y)
        r = rng.uniform(rmin, rmax)
        img = blob(img, col, cx, cy, r, r, 0, alpha * rng.uniform(0.6, 1.0))
    return img


def finish(img, vignette=0.28, blur=1.6, grain=4.0, seed=0):
    """Vignette, defocus and film grain — grain is what sells it as a photo."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    xn, yn = x / W, y / H
    vig = 1.0 - vignette * (((xn - .5) * 1.6) ** 2 + ((yn - .5) * 1.5) ** 2)
    img = img * np.clip(vig, 0, 1)[..., None]

    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    if blur:
        out = out.filter(ImageFilter.GaussianBlur(blur))

    if grain:
        rng = np.random.RandomState(seed + 99)
        noise = rng.normal(0, grain, (H, W, 1)).astype(np.float32)
        arr = np.clip(np.array(out, np.float32) + noise, 0, 255).astype(np.uint8)
        out = Image.fromarray(arr)
    return out


# --------------------------------------------------------------------------
# Scenes. Each returns a finished PIL image.
# --------------------------------------------------------------------------

def scene_table(seed=3):
    img = canvas(IVORY, WARM)
    img = blob(img, WARM, 0.5, 0.68, 0.55, 0.26, 0, 0.75)      # linen
    img = blob(img, SAGEL, 0.30, 0.62, 0.09, 0.05, -0.3, 0.65)  # napkin
    img = blob(img, SAGEL, 0.72, 0.66, 0.08, 0.045, 0.25, 0.6)
    img = blob(img, WARM, 0.5, 0.46, 0.16, 0.12, 0, 0.7)        # centrepiece
    img = blob(img, BLUSH, 0.46, 0.44, 0.07, 0.055, 0, 0.75)
    img = blob(img, ROSE, 0.55, 0.47, 0.05, 0.04, 0, 0.6)
    img = blob(img, SAGED, 0.40, 0.50, 0.06, 0.03, -0.5, 0.45)
    img = bokeh(img, [GOLDL, GOLD], 7, seed, 0.006, 0.014, 0.75, (0.55, 0.80))  # flatware glints
    img = band(img, WARM, 0.22, 0.10, math.radians(60), 0.35)
    return finish(img, 0.30, 1.3, 4.0, seed)


def scene_blooms(seed=4):
    img = canvas(IVORY, CREAM)
    img = bokeh(img, [BLUSH, ROSE, DROSE], 6, seed, 0.10, 0.20, 0.62)
    img = bokeh(img, [SAGE, SAGED], 4, seed + 7, 0.07, 0.15, 0.45)
    img = blob(img, WARM, 0.34, 0.36, 0.13, 0.11, 0, 0.55)
    img = bokeh(img, [WARM], 8, seed + 3, 0.008, 0.02, 0.6)
    return finish(img, 0.34, 2.4, 4.5, seed)


def scene_greenery(seed=5):
    img = canvas(SAGEL, CREAM)
    rng = np.random.RandomState(seed)
    for i in range(9):                                          # leaf blades
        img = blob(img, [SAGED, SAGE, SAGEL][i % 3],
                   rng.uniform(0, 1), rng.uniform(0, 1),
                   rng.uniform(0.10, 0.26), rng.uniform(0.02, 0.05),
                   rng.uniform(-1.4, 1.4), 0.55)
    img = bokeh(img, [WARM], 7, seed + 5, 0.007, 0.016, 0.55)   # droplets
    img = band(img, WARM, 0.30, 0.11, math.radians(50), 0.30)
    return finish(img, 0.30, 1.5, 4.0, seed)


def scene_arch(seed=6):
    img = canvas(WARM, IVORY)
    img = floor(img, 0.72, WOOD, IVORY)
    rng = np.random.RandomState(seed)
    for i in range(26):                                         # balloon arch
        t = i / 25
        ang = math.pi * (0.12 + 0.76 * t)
        cx = 0.5 + 0.34 * math.cos(ang)
        cy = 0.70 - 0.44 * math.sin(ang)
        r = rng.uniform(0.035, 0.058)
        img = blob(img, [SAGEL, CREAM, GOLDL, SAGE][i % 4], cx, cy, r, r, 0, 0.80)
    img = blob(img, WARM, 0.5, 0.44, 0.16, 0.13, 0, 0.35)       # backdrop
    return finish(img, 0.26, 1.7, 3.5, seed)


def scene_candlelight(seed=7):
    img = canvas((78, 72, 64), (46, 44, 40))
    img = bokeh(img, [GOLDL, GOLD, WARM], 12, seed, 0.012, 0.035, 0.85, (0.45, 0.78))
    img = bokeh(img, [GOLDL, WARM], 8, seed + 4, 0.04, 0.09, 0.20)
    img = blob(img, BLUSH, 0.30, 0.55, 0.14, 0.10, 0, 0.22)
    img = blob(img, SAGED, 0.76, 0.60, 0.13, 0.09, 0, 0.25)
    return finish(img, 0.42, 2.2, 5.0, seed)


def scene_petals(seed=11):
    """Blush variant of the bloom study."""
    img = canvas((250, 243, 239), (240, 228, 222))
    img = bokeh(img, [BLUSH, ROSE], 7, seed, 0.09, 0.19, 0.66)
    img = bokeh(img, [SAGEL], 3, seed + 2, 0.06, 0.12, 0.35)
    img = blob(img, WARM, 0.62, 0.32, 0.15, 0.12, 0, 0.5)
    img = bokeh(img, [WARM], 9, seed + 4, 0.007, 0.018, 0.55)
    return finish(img, 0.32, 2.6, 4.5, seed)


def scene_eucalyptus(seed=12):
    """Tighter, darker greenery than the first study."""
    img = canvas((214, 224, 210), (176, 192, 172))
    rng = np.random.RandomState(seed)
    for i in range(11):
        img = blob(img, [SAGED, SAGE, (72, 92, 76)][i % 3],
                   rng.uniform(0, 1), rng.uniform(0, 1),
                   rng.uniform(0.08, 0.22), rng.uniform(0.018, 0.042),
                   rng.uniform(-1.5, 1.5), 0.60)
    img = bokeh(img, [WARM], 9, seed + 6, 0.006, 0.015, 0.6)
    img = band(img, WARM, 0.26, 0.09, math.radians(46), 0.28)
    return finish(img, 0.34, 1.6, 4.0, seed)


def scene_gold_details(seed=13):
    """Warmer, lighter counterpart to the candlelight study."""
    img = canvas((246, 238, 224), (224, 208, 184))
    img = bokeh(img, [GOLDL, GOLD], 10, seed, 0.014, 0.038, 0.72, (0.35, 0.80))
    img = bokeh(img, [WARM, GOLDL], 6, seed + 3, 0.05, 0.11, 0.30)
    img = blob(img, (252, 248, 240), 0.40, 0.40, 0.20, 0.15, 0, 0.45)
    img = blob(img, SAGEL, 0.78, 0.68, 0.11, 0.07, 0, 0.28)
    return finish(img, 0.34, 2.4, 4.5, seed)


SCENES = [
    ('table-setting', scene_table),
    ('blooms',        scene_blooms),
    ('petals',        scene_petals),
    ('greenery',      scene_greenery),
    ('eucalyptus',    scene_eucalyptus),
    ('balloon-arch',  scene_arch),
    ('candlelight',   scene_candlelight),
    ('gold-details',  scene_gold_details),
]


def main():
    for name, fn in SCENES:
        img = fn()
        path = OUT / f'{name}.jpg'
        img.save(path, 'JPEG', quality=82, optimize=True, progressive=True)
        print(f'  {path.name:20} {path.stat().st_size / 1024:6.1f} KB')


if __name__ == '__main__':
    main()
