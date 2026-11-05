# Requirements — Visual design

Roadmap phase 6 (`specs/roadmap.md`): apply the Figma design to the whole page, mobile first.

## Context

- `specs/mission.md`: nothing is loaded from another domain; the page works on any screen and gives every screen the same content.
- `specs/tech-stack.md`: plain CSS, no framework or preprocessor. The base styles are the phone layout and work from 320px wide;
  wider screens add to them with `min-width: 40rem`, the only breakpoint. Text sizes scale fluidly; images scale to their column.
  The design's fonts are self-hosted (decision 2).
- Design (`CLAUDE.md`): Figma page "Web — v4" (`150:2`). Frame "Landing — Mobile 390" (`210:61`) is the base layout; frame
  "Landing — Desktop 1440" (`150:9`) is what the `40rem` breakpoint adds. Its frames, top to bottom: Hero (`210:62` / `150:26`),
  Manifiesto (`625:299` / `625:296`), Vídeo (`210:68` / `172:107`, phase 7) and Contacto (`210:70` / `175:110`).
- The design's variables (read with `get_variable_defs` on both frames):
  - Colours: `--color-surface` `#141210`, `--color-fg` `#e6e0d8`, `--color-muted` `#8a8279`, `--color-accent` `#e6e0d8`,
    `--color-on-accent` `#141210`, `--color-border` `#e6e0d8`, `--color-on-photo` `#ffffff`. Measured against the surface: fg
    14.25:1, muted 4.94:1, on-photo 18.69:1; on-accent against the accent 14.25:1.
  - Spacing (px): 14, 16, 20, 24, 28, 32, 40, 56, 72, 80, 96, 160, 180.
  - Type styles: the nav, eyebrow, group, label and action texts in JetBrains Mono Medium 11–13px, upper case, letter-spacing
    4–40%; the field values, options, helper text and notice in Archivo Regular 14–17px; the button in Archivo Black 16px, 6%; the
    form's title in Inter Bold, 44px on mobile and 88px on desktop, line-height 0.92, −3%; the manifesto in Inter Black (cities) and
    Inter Light (phrases), 22px on mobile and 40px on desktop, line-height 1, −3%.
  - Effects: `manifesto/ink` (grain, noise, blur). Not built (decision 6).
- Starting point: `src/styles.css` holds a light theme, a system font stack and token names from the archived `spec.md` §9.
  `src/app/app.css` pads `<main>` into one column. `Introduction` and `ContactForm` have no styles. Phase 5's requirements
  (`specs/2026-11-04-introduction/requirements.md`, Consequences) leave the hero's layout and fade, the manifesto's layout and the
  hiding of its readable version to this phase.

## Scope

### In

- The design's fonts, self-hosted (decision 2).
- `src/styles.css`: the design's tokens and the element defaults, replacing the current theme (decision 3).
- `src/app/app.css`: the page shell, with no padding, so the hero is full-bleed.
- Component styles for `Introduction` (hero and manifesto) and `ContactForm` (header, groups, controls, errors, sending).
- Updating the "unstyled until phase 6" comments in the code.

### Out

- **Markup, behaviour, fields, routes and text.** Phase 6 adds styles only; no template changes (decision 1).
- The video (phase 7), its frame and its spacing.
- The "/ instagram" link (phase 5, decision 5): the hero's header has only Bookings.
- Group "03 — References" and its uploads (`specs/form.md`, Differences from the design).
- The manifesto's ink texture (decision 6).
- Hover or motion effects that the design does not show.
- Changing a test, the build budgets or the stylelint rules.

## Decisions

1. **Styles only.** Every rule hooks onto the markup that exists: elements, attributes (`aria-hidden`, `aria-invalid`, `type`,
   `id`) and structure. No class, wrapper, `id` or attribute is added to a template. If a style cannot be written without a new
   hook, that is a question for the developer, not a licence to change the template (`CLAUDE.md`, M5).
2. **Self-hosted fonts** (decided by the developer). Inter (300, 700, 900), Archivo (400, 900) and JetBrains Mono (500), as `woff2`
   files under the SIL Open Font License, with their licence texts next to them.
   - The developer provides the files, or types the download URL; nothing is fetched from a URL found in a file or a tool result.
   - They live in `src/fonts/` and are referenced from `src/styles.css` by a relative `url()`, so the build copies them next to
     each locale's stylesheet. Nothing is loaded from another domain.
   - Each `@font-face` uses `font-display: swap`, and each family's stack ends in a system fallback (`system-ui` or
     `ui-monospace`).
   - The files cover every character the page shows in both languages, including `→` (U+2192), which Google's Latin subset leaves
     out. This is checked on the files.
   - `specs/tech-stack.md` and `CLAUDE.md` say this in place of "no webfont".
3. **Tokens.** `src/styles.css` takes the design's variables as its tokens and drops the archived ones (`--color-bg` becomes
   `--color-surface`, and so on). Every token is renamed in one place, and no component keeps an old name.
   - **Colours** are the design's, under the design's names. The page is dark: `--color-surface` background, `--color-fg` text.
   - **`--color-error`** is new. The design shows no error, so its value is chosen here: a warm red that measures at least 4.5:1
     against `--color-surface`, measured and noted in a comment.
   - **Spacing** is `--space-<px>` for each design value, in `rem` (`--space-24: 1.5rem`).
   - **Type** gets one token per family (`--font-display`, `--font-body`, `--font-mono`), one per size and one per letter-spacing
     (in `em`, from the design's percentages). The title and the manifesto sizes are `clamp()` from their mobile to their desktop
     size, so they grow with the screen and never jump at the breakpoint.
   - `--touch-target` (44px) and `--border-width` stay.
   - Component styles have no `rem`, `em` or `px` of their own; stylelint already rejects them there.
4. **Element defaults** in `src/styles.css`: body in `--color-surface` and `--color-fg` with `--font-body`; `color-scheme: dark`;
   the focus ring is kept, in `--color-fg` (14.25:1), 2px with a 2px offset; `img` keeps `max-width: 100%`. The smooth anchor
   scroll and the scroll snap stay, still only under `prefers-reduced-motion: no-preference`.
5. **Hero.**
   - The `<header>` is the hero frame: full width, the design's height (720px mobile, 880px desktop, as tokens).
   - The torso photo covers the frame behind the rest (`object-fit: cover`).
   - The fade is a `linear-gradient` from transparent to `--color-surface` over the frame's bottom third (260px mobile, 300px
     desktop), drawn as a pseudo-element of the header.
   - The logo is centred, 150px wide on mobile and 224px on desktop.
   - The Bookings link is the design's button: top right, `--color-accent` fill, `--color-on-accent` text, JetBrains Mono upper
     case. Its arrow is already in the markup. It is at least `--touch-target` high.
6. **Manifiesto** (texture and line breaks decided by the developer).
   - Mobile: the face photo above the text, both the column's width. Desktop: photo on the left (400 of 1120) and text on the
     right (680), as in `625:296`.
   - The visual version: upper case already in the markup; cities `<b>` in Inter Black, words in Inter Light, letter-spacing
     −3%, line-height 1.
   - **Line breaks are the browser's**, at the `<wbr>` between words, with no hyphens; the design's fixed breaks with a hyphen
     mid-word are not copied. They hold in any width and in both languages.
   - **No ink texture.** The text is flat `--color-fg`. A texture would need an SVG filter in the markup (decision 1).
   - The readable version is hidden visually but kept for screen readers (the usual clip pattern), never with `display: none` or
     `visibility: hidden`.
7. **Form header.** Eyebrow and legend in JetBrains Mono and `--color-muted`; the title `h2` in Inter Bold, upper case, fluid from
   44px to 88px.
8. **Groups.** Each top-level `<fieldset>` has a top rule in `--color-border` and the design's spacing.
   - Mobile: the group title (`<legend>`) above its fields, one column.
   - Desktop: the title in a column of its own (320 of 1120) and the fields in another (720), as in `566:202`. The `<legend>` is
     floated so it takes part in the grid; this needs no markup.
   - Group 01 puts two fields per row on desktop; the rest stay one per row.
   - The sending part (consent, privacy notice, button, notice) sits in the fields' column on desktop, with no title, as in
     "Acciones" (`566:252`).
9. **Controls.**
   - Labels and nested legends in JetBrains Mono, upper case, as in `form/label`.
   - Text, email and date inputs: no box, only a bottom border in `--color-border`; the value in Archivo 17px.
   - Textarea: a full border, as in "Campo — Anything else".
   - Radios and the checkbox are the native controls with `accent-color` and the design's size. Each option, with its label, is
     at least `--touch-target` high. The design draws 18px rows; the extra height is padding.
   - The date range ("From" and "To", not in the design): the two inputs under the design's label "Preferred date / dates",
     stacked on mobile and side by side on desktop.
   - The consent checkbox (not in the design) uses the option style.
10. **Errors** (not in the design): the message under its field in `--color-error`, in `form/helper`'s type; the field marked
    `aria-invalid="true"` gets its border in `--color-error` too. The text already says what is wrong, so colour is never the only
    signal.
11. **Sending.** The button is the design's ("Send request"): `--color-accent` fill, `--color-on-accent` text, Archivo Black upper
    case, at least 248×56 like the design. Its arrow (`specs/form.md`) is CSS generated content with empty alternative text
    (`content: '→' / ''`), so screen readers read only "Send request". The privacy notice and the notice use `form/notice` in
    `--color-muted`.
12. **Widths.** Mobile has a 24px gutter, so at 320px the column is 272px. Desktop has the design's 160px gutter at 1440, made
    fluid so it shrinks at narrower desktops. The contact section's content is never wider than 1120px.
13. **Budgets are not raised.** `anyComponentStyle` warns at 4kB. If a component's styles pass it, that is a question for the
    developer, not a change to `angular.json`.
14. **One commit per task group** in `plan.md`, each with `pnpm check` green.

## Differences from the design

- No ink texture on the manifesto, and its line breaks are not fixed (decision 6).
- No "/ instagram" link in the hero's header (phase 5, decision 5).
- No group "03 — References"; the groups are numbered 01–04 (`specs/form.md`).
- Elements the design does not draw, styled here in its language: the date range, the consent checkbox, the privacy notice, the
  error messages and the error colour.
- Radio and checkbox rows are 44px high, not 18px, so they meet the touch target.

## Consequences

- Phase 7 adds the video between the manifesto and the contact section, with the design's sizes and these tokens.
- The torso photo (724px) is upscaled on screens wider than that, and the face crop (≈558px) is soft at 2×. Phase 11 already asks
  the artist for larger originals.
- The font files add to the first load. Their weight is noted when they are added.
