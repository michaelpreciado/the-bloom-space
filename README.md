# The Bloom Space

Static, bilingual event venue website for The Bloom Space in Visalia, California. Includes venue information, a gallery, pricing calculator, availability calendar, viewing inquiry form, and a preview admin panel.

## Preview status

This is a client preview. `lib/api.mock.js` stores demo state in the current browser's localStorage. Inquiries are not emailed, payments are not implemented, and admin login is a client-side preview gate rather than production authentication. See [release candidate notes](RC_NOTES.md) for launch work and known gaps.

## Run locally

Requires Python 3. No npm installation is needed.

```bash
git clone https://github.com/michaelpreciado/the-bloom-space.git
cd the-bloom-space
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. The preview admin is at `/admin/`. Serve over HTTP because the pages use JavaScript modules.

## Edit and rebuild pages

Edit page bodies in `src/` and shared page templates in `tools/build.py`, then run:

```bash
python3 tools/build.py
```

Commit the regenerated HTML files in the repository root alongside the source changes. Direct edits to those generated pages will be overwritten by the next build. Rebuild after changing `data/media.json` too, because the generator reads it to assemble media markup.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/` | Source page bodies |
| `tools/build.py` | Shared templates and static page generator |
| `data/content.js` | English and Spanish content seeds |
| `data/rates.js` | Pricing, time windows, and blocked dates |
| `data/media.json` | Image and video definitions |
| `lib/` | Preview API, translations, pricing, and interactions |
| `styles/site.css` | Public site styling |
| `admin/` | Preview administration interface |
| `assets/` | Committed images, videos, and illustrations |

## Hosting

Serve the repository root as a static website. The generated HTML is committed; `tools/build.py` is an authoring step and does not need to run during deployment. Keep generated HTML and published assets tracked in Git.
