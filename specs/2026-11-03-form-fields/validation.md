# Validation — Form fields

The phase can be merged when every check below passes. Phase 3 (validation) does not start until it is merged.

## Artist

- [ ] The artist has confirmed the field list: the groups, every field, which are required, and every option.
- [ ] Every question the design left open has the artist's answer recorded in `form.md`'s differences section, and none is left in
      `QUESTIONS.md`.
- The Spanish text does **not** need the artist's approval to merge: it stays marked as a proposal until launch (phase 11).

## Against the design (Figma v4, `150:9` and `210:61`)

- [ ] Every input in the design is either in `form.md` or listed in its differences section with the reason.
- [ ] Every field in `form.md` that is not in the design is listed in its differences section with the reason.
- [ ] Every label and option matches the design's English text, apart from casing, or the difference is listed.
- [ ] Any difference between the desktop and mobile frames is listed and resolved.

## Against the specs

- [ ] Every decision of `specs/roadmap.md` phase 2 holds in `form.md`: no field describes the tattoo, no group 03 (References) and
      the groups are numbered 01–04, Instagram and email are required, the dates are a range of two date pickers, the radio questions
      are optional, and a required consent checkbox with a privacy notice comes before "Send request".
- [ ] No field is there "just in case" (`specs/mission.md`): each one is in the design or was asked for by the artist.
- [ ] No field accepts images or files.

## The document

- [ ] Every field and every option value has a key, and no key is repeated.
- [ ] Every label, option and fixed text has both an English and a Spanish text.
- [ ] The privacy notice is marked as a placeholder and uses `hello@wavebuto.example`.
- [ ] `form.md` defines no validation rule beyond "required" and the control type, and no error message (phases 3 and 4).
- [ ] Phase 2 is marked done in `specs/roadmap.md`.

## Automated

- [ ] `pnpm format:check` passes.
- [ ] `pnpm check` passes (no code changed, so it must still be green).
