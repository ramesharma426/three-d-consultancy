# 3D Engineering Consultancy Website

Marketing website for 3D Engineering Consultancy (Hetauda, Nepal), built with
NestJS and Handlebars, exported to a static site and deployed to GitHub Pages.

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
- **Contact form**: create a free form at https://formspree.io, then replace
  `PLACEHOLDER_ID` in `src/config/company.ts` (`formspreeAction`) with your
  real Formspree form ID.
- **Portfolio**: the Portfolio page (`views/portfolio.hbs`) currently shows
  three sample projects. Replace the text and add real project images under
  `public/images/` once available.
