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
