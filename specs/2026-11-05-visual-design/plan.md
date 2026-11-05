# Plan — Visual design

Branch `feat/visual-design`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. Each group ends
with `pnpm check` green and one commit. No group touches a template, a test or `stylelint.config.js` (`requirements.md`, decision 1); `angular.json`
changes only in the budget the developer raised (decision 13).

Every group starts from the design: create a Figma session, load the `/figma-design-to-code` skill, and read the group's frames with
`get_design_context` on both the mobile and the desktop node. Its output is a reference to adapt to the tokens, not code to paste.
Every group ends by looking at the page in the browser with `pnpm start`, at 320px, 390px and 1440px.

## 1. Fonts and tokens

1. Ask the developer for the six `woff2` files (Inter 300, 700 and 900; Archivo 400 and 900; JetBrains Mono 500) and their licence
   texts. Do not fetch them from a URL the developer has not typed.
2. Save them in `src/fonts/` with their `OFL.txt` files. Check that each covers the characters the page shows in both languages,
   `→` included, with `fc-query`. Note each file's weight.
3. In `src/styles.css`: the `@font-face` rules, then the tokens of decision 3, then the element defaults of decision 4. Measure
   `--color-error` against `--color-surface` and write the ratio in a comment.
4. Rename every use of an old token in `src/app/app.css`.
5. `pnpm build`: check that each locale's stylesheet references the fonts by a same-origin path and that the files exist in
   `dist/`.
6. `pnpm check`, then commit.

## 2. Shell and hero

1. `src/app/app.css`: `<main>` with no padding, so the hero reaches the edges.
2. `Introduction` gets its own stylesheet (`introduction.css`, through `styleUrl`). Lay out the hero (decision 5): the header as the
   frame, the torso photo as the cover, the fade, the centred logo, and the Bookings button top right.
3. Check the Bookings button's focus ring over the photo.
4. `pnpm check`, then commit.

## 3. Manifiesto

1. In `introduction.css`, the manifesto (decision 6): the photo and text in one column on mobile and two on desktop, the visual
   version's type, and the readable version hidden visually.
2. Check at 320px that lines break only between words and that there is no horizontal scroll, in `/en/` and `/es/`.
3. `pnpm check`, then commit.

## 4. Form layout

1. `ContactForm` gets its own stylesheet (`contact-form.css`, through `styleUrl`). Lay out the header (decision 7), the column and
   gutters (decision 12), and the groups (decision 8): the top rules, the floated legends in their own column on desktop, two fields
   per row in group 01, and the sending part in the fields' column.
2. `pnpm check` and `pnpm build`; if `contact-form.css` passes the 4kB budget, stop and ask.
3. Commit.

## 5. Controls, errors and sending

1. In `contact-form.css`: labels, inputs, textarea, radios, the checkbox and the date range (decision 9); the error state
   (decision 10); the button with its arrow, the privacy notice and the notice (decision 11).
2. Check every option row and the button against the 44px touch target, and the focus ring on every control.
3. Submit the empty form to see every error at 320px and at 1440px, in both languages.
4. `pnpm check` and `pnpm build`; if the budget is passed, stop and ask.
5. Commit.

## 6. Close the phase

1. Update the "unstyled until phase 6" comments in `app.css`, `introduction.ts` and `contact-form.ts`.
2. Check in the browser with `pnpm preview`: `/en/`, `/es/` and `/` at 320px, 390px and 1440px, side by side with the Figma frames.
3. Go through `validation.md`.
4. Mark phase 6 done in `specs/roadmap.md`, with the date and a link to this folder.
5. `pnpm check` and `pnpm format:check`, then commit.
