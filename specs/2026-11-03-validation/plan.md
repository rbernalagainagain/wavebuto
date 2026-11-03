# Plan — Validation

Branch `feat/validation`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. Each group ends
with `pnpm check` green and one commit. Within groups 2–5, the tests for the group's fields are written first and seen failing, then
the rules are added until they pass; the commit holds both.

## 1. Error codes and their text

1. Create `src/app/validation/contact.ts` with the list of error codes (`requirements.md`, decision 3), its type, and
   `createContactSchema(today)` returning an empty object schema.
2. Create `src/app/validation/contact.spec.ts` with a test that pins the list of codes.
3. Add an "Errors" section to `specs/form.md`: each code with its English and Spanish text.
4. Check that `wavebuto/validation-pure-boundary` applies to the new files (`pnpm lint`).
5. `pnpm check`, then commit.

## 2. 01 — Personal information

1. Tests for `name`, `instagram`, `email` and `location`, from `validation.md`'s cases.
2. Add the four fields to the schema: trimming, required, maximum length, control characters, the Instagram format (and dropping
   its `@`) and `z.email()`.
3. `pnpm check`, then commit.

## 3. 02 — Tattoo

1. Tests for `placement` and `symmetry`.
2. Add both fields: `placement` with the single-line text rules, `symmetry` as an optional enum where empty means absent.
3. `pnpm check`, then commit.

## 4. 03 — Availability

1. Tests for `dates.from`, `dates.to` and `flexibleDates`, with `today` fixed to `2026-11-03`.
2. Add `dates` as an object with `from` and `to`: real `YYYY-MM-DD` dates, `from` not before `today`, `to` optional and not before
   `from`, with the error on the field that breaks the rule. Add `flexibleDates` as an optional enum.
3. `pnpm check`, then commit.

## 5. 04 — Additional information and consent

1. Tests for `tattooHistory`, `notes` and `consent`, plus the whole-form cases: the full valid example, and an unknown key that is
   dropped.
2. Add `tattooHistory` as an optional enum, `notes` with the multi-line rules, and `consent` as `true` only.
3. `pnpm check`, then commit.

## 6. Close the phase

1. Go through `validation.md`.
2. Mark phase 3 done in `specs/roadmap.md`, with the date and a link to this folder.
3. `pnpm check` and `pnpm format:check`, then commit.
