# Roadmap

High-level implementation order, in very small phases. The phases are built and verified locally; the site is published once, when
v1 is complete.

The form comes first, but sending it comes last: the whole page is built and styled before a request reaches the artist's inbox, and
email delivery and sending are the last phases before launch. Both languages are part of the structure from the first phase, so no
text is ever written in only one. The visual design from Figma is applied in its own phase, after structure work. Every phase works
on any screen from 320px wide (`tech-stack.md`): an unstyled phase still reflows on a phone, and phase 7 adds the look, not the
responsiveness.

## v1

1. **Two languages.** Set up Angular's built-in i18n with `/en/` and `/es/` prerendered as separate pages, and `/` redirecting to
   the visitor's language (English by default). Remove Transloco.
   **Done** 2026-11-03 (`specs/2026-11-03-two-languages/`).
2. **Form fields.** Take the v1 fields from the [Figma design](https://www.figma.com/design/6T0g1ib2lMXa5mTP9sOY0o/wavebuto), page
   "Web — v4" (`150:2`), and confirm them with the artist: contact details, the tattoo they want, availability, and other notes. The
   agreed list is written to `specs/form.md`, which from then on is the source of truth for the fields. Already decided:
   - **No field describes the tattoo.** The design has none and none is added; the tattoo is described by its placement, its
     symmetry and "Anything else".
   - **Group 03 (References) is not in v1**, so the form has four groups, not the design's five, and they are numbered 01–04.
   - **Instagram and email are both required**, as in the design.
   - **"Preferred date / dates" is a range** of two native date pickers (`<input type="date">`), not free text.
   - **The radio questions are optional**, as in the design: symmetry, flexible dates and tattoo history.
   - **A required consent checkbox** comes before "Send request", with a short notice of what happens to the person's data.
   - **Every label, option and message is written in English and Spanish** in `specs/form.md`; the design is in English only, and
     the Spanish text is the artist's to approve.
     **Done** 2026-11-03 (`specs/2026-11-03-form-fields/`). The artist has not confirmed the fields yet: the open questions have
     provisional answers in `specs/form.md`, and the confirmation moves to phase 11.
3. **Validation.** One Zod schema with the rules for those fields, with tests written first.
   **Done** 2026-11-03 (`specs/2026-11-03-validation/`).
4. **Form.** The form on the page with every field, its label and its error messages, in both languages, in a section with the
   anchor `#contact` so a link can open the page directly on it. Unstyled.
   **Done** 2026-11-03 (`specs/2026-11-03-form/`).
5. **Introduction.** The introduction section above the form.
6. **Video.** The video of the artist's work, between the introduction and the form, scaled to the width of the screen.
7. **Visual design.** Apply the Figma design to the whole page, mobile first, following page "Web — v4" (`150:2`): frame "Landing —
   Mobile 390" (`210:61`) is the base layout, and "Landing — Desktop 1440" (`150:9`) is what the `40rem` breakpoint adds. The other
   `Web — v*` pages are not the reference.
8. **SEO.** A title and description for each language, `hreflang` links between `/en/` and `/es/`, and a sitemap.
9. **Email delivery.** The Worker on `/api/contact` receives a request, validates it with the same schema, and emails it to the artist.
   This replaces the old handler in `src/index.js`, whose own rules for the old fields (`nombre`, `email`, `mensaje`) are the last
   ones outside `src/app/validation/`.
10. **Sending.** The form sends to the Worker and shows the person whether the request was sent or failed.
11. **Launch.** Have the artist confirm the field list and the provisional answers in `specs/form.md`, and approve the Spanish
    text. Replace the placeholder privacy notice and contact address there with the artist's real ones, then publish v1.

## After v1

12. **Reference images.** Let people attach reference images to their request.
