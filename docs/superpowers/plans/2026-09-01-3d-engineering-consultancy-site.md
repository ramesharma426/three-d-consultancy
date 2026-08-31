# 3D Engineering Consultancy Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 3D Engineering Consultancy marketing website: a NestJS app rendering five pages with Handlebars, exported to static HTML, and deployed to GitHub Pages.

**Architecture:** A single NestJS (Express adapter) app with one controller serving five routes, rendered via `hbs` views with shared header/footer partials. A build script boots the same app on an ephemeral port, fetches every route, and writes the HTML plus copied CSS assets to `dist-static/`, which a GitHub Actions workflow publishes to GitHub Pages. No database, no CMS, no server running in production.

**Tech Stack:** NestJS 10 (`@nestjs/platform-express`), `hbs` (Handlebars view engine), Jest + Supertest for e2e tests, Node 20, GitHub Actions (`actions/upload-pages-artifact`, `actions/deploy-pages`).

**Spec:** `docs/superpowers/specs/2026-09-01-3d-engineering-consultancy-site-design.md`

## Global Constraints

- No database, CMS, or dynamic backend — all pages are static at runtime; the only external dynamic behavior is the Formspree-hosted contact form submission.
- Single source of truth for company info: `src/config/company.ts`. No page template hardcodes contact details.
- Visual style: slate-gray palette + sky-blue accent, system sans-serif font stack only (no external font loading — the site must work with zero network font requests).
- Deployment target is GitHub Pages via GitHub Actions (`actions/upload-pages-artifact` + `actions/deploy-pages`); no `gh-pages` branch, no custom server host.
- Node 20, npm (no yarn/pnpm).
- Every page shares the same header (nav + call/WhatsApp buttons) and footer, implemented as `hbs` partials (`views/partials/header.hbs`, `views/partials/footer.hbs`), not duplicated per-page markup.

---

## Task 1: Project Scaffold + Home Page

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `nest-cli.json`
- Create: `test/jest-e2e.json`
- Create: `.gitignore`
- Create: `src/config/company.ts`
- Create: `src/app.config.ts`
- Create: `src/app.module.ts`
- Create: `src/main.ts`
- Create: `src/pages/pages.controller.ts`
- Create: `views/partials/header.hbs`
- Create: `views/partials/footer.hbs`
- Create: `views/home.hbs`
- Create: `public/css/style.css`
- Test: `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces:
  - `company` (const) and `Company` (type) from `src/config/company.ts`, fields: `name`, `tagline`, `location`, `phone`, `phoneHref`, `whatsappHref`, `email`, `address`, `mapCoordinates: { lat: number; lng: number }`, `formspreeAction`, `year`.
  - `configureApp(app: NestExpressApplication): void` from `src/app.config.ts` — sets static assets dir, views dir, view engine, registers partials. Used by `main.ts`, `test/pages.e2e-spec.ts`, and (Task 6) `src/scripts/render-static.ts`.
  - `AppModule` from `src/app.module.ts`.
  - `PagesController` from `src/pages/pages.controller.ts` with a `home()` handler (`@Get() @Render('home')`) returning `{ company }`. Tasks 2–5 add one method each to this same class.
  - `test/pages.e2e-spec.ts` establishes the `beforeAll`/`afterAll` app-boot pattern that Tasks 2–5 append `it()` blocks to.

- [ ] **Step 1: Write project scaffold files**

`package.json`:
```json
{
  "name": "three-d-consultancy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build:static": "npm run build && node dist/scripts/render-static.js",
    "test": "jest --config ./test/jest-e2e.json",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "hbs": "^4.2.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/supertest": "^6.0.0",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.5.0",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.0"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": false,
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

`tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

`nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

`test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "..",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

`.gitignore`:
```
node_modules/
dist/
dist-static/
*.log
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 3: Write the failing e2e test**

`test/pages.e2e-spec.ts`:
```ts
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

describe('Pages (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / renders the home page', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('3D Engineering Consultancy');
    expect(response.text).toContain(
      'Precision Engineering &amp; Design Consultancy',
    );
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — TypeScript compile error, `Cannot find module '../src/app.module'` (none of the source files exist yet).

- [ ] **Step 5: Implement the scaffold, config, and Home page**

`src/config/company.ts`:
```ts
export const company = {
  name: '3D Engineering Consultancy',
  tagline: 'Precision Engineering & Design Consultancy',
  location: 'Hetauda, Makwanpur District, Bagmati Province, Nepal',
  phone: '+977-98XXXXXXXX',
  phoneHref: 'tel:+97798XXXXXXXX',
  whatsappHref: 'https://wa.me/97798XXXXXXXX',
  email: 'info@example.com',
  address: 'Hetauda-XX, Makwanpur, Nepal (placeholder — confirm exact ward/street)',
  mapCoordinates: { lat: 27.4328334, lng: 85.0400641 },
  formspreeAction: 'https://formspree.io/f/PLACEHOLDER_ID',
  year: new Date().getFullYear(),
};

export type Company = typeof company;
```

`src/app.config.ts`:
```ts
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';

export function configureApp(app: NestExpressApplication): void {
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
}
```

`src/pages/pages.controller.ts`:
```ts
import { Controller, Get, Render } from '@nestjs/common';
import { company } from '../config/company';

@Controller()
export class PagesController {
  @Get()
  @Render('home')
  home() {
    return { company };
  }
}
```

`src/app.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { PagesController } from './pages/pages.controller';

@Module({
  controllers: [PagesController],
})
export class AppModule {}
```

`src/main.ts`:
```ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

`views/partials/header.hbs`:
```html
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/">
      <span class="brand-name">{{company.name}}</span>
    </a>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/portfolio">Portfolio</a>
      <a href="/contact">Contact</a>
    </nav>
    <div class="header-actions">
      <a class="btn btn-call" href="{{company.phoneHref}}">Call</a>
      <a class="btn btn-whatsapp" href="{{company.whatsappHref}}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
</header>
```

`views/partials/footer.hbs`:
```html
<footer class="site-footer">
  <div class="container footer-inner">
    <p>{{company.name}} &mdash; {{company.location}}</p>
    <p>{{company.phone}} &middot; {{company.email}}</p>
    <p class="footer-copyright">&copy; {{company.year}} {{company.name}}. All rights reserved.</p>
  </div>
</footer>
```

`views/home.hbs`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{company.name}} — {{company.tagline}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
{{> header}}
<main>
  <section class="hero">
    <div class="container">
      <h1>{{company.tagline}}</h1>
      <p class="hero-lead">3D modeling, structural design, and engineering consultancy for clients in Hetauda and across Nepal.</p>
      <a class="btn btn-primary" href="/contact">Get in touch</a>
    </div>
  </section>

  <section class="services-summary">
    <div class="container grid-3">
      <div class="card">
        <h2>3D Modeling &amp; CAD Design</h2>
        <p>Precise 3D models and CAD drawings for product, mechanical, and construction projects.</p>
      </div>
      <div class="card">
        <h2>Architectural &amp; Structural Design</h2>
        <p>Building design and structural engineering, from concept drawings to construction-ready plans.</p>
      </div>
      <div class="card">
        <h2>General Engineering Consultancy</h2>
        <p>Feasibility studies, project advisory, and technical consultancy across engineering disciplines.</p>
      </div>
    </div>
    <div class="container" style="text-align:center;">
      <a class="btn" href="/services">View all services</a>
    </div>
  </section>

  <section class="values-strip">
    <div class="container grid-3">
      <div class="value"><h3>Precision</h3><p>Detail-focused engineering work you can build on.</p></div>
      <div class="value"><h3>Local Expertise</h3><p>Grounded in Hetauda, familiar with local codes and conditions.</p></div>
      <div class="value"><h3>Reliability</h3><p>Clear communication and dependable delivery.</p></div>
    </div>
  </section>
</main>
{{> footer}}
</body>
</html>
```

`public/css/style.css`:
```css
:root {
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-400: #90a1b9;
  --slate-600: #45556c;
  --slate-700: #314158;
  --slate-900: #0f172a;
  --sky-600: #0284c7;
  --sky-700: #0369a1;
  --white: #ffffff;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--slate-700);
  background: var(--white);
  line-height: 1.6;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

a { color: var(--sky-600); text-decoration: none; }
a:hover { text-decoration: underline; }

h1, h2, h3 { color: var(--slate-900); line-height: 1.25; }

.site-header {
  border-bottom: 1px solid var(--slate-200);
  background: var(--white);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.5rem;
}
.brand-name { font-weight: 700; font-size: 1.25rem; color: var(--slate-900); }
.site-nav { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.site-nav a { color: var(--slate-700); font-weight: 500; }
.header-actions { display: flex; gap: 0.5rem; }

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid var(--slate-200);
  color: var(--slate-700);
}
.btn:hover { text-decoration: none; background: var(--slate-100); }
.btn-primary { background: var(--sky-600); border-color: var(--sky-600); color: var(--white); }
.btn-primary:hover { background: var(--sky-700); }
.btn-call { background: var(--slate-900); color: var(--white); border-color: var(--slate-900); }
.btn-whatsapp { background: #25d366; color: var(--white); border-color: #25d366; }

.hero { background: var(--slate-50); padding: 4rem 0; text-align: center; }
.hero h1 { font-size: 2.25rem; margin-bottom: 1rem; }
.hero-lead { color: var(--slate-600); max-width: 640px; margin: 0 auto 1.5rem; }

.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin: 2rem 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
@media (max-width: 768px) {
  .grid-3 { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}

.card { background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 8px; padding: 1.5rem; }

section { padding: 2.5rem 0; }
.page-intro { background: var(--slate-50); }

.values-strip .value p { color: var(--slate-600); margin: 0; }
.values-strip .value h3 { margin-bottom: 0.4rem; }

.service-detail:nth-child(even) { background: var(--slate-50); }

.notice {
  background: var(--slate-100);
  border: 1px solid var(--slate-200);
  color: var(--slate-700);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin: 1rem 0;
}
.portfolio-thumb {
  height: 140px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--slate-200), var(--slate-400));
  margin-bottom: 1rem;
}

.contact-form { display: flex; flex-direction: column; gap: 0.5rem; }
.contact-form label { font-weight: 600; color: var(--slate-700); margin-top: 0.5rem; }
.contact-form input, .contact-form textarea {
  padding: 0.6rem;
  border: 1px solid var(--slate-200);
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
}
.contact-form button { margin-top: 1rem; align-self: flex-start; }
.map-embed iframe { border-radius: 8px; border: 0; }

.site-footer { background: var(--slate-900); color: var(--slate-200); margin-top: 2rem; }
.footer-inner { padding: 2rem 1.5rem; text-align: center; }
.footer-inner p { margin: 0.25rem 0; }
.footer-copyright { color: var(--slate-400); font-size: 0.875rem; margin-top: 0.75rem; }
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS — 1 test passed.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.build.json nest-cli.json .gitignore test/jest-e2e.json test/pages.e2e-spec.ts src/ views/ public/
git commit -m "feat: scaffold NestJS app with Home page"
```

---

## Task 2: About Page

**Files:**
- Modify: `src/pages/pages.controller.ts`
- Create: `views/about.hbs`
- Modify: `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: `PagesController` (Task 1), `company` config, `views/partials/header.hbs` / `footer.hbs`.
- Produces: `about()` handler (`@Get('about') @Render('about')`) on `PagesController`, returning `{ company }`.

- [ ] **Step 1: Write the failing test**

Append to `test/pages.e2e-spec.ts` (inside the existing `describe` block, after the `/` test):
```ts
  it('GET /about renders the about page', async () => {
    const response = await request(app.getHttpServer()).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toContain('What We Stand For');
    expect(response.text).toContain('Hetauda');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `GET /about` returns 404 (no route defined yet).

- [ ] **Step 3: Implement the About page**

In `src/pages/pages.controller.ts`, add a method to `PagesController` (after `home()`):
```ts
  @Get('about')
  @Render('about')
  about() {
    return { company };
  }
```

`views/about.hbs`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About — {{company.name}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
{{> header}}
<main>
  <section class="page-intro">
    <div class="container">
      <h1>About {{company.name}}</h1>
      <p>{{company.name}} is an engineering consultancy based in {{company.location}}, providing 3D modeling, structural design, and general engineering consultancy to clients across Nepal.</p>
    </div>
  </section>

  <section class="our-story">
    <div class="container">
      <h2>Our Story</h2>
      <p><em>Placeholder — replace with the real company history.</em> {{company.name}} was founded to bring precise, dependable engineering and 3D design services to Hetauda and the surrounding region, combining technical rigor with a practical understanding of local projects.</p>
    </div>
  </section>

  <section class="values">
    <div class="container">
      <h2>What We Stand For</h2>
      <div class="grid-3">
        <div class="card">
          <h3>Precision</h3>
          <p>Every model and drawing is checked against real-world engineering requirements.</p>
        </div>
        <div class="card">
          <h3>Local Expertise</h3>
          <p>Based in Hetauda, with first-hand knowledge of local sites, codes, and suppliers.</p>
        </div>
        <div class="card">
          <h3>Reliability</h3>
          <p>Clear timelines, clear communication, and consistent delivery on every project.</p>
        </div>
      </div>
    </div>
  </section>
</main>
{{> footer}}
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS — 2 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/pages.controller.ts views/about.hbs test/pages.e2e-spec.ts
git commit -m "feat: add About page"
```

---

## Task 3: Services Page

**Files:**
- Modify: `src/pages/pages.controller.ts`
- Create: `views/services.hbs`
- Modify: `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: `PagesController` (Task 1), `company` config, header/footer partials.
- Produces: `services()` handler (`@Get('services') @Render('services')`) on `PagesController`, returning `{ company }`.

- [ ] **Step 1: Write the failing test**

Append to `test/pages.e2e-spec.ts`:
```ts
  it('GET /services renders the services page', async () => {
    const response = await request(app.getHttpServer()).get('/services');
    expect(response.status).toBe(200);
    expect(response.text).toContain('3D Modeling &amp; CAD Design');
    expect(response.text).toContain('General Engineering Consultancy');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `GET /services` returns 404.

- [ ] **Step 3: Implement the Services page**

In `src/pages/pages.controller.ts`, add (after `about()`):
```ts
  @Get('services')
  @Render('services')
  services() {
    return { company };
  }
```

`views/services.hbs`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services — {{company.name}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
{{> header}}
<main>
  <section class="page-intro">
    <div class="container">
      <h1>Our Services</h1>
      <p>Engineering and design services tailored to your project, from first concept to construction-ready documentation.</p>
    </div>
  </section>

  <section class="service-detail">
    <div class="container">
      <h2>3D Modeling &amp; CAD Design</h2>
      <p>Detailed 3D models and CAD drawings for mechanical, product, and construction applications.</p>
      <ul>
        <li>3D solid modeling and assemblies</li>
        <li>2D CAD drafting and detailing</li>
        <li>Design review and revisions</li>
        <li>Rendering for presentation and client review</li>
      </ul>
    </div>
  </section>

  <section class="service-detail">
    <div class="container">
      <h2>Architectural &amp; Structural Design</h2>
      <p>Building design and structural engineering from concept through construction-ready plans.</p>
      <ul>
        <li>Architectural concept and layout design</li>
        <li>Structural analysis and design</li>
        <li>Construction drawing sets</li>
        <li>Site assessment and coordination</li>
      </ul>
    </div>
  </section>

  <section class="service-detail">
    <div class="container">
      <h2>General Engineering Consultancy</h2>
      <p>Independent technical advice across the life of a project.</p>
      <ul>
        <li>Feasibility studies</li>
        <li>Project technical advisory</li>
        <li>Quality and compliance review</li>
        <li>Engineering documentation support</li>
      </ul>
    </div>
  </section>
</main>
{{> footer}}
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/pages.controller.ts views/services.hbs test/pages.e2e-spec.ts
git commit -m "feat: add Services page"
```

---

## Task 4: Portfolio Page

**Files:**
- Modify: `src/pages/pages.controller.ts`
- Create: `views/portfolio.hbs`
- Modify: `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: `PagesController` (Task 1), `company` config, header/footer partials, `.notice`/`.portfolio-thumb` CSS classes (already defined in Task 1's `style.css`).
- Produces: `portfolio()` handler (`@Get('portfolio') @Render('portfolio')`) on `PagesController`, returning `{ company }`.

- [ ] **Step 1: Write the failing test**

Append to `test/pages.e2e-spec.ts`:
```ts
  it('GET /portfolio renders the portfolio page', async () => {
    const response = await request(app.getHttpServer()).get('/portfolio');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Sample projects');
    expect(response.text).toContain('Sample Residential Structural Design');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `GET /portfolio` returns 404.

- [ ] **Step 3: Implement the Portfolio page**

In `src/pages/pages.controller.ts`, add (after `services()`):
```ts
  @Get('portfolio')
  @Render('portfolio')
  portfolio() {
    return { company };
  }
```

`views/portfolio.hbs`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio — {{company.name}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
{{> header}}
<main>
  <section class="page-intro">
    <div class="container">
      <h1>Portfolio</h1>
      <div class="notice">Sample projects — replace with real project photos and descriptions.</div>
    </div>
  </section>

  <section class="portfolio-grid">
    <div class="container grid-3">
      <div class="card portfolio-card">
        <div class="portfolio-thumb" aria-hidden="true"></div>
        <h3>Sample Residential Structural Design</h3>
        <p>Structural design and drawings for a residential building project.</p>
      </div>
      <div class="card portfolio-card">
        <div class="portfolio-thumb" aria-hidden="true"></div>
        <h3>Sample Mechanical 3D Model</h3>
        <p>3D modeling and CAD detailing for a mechanical component assembly.</p>
      </div>
      <div class="card portfolio-card">
        <div class="portfolio-thumb" aria-hidden="true"></div>
        <h3>Sample Feasibility Study</h3>
        <p>Technical feasibility review and consultancy for a small commercial project.</p>
      </div>
    </div>
  </section>
</main>
{{> footer}}
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/pages.controller.ts views/portfolio.hbs test/pages.e2e-spec.ts
git commit -m "feat: add Portfolio page"
```

---

## Task 5: Contact Page

**Files:**
- Modify: `src/pages/pages.controller.ts`
- Create: `views/contact.hbs`
- Modify: `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: `PagesController` (Task 1), `company` config (`formspreeAction`, `address`, `phone`, `email`, `mapCoordinates`), header/footer partials, `.contact-form`/`.map-embed`/`.grid-2` CSS classes (already defined in Task 1's `style.css`).
- Produces: `contact()` handler (`@Get('contact') @Render('contact')`) on `PagesController`, returning `{ company }`.

- [ ] **Step 1: Write the failing test**

Append to `test/pages.e2e-spec.ts`:
```ts
  it('GET /contact renders the contact page', async () => {
    const response = await request(app.getHttpServer()).get('/contact');
    expect(response.status).toBe(200);
    expect(response.text).toContain(
      'action="https://formspree.io/f/PLACEHOLDER_ID"',
    );
    expect(response.text).toContain('maps?q=27.4328334,85.0400641');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `GET /contact` returns 404.

- [ ] **Step 3: Implement the Contact page**

In `src/pages/pages.controller.ts`, add (after `portfolio()`):
```ts
  @Get('contact')
  @Render('contact')
  contact() {
    return { company };
  }
```

`views/contact.hbs`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact — {{company.name}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
{{> header}}
<main>
  <section class="page-intro">
    <div class="container">
      <h1>Contact Us</h1>
      <p>{{company.address}}</p>
      <p>{{company.phone}} &middot; {{company.email}}</p>
    </div>
  </section>

  <section class="contact-grid">
    <div class="container grid-2">
      <form class="contact-form" action="{{company.formspreeAction}}" method="POST">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>

        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>

        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" required></textarea>

        <button type="submit" class="btn btn-primary">Send Message</button>
      </form>

      <div class="map-embed">
        <iframe
          title="{{company.name}} location"
          width="100%"
          height="320"
          loading="lazy"
          src="https://www.google.com/maps?q={{company.mapCoordinates.lat}},{{company.mapCoordinates.lng}}&z=16&output=embed">
        </iframe>
      </div>
    </div>
  </section>
</main>
{{> footer}}
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS — 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/pages.controller.ts views/contact.hbs test/pages.e2e-spec.ts
git commit -m "feat: add Contact page"
```

---

## Task 6: Static Export Script

**Files:**
- Create: `src/scripts/render-static.ts`
- Test: `test/render-static.e2e-spec.ts`

**Interfaces:**
- Consumes: `AppModule`, `configureApp` (Task 1), all five routes (Tasks 1–5).
- Produces: `renderStatic(outDir: string): Promise<void>` from `src/scripts/render-static.ts` — writes `index.html` for `/`, `<route>/index.html` for each other route, copies `public/` contents into `outDir`, writes `outDir/.nojekyll`. A CLI entry point runs `renderStatic(path.join(process.cwd(), 'dist-static'))` when the compiled file is executed directly (used by the `build:static` npm script from Task 1's `package.json`).

- [ ] **Step 1: Write the failing test**

`test/render-static.e2e-spec.ts`:
```ts
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { renderStatic } from '../src/scripts/render-static';

describe('renderStatic (e2e)', () => {
  const outDir = path.join(os.tmpdir(), `render-static-test-${Date.now()}`);

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('writes static HTML files and copied assets for every route', async () => {
    await renderStatic(outDir);

    expect(fs.existsSync(path.join(outDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'about', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'services', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'portfolio', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'contact', 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'css', 'style.css'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, '.nojekyll'))).toBe(true);

    const homeHtml = fs.readFileSync(path.join(outDir, 'index.html'), 'utf-8');
    expect(homeHtml).toContain('3D Engineering Consultancy');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — `Cannot find module '../src/scripts/render-static'`.

- [ ] **Step 3: Implement the static export script**

`src/scripts/render-static.ts`:
```ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';
import { configureApp } from '../app.config';

const ROUTES = ['/', '/about', '/services', '/portfolio', '/contact'];

function routeToOutputPath(route: string, outDir: string): string {
  if (route === '/') {
    return path.join(outDir, 'index.html');
  }
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

export async function renderStatic(outDir: string): Promise<void> {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });
  configureApp(app);
  await app.listen(0);

  const address = app.getHttpServer().address();
  const port = typeof address === 'string' || address === null ? 0 : address.port;
  const baseUrl = `http://127.0.0.1:${port}`;

  for (const route of ROUTES) {
    const response = await fetch(`${baseUrl}${route}`);
    const html = await response.text();
    const outputPath = routeToOutputPath(route, outDir);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
  }

  await app.close();

  fs.cpSync(path.join(__dirname, '..', '..', 'public'), outDir, {
    recursive: true,
  });
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
}

if (require.main === module) {
  const outDir = path.join(process.cwd(), 'dist-static');
  renderStatic(outDir)
    .then(() => {
      console.log(`Static site written to ${outDir}`);
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Verify the npm script works end-to-end**

Run: `npm run build:static`
Expected: builds successfully, prints `Static site written to <path>/dist-static`, and `dist-static/index.html`, `dist-static/about/index.html`, `dist-static/services/index.html`, `dist-static/portfolio/index.html`, `dist-static/contact/index.html`, `dist-static/css/style.css`, `dist-static/.nojekyll` all exist.

Run: `ls dist-static dist-static/about dist-static/css`
Expected: files listed above are present.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/render-static.ts test/render-static.e2e-spec.ts
git commit -m "feat: add static export script"
```

---

## Task 7: GitHub Actions Deployment + README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: `npm run build:static` (Task 6), producing `dist-static/`.
- Produces: a GitHub Actions workflow that deploys `dist-static/` to GitHub Pages on push to `main`.

- [ ] **Step 1: Write the deployment workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:static
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist-static

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate the workflow YAML parses correctly**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('OK')"`
Expected: `OK` printed, no exception.

- [ ] **Step 3: Write the README**

`README.md`:
```markdown
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
```

- [ ] **Step 4: Verify the full test suite and static build still pass**

Run: `npm run test:e2e && npm run build:static`
Expected: all 6 e2e tests pass, static build completes successfully.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "docs: add deployment workflow and README"
```

---

## Self-Review Notes

- **Spec coverage:** NestJS + hbs architecture (Task 1), all five pages (Tasks 1–5), placeholder company config as single source of truth (Task 1), Formspree contact form + map embed (Task 5), static export via ephemeral-port fetch (Task 6, matches spec's build-time rendering requirement — implemented via `app.listen(0)` + HTTP fetch rather than in-process injection, since the spec's Express adapter doesn't support Fastify-style `light-my-request` injection), GitHub Actions deployment to GitHub Pages (Task 7), README documenting placeholder swaps (Task 7). Jest e2e tests for all routes and the build script (Tasks 1–6) satisfy the spec's testing section.
- **Deviations from spec (both implementation-detail-level, noted for the reviewer):** shared header/footer are implemented as `hbs` partials included per-page (`{{> header}}` / `{{> footer}}`) rather than a single wrapping `layout.hbs`, since the `hbs` npm package has no built-in layout-wrapping feature — this achieves the same "shared header/nav/footer across all pages" requirement. The static export script lives at `src/scripts/render-static.ts` (compiled to `dist/scripts/render-static.js`) rather than a top-level `scripts/` directory, so it participates in the normal Nest/tsc build and can import `AppModule` directly.
- **Placeholder scan:** no TBD/TODO in any step; all code blocks are complete. The literal strings `PLACEHOLDER_ID` and `98XXXXXXXX` are intentional in-app placeholders (per spec), documented in the README's "Replacing placeholder content" section.
- **Type consistency:** `configureApp(app: NestExpressApplication): void` (Task 1) is used identically in `main.ts`, `test/pages.e2e-spec.ts`, and `src/scripts/render-static.ts` (Task 6). `company` import path (`../config/company` from `src/pages/`, `../app.module`/`../app.config` from `src/scripts/`) is consistent across all tasks. `renderStatic(outDir: string): Promise<void>` signature matches its use in Task 6's test and in the CLI entry point.
