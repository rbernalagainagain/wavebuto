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
  - Type styles (as the design stands on 2026-11-06): the nav, eyebrow, group, label and action texts in Geist Mono Medium
    11–13px, upper case, letter-spacing 4–40%; the field values, options, helper text and notice in Instrument Sans Regular
    14–17px; the button in Instrument Sans Bold 16px, 6%; the form's title in Bodoni Moda Black (Geist Black here, decision 7), 40px
    on mobile and 88px on desktop, line-height 0.92, −1%; the manifesto in Geist Black (cities) and Geist Light (phrases), 22px on mobile and 40px on
    desktop, line-height 1, −3%.
  - Effects: `manifesto/ink` (grain, noise, blur). Not built (decision 6).
- Starting point: `src/styles.css` holds a light theme, a system font stack and token names from the archived `spec.md` §9.
  `src/app/app.css` pads `<main>` into one column. `Introduction` and `ContactForm` have no styles. Phase 5's requirements
  (`specs/2026-11-04-introduction/requirements.md`, Consequences) leave the hero's layout and fade, the manifesto's layout and the
  hiding of its readable version to this phase.

## Scope

### In

- `src/styles.css`: the design's tokens and the element defaults, replacing the current theme (decision 3).
- `src/app/app.css`: the page shell, with no padding, so the hero is full-bleed.
- Component styles for `Introduction` (hero and manifesto) and `ContactForm` (header, groups, controls, errors, sending).
- Updating the "unstyled until phase 6" comments in the code.

### Out

- **Markup, behaviour, fields, routes and text.** Phase 6 adds styles only; no template changes (decision 1).
- The video (phase 7), its frame and its spacing.
- The "/ instagram" link (phase 5, decision 5): the hero's header has only Bookings.
- Group "03 — References" and its uploads (`specs/form.md`, Differences from the design).
- The fonts' files and `@font-face` rules: moved to roadmap phase 11 (decision 2).
- Hover or motion effects that the design does not show. The states drawn in the design's components (Form/Input, Form/Radio,
  Form/Button) are in (decision 15).
- Changing a test, the build budgets or the stylelint rules.

## Decisions

1. **Styles only.** Every rule hooks onto the markup that exists: elements, attributes (`aria-hidden`, `aria-invalid`, `type`,
   `id`) and structure. No class, wrapper, `id` or attribute is added to a template. If a style cannot be written without a new
   hook, that is a question for the developer, not a licence to change the template (`CLAUDE.md`, M5).
2. **Fonts from Google Fonts** (decided by the developer, 2026-11-06, replacing the self-hosted fonts first planned for roadmap
   phase 11). The design changed its families, and they are not self-hosted:
   - One stylesheet `<link>` in `src/index.html` asks for Geist 300 and 900, Geist Mono 500 and Instrument Sans 400 and 700,
     with `display=swap`. No `@font-face` and no font file is in the repo.
   - The tokens name the families (decision 3); each stack ends in a system fallback (`system-ui` or `ui-monospace`),
     which also draws any character a family lacks, such as `→` if its font has none.
   - `wavebuto/no-offorigin-template-resource` allows `https://fonts.googleapis.com` in `src/index.html`'s `<link href>` and
     nowhere else (`eslint.config.js`).
   - `specs/mission.md`, `specs/tech-stack.md` and `CLAUDE.md` say this.
3. **Tokens.** `src/styles.css` takes the design's variables as its tokens and drops the archived ones (`--color-bg` becomes
   `--color-surface`, and so on). Every token is renamed in one place, and no component keeps an old name.
   - **Colours** are the design's, under the design's names. The page is dark: `--color-surface` background, `--color-fg` text.
   - **`--color-error`** is the design's (`#c9725c`, Form/Input, state Error), decided by the developer on 2026-11-05. It
     measures 5.38:1 against `--color-surface` (at least 4.5:1 is required), noted in a comment. It replaces the `#ef6a5a` first
     chosen here, when the design was thought to show no error.
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
   - The Bookings link is the design's button: top right, `--color-accent` fill, `--color-on-accent` text, Geist Mono upper
     case. Its arrow is already in the markup. It is at least `--touch-target` high.
6. **Manifiesto** (texture and line breaks decided by the developer).
   - The text alone (decided by the developer, 2026-11-06): the design removed the face photo, so nothing sits beside the
     text. Mobile: the column's width. Desktop: at most 680 of the 1120 column, from its left edge. Figma's text box spans the
     whole column, but its lines break every 24 characters and fill about 650px; 680 keeps the browser's lines close to that.
   - The visual version: upper case already in the markup; cities `<b>` in Geist Black, words in Geist Light, letter-spacing
     −3%, line-height 1.
   - **Line breaks are the browser's**, at the `<wbr>` between words, with no hyphens; the design's fixed breaks with a hyphen
     mid-word are not copied. They hold in any width and in both languages.
   - **Worn ink** (decided by the developer, 2026-11-06, replacing "no ink texture"): the design's `manifesto/ink` effects
     without markup. A fine noise tile, an SVG image in a data URI (`--texture-ink`), is the text's `mask-image`, so about 17%
     of the surface shows through in specks, as the design's noise does; and the design's blur, 0.19px on mobile and 0.3px from
     `40rem`. The edge displacement of Figma's texture would need an SVG filter in the markup (decision 1) and is not copied.
   - The readable version is hidden visually but kept for screen readers (the usual clip pattern), never with `display: none` or
     `visibility: hidden`.
7. **Form header.** Eyebrow and legend in Geist Mono and `--color-muted`; the title `h2` in Geist Black, upper case, −1%, fluid
   from 40px to 88px. The design draws it in Bodoni Moda Black; the developer chose the manifesto's font instead (2026-11-06),
   so `--font-display` is Geist for both.
8. **Groups.** Each top-level `<fieldset>` has a top rule in `--color-border` and the design's spacing.
   - Mobile: the group title (`<legend>`) above its fields, one column.
   - Desktop: the title in a column of its own (320 of 1120) and the fields in another (720), as in `566:202`. The `<legend>` is
     positioned in that column, which makes it an ordinary child of the fieldset; this needs no markup.
   - A fieldset's own legend sits over its top border and hides it, and a float does not free it in Firefox and Safari when the
     fieldset is a flex or grid container (found by the developer, 2026-11-06). So the rule is never the fieldset's border: on
     mobile the legend draws it above the title, and on desktop a pseudo-element of the fieldset draws it across the group.
   - Group 01 puts two fields per row on desktop; the rest stay one per row.
   - The sending part (consent, privacy notice, button, notice) sits in the fields' column on desktop, with no title, as in
     "Acciones" (`566:252`).
9. **Controls.**
   - Labels and nested legends in Geist Mono, upper case, as in `form/label`.
   - Text, email and date inputs: no box, only a bottom border in `--color-border`; the value in Instrument Sans 17px.
   - Textarea: a full border, as in "Campo — Anything else".
   - Radios and the checkbox are the native inputs drawn as the design's Form/Radio (decided by the developer on 2026-11-05):
     `appearance: none`, an 18px ring with a 1.5px `--color-border` stroke, and an 8px `--color-fg` dot when chosen. The
     checkbox, which the design does not draw, is the same control, square, with a tick. In forced colours the dot and the tick
     use `CanvasText`. Each option, with its label, is at least `--touch-target` high. The design draws 18px rows; the extra
     height is padding, and the radio group's margins take it back so the question, the controls and what follows sit at the
     design's distances.
   - The date range ("From" and "To", not in the design): the two inputs under the design's label "Preferred date / dates",
     stacked on mobile and side by side on desktop.
   - The consent checkbox (not in the design) uses the option style.
10. **Errors** (Form/Input, state Error): the message under its field in `--color-error`, in `form/helper`'s type; the field marked
    `aria-invalid="true"` gets its border in `--color-error` too. The text already says what is wrong, so colour is never the only
    signal.
11. **Sending.** The button is the design's ("Send request"): `--color-accent` fill, `--color-on-accent` text, Instrument Sans Bold upper
    case, at least 248×56 like the design. Its arrow (`specs/form.md`) is CSS generated content with empty alternative text
    (`content: '→' / ''`), so screen readers read only "Send request". The privacy notice and the notice use `form/notice` in
    `--color-muted`.
12. **Widths.** Mobile has a 24px gutter, so at 320px the column is 272px. Desktop has the design's 160px gutter at 1440, made
    fluid so it shrinks at narrower desktops. The contact section's content is never wider than 1120px.
13. **Budgets are not raised without asking.** `anyComponentStyle` warned at 4kB. `contact-form.css` reached 4.83kB, mostly from
    the attribute Angular adds to every selector, and the developer chose to raise the warning to 6kB (the error stays at 8kB).
    Drawing the options and adding the states (decisions 9 and 15) took it to 6.24kB, and the developer raised the warning to
    7kB on 2026-11-05 (the error stays at 8kB).
14. **One commit per task group** in `plan.md`, each with `pnpm check` green.
15. **Interaction states** (decided by the developer on 2026-11-05), as in the design's components:
    - Text, email and date inputs and the textarea: a `--color-fg` tint of 4% on hover and 8% on focus.
    - Radios and the checkbox: a 12% tint inside the control on hover, of the control or of its label.
    - The button: on hover, no fill, a 1.5px `--color-fg` outline and `--color-fg` text; while pressed, the fill at 80%.
    - Hover applies only under `(hover: hover)`, so a tap does not leave it stuck.
    - The focus ring of decision 4 stays on every control. The design's own focus rings (1px around a radio, none on a field)
      are not copied: the ring is never thinner or removed.

## Differences from the design

- No ink texture on the manifesto, and its line breaks are not fixed (decision 6).
- No "/ instagram" link in the hero's header (phase 5, decision 5).
- No group "03 — References"; the groups are numbered 01–04 (`specs/form.md`).
- Elements the design does not draw, styled here in its language: the date range, the consent checkbox and its tick, and the
  privacy notice.
- The focus ring is decision 4's on every control, not the design's 1px ring on radios or its tint-only focus on fields
  (decision 15).
- Radio and checkbox rows are 44px high, not 18px, so they meet the touch target.

## Consequences

- Phase 7 adds the video between the manifesto and the contact section, with the design's sizes and these tokens.
- The face crop (558px) is soft at 2×. The torso photo was a 724px crop upscaled on desktop; it is now one crop per frame at the
  original's resolution (`specs/2026-11-04-introduction/requirements.md`, decision 6). Phase 12 asks the artist for larger
  originals.
- Until phase 11 the page shows the system fonts. The font files add to the first load; their weight is noted when they are
  added.
