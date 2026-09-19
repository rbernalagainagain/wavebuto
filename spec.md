# SPEC — Wavebuto (first slice)

The concrete slice to build now. This document holds decisions that are expected to change; the durable invariants live in `CONSTITUTION.md`
and win on any conflict.

Everything here is normative. If the implementation disagrees with this document, the implementation is wrong.

---

## 1. Scope

Two pages and one contact form.

| Route    | Page  | Render mode |
| -------- | ----- | ----------- |
| `/`      | Home  | Prerender   |
| `/about` | About | Prerender   |

The form lives on `/` , below the page content. There is no `/contact` route.

## 2. Form fields

Exactly these four. No others (`CLAUDE.md` guardrail 6).

| Field   | Name      | Type     | Required | Label                |
| ------- | --------- | -------- | -------- | -------------------- |
| Name    | `name`    | text     | yes      | "Your name"          |
| Email   | `email`   | email    | yes      | "Email address"      |
| Subject | `subject` | select   | yes      | "What's this about?" |
| Message | `message` | textarea | yes      | "Message"            |

`subject` options, in order: `general`, `support`, `other`.
Displayed as: "General enquiry", "Support", "Something else".
No option is preselected; the control starts on an empty prompt option.

## 3. Validation rules

All rules trim leading and trailing whitespace before evaluating. All rules are pure functions over a string value.

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

### 3.2 `email`

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

### 3.3 `subject`

- Required. Must be one of `general`, `support`, `other`.

| Input       | Result | Reason                       |
| ----------- | ------ | ---------------------------- |
| `"support"` | pass   |                              |
| `""`        | fail   | prompt option still selected |
| `"urgent"`  | fail   | not in the allowed set       |

### 3.4 `message`

- Required.
- Minimum 10 characters after trimming.
- Maximum 2000 characters after trimming.

| Input           | Result | Reason                   |
| --------------- | ------ | ------------------------ |
| `"Hello there"` | pass   |                          |
| `"Hi"`          | fail   | below minimum            |
| 10 × `"a"`      | pass   | exactly at the minimum   |
| `"          "`  | fail   | whitespace-only is empty |
| 2001 × `"a"`    | fail   | over maximum             |

## 4. Error messages

One message per field, shown below the control. Say what to do, not what
went wrong (`constitution.md` §3.2).

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
failure state required by M3's Definition of Done.

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
(`constitution.md` §3.2).

A non-2xx response is a failure. A network error is a failure. There is
no retry and no timeout beyond the browser default.

## 6. Page content

### `/` — Home

- `<h1>`: [one line]
- Two short paragraphs: [content]
- The form, under an `<h2>`: "Get in touch"

### `/about` — About

- `<h1>`: [one line]
- Three short paragraphs: [content]
- A link back to `/`

Both pages share a header with the site name and links to both routes,
and a footer with the site name and year. Header and footer are static;
neither reads state.

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
- A second form, or a form on `/about`.
- Internationalisation.

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
- Page content is capped at `--measure` and centred; the header and
  footer rules span the full width, their contents aligned to the same
  column.
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

- No decorative animation.
- Any transition is under 200ms and affects opacity or colour only —
  never layout position.
- All motion is suppressed under
  `@media (prefers-reduced-motion: reduce)`.

### 9.11 Print and dark mode

Out of scope for this slice. No print stylesheet, no
`prefers-color-scheme` handling. The site renders in one palette.
