# Validation — Form fields

The phase can be merged when every check below passes. Phase 3 (validation) does not start until it is merged.

## Artist

- [x] Every question the design left open has an answer in `form.md`: the artist's, or a provisional one marked as such. None is
      left in `QUESTIONS.md`.
- [x] `specs/roadmap.md` phase 11 includes the artist's confirmation of the field list and of any provisional answer.
- The artist's confirmation and the Spanish text do **not** block the merge: both wait until launch (phase 11).

## Against the design (Figma v4, `150:9` and `210:61`)

- [x] Every input in the design is either in `form.md` or listed in its differences section with the reason.
- [x] Every field in `form.md` that is not in the design is listed in its differences section with the reason.
- [x] Every label and option matches the design's English text, apart from casing, or the difference is listed.
- [x] Any difference between the desktop and mobile frames is listed and resolved.

## Against the specs

- [x] Every decision of `specs/roadmap.md` phase 2 holds in `form.md`: no field describes the tattoo, no group 03 (References) and
      the groups are numbered 01–04, Instagram and email are required, the dates are a range of two date pickers, the radio questions
      are optional, and a required consent checkbox with a privacy notice comes before "Send request".
- [x] No field is there "just in case" (`specs/mission.md`): each one is in the design, was decided in `specs/roadmap.md`, or was asked for by the artist.
- [x] No field accepts images or files.

## The document

- [x] Every field and every option value has a key, and no key is repeated.
- [x] Every label, option and fixed text has both an English and a Spanish text.
- [x] The privacy notice is marked as a placeholder and uses `hello@wavebuto.example`.
- [x] `form.md` defines no validation rule beyond "required" and the control type, and no error message (phases 3 and 4).
- [x] Phase 2 is marked done in `specs/roadmap.md`.

## Automated

- [x] `pnpm format:check` passes.
- [x] `pnpm check` passes (no code changed, so it must still be green).
