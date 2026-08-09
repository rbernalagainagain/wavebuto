# CONSTITUTION — wavebuto

> Two pages and a form. The site says what it has to say and asks for
> exactly what it needs — nothing more.

This document defines the **durable invariants** of the system: the
principles that must hold across every version and implementation
choice. It governs _how_ the site may be built. Concrete copy, field
lists, validation rules and styling live in `spec.md` and are expected
to evolve; the rules here are not.

If an implementation decision ever conflicts with this document, this
document wins — or the conflict is escalated and resolved here before
code is written.

---

## 1. Mission and stance

The site presents information on two static pages and collects one
submission through a form. It answers "what is this, and how do I get in
touch" — nothing more.

- Every page renders from markup committed to the repo. No content is
  composed at runtime from a remote source.
- The form collects **only** the fields declared in `spec.md`.
  Collecting a field because it might be useful later is prohibited.
- The user is told what happens to their submission before they send it.
- The site holds no identity: no accounts, no sessions, no recognition
  of a returning visitor.

## 2. Structural invariants

### 2.1 One submission path (the core contract)

Exactly one module — `src/submit/` — performs the submit. It is the only
place in the codebase that talks to the network.

- A component that collects input does not send it. It hands the values
  to the submit module and does nothing else.
- The submit module knows nothing about markup or styling. Swapping the
  destination endpoint must not require touching a page, a field, or a
  validation rule.
- No other module may issue a request for any reason. This contract is
  the reason the site's network surface is auditable at a glance, and it
  must never be short-circuited by a component reaching for the network
  directly.

### 2.2 Hard layer seams

The system is built as three layers with strict boundaries. Data crosses
a seam in one direction only; no layer reaches around another.

markup → validation → submit

- **Markup** renders structure and collects input. It contains no rules.
- **Validation** decides whether values are acceptable. Pure functions
  over values; no DOM access, no network.
- **Submit** sends validated values and reports the outcome. It performs
  no validation of its own beyond trusting its input contract.

A validation rule must be testable in isolation, with no page rendered.
If it cannot, the rule is entangled with markup and belongs in the
validation layer first.

### 2.3 Origin agnosticism

The site depends on nothing it does not serve itself. No off-origin
script, font, stylesheet, or widget. Adding a dependency is an explicit
decision, never a side effect of solving a problem.

## 3. Data invariants

### 3.1 Validate at every boundary

Input is validated before it leaves the client and, wherever a server
exists, again on arrival.

- Client-side validation is a **convenience for the user**, never the
  guarantee. It may be bypassed and the system must assume it was.
- The same rules are expressed once and reused, not restated per
  boundary. Two divergent copies of a rule is a defect, not redundancy.

### 3.2 No silent failure

A submission either visibly succeeds or visibly fails.

- A failed send is never presented as success, and never disappears
  without a message.
- An error a user can act on says what to do next. An error they cannot
  act on says so plainly rather than blaming them.

### 3.3 Nothing sensitive crosses the repo boundary

No secrets, keys, tokens, or credentialed endpoints in committed files.
No submitted data is written to logs, storage, or the console.

## 4. Accessibility

Accessibility is an invariant, not a polish task deferred to the end.

- Every control has an associated label. Placeholder text is not a
  label.
- Every interactive element is reachable and operable by keyboard alone.
- State — error, success, required, disabled — is communicated by more
  than colour, and announced to assistive technology, not only drawn.

## 5. Quality bars

- Validation rules are the highest-risk logic in the system and **must
  be covered by unit tests pinned to explicit worked examples** (see
  `spec.md`). Each rule has at least one passing and one failing case.
  It may not ship without them.
- The submit module is covered by tests asserting both outcomes,
  including that a forced failure produces a failure state.
- The keyboard-only path through the form is verified, not assumed.
- Edge cases (empty input, whitespace-only, over-length, unexpected
  characters) are handled explicitly and never produce a silent wrong
  answer.

## 6. Non-goals and prohibitions

- No authentication, accounts, sessions, or database.
- No analytics, tracking, or telemetry of any kind.
- No third-party scripts, embeds, or off-origin resources.
- No routes beyond the two declared pages.
- No network request outside the submit module.
- No form field not declared in `spec.md`.
- No validation logic inline in markup or in an event handler.
- No dependency added without an explicit decision.
- No silent degradation: a failed submission is always visible; it is
  never swallowed or presented as success.
