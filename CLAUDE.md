# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A marketing website for 3D Engineering Consultancy (Hetauda, Nepal). It is a single-page site: one scrolling page with a fixed left sidebar nav linking to in-page sections (Top/About/Services/Portfolio/Contact), styled after sharma-ramesh.com.np, with a client-side English/Nepali content toggle (see below). NestJS is used purely as a page renderer during development, but the site is **deployed as static HTML to GitHub Pages** (custom domain `engconsultancy3d.com.np`) — there is no server running in production. The page is server-rendered via Handlebars during `npm run start:dev`, then exported to a plain file by a build script.

## Commands

```bash
npm install
npm run start:dev      # dev server with hot reload, http://localhost:3000
npm run test:e2e       # full e2e suite (also aliased as `npm test`)
npm run build:static   # compiles + exports the static site to dist-static/
```

Run a single test file: `npx jest --config ./test/jest-e2e.json test/pages.e2e-spec.ts`
Run a single test by name: `npx jest --config ./test/jest-e2e.json -t "includes the About section"`

There is no lint script configured.

To validate the deploy workflow YAML after editing it:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('OK')"
```

## Architecture

**Request flow:** `src/main.ts` boots the Nest app and calls `configureApp()` (`src/app.config.ts`), which wires up the `hbs` view engine, static asset serving, and Handlebars partials. `PagesController` (`src/pages/pages.controller.ts`) has a single `@Get() @Render('home')` handler returning `{ company, portfolioPhotos }` — there is only one route (`/`). `views/home.hbs` is the entire site: five `<section id="...">` blocks (`top`, `about`, `services`, `portfolio`, `contact`) stacked in one scroll, each targeted by an anchor link. `views/partials/sidebar.hbs` provides the fixed-left desktop nav (`.sidebar`, hidden below 1024px) and a `.topbar` fallback for mobile, both linking to the same section ids; `views/partials/footer.hbs` closes the page; `views/partials/float-contact.hbs` renders the fixed-position Messenger/WhatsApp bubbles (bottom-right, all viewports). There is no wrapping layout file — `home.hbs` includes all three partials directly via `{{> sidebar}}` / `{{> footer}}` / `{{> float-contact}}`. **Adding a partial file requires a dev-server restart**, not just a save — `configureApp()` reads the partials directory once at boot (`fs.readdirSync`), so a newly-*added* file isn't picked up by hot reload the way edits to an existing partial are; this bit twice while building float-contact.hbs (500 error, stale process still bound to :3000 serving pre-partial code).

**Single source of truth for content:** `src/config/company.ts` exports one `company` object (name, tagline, contact info, map coordinates, `basePath`, `siteUrl`). No template hardcodes contact details — everything flows through `{{company.*}}`. When updating business info, this is the only file to touch.

**Active-section highlighting:** `public/js/scrollspy.js` (plain JS, no build step, loaded via `<script defer>` in `home.hbs`) uses an `IntersectionObserver` to toggle `.is-on` on the sidebar tick matching the section currently in view. It keys off the sidebar's own `href="#id"` values, so a new section only needs a matching `id` on its `<section>` and a corresponding `<a href="#id">` in `sidebar.hbs` — no JS changes needed to add one.

**Static export (`src/scripts/render-static.ts`):** Since GitHub Pages can't run a Node server, `npm run build:static` boots the real Nest app on an OS-assigned ephemeral port (`app.listen(0)`), fetches `/` over real HTTP, and writes it to `dist-static/index.html`. `public/`'s contents (including `js/scrollspy.js`) are copied to the root of `dist-static/` afterward (not nested under a `public/` subfolder) so asset paths line up with what the template references (`/css/style.css`, `/js/scrollspy.js`).

**GitHub Pages base path / custom domain:** GitHub Pages serves a bare project repo at `https://<user>.github.io/<repo-name>/`, not the domain root — but this site is served from the custom domain `engconsultancy3d.com.np` (configured in the repo's GitHub Pages settings and mirrored in `public/CNAME`, which `render-static.ts` copies into `dist-static/` on every build so the Actions-based deploy doesn't drop the custom domain). A custom domain is served at its own root, so `company.basePath` is `''`. Only set `basePath` back to `/<repo-name>` if the custom domain is ever removed and the site falls back to the default `<user>.github.io/<repo-name>/` URL — and if you do, note that `render-static.ts`'s rewrite only matches `href="/` (not `src="/`), so any `<img src="/...">` or `<script src="/...">` would need the same treatment added, or they'll 404 under a non-root base path. `home.hbs` and `sidebar.hbs` stay root-relative for asset paths (`href="/css/style.css"`, `src="/images/logo-mark.png"`) — in-page nav links are same-page anchors (`href="#about"`) and are unaffected by any of this.

**Partial registration is synchronous by necessity:** `configureApp()` reads and registers `views/partials/*.hbs` with `fs.readdirSync`/`readFileSync` rather than the `hbs` package's own async `registerPartials()` — the async version has no awaited callback and previously created a race where a request could arrive before partials were registered, throwing "partial could not be found". Don't revert this to the async form.

**Deploy pipeline (`.github/workflows/deploy.yml`):** on push to `main`, runs `npm ci` → `npm run test:e2e` → `npm run build:static` → uploads `dist-static/` via `actions/upload-pages-artifact` + `actions/deploy-pages`. The test step is a deliberate gate — `render-static.ts` throws on any non-2xx response (so a broken build fails loudly rather than silently deploying an error page), and CI must actually run the suite to catch it before it can act.

## Design system

Base layout adapted from `sharma-ramesh.com.np` (the user's own portfolio site): `--ink #0a0a0a` text, `--paper #ffffff` background (white per explicit request), Familjen Grotesk for headings/body, Martian Mono for the sidebar/labels/footer copyright. No decorative "eyebrow" divider labels — tried and explicitly rejected by the user.

The color accent comes from the client-supplied logo (a navy "31" building mark, tagline "Design Develop Deliver"): `--navy #1a2f52` and `--navy-deep #0d1b33` are sampled from it and drive the primary buttons, the active sidebar-tick state, `em` emphasis, and the footer background (`.site-footer`, previously plain `--ink` black). `--tint #eef1f6` (a cool blue-gray, replacing an earlier warm `--cream`) is the alternating-section background, chosen to stay in the same cool family as the logo. Body text and headings stay near-black (`--ink`, `--ink-soft`, `--stone`) for readability — navy is reserved for accents, not prose.

**Logo assets (`public/images/`):** the source logo (500×500, solid black background) was chroma-keyed to transparent with a Python/Pillow script (threshold on max(R,G,B) since the background is pure/near-black and the logo's darkest navy tones are well above that threshold) — there's no build step for this, the script was run once and its outputs committed as static PNGs:
- `logo-full.png` — tightly-cropped full logo (icon + "Design Develop Deliver" tagline). Used in the sidebar mark (`sidebar.hbs`) and referenced by the JSON-LD `image` field. It's 46px wide collapsed, legible as a compact wordmark, and grows to 160px with a `transition: width 0.25s ease` when `.sidebar:hover`/`:focus-within` (`.sidebar-mark-icon` in `style.css`) — same expand trigger as the nav-tick labels, so it grows/shrinks in step with the rail opening and closing.
- `logo-mark.png` — tight-cropped "31" icon only (no tagline), used in the mobile topbar brand and the footer.
- `favicon-16/32/192.png`, `apple-touch-icon.png`, and `../favicon.ico` (multi-size) — generated from a square-padded version of the mark.
- `og-image.png` — 1200×630 white-background social preview card, referenced by the Open Graph/Twitter meta tags.

`company.shortName` (a "3DEC" text abbreviation) was removed — the sidebar mark used to pair it with the icon, but now shows the full logo image instead, so there's no text fallback for it. If the logo is ever replaced, regenerate all of the above from the new source rather than hand-editing — the crop coordinates and chroma-key threshold in this description are specific to the current file.

## English/Nepali toggle

The site ships both languages in every render and switches between them client-side — there's no `/ne` route and no server-side language negotiation, consistent with the single static `index.html` export. Every translatable piece of copy in `home.hbs` and the partials is a pair of adjacent elements: `<span data-i18n-en>English</span><span data-i18n-ne hidden>नेपाली</span>` (the `hidden` attribute lives only on the Nepali span, so the page reads correctly in English even with JS disabled or before `public/js/i18n.js` runs). `i18n.js` reads `localStorage.lang` (default `'en'`) on load and sets `.hidden` on every `[data-i18n-en]`/`[data-i18n-ne]` pair accordingly, plus toggles `aria-pressed` on the `.lang-toggle` EN/ने buttons (in the sidebar foot and the mobile topbar) and updates `<html lang>`. Adding a new piece of copy means adding both spans by hand — there's no translation-key/JSON-file indirection.

`[data-i18n-ne]` gets `font-family: var(--font-devanagari)` (Noto Sans Devanagari, loaded alongside the other two Google Fonts) since Familjen Grotesk has no Devanagari glyphs.

Scope note: only on-page copy is bilingual. `<title>`, meta description, Open Graph/Twitter tags, and the JSON-LD block stay English-only — they're static per-request HTML, so toggling them would need either real hreflang-alternate pages or JS-rewritten meta tags (which crawlers mostly ignore anyway). If true bilingual SEO is ever wanted, that's a bigger change than this toggle.

`company.taglineNe` holds the Nepali hero tagline (paired with `company.tagline`) since the hero heading is data-driven; all other Nepali strings are hardcoded directly in the templates next to their English counterparts, matching how the English prose already lives in `home.hbs` rather than `company.ts`.

## SEO

`home.hbs`'s `<head>` carries a meta description, `robots` tag, canonical link, `theme-color`, full Open Graph + Twitter Card tags (pointing at `og-image.png`), and a `ProfessionalService` JSON-LD block — all driven by `company.*` fields (`siteUrl` especially) rather than hardcoded. `public/robots.txt` and `public/sitemap.xml` are static files copied verbatim by `render-static.ts`; both hardcode `https://engconsultancy3d.com.np` since they can't reference `company.ts` at request time — if the domain ever changes, update `company.siteUrl` **and** these two files together. `sameAs` in the JSON-LD block links `company.facebookHref`.

**Handlebars escapes `=` inside `<script type="application/ld+json">` — use triple-stash there.** Default `{{...}}` HTML-escaping turns `=` into `&#x3D;`, which is harmless in an `href="..."` attribute (the browser decodes it back on parse) but corrupts a URL sitting in a `<script>` block's raw text, since script content isn't HTML-entity-decoded. Bit us on `company.facebookHref` (`.../profile.php?id=...`) — the `sameAs` field must use `{{{company.facebookHref}}}`, not `{{company.facebookHref}}`. Only do this for trusted `company.ts` values, never for anything resembling user input.

## Contact bubbles

`views/partials/float-contact.hbs` renders two `position: fixed; bottom-right` circular buttons (`.float-contact` / `.float-bubble`) — Messenger (`company.messengerHref`, `https://m.me/<page-id>`) on top, WhatsApp (`company.whatsappHref`) below, both `target="_blank"`. Icons are inline SVGs (no icon font/library, no image requests) using the standard Simple Icons brand paths, colored via each bubble's own `background` (`--messenger: #0084ff`-equivalent literal, WhatsApp `#25d366` — not tied to the site's `--navy` palette, since these are recognizable brand colors, not site accents). `z-index: 40`, below the lightbox's `100` so an open lightbox always sits on top.

## Content state

All contact info in `company.ts` (phone, email, address, Facebook, Messenger) is real, sourced from the business's Facebook page. There is no contact form; the Contact section shows address/phone/email/Facebook plus an embedded Google Maps iframe (keyless embed, no API key needed), plus the fixed Messenger/WhatsApp bubbles (see Contact bubbles). Logo and favicon are real (client-supplied); SEO metadata is in place and points at the live custom domain.

**Portfolio (`id="portfolio"`):** "Sample Residential Structural Design" is a real project — it's pulled out of the placeholder `.grid-3` into its own full-width `.portfolio-feature` block with a photo carousel. The other two portfolio items ("Sample Mechanical 3D Model", "Sample Feasibility Study") are still placeholders, in a `.grid-2` row below the feature block — replace them the same way when real photos exist for those. Source photos (PNGs with the company's own watermark baked in) were converted to JPEG (quality 82, capped at 1600px on the long edge) via a one-off Pillow script — resized, never cropped — landing at `public/images/portfolio/residential-01.jpg` … `residential-15.jpg`. `PagesController`'s `portfolioPhotos` array length (currently 15) is the only place the photo count is set — bump it and add the matching JPEGs to extend the carousel. **Before adding a new batch of photos, check for duplicates against the existing files** — an MD5-of-raw-pixels comparison (`Image.open(path).convert('RGB').tobytes()` hashed, not a file-level hash, since re-exports of the same render can differ byte-for-byte while being pixel-identical) caught one exact duplicate across two upload batches that a plain file hash or eyeballing missed.

**Portfolio carousel (`public/js/carousel.js`) + lightbox (`public/js/lightbox.js`):** `PagesController.home()` builds a `portfolioPhotos` array (`{ n, src }` for the residential JPEGs) and passes it to `home.hbs`, which loops it with `{{#each}}` into `.carousel-card` `<button>`s, each wrapping a plain `<img class="carousel-card-img">`. Cards deliberately carry no badge or title text — an earlier version had a "Gallery" badge plus a title/"view full size" link baked into a dark gradient overlay, but the user asked for both removed, so the card is just the photo. **Each `<img>` uses `object-fit: contain` inside a fixed `aspect-ratio: 4/3` box, never `cover`** — the source photos have mixed aspect ratios (some portrait, some square) and the company's watermark sits in the bottom-left corner, so `cover`-cropping a non-4:3 photo could slice the watermark off; `contain` always shows the whole photo, letterboxed against `var(--tint)` if needed. Don't reintroduce `background-size: cover` here without re-checking every source photo's aspect ratio against the watermark position.

`carousel.js` is a `[data-carousel]`-scoped vanilla controller — no library — that toggles `.is-active` on the current card and translates `.carousel-track` so that card is horizontally centered in the viewport (computed from `offsetLeft`/`offsetWidth`, so it's agnostic to card width and gap); inactive cards are dimmed/scaled via CSS (`.carousel-card` vs `.carousel-card.is-active`). Auto-advances every 4s via `setInterval`, paused on hover/focus and resumed on the corresponding leave/blur; prev/next are plain circular buttons, no dot indicators. Adding a 7th photo only requires extending `portfolioPhotos` in the controller — the template and JS don't hardcode a count.

Clicking any card (`[data-lightbox-src]`) opens `lightbox.js`'s modal instead of navigating — a single reusable overlay is appended to `<body>` once, sized/populated per click (`img.src` swapped, not a new element per card). Closes via the × button, clicking the backdrop, or Escape; `body.lightbox-open` sets `overflow:hidden` while open. This replaced an earlier version where each card's image linked out to the JPEG in a new tab (`target="_blank"`) — the user asked for an in-page modal instead.
