# build guide

`wavebuto` — a small static site: a single page (`/`) with three sections, reached through in-page anchor links. The first section is the landing (`#home`), the second shows images (`#gallery`), and the third holds the contact form (`#contact`: name → email → subject → message). Clicking a navigation link scrolls to its section without leaving the page. It is built one way from one codebase: an Angular SSR build whose output is fully prerendered static HTML (`outputMode: "static"`), then hydrated in the browser. The form POSTs JSON to `/api/contact`; no endpoint is deployed for this slice, so the failure state is the one that fires.

Operating instructions for building wavebuto. This file governs _how you work_; it does not redefine _what to build_.

@CONSTITUTION.md
@spec.md

The two documents imported above are the sources of truth:

- **`CONSTITUTION.md`** — durable invariants. Never violate these.
- **`spec.md`** — the concrete first slice: acceptance tests.

**Authority order when anything conflicts:** `CONSTITUTION.md` > `spec.md` > this file > your own judgement.

Decision provenance (why choices were made) lives in `docs/adr/`. It is background for humans, **not** build instructions — do not act on it or treat it as authoritative.

## Technology Stack

- Angular 22.1, standalone and zoneless (do not add `zone.js` or trigger change detection by hand). SSR via `@angular/ssr` prerenders every route to static HTML at build time because SEO is a priority; there is no runtime server rendering
- Signal Forms (`@angular/forms/signals`) for the contact form; do not use Reactive Forms or Template-driven Forms
- Zod for the contact form, the only input the site has (its schema in `src/app/validation/` is the single definition of the form's rules; do not restate them elsewhere): one schema validates what the user typed and what `src/app/submit/` sends
- Transloco for i18n (never hardcode user-visible text; add keys to the translation files). Translations live in `public/i18n/` and the browser loads them over HTTP through `src/app/i18n/translation-http-loader.ts` (plain `fetch`, same-origin, no `HttpClient`); the prerender and the tests bundle the same file instead (`src/app/i18n/bundled-translations.ts`). That loader and `src/app/submit/` are the only two requests the site makes
- RxJS is installed only because Angular and Transloco need it; app code uses it only where Transloco's API demands it (`src/app/i18n/`). Do not introduce `HttpClient`
- Plain CSS: tokens and element defaults in `src/styles.css`, component styles reference tokens only. No CSS framework, preprocessor, utility classes or webfont (`spec.md` §9)
- Vitest via `ng test` (jsdom) for all tests, not Karma or Jasmine; validation specs never import `TestBed`
- ESLint and stylelint enforce the guardrails: never disable or loosen a rule to get a change through
- No new dependency without asking first (guardrail 4); the stack above is the whole stack

## Project state

Wavebuto is an Angular 22 application (generated via Angular CLI 22.1.2), being built milestone by milestone per the plan below.

**Done:** M0 (ESLint + boundary rules + `pnpm check`), M1 (validation rules as pure functions in `src/app/validation/`, test-first, covered by
the `spec.md` §3 cases), M2 (`ContactForm` in `src/app/contact-form/`, wired to M1's validators, keyboard-only completion and ARIA error
announcement covered by tests), M3 (`submitContactForm` in `src/app/submit/`, a framework-free `fetch` wrapper around `POST /api/contact`
returning a success/failure result; wired into `ContactForm`'s idle / submitting / success / failure states, covered by tests for both
outcomes including a forced network-error failure).

**Current:** M4 (page sections). M4 was first built as two pages — `Home` in `src/app/home/` and `About` in `src/app/about/`, both
prerendered, with the shared static header/footer shell in `App` and `ContactForm` mounted on `/` under an `<h2>`. It is being redone as a
single page with three sections: `About` and its `/about` route are removed from both route files, and `/` holds the landing, images and
contact sections. M5 (visual layer, `spec.md` §9) follows once M4 is complete. The POC is **not** feature-complete until M5's Definition
of Done is met.

Conventions are now set by M1–M3 and must be followed, not re-decided: validation is pure functions over strings, framework-free, with
specs alongside; the submit module is likewise a framework-free async function wrapping the sole `fetch` call, returning a
`{ status: 'success' | 'failure' }` result and never throwing; components call it directly and hold their own submission-phase state
(no Angular `HttpClient`, no service wrapper). Page copy resolving `spec.md` §6's brackets was drafted at M4 and is placeholder-grade — it
invents no facts about the site, so it is safe to replace wholesale with real copy. The failure message's contact address stays
`hello@wavebuto.example`: the `.example` TLD is reserved and cannot resolve, so it can never silently misdirect a user's email. Swap it
for a real inbox when one exists.

## Commands

```bash
pnpm start                               # Dev server, port 4200, auto-reloads on source changes
pnpm check                               # ESLint + stylelint + all tests once. Run after every change
pnpm lint                                # ESLint only (guardrails 1, 2, 3, 7, and no inline style=)
pnpm lint:styles                         # stylelint only (guardrail 10's CSS rules)
pnpm ng test --watch=false               # Run all tests once (never plain pnpm test: it watches in a TTY)
pnpm ng test --watch=false --include <path>     # Run a single spec file (glob)
pnpm ng test --watch=false --filter '<regex>'   # Run only tests/suites whose name matches
pnpm build                               # Production build (SSR + static prerender) to dist/
pnpm format                              # Apply Prettier. Run this instead of hand-formatting
pnpm format:check                        # Verify formatting. Not in pnpm check: run it before finishing
pnpm ng generate component <name>        # Scaffold a standalone component
```

- **pnpm only** (pinned by `packageManager` and `engines` in `package.json`). Never use npm or yarn, and do not create other lockfiles.
- CI (`.github/actions/build-angular`) runs only `pnpm install --frozen-lockfile` and `pnpm build`. It does not run `pnpm check` or `pnpm format:check`, so a guardrail that only you run is the only one that fires.

## Architecture

- **Standalone components, no NgModules.** `App` (`src/app/app.ts`) is the root standalone component bootstrapped directly in `src/main.ts` via `bootstrapApplication`.
- **SSR + hydration + static prerendering are all wired up already** — this is not opt-in scaffolding to add later:
  - `src/app/app.config.ts` — client-side providers: router (with `withInMemoryScrolling({ anchorScrolling: 'enabled' })` for the section anchors), `provideBrowserGlobalErrorListeners()`, `provideClientHydration()`.
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

1. **The network has two doors.**
   - Only files in `src/app/submit/` and `src/app/i18n/translation-http-loader.ts` may contain `fetch`, `XMLHttpRequest`,
     `navigator.sendBeacon`, `HttpClient`, or any request library (`CONSTITUTION.md` §2.1). The submit module sends the submission;
     the translation loader only reads the site's own translation files. If a request appears anywhere else, it's a bug.
   - Add a lint rule that fails `pnpm check` if these are used outside those two places. Wire it in M0.

2. **Seam boundaries are import boundaries.**
   - `src/app/validation/` imports nothing but types and `zod`. No DOM access, no Angular runtime, no network — pure functions over
     values (`CONSTITUTION.md` §2.2). Zod is the only runtime import allowed there.
   - Components import validation; validation never imports a component.
   - Enforce with a dependency-boundary lint rule that allows `zod` and nothing else. Wire it in M0.


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
    - No `@import` in CSS — an off-origin one is already guardrail 3, and a local one hides the dependency graph.
    - No inline `style=` attribute in a template. This is a template rule, so ESLint enforces it, not stylelint.
    - Add a stylelint config to `pnpm check` covering the four CSS rules above (`max-width`, `outline`, literals, `@import`). Wire it
      in M5, before the styles it constrains. Stylelint is a pre-authorised exception to guardrail 4, like M0's ESLint.

## Milestones

### M0 — Scaffold the barriers ⟵ before the code they constrain

Install and configure ESLint (`angular-eslint`), add a `check` script to
`package.json` (`pnpm check` = lint + `ng test --watch=false`), and wire
the lint rules for guardrails 1, 2, 3 and 7, plus guardrail 10's
no-inline-`style=` rule.

### M1 — Validation (pure, test-first) ⟵ highest risk, do first

Implement the `spec.md` rules as a single Zod schema in
`src/app/validation/` — no DOM, no Angular runtime, no `TestBed`.

- Write the `spec.md` cases as tests **first**.
- Implement until every case passes **exactly**.
- Add edge cases: empty, whitespace-only, over-length, unexpected characters.


### M2 — Form

The form component, wired to M1's validation. Fields exactly as declared
in `spec.md`. Errors announced to assistive technology, not only
coloured.

### M3 — Submit

The single submit module in `src/app/submit/`. Visible success and
failure states. Tells the user what happens to their submission before
they send it.

### M4 — Page sections

The single page (`/`) with its three sections, content from `spec.md`:
landing (`#home`), images (`#gallery`) and contact form (`#contact`).
Add the `/` route to **both** `app.routes.ts` and `app.routes.server.ts`,
and enable anchor scrolling with
`withInMemoryScrolling({ anchorScrolling: 'enabled' })`.
Navigation links use `routerLink` with `fragment`.

### M5 — Visual layer ⟵ barriers before styles, as in M0

Implement `spec.md` §9. Install and configure stylelint **first**, wire
it into `pnpm check`, then write styles.

- Stylelint covers guardrail 10's four CSS rules: no `max-width` media
  query, no bare `outline: none`, no colour or spacing literal outside
  `src/styles.css`, and no `@import`. The no-inline-`style=` rule is
  already enforced by ESLint (M0).
- Then tokens and element defaults in `src/styles.css` (§9.2), then
  component styles.
- Touch nothing else. M5 adds no markup, no field, no route and no
  behaviour. If a style needs a hook that does not exist, that is a
  question, not a licence to restructure the template.

## Definition of Done (whole POC)

- One page with three sections renders and prerenders, its anchor links
  reach each section, one form submits, driven only by committed content.
- Validation rules match the pinned tests; no rule is stated twice.
- No request exists outside `src/app/submit/` and the translation loader; swapping the endpoint
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

Ask before you: add a dependency, add a form field, add a route, put a
request outside `src/app/submit/` and the translation loader, add an off-origin resource, write a
validation rule inline, add a second breakpoint, put a colour or
spacing literal in a component, remove a focus indicator, or change
anything in `spec.md` or `CONSTITUTION.md`. These are exactly the
places where a plausible-looking shortcut breaks an invariant.
