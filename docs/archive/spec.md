# SPEC — wavebuto

The concrete slice to build now. This document holds decisions that are expected to change; the durable invariants live in `CONSTITUTION.md` and win on any conflict.

Everything here is normative. If the implementation disagrees with this document, the implementation is wrong.

---

## 1. Scope

One page and one contact form.

| Route | Page | Render mode |
| ----- | ---- | ----------- |
| `/`   | Home | Prerender   |

The page reads top to bottom in this order:

| Part    | Anchor     | Content                  |
| ------- | ---------- | ------------------------ |
| Landing | —          | Introduction to the site |
| Video   | —          | A video                  |
| Contact | `#contact` | The contact form         |

Only the contact form is a declared section with an anchor. The landing
and the video have no anchor and no link to them. The page therefore has
exactly two addresses: `/` and `/#contact`.

The address bar always reads `/`. Following the contact link scrolls to
the form without adding its anchor to the URL. A URL that arrives with
the anchor (`/#contact`) opens on the form, then drops the anchor from
the address bar. A refresh opens at the top of the page, not at the last
position scrolled to.

## 2. Form fields

The form is a tattoo appointment request. Exactly these thirteen fields,
in this order. No others (`CLAUDE.md` guardrail 6).

The fields are grouped. Each group is a `<fieldset>` whose `<legend>` is
the group title.

### 2.1 Personal information

| Field          | Name        | Type  | Required | Label            |
| -------------- | ----------- | ----- | -------- | ---------------- |
| Name           | `name`      | text  | yes      | "Name"           |
| Instagram      | `instagram` | text  | yes      | "Instagram"      |
| Email          | `email`     | email | yes      | "Email"          |
| City / Country | `location`  | text  | yes      | "City / Country" |

### 2.2 Tattoo

| Field          | Name            | Type  | Required | Label                          |
| -------------- | --------------- | ----- | -------- | ------------------------------ |
| Body placement | `bodyPlacement` | text  | yes      | "Body placement"               |
| Symmetry       | `symmetry`      | radio | yes      | "Symmetrical or asymmetrical?" |

`symmetry` options, in order: `symmetrical`, `asymmetrical`, `not-sure`.
Displayed as: "Symmetrical", "Asymmetrical", "Not sure".

### 2.3 References

| Field                  | Name                   | Type                  | Required | Label                    |
| ---------------------- | ---------------------- | --------------------- | -------- | ------------------------ |
| Reference from my work | `workReference`        | image file (one)      | no       | "Reference from my work" |
| Additional references  | `additionalReferences` | image files (several) | no       | "Additional references"  |
| Body photo             | `bodyPhoto`            | image file (one)      | no       | "Body photo"             |

Help text, shown below the control and associated with it via
`aria-describedby`:

- `workReference`: "Attach a screenshot of any of my tattoos you would
  like to use as reference."
- `bodyPhoto`: "If needed, attach a photo of the area to be tattooed."

### 2.4 Availability

| Field                  | Name             | Type  | Required | Label                          |
| ---------------------- | ---------------- | ----- | -------- | ------------------------------ |
| Preferred date / dates | `preferredDates` | text  | yes      | "Preferred date / dates"       |
| Flexible with dates    | `flexibleDates`  | radio | yes      | "Are you flexible with dates?" |

`flexibleDates` options, in order: `yes`, `no`.
Displayed as: "Yes", "No".

### 2.5 Additional information

| Field          | Name            | Type     | Required | Label                                                                     |
| -------------- | --------------- | -------- | -------- | ------------------------------------------------------------------------- |
| Tattoo history | `tattooHistory` | radio    | yes      | "Is this your first tattoo, or do you already have tattoos in this area?" |
| Anything else  | `notes`         | textarea | no       | "Anything else I should know?"                                            |

`tattooHistory` options, in order: `first-tattoo`, `tattoos-in-area`,
`tattoos-elsewhere`. Displayed as: "First tattoo", "I already have
tattoos in this area", "I have tattoos, but not in this area".

### 2.6 Choice controls

Each radio group is a `<fieldset>` whose `<legend>` is its label. No
option is preselected: a required radio group starts with nothing chosen.

## 3. Validation rules

All rules are defined once, as a single Zod schema in `src/app/validation/`. The same schema validates what the user enters and the
payload sent in §5; no rule is restated elsewhere. Each rule is a pure function over a value, testable with no page rendered:

- **Text rules** take a string. They trim leading and trailing whitespace before evaluating.
- **Choice rules** take a string: the value of the chosen option, or `""` when nothing is chosen.
- **Image rules** take the file's metadata — its MIME `type` (a string) and its `size` in bytes (a number) — never the browser's
  `File` object, so they need no DOM.

An optional text field that is empty or whitespace-only passes. An optional image field with no file passes.

### 3.1 `name`

- Required. Empty or whitespace-only fails.
- Minimum 2 characters after trimming.
- Maximum 80 characters after trimming.

| Input       | Result | Reason                   |
| ----------- | ------ | ------------------------ |
| `"Ada"`     | pass   |                          |
| `"Jo"`      | pass   | exactly at the minimum   |
| `"A"`       | fail   | below minimum            |
| `""`        | fail   | required                 |
| `"   "`     | fail   | whitespace-only is empty |
| `"  Ada  "` | pass   | trimmed to `"Ada"`       |
| 81 × `"a"`  | fail   | over maximum             |
| 80 × `"a"`  | pass   | exactly at the maximum   |

### 3.2 `instagram`

- Required.
- One optional leading `@`, then 1 to 30 characters, each a letter, a
  digit, a period `.` or an underscore `_`.
- The leading `@`, if present, is removed from the value that is sent.

This is deliberately permissive. It accepts anything shaped like a
username; it does not check that the account exists.

| Input                 | Result | Reason                            |
| --------------------- | ------ | --------------------------------- |
| `"ada.lovelace"`      | pass   |                                   |
| `"@ada_lovelace"`     | pass   | leading `@` allowed, then dropped |
| `"  @ada  "`          | pass   | trimmed to `"@ada"`               |
| `""`                  | fail   | required                          |
| `"@"`                 | fail   | nothing after `@`                 |
| `"ada lovelace"`      | fail   | space inside                      |
| `"ada!"`              | fail   | character not allowed             |
| `"instagram.com/ada"` | fail   | a link, not a username            |
| 30 × `"a"`            | pass   | exactly at the maximum            |
| 31 × `"a"`            | fail   | over maximum                      |

### 3.3 `email`

- Required.
- Must contain exactly one `@`, at least one character before it, and a
  dot-separated domain after it with a final segment of 2+ characters.
- Maximum 254 characters.

This is deliberately permissive. The rule rejects obvious mistakes; it does not attempt to prove deliverability.

| Input                     | Result | Reason                   |
| ------------------------- | ------ | ------------------------ |
| `"ada@example.com"`       | pass   |                          |
| `"ada@sub.example.co.uk"` | pass   | multiple domain segments |
| `"ada"`                   | fail   | no `@`                   |
| `"ada@"`                  | fail   | no domain                |
| `"@example.com"`          | fail   | nothing before `@`       |
| `"ada@@example.com"`      | fail   | two `@`                  |
| `"ada@example"`           | fail   | no dot in domain         |
| `"ada@example.c"`         | fail   | final segment too short  |
| `""`                      | fail   | required                 |

### 3.4 `location`

- Required. Empty or whitespace-only fails.
- Minimum 2 characters after trimming.
- Maximum 100 characters after trimming.

| Input             | Result | Reason                   |
| ----------------- | ------ | ------------------------ |
| `"Madrid, Spain"` | pass   |                          |
| `"UK"`            | pass   | exactly at the minimum   |
| `"M"`             | fail   | below minimum            |
| `""`              | fail   | required                 |
| `"   "`           | fail   | whitespace-only is empty |
| 100 × `"a"`       | pass   | exactly at the maximum   |
| 101 × `"a"`       | fail   | over maximum             |

### 3.5 `bodyPlacement`

- Required. Empty or whitespace-only fails.
- Minimum 2 characters after trimming.
- Maximum 100 characters after trimming.

| Input            | Result | Reason                   |
| ---------------- | ------ | ------------------------ |
| `"Left forearm"` | pass   |                          |
| `"Ar"`           | pass   | exactly at the minimum   |
| `"A"`            | fail   | below minimum            |
| `""`             | fail   | required                 |
| `"   "`          | fail   | whitespace-only is empty |
| 100 × `"a"`      | pass   | exactly at the maximum   |
| 101 × `"a"`      | fail   | over maximum             |

### 3.6 `symmetry`

- Required. Must be one of `symmetrical`, `asymmetrical`, `not-sure`.

| Input        | Result | Reason                 |
| ------------ | ------ | ---------------------- |
| `"not-sure"` | pass   |                        |
| `""`         | fail   | nothing chosen         |
| `"round"`    | fail   | not in the allowed set |

### 3.7 Images: `workReference`, `additionalReferences`, `bodyPhoto`

All three are optional. Every file, in any of the three fields, must:

- Have a `type` of `image/jpeg`, `image/png`, `image/webp` or
  `image/heic`.
- Be at most 10 MB (10 485 760 bytes).

`workReference` and `bodyPhoto` hold at most one file each.
`additionalReferences` holds at most 5 files, and fails as a whole if any
one of them fails.

| Field                  | Input                                  | Result | Reason                       |
| ---------------------- | -------------------------------------- | ------ | ---------------------------- |
| `workReference`        | no file                                | pass   | optional                     |
| `workReference`        | `image/jpeg`, 2 000 000 bytes          | pass   |                              |
| `bodyPhoto`            | `image/heic`, 10 485 760 bytes         | pass   | exactly at the maximum       |
| `bodyPhoto`            | `image/png`, 10 485 761 bytes          | fail   | over maximum size            |
| `workReference`        | `application/pdf`, 100 000 bytes       | fail   | not an allowed image type    |
| `workReference`        | `""` (type unknown), 100 000 bytes     | fail   | not an allowed image type    |
| `additionalReferences` | no files                               | pass   | optional                     |
| `additionalReferences` | 5 × `image/webp`, 1 000 000 bytes each | pass   | exactly at the maximum count |
| `additionalReferences` | 6 × `image/webp`, 1 000 000 bytes each | fail   | over maximum count           |
| `additionalReferences` | 2 × `image/png` + 1 × `image/gif`      | fail   | one file not allowed         |

### 3.8 `preferredDates`

- Required. Empty or whitespace-only fails.
- Minimum 2 characters after trimming.
- Maximum 200 characters after trimming.

Free text: the rule does not parse dates. "Any weekend in May" is as
valid as "12/05".

| Input                  | Result | Reason                   |
| ---------------------- | ------ | ------------------------ |
| `"Any weekend in May"` | pass   |                          |
| `"12/05"`              | pass   | not parsed as a date     |
| `"Ma"`                 | pass   | exactly at the minimum   |
| `"M"`                  | fail   | below minimum            |
| `""`                   | fail   | required                 |
| `"   "`                | fail   | whitespace-only is empty |
| 200 × `"a"`            | pass   | exactly at the maximum   |
| 201 × `"a"`            | fail   | over maximum             |

### 3.9 `flexibleDates`

- Required. Must be one of `yes`, `no`.

| Input     | Result | Reason                 |
| --------- | ------ | ---------------------- |
| `"yes"`   | pass   |                        |
| `""`      | fail   | nothing chosen         |
| `"maybe"` | fail   | not in the allowed set |

### 3.10 `tattooHistory`

- Required. Must be one of `first-tattoo`, `tattoos-in-area`,
  `tattoos-elsewhere`.

| Input                 | Result | Reason                 |
| --------------------- | ------ | ---------------------- |
| `"tattoos-elsewhere"` | pass   |                        |
| `""`                  | fail   | nothing chosen         |
| `"many"`              | fail   | not in the allowed set |

### 3.11 `notes`

- Optional. Empty or whitespace-only passes and is sent as `""`.
- Maximum 2000 characters after trimming.

| Input                     | Result | Reason                   |
| ------------------------- | ------ | ------------------------ |
| `""`                      | pass   | optional                 |
| `"   "`                   | pass   | whitespace-only is empty |
| `"I'm allergic to latex"` | pass   |                          |
| 2000 × `"a"`              | pass   | exactly at the maximum   |
| 2001 × `"a"`              | fail   | over maximum             |

## 4. Error messages

One message per field, shown below the control. Say what to do, not what
went wrong (`CONSTITUTION.md` §3.2).

| Field     | Message                                              |
| --------- | ---------------------------------------------------- |
| `name`    | "Enter your name (2–80 characters)."                 |
| `email`   | "Enter a valid email address, like ada@example.com." |
| `subject` | "Choose what this is about."                         |
| `message` | "Enter a message (at least 10 characters)."          |

Errors appear on blur and on submit, not on every keystroke. Once a field has shown an error, it revalidates as the user types so the
message clears as soon as the input becomes valid.

## 5. Submit

**Destination:** `POST` to `/api/contact`. No endpoint is deployed for
this slice, so the success path is untestable end-to-end and the failure
path is the one that will fire. This is deliberate: it exercises the
failure state required by M3.

**Payload:** JSON, the four trimmed field values, nothing else. No
timestamp, no user agent, no identifier.

**Before sending**, the form states beneath the submit button:
"We'll use your message to reply to you. We don't store it for anything
else."

**States:**

| State      | Behaviour                                                      |
| ---------- | -------------------------------------------------------------- |
| Idle       | Submit button enabled                                          |
| Submitting | Button disabled, label "Sending…", form inputs remain readable |
| Success    | Form replaced by: "Thanks — we'll get back to you."            |
| Failure    | Form retained with all values intact, error above the button   |

**Failure message:** "That didn't send. Try again, or email us at
[address]." Never blame the user for a transport failure
(`CONSTITUTION.md` §3.2).

A non-2xx response is a failure. A network error is a failure. There is
no retry and no timeout beyond the browser default.

## 6. Page content

### `#home` — Landing

- `<h1>`: [one line]
- Two short paragraphs: [content]

### `#gallery` — Images

- `<h2>`: [one line]
- [n] images served from `public/`, each with descriptive `alt` text
  and explicit `width` and `height` attributes.

### `#contact` — Contact

- `<h2>`: "Get in touch"
- The form.

Each section is a `<section>` carrying its anchor as `id` and labelled
by its heading.

The page has a header with the site name and links to the three
sections, and a footer with the site name and year. Header and footer
are static; neither reads state.

The header rests in the vertical centre of the first screen, above the
landing content, and sticks to the top of the screen once scrolling
brings it there; from then on it stays at the top. It never covers a
section's heading: a section reached by a link, by opening the page on
its anchor, or by snapping (§9.10) begins just below the header.

## 7. Accessibility specifics

- Each error message is associated with its control via
  `aria-describedby` and lives in a container with `role="alert"`.
- The invalid control carries `aria-invalid="true"` while the error
  shows.
- On a failed submit, focus moves to the first invalid control.
- On success, focus moves to the success message.
- The submit button is a real `<button type="submit">`.

## 8. Out of scope for this slice

- File attachments.
- Spam protection of any kind (captcha, honeypot, rate limit).
- Sending a copy to the user.
- Storing submissions anywhere.
- A second form.
- Languages other than English. All user-visible copy lives in translation
  files so that another language can be added later, but only English
  ships, and there is no language switcher.

## 9. Visual design

Concrete values for the visual layer. The durable rule is
`CONSTITUTION.md` §2.4: the base stylesheet is the mobile stylesheet.
Everything here is normative.

### 9.1 Where styles live

- `src/styles.css` — tokens (§9.2) and element defaults only. Nothing
  component-specific.
- Component styles live in the component's own `styles` array,
  alongside its template.
- No inline `style=` attributes. No utility-class framework.
- Every colour, size and spacing value in a component references a token
  from §9.2. A raw hex or px value outside `src/styles.css` is a defect.

### 9.2 Tokens

Declared as custom properties on `:root`. These names are the contract;
the values may change.

| Token            | Value           | Use                              |
| ---------------- | --------------- | -------------------------------- |
| `--color-bg`     | `#fdfdfc`       | page background                  |
| `--color-fg`     | `#1a1a18`       | body text                        |
| `--color-muted`  | `#5c5c56`       | secondary text, footer           |
| `--color-accent` | `#1c4f8a`       | links, focus ring, submit button |
| `--color-error`  | `#a3221c`       | error text and invalid borders   |
| `--color-border` | `#d6d6d0`       | control borders, rules           |
| `--space-1`      | `0.25rem`       |                                  |
| `--space-2`      | `0.5rem`        |                                  |
| `--space-3`      | `1rem`          |                                  |
| `--space-4`      | `1.5rem`        |                                  |
| `--space-5`      | `2.5rem`        |                                  |
| `--font-body`    | system UI stack | all text                         |
| `--measure`      | `65ch`          | maximum line length for prose    |
| `--radius`       | `4px`           | controls                         |

The font stack is the platform's own (`system-ui`, then generic
fallbacks). No webfont is loaded — self-hosted or otherwise
(`CONSTITUTION.md` §2.3). A webfont is a dependency decision, not a
styling one.

### 9.3 Contrast and colour

- Body text against its background: **at least 7:1**.
- Secondary text, borders and large text: **at least 4.5:1**.
- No state is communicated by colour alone (`CONSTITUTION.md` §4). An
  invalid field carries a text message and `aria-invalid`; the red
  border is the third signal, never the only one.

### 9.4 Type scale

Fluid between the minimum and maximum viewport widths of §9.6; no
step changes at a breakpoint.

| Element        | Min        | Max         |
| -------------- | ---------- | ----------- |
| `h1`           | `1.75rem`  | `2.5rem`    |
| `h2`           | `1.375rem` | `1.75rem`   |
| body, controls | `1rem`     | `1.0625rem` |
| small, footer  | `0.875rem` | `0.875rem`  |

- Body line height `1.6`; headings `1.2`.
- Form controls never render below `1rem`: on iOS a smaller control
  triggers zoom on focus.
- Prose paragraphs are capped at `--measure`.

### 9.5 Layout

- Single column at every width. The wide layout is the same column,
  centred, with more breathing room — not a rearrangement.
- Each section fills at least the visible screen below the header
  (§6). When its content is taller than that, the section grows to fit
  it; its content is never clipped or scrolled internally.
- Page content is capped at `--measure` and centred; the header and
  footer rules span the full width, their contents aligned to the same
  column.
- Images scale down to the column width and never exceed it.
- Vertical rhythm uses the `--space-*` scale only.

### 9.6 Viewport range and breakpoints

- **Minimum supported width: 320px.** No horizontal scroll, no clipped
  content, no scaled-down layout at that width.
- Exactly one breakpoint: **`min-width: 40rem`**. Adding a second is a
  spec change, not an implementation detail.
- Below it: header links stack under the site name; form controls are
  full width.
- At and above it: header name and links sit on one row; the column
  reaches `--measure` and centres; vertical spacing steps up from
  `--space-3` to `--space-5`.
- `max-width` media queries are prohibited (`CONSTITUTION.md` §2.4).

### 9.7 Controls and touch targets

- Every interactive element — links in the header included — has a
  touch target of **at least 44×44px**, achieved with padding rather
  than by growing the visible box where needed.
- Adjacent targets are separated by at least `--space-2`.
- Inputs, the select and the textarea share one border, radius and
  padding; they do not diverge per field.
- The textarea is resizable vertically only, minimum 5 rows.
- No hover-only affordance. Anything hover reveals is also available
  without a pointer.

### 9.8 Focus

- The focus indicator is **never removed**. `outline: none` without an
  equivalent replacement is prohibited.
- Focus renders as a 2px `--color-accent` outline with a 2px offset,
  and is visible against every background used on the site.
- Focus styling uses `:focus-visible` for the ring; keyboard and
  pointer focus need not look identical, but neither may be invisible.

### 9.9 Form states

Visual treatment for the states already defined in §5 and §4. The
styling adds no behaviour.

| State         | Treatment                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Idle          | Default border; submit button in `--color-accent`                                                                           |
| Invalid field | `--color-error` border, error text below in `--color-error`, in addition to `aria-invalid` and the `role="alert"` container |
| Submitting    | Button disabled, reduced opacity, label "Sending…"; inputs stay readable, not greyed to illegibility                        |
| Success       | Success message occupies the form's place; not styled as an error                                                           |
| Failure       | Error block above the button, `--color-error`, with the same treatment as a field error so failure reads as failure         |

- A disabled control still meets §9.3's 4.5:1 minimum. "Disabled" is
  communicated by the cursor and the label, not by making the text
  unreadable.

### 9.10 Motion

Three motions are specified. Nothing else moves.

**Section scrolling**

- Clicking an anchor link scrolls smoothly to its section instead of
  jumping.

**Section snapping**

- A scroll released near the start of a section settles on it, just below
  the header; the opening screen (header centred) is a resting place too.
- Snapping is by proximity, never mandatory: inside a section taller than
  the screen, scrolling stays free.

**Contact slide**

- The `#contact` section slides up into place as it comes into view,
  fading in as it moves.
- The slide follows the scroll: it completes by the time the section
  is fully in view.
- Where the browser cannot perform the slide, the section simply
  appears in place. The section is never hidden in its resting state.
- Only `#contact` slides. The other sections do not animate.

**Everything else**

- No other decorative animation.
- Any other transition is under 200ms and affects opacity or colour
  only — never layout position.
- The header's change from the centre of the landing section to the
  top of the screen does not animate.

**Reduced motion**

- When the user prefers reduced motion, nothing moves: anchor links
  jump directly, nothing snaps, and `#contact` appears in place.

### 9.11 Print and dark mode

Out of scope for this slice. No print stylesheet, no
`prefers-color-scheme` handling. The site renders in one palette.
