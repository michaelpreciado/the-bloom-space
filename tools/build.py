#!/usr/bin/env python3
"""
Assembles the static pages from src/ + the shared chrome below.

This is an AUTHORING tool, not a deploy step. It writes plain .html files to
the repo root which Vercel serves directly — there is no build on deploy and
no runtime dependency on this script. Run it after editing anything in src/
or the templates here, then commit the generated pages.

    python3 tools/build.py

Why a generator at all: six pages sharing a header, footer, meta block and
JSON-LD will drift if they're six hand-maintained copies. This keeps one copy
of the chrome while still shipping fully static, crawlable HTML.
"""

import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
MEDIA = json.loads((ROOT / 'data' / 'media.json').read_text())

SITE_NAME = 'The Bloom Space'
DESCRIPTION_FALLBACK = (
    'A bright boutique event room on Bridge Street in Visalia, CA. '
    'Baby showers, bridal showers, quinceañeras, birthdays and workshops, up to 65 guests.'
)

# Relative so the site stays portable until a custom domain is pointed.
PAGES = [
    ('index',     'Home',                'A Boutique Event Room in Visalia'),
    ('the-space', 'nav.space',           'The Space'),
    ('gallery',   'nav.gallery',         'Gallery'),
    ('pricing',   'nav.pricing',         'Pricing'),
    ('faq',       'nav.faq',             'FAQ'),
    ('contact',   'nav.contact',         'Request a Viewing'),
]

NAV = [
    ('the-space.html', 'nav.space',   'The Space'),
    ('gallery.html',   'nav.gallery', 'Gallery'),
    ('pricing.html',   'nav.pricing', 'Pricing'),
    ('faq.html',       'nav.faq',     'FAQ'),
]

LOCAL_BUSINESS_SCHEMA = '''{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "EventVenue"],
  "name": "The Bloom Space",
  "description": "A bright boutique multipurpose event room in Visalia, California, for showers, quinceañeras, birthdays, workshops and small receptions.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "316 S Bridge St",
    "addressLocality": "Visalia",
    "addressRegion": "CA",
    "postalCode": "93291",
    "addressCountry": "US"
  },
  "maximumAttendeeCapacity": 65,
  "sameAs": ["https://www.instagram.com/the_bloom_space559"],
  "priceRange": "$65-$100 per hour",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "07:00", "closes": "23:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "07:00", "closes": "14:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "16:00", "closes": "23:00" }
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Tables and chairs", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "On-site parking", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Restroom facilities", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Climate control", "value": true }
  ]
}'''

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">

<!-- Social share card. og:url stays relative-free until a domain is pointed. -->
<meta property="og:type" content="business.business">
<meta property="og:site_name" content="The Bloom Space">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="assets/venue-exterior-wide.jpg">
<meta property="og:image:alt" content="The Bloom Space on the corner of Bridge Street in Visalia">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#faf7f2">
<link rel="icon" type="image/png" href="{favicon}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400..500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles/site.css">

<script type="application/ld+json">
{schema}
</script>
</head>
<body>
<a class="skip-link" href="#main" data-i18n="nav.skip">Skip to content</a>
'''

HEADER = '''
<header class="site-header" role="banner">
  <nav class="nav wrap" aria-label="Main">
    <a href="index.html" class="brand" aria-label="The Bloom Space — home">
      <img class="brand-icon" src="assets/logo-mark.png" alt="" width="120" height="120" decoding="async">
      <span>The Bloom Space</span>
    </a>

    <div class="nav-links" id="navLinks">
{nav_items}
      <button type="button" class="lang-toggle" data-lang-toggle lang="es">Español</button>
      <a href="contact.html" class="btn btn-primary"{book_current} data-i18n="nav.book">Request a Viewing</a>
    </div>

    <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">
      <span></span><span></span><span></span>
    </button>
  </nav>
</header>
'''

FOOTER = '''
<footer class="site-footer" role="contentinfo">
  <!-- Closes the page with the same botanical rule the section titles use.
       Unlike the corner frame this fits at any width, so it is the border
       phones and tablets actually get. -->
  <div class="footer-flourish" aria-hidden="true"></div>
  <div class="wrap footer-grid">
    <div class="footer-col">
      <div class="footer-brand">The Bloom Space</div>
      <p class="footer-heading" data-i18n="footer.address">Visit</p>
      <p>316 S Bridge St<br>Visalia, CA 93291</p>
      <p><a href="https://maps.google.com/?q=316+S+Bridge+St+Visalia+CA+93291" target="_blank" rel="noopener noreferrer" data-i18n="footer.maps">Open in Google Maps</a></p>
    </div>

    <div class="footer-col">
      <p class="footer-heading" data-i18n="footer.hours">Hours</p>
      <p>Mon &ndash; Thu: <span data-i18n="footer.byAppt">By appointment</span></p>
      <p>Fri: <span data-i18n="footer.byAppt">By appointment</span></p>
      <p>Sat &ndash; Sun: <span data-i18n="footer.weekend">7am&ndash;2pm, 4pm&ndash;11pm</span></p>
    </div>

    <div class="footer-col">
      <p class="footer-heading" data-i18n="footer.connect">Connect</p>
      <p><a href="https://www.instagram.com/the_bloom_space559" target="_blank" rel="noopener noreferrer">Instagram</a></p>
      <p><a href="mailto:hello@thebloomspace.com">hello@thebloomspace.com</a></p>
      <p><a href="contact.html" data-i18n="nav.book">Request a Viewing</a></p>
    </div>
  </div>

  <div class="wrap footer-bottom">
    <p>&copy; 2026 The Bloom Space. <span data-i18n="footer.rights">All rights reserved.</span></p>
    <p data-i18n="footer.madeIn">Made with care, in Visalia.</p>
  </div>
</footer>
'''

# The availability calendar appears on both Pricing and the home page, and
# lib/ui.js drives it by element id — so there can only ever be one copy of
# this markup. It lives here rather than in either page.
CALENDAR = '''<div class="availability" id="availability">
    <div class="cal-head">
      <div class="cal-nav">
        <button type="button" class="cal-arrow" id="calPrev" aria-label="Previous month">&larr;</button>
        <span class="cal-month" id="calMonth" aria-live="polite"></span>
        <button type="button" class="cal-arrow" id="calNext" aria-label="Next month">&rarr;</button>
      </div>
    </div>

    <div class="cal-weekdays" aria-hidden="true">
      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
    </div>

    <div class="cal-grid" id="calGrid" role="grid" aria-labelledby="avail-title"></div>

    <ul class="cal-legend">
      <li><span class="swatch open" aria-hidden="true"></span><span data-i18n="pricing.availOpen">Open</span></li>
      <li><span class="swatch limited" aria-hidden="true"></span><span data-i18n="pricing.availLimited">Partly held</span></li>
      <li><span class="swatch booked" aria-hidden="true"></span><span data-i18n="pricing.availBlocked">Unavailable</span></li>
    </ul>

    <div class="cal-detail" id="calDetail" role="status" aria-live="polite">
      <p class="cal-detail-empty" data-i18n="pricing.availPick">Select a date to see the hours we have open.</p>
    </div>
  </div>'''

# The invitation border. Purely decorative, so it is hidden from assistive
# tech and cannot be clicked through. Desktop and tablet only — see the CSS.
PAGE_FRAME = '''
<div class="page-frame" aria-hidden="true">
  <span class="frame-corner tl"></span>
  <span class="frame-corner tr"></span>
  <span class="frame-corner bl"></span>
  <span class="frame-corner br"></span>
</div>
'''

# Phone-only, and only once the visitor is past the opening screen. Booking a
# room for a shower is a decision people make on a phone, halfway down the
# page — the ask should be there when they arrive at it, not scrolled back up
# at the top. Skipped on the contact page, where the form itself is the CTA.
BOOK_BAR = '''
<div class="book-bar" id="bookBar">
  <a href="contact.html" class="btn btn-primary" data-i18n="nav.book">Request a Viewing</a>
  <a class="book-bar-alt" href="https://www.instagram.com/the_bloom_space559"
     target="_blank" rel="noopener noreferrer"
     aria-label="Message us on Instagram" data-i18n-attr="aria-label:book.dmAria">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
         stroke-width="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>
    </svg>
  </a>
</div>
'''

TAIL = '''
<script type="module">
  import {{ initI18n }} from './lib/i18n.js';
  import {{ initPage }} from './lib/ui.js';
  await initI18n();
  initPage();
{extra}
</script>
</body>
</html>
'''


def img_tag(entry, extra=''):
    """One <img> from a data/media.json entry. Dimensions and alt are not
    optional — both are graded, and alt is how the site is usable at all."""
    return (
        f'<img src="{html.escape(entry["src"], quote=True)}"\n'
        f'           alt="{html.escape(entry.get("alt", ""), quote=True)}"\n'
        f'           width="{entry.get("width", 1200)}" height="{entry.get("height", 900)}"'
        f'{extra}>'
    )


def fill_media(body):
    """Replace {{media:...}} and {{calendar}} slots with generated markup."""
    body = body.replace('{{calendar}}', CALENDAR)
    hero = MEDIA['hero']

    # Two shapes, chosen by the browser. A landscape hero cover-cropped into a
    # phone viewport zooms into the middle of the frame; the portrait cut keeps
    # the whole building on screen, which is the entire point of leading with it.
    portrait = ''
    if hero.get('posterPortrait'):
        portrait = (f'<source media="(max-width: 700px)" srcset="{hero["posterPortrait"]}"'
                    f' width="{hero.get("posterPortraitWidth", 900)}"'
                    f' height="{hero.get("posterPortraitHeight", 1200)}">\n      ')
    body = body.replace('{{media:hero-poster}}',
        f'<picture>\n      {portrait}'
        f'<img src="{hero["poster"]}" alt="" width="{hero.get("posterWidth", 1280)}"'
        f' height="{hero.get("posterHeight", 720)}" fetchpriority="high" decoding="async">\n    </picture>')

    body = body.replace('{{media:hero-sources}}', '\n      '.join(
        f'<source data-src="{s["src"]}" type="{s["type"]}">' for s in hero['sources']))

    for name, entry in MEDIA['pages'].items():
        body = body.replace('{{media:' + name + '}}',
                            img_tag(entry, ' loading="lazy" decoding="async"'))

    body = body.replace('{{media:strip}}', '\n    '.join(
        img_tag(e, ' loading="lazy" decoding="async"') for e in MEDIA['strip']))

    # Gallery is rendered client-side, so hand it over as inline JSON rather
    # than a second fetch.
    body = body.replace('{{media:gallery-json}}',
        '<script type="application/json" id="media-gallery">'
        + json.dumps(MEDIA['gallery'], ensure_ascii=False) + '</script>')

    return body


def build_nav(active):
    out = []
    for href, key, label in NAV:
        current = ' aria-current="page"' if href.startswith(active) else ''
        out.append(f'      <a href="{href}"{current} data-i18n="{key}">{label}</a>')
    return '\n'.join(out)


def main():
    favicon = (ROOT / 'favicon.txt').read_text().strip() if (ROOT / 'favicon.txt').exists() else ''

    for slug in [p[0] for p in PAGES]:
        src = SRC / f'{slug}.html'
        if not src.exists():
            print(f'  skip {slug} (no src)')
            continue

        raw = src.read_text()

        def meta(name, default=''):
            m = re.search(rf'<!--\s*{name}:\s*(.*?)\s*-->', raw)
            return m.group(1) if m else default

        title = meta('title', SITE_NAME)
        description = meta('description', DESCRIPTION_FALLBACK)
        extra = meta('extra', '')
        body = re.sub(r'<!--\s*(title|description|extra):.*?-->\n?', '', raw).strip()
        body = fill_media(body)

        active = f'{slug}.html'
        book_current = ' aria-current="page"' if slug == 'contact' else ''

        html = (
            HEAD.format(title=title, description=description, schema=LOCAL_BUSINESS_SCHEMA, favicon=favicon)
            + HEADER.format(nav_items=build_nav(active), book_current=book_current)
            + '\n' + body + '\n'
            + FOOTER
            + PAGE_FRAME
            + ('' if slug == 'contact' else BOOK_BAR)
            + TAIL.format(extra=('  ' + extra if extra else ''))
        )

        (ROOT / f'{slug}.html').write_text(html)
        print(f'  built {slug}.html  ({len(html):,} bytes)')


if __name__ == '__main__':
    main()
