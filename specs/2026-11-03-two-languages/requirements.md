# Requirements — Two languages

Roadmap phase 1 (`specs/roadmap.md`): set up Angular's built-in i18n with `/en/` and `/es/` prerendered as separate pages, and `/`
redirecting to the visitor's language (English by default). Remove Transloco.

## Context

- `specs/mission.md`: the site speaks English and Spanish. The artist shares **one link with no language in it**; it opens in the
  visitor's language, and English is the default whenever that language is not Spanish or cannot be told.
- `specs/tech-stack.md`: Angular's built-in i18n (`@angular/localize`), each language prerendered as its own page. `/` has no language
  of its own: the Worker redirects it. A redirect keeps the link's anchor, so `/#contact` opens in the chosen language.
- Starting point: Transloco 8.4 with one translation file (`public/i18n/en.json`) loaded over HTTP. The page text is placeholder from
  the previous site (gallery, and a form with name, email, subject and message). The Worker (`src/index.js`) runs only for `/api/*`
  and returns 404 for anything else.

## Scope

### In

- `@angular/localize` with `en` as the source locale and `es` as the one translation.
- `/en/` and `/es/` prerendered to static HTML, each with the right `<html lang>`.
- The Worker redirects `/` to `/en/` or `/es/`.
- Transloco, its loaders and `public/i18n/` removed.
- The page reduced to a minimal bilingual skeleton.
- `wrangler` as a devDependency so the redirect can be run locally.

### Out

- Form fields, validation, the form, sending, introduction, video, visual design and SEO metadata (roadmap phases 2–10).
- A visible language switcher (not in v1).
- Remembering the visitor's language (`specs/mission.md`: the site does not recognise returning visitors).

## Decisions

1. **Minimal skeleton.** The page keeps only a title and one sentence, in both languages. The gallery, the old form and the
   placeholder copy are removed instead of being translated: phases 2–8 rebuild them.
2. **Old form code removed.** `src/app/contact-form/`, `src/app/submit/` and `src/app/validation/` (fields name, email, subject,
   message) are deleted with their tests. Phases 3 and 6 rebuild validation and sending from `specs/form.md`.
3. **Source locale `en`, XLIFF 2.0.** Templates are written in English and marked with `i18n`. The Spanish translation lives in
   `src/locale/messages.es.xlf` (XLIFF 2.0, extracted with `ng extract-i18n --format xlf2`).
4. **Redirect in the Worker.** `/` is added to `run_worker_first` in `wrangler.jsonc`. The Worker answers it with a **302** and
   `Vary: Accept-Language`, never 301, because the answer depends on the visitor.
5. **Language rule.** `/es/` only when the language with the highest weight (`q`) in `Accept-Language` is any variant of Spanish
   (`es`, `es-ES`, `es-MX`, …). In every other case, including a missing or unreadable header, `/en/`.
6. **No language switcher in v1.** The language is chosen only by the redirect of `/`.
7. **`wrangler` is a devDependency**, approved for this phase, to run the built site and the Worker locally with `wrangler dev`.
8. **One commit per task group** in `plan.md`, each with `pnpm check` green.

## Consequences

- The network-rule exception for `src/app/i18n/translation-http-loader.ts` in `eslint.config.js` and
  `eslint-rules/no-network-outside-submit.js` goes away: after this phase the site makes no request until phase 6 restores
  `src/app/submit/`.
- With the source locale moved to `/en/`, there is no `index.html` at the root of the build output, so
  `not_found_handling: "single-page-application"` in `wrangler.jsonc` has no page to fall back to. It is changed so an unknown path
  gets a 404 instead.
- `CLAUDE.md` references to Transloco, `public/i18n/`, the translation loader and "two doors" are updated to match.
