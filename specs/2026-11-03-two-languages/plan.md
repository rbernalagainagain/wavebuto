# Plan — Two languages

Branch `feat/two-languages`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. Each group ends
with `pnpm check` green and one commit.

## 1. Remove Transloco and reduce the page to a skeleton

1. Delete `src/app/contact-form/`, `src/app/submit/` and `src/app/validation/` with their specs.
2. Reduce `Home` and `App` to the skeleton: a title and one sentence, in plain English in the template for now.
3. Delete `src/app/i18n/` (Transloco config, HTTP loader, bundled translations) and `public/i18n/`, and remove the Transloco
   providers from `app.config.ts`.
4. Remove `@jsverse/transloco` from `package.json` (`pnpm remove`).
5. Update the specs that remain (`app.spec.ts`, `home.spec.ts`) to the skeleton.
6. `pnpm check`, then commit.

## 2. Angular i18n with `/en/` and `/es/`

1. Add `@angular/localize` (`pnpm ng add @angular/localize`), including `$localize` initialisation for the tests.
2. In `angular.json`: `i18n.sourceLocale` `en`, locale `es` with `src/locale/messages.es.xlf`, and `localize: true` in the build
   options, so the output is `dist/wavebuto/browser/en/` and `dist/wavebuto/browser/es/`.
3. Mark the skeleton's text with `i18n` and stable custom IDs (`@@…`), plus the route title.
4. Extract with `pnpm ng extract-i18n --format xlf2 --output-path src/locale`, create `messages.es.xlf` and translate it.
5. Check that `pnpm build` prerenders both pages with `<html lang="en">` and `<html lang="es">` and the right `<base href>`.
6. `pnpm check`, then commit.

## 3. Redirect `/` in the Worker

1. Write the tests first for a pure function that takes an `Accept-Language` value and returns `'en'` or `'es'`, covering
   `validation.md`'s cases. Put it in a small module the Worker imports, so `ng test` runs its spec.
2. Implement the function until the tests pass.
3. In `src/index.js`, answer `GET /` with a 302 to `/en/` or `/es/` and `Vary: Accept-Language`. Leave `/api/contact` as it is
   (phase 5 rewrites it).
4. In `wrangler.jsonc`: add `/` to `run_worker_first`, and change `not_found_handling` so an unknown path gets a 404.
5. Add `wrangler` as a devDependency and a `pnpm preview` script that builds and runs `wrangler dev`. Risk: the `send_email` binding
   is `remote: true` and may need a Cloudflare login for `wrangler dev`. If it does, run the preview with the binding local only, and
   do not change the deployed config.
6. `pnpm check`, then commit.

## 4. Clean up and verify

1. Remove the `translation-http-loader.ts` exception from `eslint.config.js` and `eslint-rules/no-network-outside-submit.js`.
2. Update `CLAUDE.md`: Transloco, `public/i18n/`, the translation loader and "the network has two doors".
3. Check that no reference to Transloco is left (`grep -ri transloco`, outside `docs/archive/`).
4. Go through `validation.md`, automated then manual.
5. `pnpm check` and `pnpm format:check`, then commit.
