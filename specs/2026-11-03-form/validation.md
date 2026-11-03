# Validation — Form

The phase can be merged when every check below passes.

## Automated

- [x] `pnpm check` passes (ESLint, stylelint, all tests).
- [x] `pnpm format:check` passes.
- [x] `pnpm build` passes with `"i18nMissingTranslation": "error"` set on the build target in `angular.json`.
- [x] `pnpm build` shows no budget warning (`requirements.md`, decision 14).
- [x] `dist/wavebuto/browser/en/index.html` has `<section id="contact">` with the form and its English text, and
      `dist/wavebuto/browser/es/index.html` has it with the Spanish text. Neither shows an error message or has
      `aria-invalid="true"` in the prerendered HTML.
- [x] The `ContactForm` spec covers, in English:
  - Every field of `specs/form.md` with its key and control, in the order of `form.md`, inside the `<fieldset>` of its group, and
    nothing else.
  - Every control has a label; each radio group and the `dates` range is a nested `<fieldset>` whose `<legend>` is the field's label.
  - Each required field shows `*` and has `aria-required="true"`; no control has `required`, `maxlength`, `minlength`, `min`, `max`,
    `pattern` or `placeholder`, and the `<form>` has `novalidate`.
  - `name` has `autocomplete="name"` and `email` has `autocomplete="email"`.
  - No error shows before the person leaves a field or tries to send. Leaving an invalid field shows its error text from
    `specs/form.md` right after it, with `aria-invalid="true"` and `aria-describedby` on the control (on the `<fieldset>` for a
    radio group). Making the value valid removes both.
  - With `today` fixed, a past "From" shows `date-past` on "From", and a "To" before "From" shows `date-order` on "To".
  - Sending an empty form shows the error of every required field and of `consent`, none on the optional ones, and moves the focus
    to `name`. Sending a form whose first error is further down moves the focus there.
  - Sending a valid form shows no error and makes no request.
- [x] The `Home` spec finds `<section id="contact">` with the form in it.

## Code

- [x] The rules live only in `src/app/validation/contact.ts`: the template of `ContactForm` has no `required`, `maxlength`,
      `minlength`, `min`, `max`, `pattern` or `placeholder` attribute (`grep`), and the component states no length, format or
      required check.
- [x] The form's keys are exactly those of `specs/form.md`; no field, option or text is added.
- [x] Every text in the template is marked with `i18n` and a `@@contact.` ID; every error text is in the map typed by
      `ContactErrorCode`, with a `@@contact.error.<code>` ID.
- [x] `ContactForm` has no `styles` or `styleUrl`.
- [x] The privacy notice's address is plain text, not a link.
- [x] `src/app/home/home.spec.ts` changed only in its paragraph check, narrowed to `Home`'s direct children, and gained the test of
      the section above; "loads nothing" is unchanged and passes with the form inside `Home`.
- [x] No dependency was added (`package.json` and `pnpm-lock.yaml` unchanged).
- [x] No request is made anywhere (`wavebuto/no-network-outside-submit` passes, and `src/app/submit/` does not exist yet).
- [x] Phase 4 is marked done in `specs/roadmap.md`.

## Manual (`pnpm preview`)

- [x] `/en/#contact`, `/es/#contact` and `/#contact` open the page on the form.
- [x] Every text on `/es/` matches the Spanish text of `specs/form.md`, and every text on `/en/` the English text.
- [x] With the keyboard alone: the tab order follows the visual order, a radio is chosen with the arrow keys, the consent checkbox
      is ticked with Space, Enter in a text field sends, and the focus is always visible.
- [x] Sending the empty form moves the focus to "Name" and shows the errors in the page's language.
- [x] 320px wide: no horizontal scroll, and every control can be used.
- [x] The console shows no error and no hydration warning on `/en/` or `/es/`.
- [x] DevTools → Network: sending the form makes no request.
