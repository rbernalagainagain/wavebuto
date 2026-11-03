# Plan — Form fields

Branch `feat/form-fields`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. This phase changes
documentation only. Each group ends with `pnpm format:check` green and one commit.

## 1. Rewrite `form.md` from Figma v4

1. Read the frames "Landing — Desktop 1440" (`150:9`) and "Landing — Mobile 390" (`210:61`) of page "Web — v4" (`150:2`) through the
   Figma MCP. Do not use the earlier `form.md` as the source.
2. List every input in the design, in order: its group, label, control type, options, required marker and helper text. Note any
   difference between the desktop and mobile frames.
3. Apply the roadmap's decisions (`requirements.md`, decision 1): drop group 03 (References), renumber the groups 01–04, make the
   dates a range of two date pickers, add the consent checkbox and the privacy notice.
4. Give each field and option value a stable key, and write the Spanish text for every label, option and fixed text.
5. Rewrite `specs/form.md`: header, the four groups, the sending section (consent, privacy notice, button, notice) and the
   differences from the design.
6. Compare the result with the design again, element by element, looking for anything missing, added or changed. Write down every
   question the design leaves open for the artist.
7. `pnpm format:check`, then commit.

## 2. Artist review

1. Send the artist the field list (groups, fields, required markers, options) and the open questions from group 1. Send the Spanish
   text too, as a proposal.
2. Apply the artist's answers to `specs/form.md` and record each change in its differences section.
3. If the answers change anything already decided in `specs/roadmap.md` phase 2, stop and update the roadmap first: `specs/` is the
   higher authority.
4. If the artist is not available, the developer answers the open questions provisionally, with the option that changes least,
   and `form.md` marks them as provisional. The artist confirms them in phase 11; the phase does not wait for that.
5. `pnpm format:check`, then commit.

## 3. Close the phase

1. Go through `validation.md`.
2. Mark phase 2 done in `specs/roadmap.md`, with the date and a link to this folder, like phase 1.
3. `pnpm format:check` and `pnpm check`, then commit.
