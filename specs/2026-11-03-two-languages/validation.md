# Validation — Two languages

The phase can be merged when every check below passes.

## Automated

- [ ] `pnpm check` passes (ESLint, stylelint, all tests).
- [ ] `pnpm format:check` passes.
- [ ] `pnpm build` passes and produces `dist/wavebuto/browser/en/index.html` and `dist/wavebuto/browser/es/index.html`.
- [ ] `en/index.html` has `<html lang="en">`, `<base href="/en/">` and the English text. `es/index.html` has `<html lang="es">`,
      `<base href="/es/">` and the Spanish text.
- [ ] The language-choice tests pass, with at least these cases:

| `Accept-Language`          | Result |
| -------------------------- | ------ |
| `es`                       | `es`   |
| `es-ES,es;q=0.9`           | `es`   |
| `es-MX`                    | `es`   |
| `ES-ar` (case)             | `es`   |
| `en-US,en;q=0.9,es;q=0.8`  | `en`   |
| `fr-FR,es;q=0.9`           | `en`   |
| `en;q=0.5,es;q=0.8`        | `es`   |
| `es;q=0`                   | `en`   |
| `*`                        | `en`   |
| empty or missing header    | `en`   |
| unreadable value (`;;q=x`) | `en`   |

## Code

- [ ] No reference to Transloco outside `docs/archive/` (`grep -ri transloco`), and no `@jsverse/transloco` in `package.json` or
      `pnpm-lock.yaml`.
- [ ] `public/i18n/`, `src/app/i18n/`, `src/app/contact-form/`, `src/app/submit/` and `src/app/validation/` no longer exist.
- [ ] Every user-visible text in a template is marked with `i18n` and has a Spanish translation in `src/locale/messages.es.xlf`.
- [ ] The only new dependencies are `@angular/localize` and `wrangler` (dev).
- [ ] `CLAUDE.md` no longer mentions Transloco or the translation loader as part of the stack.

## Manual (`pnpm preview`, `wrangler dev`)

- [ ] `/` with the browser in Spanish lands on `/es/`.
- [ ] `/` with the browser in English, or another language, lands on `/en/`.
- [ ] `curl -sI http://localhost:8787/` answers `302`, with `Location: /en/` and `Vary: Accept-Language`.
- [ ] `curl -sI -H 'Accept-Language: es-ES' http://localhost:8787/` answers `302` with `Location: /es/`.
- [ ] Opening `/#contact` in the browser ends on `/en/#contact` or `/es/#contact`, keeping the anchor.
- [ ] `/en/` and `/es/` load with no request to another domain, and no request at all besides the page's own files (DevTools →
      Network).
- [ ] An unknown path (`/nope`) answers 404.
