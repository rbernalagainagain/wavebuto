# Validation — Video

The phase can be merged when every check below passes.

## Automated

- [ ] `pnpm check` passes (ESLint, stylelint, all tests).
- [ ] `pnpm format:check` passes.
- [ ] `pnpm build` passes with no missing translation and no budget warning.

## Code

- [ ] No existing check in a test changed; `home.spec.ts` only gained one (`git diff main -- '*.spec.ts'`).
- [ ] No dependency was added (`package.json` and `pnpm-lock.yaml` unchanged), and no stylelint rule or budget changed.
- [ ] The `<video>` has `muted`, `loop`, `playsinline`, `preload="none"`, the WebP poster and a label, and neither `autoplay` nor
      `controls`.
- [ ] The WebM source comes first and names its AV1 codec; the MP4 comes second.
- [ ] Every URL the video loads is a relative same-origin path, and the lint rule now checks `poster`.
- [ ] `video.css` holds no colour, `rem`, `em` or `px`, and no width query other than `min-width: 40rem`.
- [ ] `public/wavebuto-video.webm` and `public/web/wavebuto-video-poster.jpg` are gone, and the built pages hold no copy of them.
- [ ] Every new text has an `@@video.` ID and a Spanish target.
- [ ] Phase 7 is marked done in `specs/roadmap.md`, and phase 12 includes the video's texts.

## Manual (`pnpm preview`)

- [ ] At 390px and 1440px, the video matches frames `210:68` and `172:107`: edge to edge, cropped to 390/488 on mobile and whole
      at 16:9 on desktop, with no gap above or below.
- [ ] At 320px: no horizontal scroll, and the button fits over the video.
- [ ] Opening `/#contact` and staying there, DevTools → Network shows the poster but no video request.
- [ ] Scrolling to the video starts it, muted and looping; the button reads "Pause video" and pauses it, then "Play video" and
      plays it.
- [ ] After pausing and scrolling away and back, the video stays paused.
- [ ] With reduced motion on (DevTools → Rendering → `prefers-reduced-motion: reduce`), the video does not start on its own and the
      button reads "Play video".
- [ ] Safari (or a browser without AV1) plays the MP4.
- [ ] Keyboard alone: the button is reachable, shows the focus ring over the video, and works with Enter and Space.
- [ ] The button is at least 44px high.
- [ ] `/es/` shows "Pausar vídeo" / "Reproducir vídeo", and the accessibility tree names the video in each language.
- [ ] DevTools → Network: every request is same-origin. The console shows no error and no hydration warning.
