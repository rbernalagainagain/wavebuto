# Roadmap

High-level implementation order, in very small phases. The phases are built and verified locally; the site is published once, when
v1 is complete.

The form comes first: before anything else, a request has to reach the artist's inbox. Both languages are part of the structure from
the first phase, so no text is ever written in only one. The visual design from Figma is applied in its own phase, after structure and
behaviour work.

## v1

1. **Two languages.** Set up Angular's built-in i18n with `/en/` and `/es/` prerendered as separate pages. Remove Transloco.
2. **Form fields.** Agree the exact v1 fields with the artist: contact details, the tattoo they want, availability, and other notes.
3. **Validation.** One Zod schema with the rules for those fields, with tests written first.
4. **Form.** The form on the page with every field, its label and its error messages, in both languages. Unstyled.
5. **Email delivery.** The Worker on `/api/contact` receives a request, validates it with the same schema, and emails it to the artist.
6. **Sending.** The form sends to the Worker and shows the person whether the request was sent or failed.
7. **Introduction.** The introduction section above the form.
8. **Video.** The video of the artist's work, between the introduction and the form.
9. **Visual design.** Apply the Figma design to the whole page.
10. **Launch.** Publish v1.

## After v1

11. **Reference images.** Let people attach reference images to their request.
