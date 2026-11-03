# Requirements — Validation

Roadmap phase 3 (`specs/roadmap.md`): one Zod schema with the rules for the fields of `specs/form.md`, with tests written first.

## Context

- `specs/mission.md`: the form asks only for what the artist needs to answer a request. Each request reaches the artist by email.
- `specs/tech-stack.md`: Zod for the form's validation rules. The same schema is used by the form (phase 4) and by the Worker on
  `/api/contact` (phase 5), so the rules are written once.
- `specs/form.md` is the source of truth for the fields: their keys, controls, which are required, their options and their text. It
  leaves the rules beyond "required" and the control (lengths, formats, date limits) and the error messages to this phase.
- Starting point: there is no `src/app/validation/` (phase 1 removed the old one). The lint rule `wavebuto/validation-pure-boundary`
  already limits that folder to `zod` and type imports, with no DOM, Angular or network.

## Scope

### In

- One schema in `src/app/validation/` covering every field of `specs/form.md`, with its spec alongside.
- A fixed list of error codes, and the English and Spanish text for each one, added to `specs/form.md`.
- Tests written before the rules they cover, including the edge cases: empty, whitespace only, over-length and unexpected characters.

### Out

- The form on the page, and showing the errors there (phase 4).
- The Worker validating requests with the schema (phase 5), including how it decides what "today" is.
- Sending the form (phase 6).
- Any field not in `specs/form.md`.

## Decisions

1. **One module, one factory.** `src/app/validation/contact.ts` exports `createContactSchema(today)`, which returns the Zod schema,
   plus the type of the validated request and the list of error codes. `today` is the current date as `YYYY-MM-DD`, passed in by the
   caller, so the schema never reads a clock and stays a pure function over values.
2. **Errors are codes, not text.** Each issue's message is a stable code; the component (phase 4) turns it into the English or Spanish
   text. The validation folder holds no user-visible text and no `$localize`. A field reports one code: the first rule it breaks, in
   the order required → too-long → format or characters.
3. **Error codes:**

   | Code         | Meaning                                                    |
   | ------------ | ---------------------------------------------------------- |
   | `required`   | A required field is empty, or only whitespace.             |
   | `too-long`   | The text is longer than the field's limit.                 |
   | `characters` | The text contains a control character (decision 6).        |
   | `email`      | The email address is not valid.                            |
   | `instagram`  | The Instagram username is not valid.                       |
   | `option`     | A radio value is not one of the options in `form.md`.      |
   | `date`       | A date is not a real calendar date in `YYYY-MM-DD` format. |
   | `date-past`  | `dates.from` is before `today`.                            |
   | `date-order` | `dates.to` is before `dates.from`.                         |
   | `consent`    | The consent checkbox is not ticked.                        |

4. **Whitespace.** Every text value is trimmed before it is checked, and the validated value is the trimmed one. An optional field
   that is empty or only whitespace is treated as absent, and so is an unselected radio group (empty or missing).
5. **Field rules:**

   | Key             | Rule                                                                                                 |
   | --------------- | ---------------------------------------------------------------------------------------------------- |
   | `name`          | Required, single line, at most 100 characters.                                                       |
   | `instagram`     | Required. An optional leading `@`, then 1–30 letters, digits, `.` or `_`. Validated without the `@`. |
   | `email`         | Required, at most 254 characters, a valid address (`z.email()`).                                     |
   | `location`      | Required, single line, at most 100 characters.                                                       |
   | `placement`     | Required, single line, at most 100 characters.                                                       |
   | `symmetry`      | Optional. `symmetrical`, `asymmetrical` or `not-sure`.                                               |
   | `dates.from`    | Required, a real date, `today` or later.                                                             |
   | `dates.to`      | Optional (empty means a single day), a real date, equal to or after `dates.from`. No upper limit.    |
   | `flexibleDates` | Optional. `yes` or `no`.                                                                             |
   | `tattooHistory` | Optional. `first`, `same-area` or `other-areas`.                                                     |
   | `notes`         | Optional, multi-line, at most 2000 characters.                                                       |
   | `consent`       | Must be `true`.                                                                                      |

6. **Unexpected characters.** Single-line fields reject every control character, line breaks included; `notes` allows line breaks
   and tabs and rejects any other control character. Letters with accents, `ñ` and other scripts are accepted everywhere: names and
   places are not limited to ASCII. Rejecting line breaks also keeps a name from breaking the email's headers in phase 5.
7. **Unknown keys are dropped.** A key not in `specs/form.md` is not an error; it is left out of the validated value, so it never
   reaches the email.
8. **Specs never import `TestBed`.** The spec tests the schema directly, with `today` fixed to `2026-11-03`.
9. **One commit per task group** in `plan.md`, each with `pnpm check` green. Within a group, the tests are written before the rules,
   and the commit holds both.

## Consequences

- `specs/form.md` gains an "Errors" section with each code's text in English and Spanish. Like the rest of the Spanish text, it is a
  proposal for the artist to approve before launch (phase 11).
- Phase 4 passes the visitor's local date as `today`. Phase 5 has to choose the Worker's `today` so that a visitor ahead of UTC is
  not rejected for choosing their own today; that choice is phase 5's, not this one's.
