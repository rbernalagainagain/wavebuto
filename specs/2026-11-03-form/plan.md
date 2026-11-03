# Plan — Form

Branch `feat/form`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. Each group ends with
`pnpm check` green and one commit. Within groups 2–6, the component tests for the group are written first and seen failing, then the
template and code are added until they pass; the commit holds both.

Every group that adds text also translates it: run `pnpm ng extract-i18n --format xlf2 --output-path src/locale`, then add each new
unit's Spanish text to `src/locale/messages.es.xlf`, copied verbatim from `specs/form.md`. The group's commit holds both files, so no
text is ever in English only.

## 1. Skeleton

1. Narrow the paragraph check of `src/app/home/home.spec.ts` to `Home`'s direct children (`requirements.md`, decision 2).
2. Set `"i18nMissingTranslation": "error"` on the build target in `angular.json` (decision 12), and check that `pnpm build` still
   passes.
3. Create `src/app/contact-form/` with `ContactForm` and its spec: the header (eyebrow, title as `h2`, "\* Required"), a `<form>` with
   `novalidate`, the four group `<fieldset>`s with their `<legend>`s, the privacy notice, the button and the notice, in the order of
   `specs/form.md`.
4. Create the form model (decision 3) and validate it with `createContactSchema` through Signal Forms' Standard Schema support,
   with the browser's local date as `today` (decision 4).
5. Add the map from `ContactErrorCode` to each error's text, marked with `$localize` and `@@contact.error.<code>`.
6. Place `ContactForm` in `Home`, inside `<section id="contact">`, after the title and sentence.
7. Extract and translate the new texts.
8. `pnpm check` and `pnpm build`, then commit.

## 2. 01 — Personal information

1. Tests for `name`, `instagram`, `email` and `location`: each has a label, `*` and `aria-required="true"`, no native constraint
   attribute; an invalid value shows its error only after the field is left, with `aria-invalid` and `aria-describedby` tied to the
   error; the error disappears once the value is valid. `name` and `email` have their `autocomplete`.
2. Add the four fields and the way a field shows its error (decisions 6 and 8).
3. Extract and translate the new texts.
4. `pnpm check`, then commit.

## 3. 02 — Tattoo

1. Tests for `placement` and `symmetry`: `symmetry` is a nested `<fieldset>` with the field's label as `<legend>` and one labelled
   radio per option, none chosen at first.
2. Add both fields.
3. Extract and translate the new texts.
4. `pnpm check`, then commit.

## 4. 03 — Availability

1. Tests for `dates` and `flexibleDates`: `dates` is a nested `<fieldset>` with "From" and "To" date inputs; with `today` fixed, a
   past "From" shows `date-past` on "From" and a "To" before "From" shows `date-order` on "To".
2. Add both fields.
3. Extract and translate the new texts.
4. `pnpm check`, then commit.

## 5. 04 — Additional information and consent

1. Tests for `tattooHistory`, `notes` and `consent`: `notes` is a `<textarea>`; `consent` is a labelled checkbox before the privacy
   notice, unticked at first.
2. Add the three fields.
3. Extract and translate the new texts.
4. `pnpm check`, then commit.

## 6. Trying to send

1. Tests: sending an empty form shows the error of every required field and of `consent`, and none on the optional ones, and moves
   the focus to `name`; sending a form whose first error is further down moves the focus there; sending a valid form shows no error
   and makes no request.
2. Add the submit handler (decision 7).
3. `pnpm check`, then commit.

## 7. Close the phase

1. Check in the browser with `pnpm preview`: open `/en/#contact`, `/es/#contact` and `/#contact`, go through the form with the
   keyboard alone, and look at it 320px wide.
2. Go through `validation.md`.
3. Mark phase 4 done in `specs/roadmap.md`, with the date and a link to this folder.
4. `pnpm check` and `pnpm format:check`, then commit.
