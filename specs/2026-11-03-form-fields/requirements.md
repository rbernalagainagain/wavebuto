# Requirements — Form fields

Roadmap phase 2 (`specs/roadmap.md`): take the v1 fields from the Figma design, page "Web — v4" (`150:2`), confirm them with the
artist, and write the agreed list to `specs/form.md`, which from then on is the source of truth for the fields.

## Context

- `specs/mission.md`: the site's only purpose is the appointment request form. It collects the person's contact details, the tattoo
  they want, their availability and any other notes, and asks only for what the artist needs to answer, nothing "just in case".
  Reference images come after v1.
- `specs/tech-stack.md`: reference images are not in v1. The page speaks English and Spanish.
- Design: Figma file `6T0g1ib2lMXa5mTP9sOY0o`, page "Web — v4" (`150:2`), frames "Landing — Desktop 1440" (`150:9`) and "Landing —
  Mobile 390" (`210:61`). The other `Web — v*` pages are not the reference. The design is in English only.
- Starting point: a first `specs/form.md` was written in commit `bf629e3`. This phase does not take it as given: the field list is
  derived again from the design, and `form.md` is rewritten from that result.

## Scope

### In

- Every input of the form in Figma v4, read again from the design, in both frames.
- Rewriting `specs/form.md`: the form's groups, each field's key, control, whether it is required, its options, and every label and
  option in English and Spanish.
- A section in `form.md` listing every difference from the design and why.
- Answering the design's open questions, provisionally if the artist is not available.
- Marking phase 2 done in `specs/roadmap.md`.

### Out

- Validation rules beyond "required" and the control type: lengths, formats, date limits (phase 3).
- Error messages (phases 3 and 4) and the sent and failed messages (phase 6).
- Any code: no component, schema or template changes in this phase.
- Reference images (phase 12).
- The artist's confirmation of the field list and of the provisional answers. It moves to launch (phase 11), so the phase does not
  wait for the artist.

## Decisions

1. **The roadmap's decisions stand.** Rewriting `form.md` does not reopen what `specs/roadmap.md` phase 2 already decided, since
   `specs/` outranks the design:
   - No field describes the tattoo; it is described by its placement, its symmetry and "Anything else".
   - Group 03 (References) is not in v1, so the form has four groups, numbered 01–04.
   - Instagram and email are both required.
   - "Preferred date / dates" is a range of two native date pickers (`<input type="date">`), not free text.
   - The radio questions (symmetry, flexible dates, tattoo history) are optional.
   - A required consent checkbox comes before "Send request", with a short notice of what happens to the person's data.
   - Every label, option and message is written in English and Spanish.
2. **The design is read afresh.** Every field, label, option and required marker is taken from the Figma frames during this phase,
   not from the earlier `form.md` or any summary of it. Where the two frames disagree, the difference is recorded and the artist
   decides.
3. **Anything else the design and the specs disagree on is asked, not settled.** It goes to the artist with the options, and the
   answer is recorded in `form.md`'s differences section.
4. **Stable keys.** Each field and option value gets an English camelCase or kebab-case key. These keys are the field names in the
   form value and in the request sent to `/api/contact`, so later phases depend on them.
5. **Sentence case.** Labels are written in sentence case; the capitals in the design are styling (phase 9).
6. **Spanish addresses the visitor as _tú_.** The Spanish text is a proposal for the artist to approve; approving it is not required
   to close this phase (see `validation.md`), only before launch (phase 11).
7. **Placeholder privacy notice.** The notice under the consent checkbox is invented for development, marked as a placeholder, and
   uses `hello@wavebuto.example`. Phase 11 replaces it with the artist's real one.
8. **Provisional answers.** While the artist is not available, the developer answers the open questions with the option that
   changes least. The answers are marked as provisional in `form.md` until the artist confirms them in phase 11.
9. **One commit per task group** in `plan.md`, each with `pnpm format:check` green.

## Consequences

- Phase 3 builds the Zod schema from the rewritten `form.md`. A key renamed here is a rename in every later phase, so keys are
  settled before this phase closes.
- If the rewrite matches the earlier `form.md`, the diff is small; if it does not, the differences are the point of the phase.
