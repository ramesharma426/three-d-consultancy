# 3D Engineering Consultancy Website

Marketing website for 3D Engineering Consultancy (Hetauda, Nepal), built with
NestJS and Handlebars, exported to a static site and deployed to GitHub Pages.
It's a single scrolling page (`views/home.hbs`) with a fixed sidebar nav
(`views/partials/sidebar.hbs`) linking to in-page sections (`#about`,
`#services`, `#portfolio`, `#contact`), with an EN/नेपाली content toggle
(`public/js/i18n.js`) and fixed Messenger/WhatsApp bubbles
(`views/partials/float-contact.hbs`) — see `CLAUDE.md` for how these work.

## Development

    npm install
    npm run start:dev

Visit http://localhost:3000.

## Testing

    npm run test:e2e

## Building the static site locally

    npm run build:static

Output is written to `dist-static/`.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
static site and publishes it to GitHub Pages. One-time setup: in the repo's
Settings → Pages, set "Source" to "GitHub Actions".

The site is served from the custom domain `engconsultancy3d.com.np`
(`public/CNAME`), not the default `github.io` URL, so `company.basePath` is
`''`. See `CLAUDE.md` if this ever changes.

## Replacing placeholder content

- **Company info** (name, tagline, phone, email, address, map coordinates,
  WhatsApp link): edit `src/config/company.ts`. Every page pulls from this
  one file.
- **Portfolio**: the Portfolio section in `views/home.hbs` (`id="portfolio"`)
  has one real project ("Sample Residential Structural Design") shown as an
  auto-advancing photo carousel (`public/js/carousel.js`) with photos in
  `public/images/portfolio/`, click-to-enlarge via a modal
  (`public/js/lightbox.js`). Add a second project the same way (a
  `.portfolio-feature` block with its own carousel) once real photos exist.
  See `CLAUDE.md` for why the carousel uses `object-fit: contain` rather
  than `cover`.
- **Base path**: the static export rewrites root-relative links (e.g.
  `/css/style.css`) with a prefix from `company.basePath` in
  `src/config/company.ts`, since a bare GitHub Pages project repo is served
  at `https://<user>.github.io/<repo-name>/`. This site uses a custom
  domain instead (served at its own root), so `basePath` is `''`. If the
  custom domain is ever removed, set `basePath` back to `/<repo-name>`.
- **Logo/favicon**: `public/images/logo-full.png` (sidebar mark) and
  `public/images/logo-mark.png` (topbar/footer) are generated from the
  client-supplied logo with the background chroma-keyed to transparent;
  `favicon.ico` and the `favicon-*.png`/`apple-touch-icon.png` files are
  resized from the same source. Regenerate all of them together if the
  logo changes.
- **SEO**: meta description, Open Graph/Twitter tags, canonical URL, and
  JSON-LD are in `views/home.hbs`'s `<head>`, driven by `company.siteUrl`.
  `public/robots.txt` and `public/sitemap.xml` hardcode the domain and need
  updating by hand if it ever changes.
- **Nepali translations**: every translatable string in `home.hbs` and the
  partials is a pair of `data-i18n-en`/`data-i18n-ne` spans next to each
  other (see `CLAUDE.md`). Meta tags and JSON-LD are English-only.
- **Contact badges/map card**: `views/partials/contact-badges.hbs` (phone,
  email, Facebook icons) is shared by the footer and Contact section. The
  Contact section's map has a floating "Google-style" info card
  (`.gmap-card`) built from `company.mapCoordinates` — see `CLAUDE.md`.
- **Smooth scroll**: `public/js/vendor/lenis.min.js` (vendored, MIT) +
  `public/js/smooth-scroll.js`. Elements that shouldn't be intercepted by
  it (the carousel, the lightbox) carry `data-lenis-prevent`.
