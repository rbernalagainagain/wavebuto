# CLAUDE.md — wavebuto build guide

Operating instructions for building wavebuto. This file governs _how you work_; it does not redefine _what to build_.

@CONSTITUTION.md
@spec.md

The two documents imported above are the sources of truth:

- **`CONSTITUTION.md`** — durable invariants. Never violate these.
- **`spec.md`** — the concrete first slice: acceptance tests.

**Authority order when anything conflicts:** `CONSTITUTION.md` > `spec.md` > this file > your own judgement.

Decision provenance (why choices were made) lives in `docs/adr/`. It is background for humans, **not** build instructions — do not act on it or treat it as authoritative.

Before writing any code, read both documents in full.

## Project state

Wavebuto is an Angular 22 application (generated via Angular CLI 22.1.2), being built milestone by milestone per the plan below.

**Done:** M0 (ESLint + boundary rules + `pnpm check`), M1 (validation rules as pure functions in `src/app/validation/`, test-first, covered by
the `spec.md` §3 cases), M2 (`ContactForm` in `src/app/contact-form/`, wired to M1's validators, keyboard-only completion and ARIA error
announcement covered by tests), M3 (`submitContactForm` in `src/app/submit/`, a framework-free `fetch` wrapper around `POST /api/contact`
returning a success/failure result; wired into `ContactForm`'s idle / submitting / success / failure states, covered by tests for both
outcomes including a forced network-error failure), M4 (`Home` in `src/app/home/` and `About` in `src/app/about/`, both prerendered, with
the shared static header/footer shell in `App`; `ContactForm` mounts on `/` under an `<h2>`).

**Current:** M5 (visual layer, `spec.md` §9). M0–M4 are complete and their conventions are settled. M5 styles what already exists; it adds
no markup, field, route or behaviour. The POC is **not** feature-complete until M5's Definition of Done is met.

Conventions are now set by M1–M4 and must be followed, not re-decided: validation is pure functions over strings, framework-free, with
specs alongside; the submit module is likewise a framework-free async function wrapping the sole `fetch` call, returning a
`{ status: 'success' | 'failure' }` result and never throwing; components call it directly and hold their own submission-phase state
(no Angular `HttpClient`, no service wrapper). Page copy resolving `spec.md` §6's brackets was drafted at M4 and is placeholder-grade — it
invents no facts about the site, so it is safe to replace wholesale with real copy. The failure message's contact address stays
`hello@wavebuto.example`: the `.example` TLD is reserved and cannot resolve, so it can never silently misdirect a user's email. Swap it
for a real inbox when one exists.

## Commands

Package manager is **pnpm** (required — see `packageManager`/`engines`in `package.json`). Never use npm or yarn; do not create other lockfiles.

- `pnpm start` — dev server at `http://localhost:4200/`, auto-reloads on source changes.
- `pnpm check` — lint + tests. Run after every change.
- `pnpm test` — unit tests via the Vitest-based Angular builder (`@angular/build:unit-test`), jsdom environment.
- `ng test --watch=false` — single run; watch defaults to on in TTY, so omit this at your peril.
- `ng test --include <path>` — run a single spec file (glob-based).
- `ng test --filter '<regex>'` — run only tests/suites whose name matches.
- `ng generate component <name>` — scaffold a new standalone component.
- `pnpm build` — production build (SSR + static prerendering) to `dist/`.
- `pnpm format` — apply Prettier (100-char width, single quotes, Angular parser for `.html`). Run this instead of hand-formatting.
- `pnpm format:check` — verify formatting without writing; not part of
  `pnpm check` and not run in CI, so run it yourself before treating formatting as settled.

## Architecture

- **Standalone components, no NgModules.** `App` (`src/app/app.ts`) is the root standalone component bootstrapped directly in `src/main.ts` via `bootstrapApplication`.
- **SSR + hydration + static prerendering are all wired up already** — this is not opt-in scaffolding to add later:
  - `src/app/app.config.ts` — client-side providers: router, `provideBrowserGlobalErrorListeners()`, `provideClientHydration()`.
  - `src/app/app.config.server.ts` — merges `appConfig` with `provideServerRendering(withRoutes(serverRoutes))` for the server build.
  - `src/app/app.routes.server.ts` — per-route render-mode config (`RenderMode.Prerender`, etc.) consumed by the server config; currently a catch-all prerender rule.
  - `src/main.server.ts` — server entry point (`bootstrap` function used by the Angular SSR build).
  - `angular.json` build target has `"outputMode": "static"` and a `server` entry point — build output includes prerendered pages.
  - When adding routes, update both `src/app/app.routes.ts` (client router) and `src/app/app.routes.server.ts` (server render mode per route) — they are separate files that must stay in sync.
- **Styling**: `src/styles.css` holds the design tokens and element defaults of `spec.md` §9.2 and is the only file allowed to contain raw
  colour or spacing literals. Component styles live in each component's own `styles` array and reference tokens only. No CSS framework,
  no utility classes, no webfont.
- **Testing**: Vitest is the configured unit test runner (via the Angular CLI's `@angular/build:unit-test` builder, not run standalone). Specs live alongside source as `*.spec.ts` and use Angular's `TestBed`.
- **TypeScript config** is split three ways from a shared `tsconfig.json`: `tsconfig.app.json` (app build, excludes specs), `tsconfig.spec.json` (specs only, includes `vitest/globals` types). Notable strict options enabled at the root: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `strictInjectionParameters`, `strictInputAccessModifiers`.
- Static assets go in `public/` (mapped to app root via the `assets` glob in `angular.json`).

## How to work

- **Build in the milestone order below.** Each milestone is dependency-ordered so the riskiest, most testable logic lands first
  and nothing is built on an untested foundation.
- **Test-first for all validation rules.** Write the `spec.md` cases as tests _before_ the implementation, and do not move past M1 until they pass exactly.
- **One milestone at a time.** Finish it, get its checks green, confirm its Definition of Done, commit, then continue.
- **Run `pnpm check` after every change**, not only at the end. If it fails, fix it before continuing. A guardrail that only fires in CI fires too late.
- **When the spec is ambiguous or you're tempted to cross a seam, stop and ask** rather than guessing. A wrong guess that violates an invariant is more expensive than a question.
- **If you cannot ask** — no one is there to answer — write the question to `QUESTIONS.md` and stop. Do not guess and continue.

## Non-negotiable guardrails

These are the constitution's invariants stated as operational rules.
Treat a violation as a build failure.

1. **The network has one door.**
   - Only files in `src/app/submit/` may contain `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `HttpClient`, or any
     request library (`CONSTITUTION.md` §2.1). If a request appears anywhere else, it's a bug.
   - Add a lint rule that fails `pnpm check` if these are used outside`src/app/submit/`. Wire it in M0.

2. **Seam boundaries are import boundaries.**
   - `src/app/validation/` imports nothing but types. No DOM access, no Angular runtime, no network — pure functions over values
     (`CONSTITUTION.md` §2.2).
   - Components import validation; validation never imports a component.
   - Enforce with a dependency-boundary lint rule. Wire it in M0.

3. **Nothing off-origin.** No `<script src>`, `<link href>`, font, or embed pointing outside the repo. No analytics, no telemetry. Lint
   fails on an off-origin URL in a template.

4. **No new dependencies.** Adding to `package.json` requires asking first, every time. "It's tiny" is not an exception. The only
   pre-authorised exceptions are the ESLint setup installed in M0 and the stylelint setup installed in M5.

5. **Validation lives in one place.** Rules are defined in `src/app/validation/` and imported. Never write a regex, length
   check, or required-check directly into a template or an event handler — and never restate a rule a second time for a second
   boundary.

6. **No field beyond `spec.md`.** Adding an input not declared there is out of scope, not an improvement.

7. **Every control is labelled and reachable.** Every input has an
   associated `<label>`; placeholder text is not a label. Lint fails on
   an unlabelled control. Keyboard operability is verified, not
   assumed.

8. **Fail visibly.** A failed submission shows a failure state. Never
   swallow an error, never present a failure as success, never log
   submitted values to the console.

9. **Don't edit the sources of truth or the tests to make your work pass.** `CONSTITUTION.md`, `spec.md`, and existing tests are
   read-only to you. If the implementation doesn't satisfy them, fix the implementation or stop and ask.

10. **The base stylesheet is the mobile stylesheet.**
    - No `max-width` media query, ever. Wider layouts are `min-width` additions to the base rules, never corrections of them
      (`CONSTITUTION.md` §2.4). Exactly one breakpoint exists — `min-width: 40rem` (`spec.md` §9.6); adding a second is a spec
      change, not an implementation detail.
    - `outline: none` (or `outline: 0`) is prohibited unless the same rule provides an equivalent visible indicator. The focus ring is
      never removed to make something look tidier (`spec.md` §9.8).
    - No raw colour or spacing literal outside `src/styles.css`. Components reference the `--color-*` and `--space-*` tokens of
      `spec.md` §9.2. A hex value in a component is a defect, not a shortcut.
    - No inline `style=` attribute in a template. No `@import` in CSS — an off-origin one is already guardrail 3, and a local one hides
      the dependency graph.
    - Add a stylelint config to `pnpm check` covering the four rules above. Wire it in M5, before the styles it constrains. Stylelint
      is a pre-authorised exception to guardrail 4, like M0's ESLint.

## Milestones

### M0 — Scaffold the barriers ⟵ before the code they constrain

Install and configure ESLint (`angular-eslint`), add a `check` script to
`package.json` (`pnpm check` = lint + `ng test --watch=false`), and wire
the lint rules for guardrails 1, 2, 3 and 7.
**Done:** `pnpm check` runs; an intentional `fetch` outside
`src/app/submit/`, an off-origin `<script src>` in a template, and an
unlabelled input each fail it.

### M1 — Validation (pure, test-first) ⟵ highest risk, do first

Implement the `spec.md` rules as pure functions in
`src/app/validation/` — no DOM, no Angular runtime, no `TestBed`.

- Write the `spec.md` cases as tests **first**.
- Implement until every case passes **exactly**.
- Add edge cases: empty, whitespace-only, over-length, unexpected characters.
  **Done:** every rule has a passing and a failing case, both green; no validation spec imports `TestBed`.

### M2 — Form

The form component, wired to M1's validation. Fields exactly as declared
in `spec.md`. Errors announced to assistive technology, not only
coloured.
**Done:** the form completes keyboard-only; an invalid field is
announced; no validation logic exists outside `src/app/validation/`.

### M3 — Submit

The single submit module in `src/app/submit/`. Visible success and
failure states. Tells the user what happens to their submission before
they send it.
**Done:** a forced failure produces a failure state, never a success
one; `pnpm check` confirms no request exists outside `src/app/submit/`.

### M4 — Pages

The two static pages, content from `spec.md`. Add each route to **both**
`app.routes.ts` and `app.routes.server.ts`.
**Done:** both pages render and prerender; `pnpm build` emits them as
static output; no network call on load; nothing off-origin loads.

### M5 — Visual layer ⟵ barriers before styles, as in M0

Implement `spec.md` §9. Install and configure stylelint **first**, wire
it into `pnpm check`, then write styles.

- Stylelint covers guardrail 10's four mechanical rules: no `max-width`
  media query, no bare `outline: none`, no colour or spacing literal
  outside `src/styles.css`, no inline `style=` and no `@import`.
- Then tokens and element defaults in `src/styles.css` (§9.2), then
  component styles.
- Touch nothing else. M5 adds no markup, no field, no route and no
  behaviour. If a style needs a hook that does not exist, that is a
  question, not a licence to restructure the template.

**Done:**

- `pnpm check` runs stylelint; a `max-width` query, a bare
  `outline: none` and a hex literal in a component each fail it.
- **With every media query deleted, the site is still usable at 320px:
  readable, navigable, and the form completable end to end**
  (`CONSTITUTION.md` §2.4). Verified by hand, not assumed.
- No horizontal scroll at 320px.
- Body text measures at least 7:1 against its background; secondary
  text, borders and large text at least 4.5:1 (§9.3). Measured.
- Every interactive element has a 44×44px touch target (§9.7).
- The keyboard path through the form is still complete and the focus
  ring is visible at every step, including on the submit button in its
  disabled state.
- All five form states of §9.9 render as specified; the failure state
  reads as a failure.
- `pnpm build` still prerenders both pages; nothing off-origin loads.

## Definition of Done (whole POC)

- Two pages render and prerender, one form submits, driven only by
  committed content.
- Validation rules match the pinned tests; no rule is stated twice.
- No request exists outside `src/app/submit/`; swapping the endpoint
  would not touch a template, a field, or a validation rule.
- Nothing off-origin loads. No dependency was added beyond M0's ESLint
  and M5's stylelint.
- Every control is labelled; the form is completable by keyboard alone.
- No submitted value reaches a log, a console, or storage.
- Client and server route files stayed in sync.
- The base stylesheet is the mobile stylesheet: no `max-width` query
  exists, and with every media query removed the form is still
  completable at 320px.
- Every colour and spacing value in a component comes from a token.
- Contrast ratios meet `spec.md` §9.3; every touch target meets §9.7.
- The focus indicator is present on every interactive element and was
  never removed.
- Everything in `CONSTITUTION.md` §6 stayed out of scope.

## When you're unsure

Ask before you: add a dependency, add a form field, put a request
outside `src/app/submit/`, add an off-origin resource, write a
validation rule inline, add a second breakpoint, put a colour or
spacing literal in a component, remove a focus indicator, or change
anything in `spec.md` or `CONSTITUTION.md`. These are exactly the
places where a plausible-looking shortcut breaks an invariant.
