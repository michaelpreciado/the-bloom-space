#!/usr/bin/env python3
"""
Draws the three layout diagrams in assets/layouts/.

These replace what were blurred stand-in photographs. A schematic is the
honest thing to show here: nobody has photographed the room set up three
different ways yet, and for "how does 65 people fit" a plan view answers the
question better than a photo would anyway.

They are indicative, not surveyed — the room outline is a plain rectangle.
Say so on the page. When the client supplies measurements, put them here.

    python3 tools/make-layouts.py
"""

import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'layouts'

W, H = 400, 300
PAD = 26                       # margin from the SVG edge to the wall line
WALL = (PAD, PAD, W - PAD, H - PAD)

INK = '#3a3f3c'                # wall line — the site's charcoal
PAPER = '#ffffff'              # matches the card surface the plan sits on
FLOOR = '#efe7da'              # floor fill, a shade under the paper
SAGE = '#7d8f80'
GOLD = '#c9a86a'


def chairs_around(cx, cy, r, n):
    """Chair dots evenly spaced on a circle, offset so none sits on the join."""
    out = []
    for i in range(n):
        a = (i / n) * math.tau + math.tau / (n * 2)
        out.append(f'<circle cx="{cx + r * math.cos(a):.1f}" cy="{cy + r * math.sin(a):.1f}" '
                   f'r="4" fill="{SAGE}"/>')
    return out


def frame(body, title):
    x0, y0, x1, y1 = WALL
    door_x = x0 + (x1 - x0) * 0.5
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}"
     viewBox="0 0 {W} {H}" role="img" aria-label="{title}">
  <rect width="{W}" height="{H}" fill="{PAPER}"/>
  <rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{FLOOR}"
        stroke="{INK}" stroke-width="2.5"/>
  <!-- the entrance, drawn open, on the near wall -->
  <path d="M{door_x - 22} {y1} h44" stroke="{PAPER}" stroke-width="5"/>
  <path d="M{door_x - 22} {y1} a22 22 0 0 0 22 -22" fill="none" stroke="{INK}"
        stroke-width="1.5" stroke-dasharray="3 3"/>
{body}
</svg>
'''


def banquet():
    """Eight rounds of eight — sixty-four seats, which is the room's number."""
    out = []
    for row in range(2):
        for col in range(4):
            cx = 74 + col * 84
            cy = 106 + row * 88
            out.append(f'  <circle cx="{cx}" cy="{cy}" r="17" fill="#fff" '
                       f'stroke="{INK}" stroke-width="1.5"/>')
            out += ['  ' + c for c in chairs_around(cx, cy, 26, 8)]
    return '\n'.join(out)


def theatre():
    """Five rows of thirteen — sixty-five, facing a marked focal wall."""
    out = [f'  <rect x="{W / 2 - 62:.0f}" y="{PAD + 12}" width="124" height="8" rx="4" '
           f'fill="{GOLD}"/>']
    for row in range(5):
        y = 104 + row * 32
        for col in range(13):
            x = 44 + col * 24
            out.append(f'  <rect x="{x}" y="{y}" width="14" height="14" rx="4" fill="{SAGE}"/>')
    return '\n'.join(out)


def open_floor():
    """Perimeter seating, centre kept clear for standing and dancing."""
    x0, y0, x1, y1 = WALL
    out = []
    for i in range(9):
        x = x0 + 22 + i * ((x1 - x0 - 44) / 8)
        out.append(f'  <rect x="{x - 8:.1f}" y="{y0 + 12}" width="16" height="16" rx="4" fill="{SAGE}"/>')
    for side in (x0 + 12, x1 - 28):
        for i in range(4):
            y = y0 + 62 + i * 42
            out.append(f'  <rect x="{side}" y="{y}" width="16" height="16" rx="4" fill="{SAGE}"/>')
    for i in range(3):
        cx = 118 + i * 82
        out.append(f'  <circle cx="{cx}" cy="{y1 - 44}" r="14" fill="#fff" '
                   f'stroke="{INK}" stroke-width="1.5"/>')
    out.append(f'  <ellipse cx="{W / 2}" cy="{(y0 + y1) / 2 - 4}" rx="74" ry="46" fill="none" '
               f'stroke="{GOLD}" stroke-width="1.5" stroke-dasharray="5 6"/>')
    return '\n'.join(out)


PLANS = [
    ('banquet', banquet, 'Floor plan: eight round tables of eight, sixty-four seated guests'),
    ('theatre', theatre, 'Floor plan: five rows of thirteen chairs facing a focal wall'),
    ('open', open_floor, 'Floor plan: seating around the edge with the centre left clear'),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn, title in PLANS:
        path = OUT / f'{name}.svg'
        path.write_text(frame(fn(), title))
        print(f'  {path.relative_to(ROOT)}  {path.stat().st_size} bytes')


if __name__ == '__main__':
    main()
