# Requirements — Introduction

Roadmap phase 5 (`specs/roadmap.md`): the introduction section above the form.

## Context

- `specs/mission.md`: people who find the site through search see the introduction and the video before the form. People from social
  media land on `#contact` directly. Nothing is loaded from another domain. The site speaks English and Spanish.
- `specs/tech-stack.md`: Angular's built-in i18n with `/en/` and `/es/` prerendered; translations compiled into each page. Images
  scale to the width of their column. The page works from 320px wide.
- Design (`CLAUDE.md`): Figma page "Web — v4" (`150:2`). Above the video there are two frames:
  - **Hero** (mobile `210:62`, desktop `150:26`): the photo "Foto — torso" filling the frame, a fade, the logo "Logo WAVEBUTO"
    and the header "Nav/Header" with "/ instagram" and the button "Bookings →".
  - **Manifiesto** (mobile `625:299`, desktop `625:296`): the photo "Foto — cara" (a crop) and the manifesto text. Its annotations:
    reading order `LONDON · FREEHAND STRUCTURE · AMSTERDAM · BASED ON YOUR ANATOMY · BRAZIL · TO CREATE A UNIQUE NEW SKIN · SYDNEY ·
LIMITED SPOTS · MORE TO COME`, cities in Inter Black and phrases in Inter Light; the visible string runs together with no
    spaces, so it is `aria-hidden="true"` and a readable version (spaces, normal case) is given to screen readers.
- Starting point: `Home` shows an `h1` "Wavebuto", one sentence, and `<section id="contact">` with the form.
  `src/app/home/home.spec.ts` checks that `Home` has one `h1` reading "Wavebuto" and one direct-child paragraph, and that nothing
  under it has `[src]` or `[href]`. `app.html` wraps the page in `<main>`. The router already has
  `withInMemoryScrolling({ anchorScrolling: 'enabled' })`.

## Scope

### In

- An `Introduction` component in `src/app/introduction/`, with its spec: the Hero (header with the Bookings link, the logo as the
  page's `h1`, the torso photo) and the Manifiesto (the face photo, the manifesto's visual and readable versions).
- `Home` placing it before `<section id="contact">`, and dropping its current `h1` and sentence.
- The three images exported from Figma into `public/web/`.
- Every text marked for translation, with its provisional Spanish text in `src/locale/messages.es.xlf`.
- Rewriting two checks of `src/app/home/home.spec.ts`, with the developer's approval (decision 10).

### Out

- Styles: no component styles (phase 7). Until then the photos show one after the other, never wider than the page (`img` already has
  `max-width: 100%` in `src/styles.css`), and both versions of the manifesto show one after the other.
- The fade over the torso photo and the manifesto's ink texture: they are visual effects (phase 7).
- The "/ instagram" link (decision 5).
- The video (phase 6) and the SEO title and description (phase 8).
- Any anchor other than `#contact`, and any change to the form.

## Decisions

1. **One component.** `Introduction` (`src/app/introduction/`) holds the Hero and the Manifiesto. `Home` places it first, before
   `<section id="contact">`. Neither part is a `<section>` or has an `id`: `#contact` stays the page's only anchor.
2. **Structure, in this order.**
   - The Hero is a `<header>` (inside `<main>`, so it is not the page's banner landmark) holding the Bookings link, the `h1` with
     the logo, and the torso photo.
   - The Manifiesto is a `<div>` holding the face photo, then the visual version, then the readable version.
   - Each design frame has its own wrapping element, so phase 7 can style each one without adding markup.
3. **The logo is the page's only `h1`.** `<h1><img alt="Wavebuto" …></h1>`, with the SVG exported from Figma. The current `h1`
   and sentence of `Home` are removed. The route's title (`@@route.home.title`) does not change.
4. **The Bookings link goes to `#contact`.** It is an `<a>` with `routerLink="/"` and `fragment="contact"`, so it scrolls to the
   form without leaving the page. Its text is "Bookings" plus an arrow in an `aria-hidden="true"` element, so a screen reader reads
   only the word. Figma's description of "Nav/Bookings" says it links to `#bookings`; `specs/` names the anchor `#contact`, and
   `specs/` wins (confirmed by the developer).
5. **No Instagram link.** It needs the artist's real account and is an outgoing link; it is left out until there is one.
6. **Images.** All three live in `public/web/`, next to the video's poster, and are referenced by a path relative to the page
   (`web/…`), so `/en/` and `/es/` each load their own copy.
   - `logo-wavebuto.svg`: the logo as Figma exports it.
   - `intro-torso.webp`: the torso photo at its own width (724px, the size of the original in Figma); it is not upscaled
     (confirmed by the developer).
   - `intro-face.webp`: the face crop that the Figma annotation describes, exported as its own asset, at the crop's own width
     (≈558px); it is not upscaled.
   - The photos are converted to WebP with ImageMagick, which is already on the system and is not a project dependency.
   - Every `<img>` has `width` and `height` with the file's own size, so the page does not jump while it loads. The face photo has
     `loading="lazy"`; the torso photo and the logo load at once, since they are the first thing on the page.
   - No exported file may reference anything off-origin (the SVG is checked for `http`, `//` and `<image>`; the `xmlns`
     namespace is the only expected match, and it loads nothing).
7. **Alternative texts.** Both photos show the artist's work and get a short descriptive `alt` in both languages; the logo's `alt` is
   "Wavebuto" in both. The texts are provisional (decision 9).
8. **The manifesto, in two versions, from one list of texts.**
   - The manifesto is a list of nine segments in the reading order of the Figma annotation, each a city or a phrase, each its own
     translation unit with `$localize` and `@@intro.manifesto.<n>`. Neither version restates the copy.
   - **Visual version**, `aria-hidden="true"`: the segments in upper case (`toLocaleUpperCase` for the page's language), cities in
     `<b>`, words run together with no spaces. A `<wbr>` sits where each space was, so the line can break there and the page has no
     horizontal scroll at 320px. The hyphens and fixed line breaks of the design depend on the line's width and are left to phase 7.
   - **Readable version**: the same segments in sentence case, each ending in a full stop, as one paragraph that screen readers read.
     Until phase 7 hides it visually, it shows below the visual version.
9. **Texts and translation.** Every text is marked with `i18n` or `$localize` and a stable ID under `@@intro.`. The English copy
   comes from Figma; the Spanish copy is a provisional translation, everything translated (city names and "freehand" included), for
   the artist to approve in phase 11:

   | ID                       | English                             | Spanish                                     |
   | ------------------------ | ----------------------------------- | ------------------------------------------- |
   | `intro.bookings`         | Bookings                            | Reservas                                    |
   | `intro.logo.alt`         | Wavebuto                            | Wavebuto                                    |
   | `intro.torso.alt`        | Black line tattoo across a torso    | Tatuaje de líneas negras sobre un torso     |
   | `intro.face.alt`         | Close-up of a face with black lines | Primer plano de un rostro con líneas negras |
   | `intro.manifesto.1` city | London                              | Londres                                     |
   | `intro.manifesto.2`      | Freehand structure                  | Estructura a mano alzada                    |
   | `intro.manifesto.3` city | Amsterdam                           | Ámsterdam                                   |
   | `intro.manifesto.4`      | Based on your anatomy               | Basada en tu anatomía                       |
   | `intro.manifesto.5` city | Brazil                              | Brasil                                      |
   | `intro.manifesto.6`      | To create a unique new skin         | Para crear una piel nueva y única           |
   | `intro.manifesto.7` city | Sydney                              | Sídney                                      |
   | `intro.manifesto.8`      | Limited spots                       | Plazas limitadas                            |
   | `intro.manifesto.9`      | More to come                        | Próximamente, más                           |

10. **`home.spec.ts` is rewritten in two checks, with the developer's approval.**
    - "shows a title and one sentence" becomes: `Home` has exactly one `h1`, whose image has `alt="Wavebuto"`, and
      `app-introduction` comes before `section#contact`.
    - "loads nothing" becomes "loads nothing off-origin": every `[src]` and `[href]` under `Home` is a same-origin path (no scheme
      and no leading `//`). It keeps the intent of guardrail 3 now that the page has images and a link.
    - "places the form in the section with the contact anchor" does not change.
11. **One commit per task group** in `plan.md`, each with `pnpm check` green.

## Consequences

- Phase 7 hides the readable version of the manifesto visually (not with `display: none`), lays the visual version out with the
  design's fonts, line breaks and texture, places the torso photo behind the header and logo with the fade, and sizes the photos to
  their column. It adds no markup.
- Phase 7 decides whether the visual version's line breaks are fixed per breakpoint (as in the design) or left to the browser.
- Phase 11 has the artist approve the introduction's copy and its Spanish translation along with `specs/form.md`'s, and add the
  Instagram link if they want it.
- The face crop is only ≈558px wide, so it is not sharp at 2× on desktop; the Figma annotation suggests asking the artist for a
  larger original.
- The torso photo is only 724px wide, so it is soft wherever it is shown wider than that (the desktop frame is 1440px); ask the
  artist for a larger original too.
