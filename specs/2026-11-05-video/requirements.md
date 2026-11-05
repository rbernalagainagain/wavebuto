# Requirements — Video

Roadmap phase 7 (`specs/roadmap.md`): the video of the artist's work, between the introduction and the form, scaled to the width
of the screen.

## Context

- `specs/mission.md`: people who find the site through search see the introduction and the video before the form; people from
  social media land on `#contact`. Nothing is loaded from another domain; every screen gets the same content.
- `specs/tech-stack.md`: the video scales to the width of its column. The base styles are the phone layout, from 320px wide; one
  breakpoint, `min-width: 40rem`.
- Design (`CLAUDE.md`): Figma page "Web — v4" (`150:2`), frame "Vídeo": mobile `210:68` (390×488, below the Manifiesto at
  y=1099), desktop `172:107` (1440×810, at y=1400). The video fills its frame edge to edge, with no gutter, no caption and no
  controls; on mobile it is a portrait crop of the 16:9 video (aspect 390/488), on desktop the whole 16:9 frame. The frames abut
  the Manifiesto above and the Contacto below, so the video adds no spacing of its own. No annotation says how it plays.
- The files, added in phase 1 (`63e46ab`), in `public/web/`:
  - `wavebuto-video.webm`: AV1 Main, level 3.1 (`av01.0.05M.08`), 1280×720, 24 fps, 21.8 s, 1.08 MB.
  - `wavebuto-video.mp4`: H.264 High, level 4.0 (`avc1.640028`), same size and length, 2.02 MB.
  - `wavebuto-video-poster.webp` (19.6 kB) and `wavebuto-video-poster.jpg` (35.9 kB), 1280×720.
  - Neither video has an audio track.
  - `public/wavebuto-video.webm` is a byte-identical copy of the WebM, referenced by nothing, which the build copies into `/en/`
    and `/es/`.
- Starting point: `Home` holds `<app-introduction />` and then `<section id="contact">`. The ESLint rule
  `no-offorigin-template-resource` checks `<video src>` and `<source src>`, but not `<video poster>`.

## Scope

### In

- A `Video` component in `src/app/video/`, with its spec and its stylesheet.
- `Home` placing it between `<app-introduction />` and `<section id="contact">`.
- Its texts marked for translation, with their provisional Spanish in `src/locale/messages.es.xlf`.
- Deleting `public/wavebuto-video.webm` and `public/web/wavebuto-video-poster.jpg` (decision 6).
- `poster` added to the attributes `no-offorigin-template-resource` checks on `<video>` (decision 7).
- Adding a check to `src/app/home/home.spec.ts` for the order of the three parts; no existing check changes.
- Phase 12 in `specs/roadmap.md`: the artist also approves the video's texts.

### Out

- Sound, captions or a transcript: the video has no audio track.
- Re-encoding the video or the poster, or a smaller rendition for phones.
- Any anchor or `id` on the video: `#contact` stays the page's only anchor.
- Any change to the introduction or the form.
- The SEO title and description (phase 8), the fonts (phase 11).

## Decisions

1. **One component.** `Video` (`src/app/video/`, selector `app-video`) is placed by `Home` between the introduction and the
   contact section. Its host is the frame; it is not a `<section>` and has no `id`.
2. **Markup.** A `<video>` and, after it, a `<button type="button">`.
   - `<video>`: `muted`, `loop`, `playsinline`, `preload="none"`, `poster="web/wavebuto-video-poster.webp"`, `width="1280"`
     `height="720"`, and an `aria-label` (decision 5). No `autoplay` and no `controls` attribute (decision 3).
   - Two `<source>`s, in this order: the WebM with `type='video/webm; codecs="av01.0.05M.08"'`, then the MP4 with
     `type='video/mp4; codecs="avc1.640028"'`. The codecs are named so that a browser that reads WebM but cannot decode AV1
     (Safari on hardware without AV1) skips to the MP4: a browser picks a source by its `type`, and never falls back after a
     decoding error.
   - Paths are relative to the page (`web/…`), like the introduction's images, so `/en/` and `/es/` each load their own copy.
3. **Playback** (decided by the developer). The video plays muted and in a loop, on its own, and a button pauses it. A video that
   moves on its own for more than five seconds needs a way to stop it (WCAG 2.2.2), and the design's look has no browser control
   bar.
   - It starts **the first time at least half of it is in view** (an `IntersectionObserver`), not when the page loads. With
     `preload="none"`, nothing of the video is downloaded until then: a visitor who lands on `#contact` and never scrolls up loads
     only the poster.
   - It **does not start on its own when the visitor prefers reduced motion** (`prefers-reduced-motion: reduce`): the poster and
     the Play button show, and the video plays only if they press it.
   - It starts once. After that only the button plays or pauses it; scrolling away and back does not restart a paused video.
   - The `autoplay` attribute is not used: it would start before hydration and ignore reduced motion.
   - All of this runs in the browser after the first render (`afterNextRender`), never during prerendering. A browser without
     `IntersectionObserver` or `matchMedia` leaves the video paused, with the Play button.
   - If the browser refuses to play (its `play()` promise rejects), the video stays paused and the button reads Play. That is the
     visible state, so nothing is hidden from the visitor.
4. **The button.** Its text says what pressing it does: "Pause video" while the video plays, "Play video" while it is paused. The
   state follows the video's own `play` and `pause` events, so it is never out of step with what is on screen. It is at least
   `--touch-target` high, reachable by keyboard, and keeps the focus ring.
5. **Texts** (provisional; the artist approves them in phase 12):

   | ID            | English                              | Spanish                                                    |
   | ------------- | ------------------------------------ | ---------------------------------------------------------- |
   | `video.label` | Black line tattoo drawn along a back | Tatuaje de líneas negras trazado a lo largo de una espalda |
   | `video.pause` | Pause video                          | Pausar vídeo                                               |
   | `video.play`  | Play video                           | Reproducir vídeo                                           |

   The label names what the video shows, as the photos' `alt` does; with no audio track, that is its text alternative.

6. **Unused files are deleted** (decided by the developer): `public/wavebuto-video.webm`, a duplicate that the build copied into
   each locale (1.08 MB each), and `public/web/wavebuto-video-poster.jpg`, since the poster is served as WebP.
7. **`poster` is checked for off-origin URLs.** `no-offorigin-template-resource` lists `poster` next to `src` for `<video>`, so
   guardrail 3 covers every URL the video loads. This tightens the rule; it loosens nothing.
8. **Styles** (`video.css`, tokens only), mobile first:
   - The host is a block with no padding: the video reaches both edges of the screen.
   - The video is `100%` wide with `object-fit: cover`, which also crops the poster: aspect ratio `390 / 488` on mobile and
     `16 / 9` from `40rem`, as in the frames.
   - The button sits over the video's bottom-right corner, in the style of the Bookings button: `--color-accent` fill,
     `--color-on-accent` text, JetBrains Mono upper case. Its insets are the Bookings link's (`--space-20` on mobile;
     `--space-40` and `--space-56` from `40rem`).
9. **Tests** (`video.spec.ts`, `TestBed`, jsdom). jsdom implements neither playback nor `IntersectionObserver` nor
   `matchMedia`, so the spec stubs them (`vi.stubGlobal`, and `play`/`pause` on `HTMLMediaElement.prototype`). It checks:
   - the `<video>`'s attributes of decision 2, with no `autoplay` and no `controls`, and its label;
   - the two sources, their order, their `type` and their same-origin paths;
   - the button's text in each state, and that pressing it pauses or plays;
   - that the video starts when it comes into view, only once, and not at all under reduced motion.
10. **One commit per task group** in `plan.md`, each with `pnpm check` green.

## Differences from the design

- The Pause/Play button over the video (decision 3); the design shows none.

## Consequences

- The video adds 1.08 MB (WebM) or 2.02 MB (MP4) the first time it comes into view; nothing before. The build no longer copies a
  1.08 MB duplicate into each locale.
- The 1280px video and poster are upscaled on screens wider than that, like the introduction's photos. A larger original is a
  question for the artist, alongside theirs (phase 12).
- Phase 12 has the artist approve the video's label and button texts, with the rest of the copy.
