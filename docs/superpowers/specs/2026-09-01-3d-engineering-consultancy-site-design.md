# 3D Engineering Consultancy Website — Design Spec

Date: 2026-09-01

## Purpose

A marketing website for 3D Engineering Consultancy, a Hetauda, Nepal-based
engineering firm offering 3D modeling & CAD design, architectural/structural
design, and general engineering consultancy. The site is built with NestJS
but deployed as a static site on GitHub Pages.

## Source material

- Facebook page (https://www.facebook.com/profile.php?id=61563453006366):
  Facebook blocks unauthenticated/non-browser scraping, so only the business
  name ("3D Engineering Consultancy") and location ("Hetauda") could be
  confirmed. No about text, services copy, contact details, or post content
  were retrievable. All body copy is placeholder, written in the confirmed
  business's voice, ready for the owner to edit.
- Reference site (https://buildingcare.com.np/about): minimal, text/
  credibility-driven layout — header nav, "our story," legal credentials,
  "what we stand for" values section, no hero photography or galleries.
  Built with Next.js/Tailwind, slate-gray palette (`#f8fafc`…`#0f172a`) with
  a sky-blue accent (`#0ea5e9` family), Geist sans-serif font, header
  call/WhatsApp buttons. This site borrows the visual language (palette,
  type, section structure, header contact buttons) without copying content.
- Google Maps pin (https://maps.app.goo.gl/18UaFo3D2z2LKGi67): resolves to
  "3D Engineering Consultancy" at approximately 27.4328° N, 85.0401° E,
  Hetauda, Makwanpur District, Bagmati Province, Nepal. Used for the Contact
  page map embed and placeholder address.

## Architecture

A single NestJS (TypeScript) application using the `@nestjs/platform-express`
HTTP adapter and Handlebars (`hbs`) view rendering, structured as an ordinary
server-rendered app during development:

- `src/main.ts` — Nest bootstrap, configures `hbs` view engine, static
  assets, and Handlebars partials/helpers.
- `src/app.module.ts` — root module.
- `src/pages/pages.controller.ts` — one `@Get()` handler per route
  (`/`, `/about`, `/services`, `/portfolio`, `/contact`), each calling
  `@Render('<view>')` with the view's data.
- `src/config/company.ts` — single source of truth for placeholder company
  info: name, tagline, phone, email, address, map coordinates, social links.
  All templates pull from this file; swapping in real details later is a
  one-file edit.
- `views/` — Handlebars templates: `layout.hbs` (shared header/nav/footer),
  one `.hbs` per page, `partials/` for header/footer/values-card/etc.
- `public/` — CSS, images, favicon. Plain CSS (no framework dependency),
  hand-written to match the reference site's slate + sky-blue palette and a
  system sans-serif font stack (`-apple-system, "Segoe UI", Roboto,
  sans-serif` — avoids an external font-loading dependency for a static
  GitHub Pages deployment).

### Static export

NestJS renders views at build time, not at request time in production —
GitHub Pages cannot run a Node process.

- `scripts/render-static.ts`: boots the Nest application with
  `app.listen(0)` (an OS-assigned ephemeral port), fetches each of the five
  routes from `http://localhost:<port>` with a plain HTTP client, writes
  each response body to `dist-static/<route>/index.html`
  (`dist-static/index.html` for `/`), then closes the app — giving clean
  URLs on GitHub Pages.
- Copies `public/` into `dist-static/` unchanged.
- Writes a `dist-static/.nojekyll` file (required so GitHub Pages serves
  files/folders starting with `_`, and to skip Jekyll processing generally).
- `npm run build:static` runs this script end-to-end.

### Deployment

`.github/workflows/deploy.yml`: on push to `main`, runs `npm ci`,
`npm run build:static`, then deploys `dist-static/` using
`actions/upload-pages-artifact` + `actions/deploy-pages` (the standard
GitHub Pages Actions flow — no `gh-pages` branch or extra secrets needed
beyond the default `GITHUB_TOKEN` and enabling Pages "GitHub Actions" as
the source in repo settings).

## Pages

All five pages share `layout.hbs`: header with logo/company name, nav
(Home / About / Services / Portfolio / Contact), a phone "Call" link
(`tel:`) and WhatsApp link (`https://wa.me/...`) using the placeholder
number from `company.ts`; footer with placeholder contact summary and
copyright.

- **Home** (`/`) — hero heading + one-line pitch (no photo, text-led per
  reference style), 3-card summary of the service areas linking to
  `/services`, a short "why choose us" value strip, CTA button to
  `/contact`.
- **About** (`/about`) — company introduction, "our story" placeholder
  paragraph (location: Hetauda; founded/registration details marked
  clearly as placeholders), "what we stand for" values section (3 cards,
  e.g. Precision, Local Expertise, Reliability — placeholder copy).
- **Services** (`/services`) — three detailed sections, one per confirmed
  service line: 3D Modeling & CAD Design, Architectural/Structural Design,
  General Engineering Consultancy. Each gets a short description and a
  bullet list of representative offerings (placeholder, editable).
- **Portfolio** (`/portfolio`) — placeholder project gallery (3–4 sample
  cards: title, one-line description, placeholder image), a visible banner
  noting "Sample projects — replace with real project photos and
  descriptions."
- **Contact** (`/contact`) — placeholder phone/email/address, embedded
  Google Map (iframe, using the coordinates above, no API key required for
  a basic embed), and the contact form.

## Contact form

Plain HTML `<form>` posting directly to Formspree
(`action="https://formspree.io/f/PLACEHOLDER_ID" method="POST"`) — no
backend needed at runtime, consistent with static hosting. Fields: name,
email, message. `README.md` documents the one-time step of creating a free
Formspree form and swapping `PLACEHOLDER_ID`.

## Testing

Jest e2e tests (`test/pages.e2e-spec.ts`, Nest's default e2e setup) boot the
full Nest application and assert each of the five routes returns HTTP 200
and contains an expected marker string (e.g. page `<title>`). A second test
runs `render-static.ts` against a temp output directory and asserts all five
expected HTML files (plus `.nojekyll` and copied `public/` assets) exist.

## Out of scope

- Real content: all business copy, contact details, and images are
  placeholders pending owner input — not blocking for this build.
- CMS/admin panel, database, and dynamic contact-form backend — explicitly
  ruled out in favor of static hosting.
- Multi-language (Nepali) support — the reference site has a language
  toggle; not requested for this build, can be a later addition.
