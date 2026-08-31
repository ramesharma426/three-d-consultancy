# 3D Engineering Consultancy Website

Marketing website for 3D Engineering Consultancy (Hetauda, Nepal), built with
NestJS and Handlebars, exported to a static site and deployed to GitHub Pages.
It's a single scrolling page (`views/home.hbs`) with a fixed sidebar nav
(`views/partials/sidebar.hbs`) linking to in-page sections (`#about`,
`#services`, `#portfolio`, `#contact`).

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

## Replacing placeholder content

- **Company info** (name, tagline, phone, email, address, map coordinates,
  WhatsApp link): edit `src/config/company.ts`. Every page pulls from this
  one file.
- **Portfolio**: the Portfolio section in `views/home.hbs` (`id="portfolio"`)
  currently shows three sample projects. Replace the text and add real
  project images under `public/images/` once available.
- **Base path**: the static export rewrites root-relative links (e.g.
  `/css/style.css`) with a prefix from `company.basePath` in
  `src/config/company.ts`, since GitHub Pages serves a project repo at
  `https://<user>.github.io/<repo-name>/`. If this repo is ever renamed, or
  the site moves to a `<user>.github.io` user/org repo or a custom domain,
  update `basePath` to match (use `''` for a user/org repo or custom
  domain).
