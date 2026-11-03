# Requirements — Form

Roadmap phase 4 (`specs/roadmap.md`): the form on the page with every field, its label and its error messages, in both languages, in
a section with the anchor `#contact` so a link can open the page directly on it. Unstyled.

## Context

- `specs/mission.md`: the form is the site's only purpose. The artist shares a link to the `#contact` anchor so people land on the
  form without scrolling. The site speaks English and Spanish.
- `specs/tech-stack.md`: Signal Forms (`@angular/forms/signals`) for the form, Zod for its rules, Angular's built-in i18n with `/en/`
  and `/es/` prerendered. The Worker's redirect of `/` keeps the anchor, so `/#contact` opens the form in the chosen language. The
  page works from 320px wide.
- `specs/form.md` is the source of truth for the fields: their keys, controls, which are required, their options and every text the
  form shows, including the error messages under "Errors".
- `specs/2026-11-03-validation/requirements.md`: `createContactSchema(today)` in `src/app/validation/contact.ts` holds every rule.
  Errors are codes; the component turns each code into its English or Spanish text. Phase 4 passes the visitor's local date as
  `today`.
- Starting point: `Home` shows a title and one sentence, and there is no form. `src/app/home/home.spec.ts` checks that `Home` has
  exactly one paragraph and no `[src]` or `[href]`, counting every descendant. The lint rule `wavebuto/control-has-label` already
  requires every control to have a label.

## Scope

### In

- A `ContactForm` component in `src/app/contact-form/`, with its spec: the header, the four groups and their fields, the consent
  checkbox, the privacy notice, the button and the notice, as listed in `specs/form.md`.
- `Home` placing it inside `<section id="contact">`.
- The error text of `specs/form.md` shown under each field, in both languages.
- Every text marked for translation, and its Spanish text in `src/locale/messages.es.xlf`.
- Narrowing the paragraph check of `src/app/home/home.spec.ts` to `Home`'s own paragraphs (decision 2).
- Making a missing translation fail the build (decision 12).

### Out

- Sending: no request and no sent or failed message (phase 6). The Worker on `/api/contact` (phase 5).
- Styles: no component styles (phase 9). The form relies on the element defaults already in `src/styles.css`.
- The introduction, the video and any link to `#contact` from the page itself (phases 7 and 8).
- Any change to the rules in `src/app/validation/`.
- Any field, option or text not in `specs/form.md`.
- Checking the form with a screen reader: the tests cover the `aria-*` attributes, and how they are announced is checked in phase 9,
  on the finished page.

## Decisions

1. **One component.** `ContactForm` (`src/app/contact-form/`) holds the header and the form. `Home` places it inside
   `<section id="contact">`, after its title and sentence. The section is the only anchor on the page.
2. **`home.spec.ts` is narrowed, with the developer's approval.** Its "one title and one sentence" check counts every paragraph under
   `Home`, so the form's paragraphs would break it. It is narrowed to `Home`'s direct children, which keeps what it checks. The
   "loads nothing" check is not changed, so it now covers the form too.
3. **The schema validates the form.** The form model holds the values as typed: text, date and radio values as strings (`''` when
   empty or nothing is chosen), `dates` as `{ from, to }` and `consent` as a boolean. Signal Forms validates it with the schema of
   `src/app/validation/contact.ts` through its Standard Schema support. The component states no rule of its own.
4. **`today` is the browser's date.** The schema gets the visitor's local date, as `YYYY-MM-DD`, when the form validates. It is never
   the date of the build, when the page is prerendered.
5. **No rule is stated twice.** The `<form>` has `novalidate`, and no control has `required`, `maxlength`, `minlength`, `min`, `max` or
   `pattern`: they would be a second copy of the schema's rules. A required field shows `*` after its label and has
   `aria-required="true"`, as `specs/form.md` marks it: that marks the field, it does not check it. As a result the date pickers
   allow past days, and the schema answers with `date-past`.
6. **When errors show.** A field's error shows once the person has left the field, or after they try to send. It disappears as soon
   as the value is valid. A field shows one error at a time: the schema's code for it.
7. **Sending does nothing yet.** Trying to send an invalid form shows every error and moves the focus to the first invalid field.
   Sending a valid form does nothing visible and makes no request; phase 6 adds the sending.
8. **Accessible structure.**
   - Each group 01–04 is a `<fieldset>` whose `<legend>` is the group's title.
   - Each radio group and the `dates` range is a nested `<fieldset>` whose `<legend>` is the field's label; each radio and each date
     input has its own `<label>`.
   - Every other control has a `<label>` tied to it; a placeholder is never a label.
   - A field's error is a text element right after the field, tied to its control with `aria-describedby`, and the control has
     `aria-invalid="true"` while the error shows. For a radio group, the error is tied to its `<fieldset>`.
   - There is no error summary: `specs/form.md` has none.
9. **Texts.** Every text in the template is marked with `i18n` and a stable ID under `@@contact.` The error texts live in the
   component's code, marked with `$localize` and the ID `@@contact.error.<code>`, in a map typed by `ContactErrorCode`, so a code
   without a text does not compile. The Spanish text is copied verbatim from `specs/form.md` into `src/locale/messages.es.xlf`.
10. **The privacy notice's address is plain text**, not a `mailto:` link. It is a `.example` placeholder; phase 11 replaces it with
    the real one and decides whether it is a link.
11. **Autocomplete.** `name` has `autocomplete="name"` and `email` has `autocomplete="email"`, so the browser can fill them in. No
    other field gets one.
12. **A missing translation fails the build.** `angular.json` sets `"i18nMissingTranslation": "error"` on the build target. By
    default a text without a Spanish translation is only a warning and the page shows the English text; CI runs only `pnpm build`,
    so the build is where this has to fail.
13. **One commit per task group** in `plan.md`, each with `pnpm check` green.

## Consequences

- Phase 6 adds the request and the sent and failed messages to the submit handler that this phase leaves without effect. It sends
  the schema's validated value (trimmed, Instagram without its `@`), not the form model.
- A form left open past midnight judges its dates by the new day, because `today` is read when the form validates.
- `home.spec.ts` no longer sees the form's paragraphs; phase 7 (introduction) rewrites `Home` anyway.
- From this phase on, every later phase that adds text has to translate it before `pnpm build` passes.
- Phase 9 checks with a screen reader that each field's label and error are announced.
