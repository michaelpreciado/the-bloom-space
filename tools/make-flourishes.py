#!/usr/bin/env python3
"""
Draws the floral ornaments in assets/ornaments/.

The logo is a watercolour wild rose with eucalyptus. Imitating watercolour in
SVG looks cheap, so these go the other way: fine line art in the same botanical
family, the vocabulary of an engraved invitation. That is also the right
reference for the room — a shower or a quinceañera starts with an invitation
that looks like this.

Two pieces, both drawn once and reused:

  corner.svg    a top-left spray. The other three corners are the same file
                mirrored in CSS, so the frame costs one request.
  divider.svg   a symmetric sprig for the rule between sections.

    python3 tools/make-flourishes.py

Outputs are committed; the site never runs this.
"""

import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'ornaments'

GOLD = '#b8934e'
SAGE = '#8b9a84'
ROSE = '#c99a95'
BLUSH = '#e8cfca'

HAIR = 1.1          # stem weight
LEAF_W = 0.9        # leaf outline weight


# ---------------------------------------------------------------- geometry

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3 * p0[0] + 3*u*u*t * p1[0] + 3*u*t*t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3*u*u*t * p1[1] + 3*u*t*t * p2[1] + t**3 * p3[1])


def bez_angle(p0, p1, p2, p3, t):
    u = 1 - t
    dx = 3*u*u*(p1[0]-p0[0]) + 6*u*t*(p2[0]-p1[0]) + 3*t*t*(p3[0]-p2[0])
    dy = 3*u*u*(p1[1]-p0[1]) + 6*u*t*(p2[1]-p1[1]) + 3*t*t*(p3[1]-p2[1])
    return math.atan2(dy, dx)


def stem_path(p0, p1, p2, p3):
    return (f'M{p0[0]:.1f} {p0[1]:.1f} C{p1[0]:.1f} {p1[1]:.1f} '
            f'{p2[0]:.1f} {p2[1]:.1f} {p3[0]:.1f} {p3[1]:.1f}')


def petal(cx, cy, ang, length, width):
    """One teardrop rooted at (cx,cy) pointing along `ang`. Does duty as both
    a leaf and a rose petal — botanically that is roughly true anyway."""
    tx, ty = cx + length*math.cos(ang), cy + length*math.sin(ang)
    px, py = -math.sin(ang)*width, math.cos(ang)*width
    a = (cx + length*0.28*math.cos(ang) + px, cy + length*0.28*math.sin(ang) + py)
    bpt = (cx + length*0.72*math.cos(ang) + px*0.82, cy + length*0.72*math.sin(ang) + py*0.82)
    c = (cx + length*0.72*math.cos(ang) - px*0.82, cy + length*0.72*math.sin(ang) - py*0.82)
    d = (cx + length*0.28*math.cos(ang) - px, cy + length*0.28*math.sin(ang) - py)
    return (f'M{cx:.1f} {cy:.1f} C{a[0]:.1f} {a[1]:.1f} {bpt[0]:.1f} {bpt[1]:.1f} {tx:.1f} {ty:.1f} '
            f'C{c[0]:.1f} {c[1]:.1f} {d[0]:.1f} {d[1]:.1f} {cx:.1f} {cy:.1f}Z')


def sprig(p0, p1, p2, p3, count=7, leaf=9.0, taper=0.55, start=0.12, spread=0.52):
    """A stem with leaves alternating down it, shrinking toward the tip — the
    thing that makes drawn eucalyptus read as eucalyptus."""
    out = [f'<path d="{stem_path(p0, p1, p2, p3)}" fill="none" stroke="{SAGE}" '
           f'stroke-width="{HAIR}" stroke-linecap="round"/>']
    for i in range(count):
        t = start + (1 - start) * (i / max(count - 1, 1))
        x, y = bez(p0, p1, p2, p3, t)
        a = bez_angle(p0, p1, p2, p3, t)
        side = 1 if i % 2 == 0 else -1
        size = leaf * (1 - taper * t)
        out.append(f'<path d="{petal(x, y, a + side * spread, size, size * 0.42)}" '
                   f'fill="{SAGE}" fill-opacity="0.16" stroke="{SAGE}" '
                   f'stroke-width="{LEAF_W}" stroke-linejoin="round"/>')
    return out


def rose(cx, cy, r, petals=5, turn=0.0):
    """An open wild rose: five outer petals, three inner, a stippled centre.
    The logo's flower has the same face-on geometry.

    The outer petals carry no fill. Eight overlapping translucent petals stack
    their alpha into a solid patch, which on the dark bands turned the flower
    into a grey blob — line art is also simply the more expensive-looking
    answer next to a watercolour mark."""
    out = []
    for i in range(petals):
        a = turn + i * math.tau / petals
        out.append(f'<path d="{petal(cx, cy, a, r, r * 0.62)}" fill="none" '
                   f'stroke="{ROSE}" stroke-width="{LEAF_W*1.15}" '
                   f'stroke-linejoin="round"/>')
    for i in range(3):
        a = turn + 0.5 + i * math.tau / 3
        out.append(f'<path d="{petal(cx, cy, a, r * 0.52, r * 0.34)}" fill="{BLUSH}" '
                   f'fill-opacity="0.18" stroke="{ROSE}" stroke-width="{LEAF_W}" '
                   f'stroke-linejoin="round"/>')
    out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r*0.15:.1f}" fill="{GOLD}" fill-opacity="0.55"/>')
    for i in range(6):
        a = i * math.tau / 6 + 0.3
        out.append(f'<circle cx="{cx + r*0.26*math.cos(a):.1f}" cy="{cy + r*0.26*math.sin(a):.1f}" '
                   f'r="0.9" fill="{GOLD}" fill-opacity="0.75"/>')
    return out


def bud(cx, cy, ang, size):
    """A closed bud on a short stalk — what fills the gaps between sprays."""
    tx, ty = cx - size*0.9*math.cos(ang), cy - size*0.9*math.sin(ang)
    return [
        f'<path d="M{cx:.1f} {cy:.1f} L{tx:.1f} {ty:.1f}" stroke="{SAGE}" '
        f'stroke-width="{HAIR*0.85}" stroke-linecap="round"/>',
        f'<path d="{petal(cx, cy, ang, size, size*0.46)}" fill="{BLUSH}" fill-opacity="0.25" '
        f'stroke="{ROSE}" stroke-width="{LEAF_W}" stroke-linejoin="round"/>',
        f'<path d="{petal(cx, cy, ang + 0.42, size*0.6, size*0.26)}" fill="none" '
        f'stroke="{SAGE}" stroke-width="{LEAF_W*0.9}"/>',
        f'<path d="{petal(cx, cy, ang - 0.42, size*0.6, size*0.26)}" fill="none" '
        f'stroke="{SAGE}" stroke-width="{LEAF_W*0.9}"/>',
    ]


# ---------------------------------------------------------------- pieces

def corner():
    """Top-left: a double gold bracket with one spray sweeping out along each
    edge from a rose sitting just inside the corner. The rose goes on last so
    it overlaps the inner rule the way a pressed flower would."""
    W = H = 140
    parts = [
        # the bracket the CSS frame's hairlines run out from
        f'<path d="M6 64 L6 6 L64 6" fill="none" stroke="{GOLD}" stroke-width="1" '
        f'stroke-opacity="0.55" stroke-linecap="round"/>',
        f'<path d="M14 50 L14 14 L50 14" fill="none" stroke="{GOLD}" stroke-width="0.7" '
        f'stroke-opacity="0.3" stroke-linecap="round"/>',
    ]
    parts += sprig((44, 30), (68, 24), (94, 32), (118, 28), count=6, leaf=10, spread=0.62)
    parts += sprig((30, 44), (24, 68), (32, 94), (28, 118), count=6, leaf=10, spread=-0.62)
    parts += sprig((44, 44), (58, 54), (66, 68), (68, 84), count=4, leaf=7.5, spread=0.5)
    parts += bud(96, 40, 0.55, 6)
    parts += bud(40, 96, 1.02, 6)
    parts += rose(34, 34, 14, turn=0.6)
    return W, H, parts


def divider():
    """A rule for between sections: hairline, sprigs, a rose in the middle.
    The rules stop short of the sprigs so nothing crosses anything."""
    W, H = 260, 54
    cx, cy = W / 2, H / 2
    parts = [
        f'<path d="M4 {cy} L{cx-74:.0f} {cy}" stroke="{GOLD}" stroke-width="1" '
        f'stroke-opacity="0.45" stroke-linecap="round"/>',
        f'<path d="M{cx+74:.0f} {cy} L{W-4} {cy}" stroke="{GOLD}" stroke-width="1" '
        f'stroke-opacity="0.45" stroke-linecap="round"/>',
    ]
    parts += sprig((cx - 18, cy), (cx - 32, cy - 9), (cx - 50, cy - 6), (cx - 66, cy),
                   count=5, leaf=8.5, spread=0.7)
    parts += sprig((cx + 18, cy), (cx + 32, cy - 9), (cx + 50, cy - 6), (cx + 66, cy),
                   count=5, leaf=8.5, spread=-0.7)
    parts += bud(cx - 28, cy + 8, math.pi * 0.72, 5.5)
    parts += bud(cx + 28, cy + 8, math.pi * 0.28, 5.5)
    parts += rose(cx, cy, 12, turn=1.1)
    return W, H, parts


def write(name, piece, title):
    W, H, parts = piece()
    body = '\n  '.join(parts)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
           f'viewBox="0 0 {W} {H}" role="presentation" aria-hidden="true">\n'
           f'  <title>{title}</title>\n  {body}\n</svg>\n')
    path = OUT / f'{name}.svg'
    path.write_text(svg)
    print(f'  {path.relative_to(ROOT)}  {path.stat().st_size} bytes')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    write('corner', corner, 'Botanical corner flourish')
    write('divider', divider, 'Botanical section divider')


if __name__ == '__main__':
    main()
