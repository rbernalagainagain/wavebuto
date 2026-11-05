# Plan — Introduction

Branch `feat/introduction`. Scope and decisions are in `requirements.md`; what counts as done is in `validation.md`. Each group ends
with `pnpm check` green and one commit. In groups 2 and 3, the component tests for the group are written first and seen failing,
then the template and code are added until they pass; the commit holds both.

Every group that adds text also translates it: run `pnpm ng extract-i18n --format xlf2 --output-path src/locale`, then add each new
unit's Spanish text to `src/locale/messages.es.xlf`, copied verbatim from the table in `requirements.md` (decision 9). The group's
commit holds both files, so no text is ever in English only.

## 1. Images

1. Export from Figma, through `get_design_context`, the logo (`210:65`) as SVG, the torso photo (`210:63`) and the face crop
   (`625:297`, as the annotation describes).
2. Convert both photos to WebP with ImageMagick: both at their own width (the torso 724px, the face 558px), neither
   upscaled. Save them in `public/web/` as
   `logo-wavebuto.svg`, `intro-torso.webp` and `intro-face.webp`.
3. Check that the SVG references nothing off-origin, and note each file's width, height and weight.
4. `pnpm check`, then commit.

## 2. Hero

1. Tests for `Introduction`: a `<header>` with, in order, a link whose text is "Bookings" and whose `href` ends in `#contact`, with
   its arrow `aria-hidden="true"`; an `h1` holding only the logo image, with `alt="Wavebuto"`, its `src`, `width` and `height`; the
   torso photo with its `alt`, `width` and `height`. No link to Instagram.
2. Rewrite the two checks of `src/app/home/home.spec.ts` (`requirements.md`, decision 10).
3. Create `src/app/introduction/` with `Introduction` and its Hero. Place it in `Home` before `<section id="contact">`, and remove
   `Home`'s `h1` and sentence and their units from `src/locale/messages.es.xlf`.
4. Extract and translate the new texts.
5. `pnpm check` and `pnpm build`, then commit.

## 3. Manifiesto

1. Tests: after the `<header>`, a block with the face photo (its `alt`, `width`, `height` and `loading="lazy"`), then the visual
   version with `aria-hidden="true"`, the nine segments in upper case, the four cities in `<b>` and a `<wbr>` for every space, then
   the readable version reading "London. Freehand structure. Amsterdam. Based on your anatomy. Brazil. To create a unique new skin.
   Sydney. Limited spots. More to come."
2. Add the list of segments with `$localize`, the face photo and both versions.
3. Extract and translate the new texts.
4. `pnpm check` and `pnpm build`, then commit.

## 4. Close the phase

1. Check in the browser with `pnpm preview`: open `/en/`, `/es/` and `/`, follow the Bookings link with the mouse and with the
   keyboard, and look at the page 320px wide.
2. Go through `validation.md`.
3. Mark phase 5 done in `specs/roadmap.md`, with the date and a link to this folder.
4. `pnpm check` and `pnpm format:check`, then commit.
