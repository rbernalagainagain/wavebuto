# Validation — Validation

The phase can be merged when every check below passes.

## Automated

- [x] `pnpm check` passes (ESLint, stylelint, all tests).
- [x] `pnpm format:check` passes.
- [x] The spec in `src/app/validation/` passes every case below, with `today` = `2026-11-03`. A case lists the value of one field in
      an otherwise valid request, and the expected result: valid (with the validated value when it differs) or the error code on
      that field.

### Text fields: `name`, `location`, `placement` (each)

| Input                       | Result         |
| --------------------------- | -------------- |
| `''`                        | `required`     |
| `'   '`                     | `required`     |
| `'  Ana  '`                 | valid, `'Ana'` |
| `'José Ñúñez'`              | valid          |
| `'李小龍'`                  | valid          |
| 100 characters              | valid          |
| 101 characters              | `too-long`     |
| 101 characters plus spaces  | `too-long`     |
| `'Ana\nBcc: x@example.com'` | `characters`   |
| `'Ana\tLópez'`              | `characters`   |
| missing key                 | `required`     |

### `instagram`

| Input                         | Result                |
| ----------------------------- | --------------------- |
| `''`                          | `required`            |
| `'   '`                       | `required`            |
| `'ana.lopez_'`                | valid                 |
| `'@ana.lopez_'`               | valid, `'ana.lopez_'` |
| `' @ana '`                    | valid, `'ana'`        |
| `'@'`                         | `instagram`           |
| 30 characters                 | valid                 |
| 31 characters                 | `instagram`           |
| `'ana lopez'`                 | `instagram`           |
| `'ana!'`                      | `instagram`           |
| `'@@ana'`                     | `instagram`           |
| `'https://instagram.com/ana'` | `instagram`           |

### `email`

| Input                 | Result                     |
| --------------------- | -------------------------- |
| `''`                  | `required`                 |
| `'ana@example.com'`   | valid                      |
| `' ana@example.com '` | valid, `'ana@example.com'` |
| `'ana@'`              | `email`                    |
| `'ana example.com'`   | `email`                    |
| `'ana@example'`       | `email`                    |
| 255 characters        | `too-long`                 |

### Radio groups: `symmetry`, `flexibleDates`, `tattooHistory`

| Input                                              | Result        |
| -------------------------------------------------- | ------------- |
| missing key, or `''`                               | valid, absent |
| each value in `form.md` (for example `'not-sure'`) | valid         |
| a value with another case (`'Symmetrical'`)        | `option`      |
| a value of another group (`'yes'` for `symmetry`)  | `option`      |

### `dates`

| `from`         | `to`           | Result                         |
| -------------- | -------------- | ------------------------------ |
| `''`           | `''`           | `required` on `from`           |
| `'2026-11-03'` | `''`           | valid, single day, `to` absent |
| `'2026-11-02'` | `''`           | `date-past` on `from`          |
| `'2026-11-10'` | `'2026-11-10'` | valid                          |
| `'2026-11-10'` | `'2026-11-20'` | valid                          |
| `'2026-11-10'` | `'2026-11-09'` | `date-order` on `to`           |
| `'2027-11-03'` | `''`           | valid (no upper limit)         |
| `'2026-02-30'` | `''`           | `date` on `from`               |
| `'03/11/2026'` | `''`           | `date` on `from`               |
| `'2026-11-10'` | `'tomorrow'`   | `date` on `to`                 |
| `'2028-02-29'` | `''`           | valid (leap year)              |
| `'2027-02-29'` | `''`           | `date` on `from`               |

### `notes`

| Input                       | Result        |
| --------------------------- | ------------- |
| missing key, `''` or `'  '` | valid, absent |
| `'Fine line.\nNo colour.'`  | valid         |
| `'Col 1\tCol 2'`            | valid         |
| 2000 characters             | valid         |
| 2001 characters             | `too-long`    |
| `'Hi\u0000'`                | `characters`  |

### `consent`

| Input       | Result    |
| ----------- | --------- |
| `true`      | valid     |
| `false`     | `consent` |
| missing key | `consent` |

### Whole request

- [x] This request is valid, and its validated value is the same with `instagram` as `'ana.lopez_'`:
      `name` `'Ana López'`, `instagram` `'@ana.lopez_'`, `email` `'ana@example.com'`, `location` `'Madrid / España'`, `placement`
      `'Left forearm'`, `symmetry` `'not-sure'`, `dates` `{ from: '2026-11-10', to: '2026-11-20' }`, `flexibleDates` `'yes'`,
      `tattooHistory` `'first'`, `notes` `'Fine line.'`, `consent` `true`.
- [x] The same request with only the required fields and `consent` is valid.
- [x] The same request with an extra key `subject` is valid, and `subject` is not in the validated value.
- [x] An empty object fails with `required` on every required field and `consent` on `consent`, and nothing on the optional ones.

## Code

- [x] All the rules live in `src/app/validation/contact.ts`; no other file states a length, a format or a required check for the
      fields of `specs/form.md`. The old `/api/contact` handler in `src/index.js` still checks the old form's fields (`nombre`,
      `email`, `mensaje`); it is out of this phase's scope and phase 5 replaces it (`specs/roadmap.md`).
- [x] `src/app/validation/` imports only `zod` and types (`wavebuto/validation-pure-boundary` passes), and reads no clock: `today`
      is a parameter.
- [x] No spec in `src/app/validation/` imports `TestBed` or anything from Angular.
- [x] `src/app/validation/` holds no user-visible text: errors are the codes of `requirements.md`, decision 3.
- [x] Every error code has an English and a Spanish text in `specs/form.md`.
- [x] No dependency was added (`package.json` unchanged).
- [x] Phase 3 is marked done in `specs/roadmap.md`.
