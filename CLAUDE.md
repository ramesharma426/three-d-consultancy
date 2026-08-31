# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A marketing website for 3D Engineering Consultancy (Hetauda, Nepal). It is a single-page site: one scrolling page with a fixed left sidebar nav linking to in-page sections (Top/About/Services/Portfolio/Contact), styled after sharma-ramesh.com.np. NestJS is used purely as a page renderer during development, but the site is **deployed as static HTML to GitHub Pages** — there is no server running in production. The page is server-rendered via Handlebars during `npm run start:dev`, then exported to a plain file by a build script.

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

**Request flow:** `src/main.ts` boots the Nest app and calls `configureApp()` (`src/app.config.ts`), which wires up the `hbs` view engine, static asset serving, and Handlebars partials. `PagesController` (`src/pages/pages.controller.ts`) has a single `@Get() @Render('home')` handler returning `{ company }` — there is only one route (`/`). `views/home.hbs` is the entire site: five `<section id="...">` blocks (`top`, `about`, `services`, `portfolio`, `contact`) stacked in one scroll, each targeted by an anchor link. `views/partials/sidebar.hbs` provides the fixed-left desktop nav (`.sidebar`, hidden below 1024px) and a `.topbar` fallback for mobile, both linking to the same section ids; `views/partials/footer.hbs` closes the page. There is no wrapping layout file — `home.hbs` includes both partials directly via `{{> sidebar}}` / `{{> footer}}`.

**Single source of truth for content:** `src/config/company.ts` exports one `company` object (name, tagline, contact info, map coordinates, `basePath`). No template hardcodes contact details — everything flows through `{{company.*}}`. When updating business info, this is the only file to touch.

**Active-section highlighting:** `public/js/scrollspy.js` (plain JS, no build step, loaded via `<script defer>` in `home.hbs`) uses an `IntersectionObserver` to toggle `.is-on` on the sidebar tick matching the section currently in view. It keys off the sidebar's own `href="#id"` values, so a new section only needs a matching `id` on its `<section>` and a corresponding `<a href="#id">` in `sidebar.hbs` — no JS changes needed to add one.

**Static export (`src/scripts/render-static.ts`):** Since GitHub Pages can't run a Node server, `npm run build:static` boots the real Nest app on an OS-assigned ephemeral port (`app.listen(0)`), fetches `/` over real HTTP, and writes it to `dist-static/index.html`. `public/`'s contents (including `js/scrollspy.js`) are copied to the root of `dist-static/` afterward (not nested under a `public/` subfolder) so asset paths line up with what the template references (`/css/style.css`, `/js/scrollspy.js`).

**GitHub Pages base path:** GitHub Pages serves a project repo at `https://<user>.github.io/<repo-name>/`, not the domain root. `home.hbs` and `sidebar.hbs` stay root-relative for asset paths (`href="/css/style.css"`) — in-page nav links are same-page anchors (`href="#about"`) and are unaffected by this entirely. Only `render-static.ts` rewrites root-relative hrefs at export time — a text-level `href="/` → `href="{company.basePath}/` replacement on the fetched HTML before writing it to disk. `company.basePath` (currently `/three-d-consultancy`) **must match the actual GitHub repo name**, or the stylesheet/script references will 404 once deployed. If the repo is renamed, or the site moves to a custom domain or a `<user>.github.io` user/org repo, update `basePath` (empty string `''` for the latter two).

**Partial registration is synchronous by necessity:** `configureApp()` reads and registers `views/partials/*.hbs` with `fs.readdirSync`/`readFileSync` rather than the `hbs` package's own async `registerPartials()` — the async version has no awaited callback and previously created a race where a request could arrive before partials were registered, throwing "partial could not be found". Don't revert this to the async form.

**Deploy pipeline (`.github/workflows/deploy.yml`):** on push to `main`, runs `npm ci` → `npm run test:e2e` → `npm run build:static` → uploads `dist-static/` via `actions/upload-pages-artifact` + `actions/deploy-pages`. The test step is a deliberate gate — `render-static.ts` throws on any non-2xx response (so a broken build fails loudly rather than silently deploying an error page), and CI must actually run the suite to catch it before it can act.

## Design system

Adapted from `sharma-ramesh.com.np` (the user's own portfolio site): warm grayscale palette (`--ink #0a0a0a` text, `--paper #ffffff` background — white per explicit request, the reference itself defaults to dark), `--cream #f5f0e6` for alternating section tints, Familjen Grotesk for headings/body, Martian Mono for the sidebar/labels/footer copyright. No colored accent — the only "accent" is the ink/paper monochrome contrast (buttons and the active sidebar tick invert). No decorative "eyebrow" divider labels — tried and explicitly rejected by the user.

## Content state

All contact info in `company.ts` (phone, email, address) is real, sourced from the business's Facebook page. The Portfolio section in `home.hbs` (`id="portfolio"`) still shows placeholder sample projects — replace with real project photos/descriptions when available. There is no contact form; the Contact section shows address/phone/email plus an embedded Google Maps iframe (keyless embed, no API key needed).
