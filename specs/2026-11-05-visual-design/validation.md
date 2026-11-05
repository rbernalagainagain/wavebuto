# Validation — Visual design

The phase can be merged when every check below passes.

## Automated

- [x] `pnpm check` passes (ESLint, stylelint, all tests).
- [x] `pnpm format:check` passes.
- [x] `pnpm build` passes with no missing translation and no budget warning.

## Code

- [x] No template, test or `stylelint.config.js` changed, and `angular.json` only in the `anyComponentStyle` warning (7kB,
      decision 13) (`git diff main --stat`).
- [x] No component style holds a colour, a `rem`, `em` or `px`, a `max-width` query, or a width query other than
      `min-width: 40rem` (stylelint, and a `grep` to confirm).
- [x] No old token name (`--color-bg`, `--space-1` … `--space-5`, `--measure`) is left anywhere in `src/`.
- [x] `--color-error` has its measured ratio against `--color-surface` in a comment, and it is at least 4.5:1.
- [x] The focus ring is in `src/styles.css` and no rule removes it.
- [x] The readable manifesto is hidden visually, not with `display: none` or `visibility: hidden`.
- [x] The button's arrow is generated content with empty alternative text.
- [x] `specs/tech-stack.md` and `CLAUDE.md` describe the self-hosted fonts.
- [x] No dependency was added (`package.json` and `pnpm-lock.yaml` unchanged).
- [x] Phase 6 is marked done in `specs/roadmap.md`.

## Manual (`pnpm preview`)

Not checked when the phase closed: the agent's sandbox cannot render the page, so these wait for the developer's review in
the browser. The built pages were checked for off-origin URLs (none).

- [ ] At 390px and 1440px, `/en/` matches frames `210:61` and `150:9` of "Web — v4", apart from the differences in
      `requirements.md`.
- [ ] At 320px: no horizontal scroll, the manifesto breaks only between words, and the form can be completed.
- [ ] With every media query disabled in DevTools, the form can still be completed at 320px.
- [ ] `/es/` and `/` show the same design with the Spanish text, nothing cut off or overflowing.
- [ ] DevTools → Network: every request is same-origin.
- [ ] Keyboard alone: every control shows the focus ring, the Bookings link reaches the form, and the form can be completed and
      sent.
- [ ] Every option row, the checkbox row, the Bookings link and the button are at least 44px high.
- [ ] Sending the empty form shows every error in `--color-error`, under its field, with the field's border in the same colour.
- [ ] Radios are an empty ring with a dot when chosen, and the consent a square with a tick when ticked, as in Form/Radio; with
      Windows forced colours the dot and the tick are still visible.
- [ ] With a mouse, the states of decision 15: a field tints on hover and more on focus, an option's control tints when the
      control or its label is hovered, the button turns to an outline on hover and to the 80% fill while pressed. On a touch
      screen, a tap leaves no hover state behind.
- [ ] A screen reader (or the accessibility tree) reads "Send request" without the arrow, skips the visual manifesto and reads the
      readable one.
- [ ] The console shows no error and no hydration warning on `/en/` or `/es/`.
