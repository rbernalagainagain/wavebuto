# Tech stack

## Page

- **Angular 22**, standalone and zoneless.
- **Prerendered to static HTML** at build time (`@angular/ssr` with `outputMode: "static"`), then hydrated in the browser. There is no
  runtime server rendering.
- **Signal Forms** (`@angular/forms/signals`) for the appointment form.
- **Zod** for the form's validation rules.
- **Plain CSS.** No CSS framework or preprocessor.

## Languages

- **Angular's built-in i18n** (`@angular/localize`): each language is prerendered as its own page, `/en/` and `/es/`, so search engines
  see both.
- This replaces Transloco, which is currently installed.

## Hosting and email

- **Cloudflare Workers** serves the prerendered pages as static assets.
- **A Worker on `/api/contact`** receives each submitted request and sends it to the artist by email through **Cloudflare Email
  Routing** (`send_email` binding). Configured in `wrangler.jsonc`.
- Everything is served from the same origin.

## Tooling

- **pnpm** as the package manager.
- **Vitest** through `ng test` for unit tests.
- **ESLint** (`angular-eslint`), **stylelint** and **Prettier** for linting and formatting.
- **GitHub Actions** builds and deploys to Cloudflare with `wrangler-action`.

## Not in v1

- **Reference images.** The form does not accept image uploads in the first version. They are added in a later phase (see
  `roadmap.md`).
