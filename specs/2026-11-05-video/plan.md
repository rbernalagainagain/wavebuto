# Plan — Video

Branch `feat/video`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. Each group ends with
`pnpm check` green and one commit. No group changes an existing check of a test, a stylelint rule or a build budget.

## 1. Files and the lint rule

1. Delete `public/wavebuto-video.webm` and `public/web/wavebuto-video-poster.jpg` (decision 6).
2. In `eslint-rules/no-offorigin-template-resource.js`, check `poster` on `<video>` as well as `src` (decision 7).
3. `pnpm check`, then commit.

## 2. The component

1. Write `src/app/video/video.spec.ts` first, with the checks of decision 9.
2. `Video` (`video.ts`, `video.html`): the markup of decision 2, the playback of decision 3 and the button of decision 4, with the
   texts of decision 5 marked `i18n` / `$localize`.
3. `Home` places `<app-video />` between the introduction and the contact section; `home.spec.ts` gains a check that the three
   come in that order.
4. `pnpm ng extract-i18n --format xlf2 --output-path src/locale`, then add the Spanish targets of decision 5 to
   `src/locale/messages.es.xlf`.
5. `pnpm check` and `pnpm build` (no missing translation), then commit.

## 3. Styles

1. `video.css`, through `styleUrl` (decision 8).
2. `pnpm check` and `pnpm build`; if a budget is passed, stop and ask.
3. Commit.

## 4. Close the phase

1. Phase 12 in `specs/roadmap.md`: the artist also approves the video's texts.
2. Go through `validation.md`; the checks the sandbox cannot run in a browser are left for the developer.
3. Mark phase 7 done in `specs/roadmap.md`, with the date and a link to this folder.
4. `pnpm check` and `pnpm format:check`, then commit.
