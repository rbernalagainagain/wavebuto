# Tech stack

## Page

- **Angular 22**, standalone and zoneless.
- **Prerendered to static HTML** at build time (`@angular/ssr` with `outputMode: "static"`), then hydrated in the browser. There is no
  runtime server rendering.
- **Signal Forms** (`@angular/forms/signals`) for the appointment form.
- **Zod** for the form's validation rules.
- **Plain CSS.** No CSS framework or preprocessor.
- **Fonts from Google Fonts** (decided by the developer, 2026-11-06). The design's fonts (Geist 300 and 900, Geist Mono 500,
  Instrument Sans 400 and 700) load through one stylesheet `<link>` in `src/index.html`, with `display=swap`;
  the production build inlines that stylesheet into each page, and the font files come from `fonts.gstatic.com`. It is the only
  thing loaded from another domain: lint allows that one origin in that one file. Each family's stack ends in a system
  fallback. Google receives each visitor's IP address when the fonts load, so the privacy notice has to say so.
- **Responsive, mobile first.** The base styles are the phone layout and work from 320px wide. Wider screens add to them with
  `min-width` media queries, never `max-width`, at one breakpoint: `40rem`. A second breakpoint is a change to this file. Text sizes
  scale fluidly, and images and the video scale to the width of their column. stylelint enforces the media-query rules.

## Languages

- **Angular's built-in i18n** (`@angular/localize`): each language is prerendered as its own page, `/en/` and `/es/`, so search engines
  see both.
- **`/` has no language of its own.** The Worker answers it with a redirect to `/es/` when the browser's `Accept-Language` prefers
  Spanish, and to `/en/` otherwise. A redirect keeps the link's anchor, so `/#contact` opens the form in the chosen language.
- Translations are compiled into each page at build time; no translation file is loaded at runtime.

## Hosting and email

- **Cloudflare Workers** serves the prerendered pages as static assets. An unknown path answers 404.
- **A Worker on `/api/contact`** receives each submitted request and sends it to the artist by email through **Cloudflare Email
  Routing** (`send_email` binding). Configured in `wrangler.jsonc`.
- Everything is served from the same origin.

## Tooling

- **pnpm** as the package manager.
- **Vitest** through `ng test` for unit tests.
- **ESLint** (`angular-eslint`), **stylelint** and **Prettier** for linting and formatting.
- **Wrangler** (dev) to run the built site and the Worker locally (`pnpm preview`, `wrangler dev --local`).
- **GitHub Actions** builds and deploys to Cloudflare with `wrangler-action`.

## Not in v1

- **Reference images.** The form does not accept image uploads in the first version. They are added in a later phase (see
  `roadmap.md`).
