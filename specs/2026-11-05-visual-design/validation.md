# Validation — Visual design

The phase can be merged when every check below passes.

## Automated

- [ ] `pnpm check` passes (ESLint, stylelint, all tests).
- [ ] `pnpm format:check` passes.
- [ ] `pnpm build` passes with no missing translation and no budget warning.
- [ ] In `dist/`, each locale's stylesheet references the six fonts by a same-origin path, and the files exist there.

## Code

- [ ] No template, test, `angular.json` or `stylelint.config.js` changed (`git diff main --stat`).
- [ ] No component style holds a colour, a `rem`, `em` or `px`, a `max-width` query, or a width query other than
      `min-width: 40rem` (stylelint, and a `grep` to confirm).
- [ ] No old token name (`--color-bg`, `--space-1` … `--space-5`, `--measure`) is left anywhere in `src/`.
- [ ] `src/fonts/` holds the six `woff2` files and their licence texts; each covers `→` and the Spanish letters (`fc-query`).
- [ ] `--color-error` has its measured ratio against `--color-surface` in a comment, and it is at least 4.5:1.
- [ ] The focus ring is in `src/styles.css` and no rule removes it.
- [ ] The readable manifesto is hidden visually, not with `display: none` or `visibility: hidden`.
- [ ] The button's arrow is generated content with empty alternative text.
- [ ] `specs/tech-stack.md` and `CLAUDE.md` describe the self-hosted fonts.
- [ ] No dependency was added (`package.json` and `pnpm-lock.yaml` unchanged).
- [ ] Phase 6 is marked done in `specs/roadmap.md`.

## Manual (`pnpm preview`)

- [ ] At 390px and 1440px, `/en/` matches frames `210:61` and `150:9` of "Web — v4", apart from the differences in
      `requirements.md`.
- [ ] At 320px: no horizontal scroll, the manifesto breaks only between words, and the form can be completed.
- [ ] With every media query disabled in DevTools, the form can still be completed at 320px.
- [ ] `/es/` and `/` show the same design with the Spanish text, nothing cut off or overflowing.
- [ ] DevTools → Network: every request is same-origin, fonts included.
- [ ] Keyboard alone: every control shows the focus ring, the Bookings link reaches the form, and the form can be completed and
      sent.
- [ ] Every option row, the checkbox row, the Bookings link and the button are at least 44px high.
- [ ] Sending the empty form shows every error in `--color-error`, under its field, with the field's border in the same colour.
- [ ] A screen reader (or the accessibility tree) reads "Send request" without the arrow, skips the visual manifesto and reads the
      readable one.
- [ ] The console shows no error and no hydration warning on `/en/` or `/es/`.
