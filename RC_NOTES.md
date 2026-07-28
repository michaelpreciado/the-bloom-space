# The Bloom Space — Release Candidate Notes

Client-preview build. Booking and payments are **not** live. Everything else is
production-grade and behaves as it will at launch.

---

## What is live and working

**Pages** — Home, The Space, Gallery, Pricing, FAQ, Contact / Viewing Request.
Static HTML, semantic, one `<h1>` per page, real per-page titles and descriptions.

**Bilingual (EN/ES)** — every user-facing string is translated. English ships
inline in the HTML so crawlers and first paint get real content with no
JavaScript; the toggle swaps to Spanish, persists in `localStorage`, and sets
`<html lang>` so screen readers switch pronunciation. Rate labels, form options,
FAQ, validation messages and the calendar all translate.

**Pricing calculator** — a real engine, not a mock-up. It enforces every rule:

| Day | Rate | Minimum | Windows |
|---|---|---|---|
| Mon – Thu | $65/hr | 3 hours | 7:00am – 11:00pm |
| Friday | $85/hr | 4 hours | 7:00am – 11:00pm |
| Sat & Sun | $100/hr | 5 hours | 7:00am – 2:00pm and 4:00pm – 11:00pm |

Verified behaviour: a 2-hour Monday is rejected below minimum; a booking
overlapping the Monday 7:30pm Bachata hold is rejected; a 5-hour Saturday
starting 1:00pm is rejected for overrunning the 2:00pm window, while 4:00pm–
11:00pm is accepted. Every rejection returns a reason, so the UI says *why*.

**Availability view** — month grid, keyboard navigable, with the Monday 7:30pm
Bachata class greyed out and one-off blocked dates honoured. Selecting a date
feeds the calculator.

**Deposit policy** — a retainer deposit *and* a separate security deposit are
both required and both non-refundable. Stated verbatim on Pricing, in the FAQ,
above the inquiry form, and in the confirmation copy.

**Admin panel** (`/admin/`) — fully clickable against seeded data: text blocks
with EN and ES side by side, gallery upload/reorder/delete with **alt text
required to save**, editable FAQ, editable rates and minimums, recurring and
one-off blocks, and an inquiry inbox with read/unread. Edits made in admin show
on the public site immediately — verified for copy (both languages), rates and
blocked dates.

**Technical** — LocalBusiness + EventVenue JSON-LD, Open Graph, favicon,
`sitemap.xml`, `robots.txt` (admin disallowed), lazy-loaded and dimensioned
images, alt text on every image, visible focus rings, no horizontal overflow at
390px, zero scroll listeners (all scroll motion is CSS scroll-driven), no
console or page errors.

---

## What is stubbed

Everything backend-shaped goes through **one module: `lib/api.mock.js`**. It is
the only file that would ever talk to a network, and it currently talks to
`localStorage` instead. Nothing in this build holds a key or a secret.

| Area | Now | At launch |
|---|---|---|
| Inquiry submission | Saved to browser storage; success panel says so | Resend email + Turso row |
| Inquiry inbox | Reads browser storage | Turso |
| Content / FAQ / rates / blocks | Browser storage, seeded from `data/` | Turso |
| Image upload | Data URL held in the browser | Blob storage + CDN URL |
| Admin sign-in | **Client-side gate — not security.** Passphrase stored as a SHA-256 digest, checked in the browser | Real server-side auth |
| Payments | `checkout()` returns `not-live`; UI shows "Online booking launching soon" | Client-owned Stripe |
| Calendar sync | None | Cal.com |

**The admin gate is a demo, not protection.** The passphrase is stored as a
SHA-256 digest rather than a literal, but the check still runs in the browser,
so it can be bypassed. The admin route is `noindex, nofollow` and disallowed in
`robots.txt`, but it must not hold real data until proper auth is in place.

---

## What unlocks at launch

1. **Point a domain.** Then make `sitemap.xml` URLs absolute (they are relative
   now, deliberately, so the build is portable) and set `og:url`.
2. **Swap `lib/api.mock.js`** for real `fetch()` calls. Signatures and return
   shapes already match what the API should expose, so no calling code changes.
3. **Stand up Turso** with tables for content, faq, gallery, rates, blocks and
   inquiries — the shapes are visible in the mock's seeds.
4. **Add Resend** for inquiry email, and real auth for `/admin/`.
5. **Add Stripe** when the owner's account exists; replace the "launching soon"
   panel with the deposit checkout.
6. **Cal.com** if live calendar sync is wanted over the current inquiry flow.

---

## Content the client still needs to confirm

These are flagged rather than invented:

- **`hello@thebloomspace.com`** is unverified and is the address the site
  publishes. A wrong address means lost bookings.
- **Amenity list** (tables and chairs, restroom, climate control, food prep
  area, on-site parking, WiFi) is plausible but unconfirmed. The page carries a
  line asking guests to confirm at booking — replace that once the list is
  verified.
- **Photography is placeholder.** The hero clip and still are a generated
  botanical loop, not the room. Real photos of 316 S Bridge St are the single
  biggest upgrade available and would change how the site reads more than any
  further code work.
- **Deposit amounts** are intentionally `null` in `data/rates.js` — the policy
  is stated, the numbers are not invented.

---

## Where things live

```
index.html  the-space.html  gallery.html      generated — edit src/, then run
pricing.html  faq.html  contact.html          python3 tools/build.py

src/                page bodies (authoring source)
tools/build.py      composes shared header/footer/meta into the pages
                    NOT a deploy step — output is committed static HTML

data/rates.js       rates, minimums, windows, blocks, venue details
data/content.js     every string, EN + ES, plus FAQ and list seeds
lib/api.mock.js     ← THE swap point. The only backend boundary.
lib/i18n.js         locale switching, persistence, lang attribute
lib/pricing.js      quoting, free spans, day status
lib/ui.js           nav, header state, lightbox, FAQ, counters, calendar
styles/site.css     all site styles
admin/              admin panel (html + css + js)
assets/             logo, hero still, hero loop (webm + mp4)
```

Rates and copy are **data, never markup** — the rate card, calculator and
availability view all read `data/rates.js`, so a rate change in admin flows
through every page without a code edit.

---

## Known gaps

- `tools/build.py` must be re-run after editing `src/` or the shared chrome.
  A page edited directly in the repo root will be overwritten on the next run.
- `styles/site.css` still carries a few rules for components retired during the
  rebuild (e.g. the sticky mobile bar). Harmless, worth a cleanup pass.
- Lighthouse was not run in CI here — the sandbox blocks the Google Fonts CDN,
  which skews the score. The structural work it grades (semantics, alt text,
  meta, dimensioned images, contrast, focus, no layout shift) is done and was
  verified directly.
