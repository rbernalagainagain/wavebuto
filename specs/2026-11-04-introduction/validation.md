# Validation — Introduction

The phase can be merged when every check below passes.

## Automated

- [ ] `pnpm check` passes (ESLint, stylelint, all tests).
- [ ] `pnpm format:check` passes.
- [ ] `pnpm build` passes with no missing translation and no budget warning.
- [ ] `dist/wavebuto/browser/en/index.html` has the introduction before `<section id="contact">`, in English, and
      `dist/wavebuto/browser/es/index.html` has it in Spanish. In both, the Bookings link points to that page's `#contact`, and
      `web/logo-wavebuto.svg`, `web/intro-torso.webp` and `web/intro-face.webp` exist next to the page.
- [ ] The `Introduction` spec covers, in English:
  - A `<header>` with, in order, the Bookings link (text "Bookings", `href` ending in `#contact`, arrow `aria-hidden="true"`), the
    `h1` holding only the logo with `alt="Wavebuto"`, and the torso photo with its `alt`.
  - No link other than Bookings.
  - After the header, the face photo with its `alt` and `loading="lazy"`, the visual version with `aria-hidden="true"`, the nine
    segments in upper case, the four cities in `<b>` and a `<wbr>` for every space, and the readable version with the text of
    `plan.md`, group 3.
  - Every `<img>` has `width` and `height`.
- [ ] The `Home` spec finds exactly one `h1` (the logo), `app-introduction` before `section#contact`, the form in that section, and
      no off-origin `[src]` or `[href]`.

## Code

- [ ] `Introduction` has no `styles` or `styleUrl`.
- [ ] Every text in the template is marked with `i18n` and an `@@intro.` ID; the manifesto's segments are marked with `$localize`
      and `@@intro.manifesto.<n>`; the copy is written once, and both versions are built from it.
- [ ] The Spanish units match the table in `requirements.md`, decision 9.
- [ ] `src/app/home/home.spec.ts` changed only in the two checks of `requirements.md`, decision 10.
- [ ] No `id` other than `contact` on the page, and no Instagram link.
- [ ] `public/web/logo-wavebuto.svg` references nothing off-origin (`grep` for `http`, `//` and `<image`; the
      `xmlns` namespace is the only expected match).
- [ ] No dependency was added (`package.json` and `pnpm-lock.yaml` unchanged).
- [ ] Phase 5 is marked done in `specs/roadmap.md`.

## Manual (`pnpm preview`)

- [ ] `/en/`, `/es/` and `/` show the introduction above the form, in the page's language.
- [ ] The Bookings link scrolls to the form without reloading the page, with the mouse and with Enter.
- [ ] DevTools → Network: every request is same-origin; the face photo loads only when scrolled near.
- [ ] 320px wide: no horizontal scroll, the visual manifesto breaks between words.
- [ ] A screen reader (or the accessibility tree in DevTools) reads the logo as "Wavebuto", the link as "Bookings", skips the visual
      manifesto and reads the readable one.
- [ ] The console shows no error and no hydration warning on `/en/` or `/es/`.
