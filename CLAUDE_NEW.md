## What this is

`omnicanalidad-mfe-vida` — a micro-frontend for life-insurance
sale flow (catalog → simulation → offer → contracting → closing). It runs two ways from
one codebase: as a standalone app and as a Module Federation remote mounted
by the portal shell as the custom element `<omnicanalidad-mfe-vida-wc>`.

## Technology Stack

- Angular 22 zoneless (do not use zone.js or trigger change detection manually): better performance and predictable, signal-driven rendering
- Signals for state and reactivity; RxJS only for backend calls: signals are simpler and integrate natively with zoneless change detection, while RxJS is kept where async streams add real value
- State (local and shared) uses native Angular signals only (`signal`, `computed`, `linkedSignal`); do not use NgRx or other state libraries: keeps a single reactive model aligned with zoneless change detection
- Ebro design system (`@ebrods/angular`, `@ebrods/core`) for all UI components (do not use other UI libraries or duplicate Ebro components): ensures visual consistency with the rest of the portal
- `@angular-architects/module-federation` (do not migrate to Native Federation or upgrade it to match Angular's version): the other MFEs in the portal run older Angular versions and must stay compatible
- Zod for all DTOs, both incoming and outgoing (no data enters or leaves the app without its schema): catches contract mismatches at the boundary instead of deep in the flow. Schemas must match the backend OpenAPI contract exactly; if you don't have the contract for an endpoint, ask for it instead of guessing fields
- Transloco for i18n (never hardcode user-visible text in templates or components; add keys to the translation files): keeps all copy centralized and translatable

## Commands

```bash
npm start               # Standalone dev server, port 4200, MSW mocks on
npm run start:proxy     # Standalone with real backend via proxy, MSW off
npm run start:mfe       # Module Federation remote, port 4201
npm run typecheck       # Type checking only
npm run lint            # Lint (lint:fix to autofix)
npm run test:ci         # Run all tests once (never use npm test: it runs in watch mode)
npm run e2e:acceptance             # Acceptance tests (BDD + Playwright), boots the app in acceptance configuration
npm run e2e:acceptance -- --grep "scenario name"   # Run a single acceptance scenario
npm run publish:ci      # Lint + tests + build, same as CI. Run before finishing any task
npm run docs:ebro       # Regenerate the Ebro component map in docs/ebro/ from node_modules
```

## Dependencies

- `npm install` requires auth against a private Azure DevOps feed. If it fails for auth reasons, do not modify `.npmrc` or change registries: stop and report it.
- Dependency fixes go through `patch-package` in `patches/` (currently patching `@ebrods/core`). Never edit `node_modules` directly. Updating a patched dependency may break its patch.

## Dual Build (Standalone + MFE)

The same `src/app` runs as a standalone app and as a Module Federation remote inside the portal shell. Every change must work in both modes.

- Two targets in `angular.json`: `build`/`serve` (esbuild, entry `src/main.ts`) and `build-mfe`/`serve-mfe` (custom webpack, entry `src/main.mfe.ts`). Keep both in sync when changing build settings.
- Resolve runtime assets (i18n dictionaries, Ebro SVG sprites) against `remoteBaseUrl()`, never with root-relative paths: under the shell, the base URL is the shell's origin.
- Never read or write `window.location` or browser history: under the shell, routing goes through `MfeLocationStrategy` and the shell's `routingInfo` input.
- Add new global styles only inside the mixins in `src/styles/theme.scss`: tokens are emitted at `:root` standalone and scoped to the web component tag under the shell.
- Do not remove the `@angular-architects/module-federation-runtime` alias in `webpack.config.js`: it intentionally fixes an undeclared dependency of `@arq-mfe/dynamic-load-library-ts`.

## Feature Architecture (Hexagonal)

Each step of the sale flow lives in `src/app/feature/<feature>/`; cross-step capabilities (client search, beneficiaries, stepper) live in `src/app/behaviour/<name>/`. Both use the same layers:

- `domain/`: `<entity>.ts`, e.g. `product.ts`, `client.ts` (Zod schema + inferred type as the domain model), `*.repository.ts` (interface + InjectionToken, e.g. `CLIENT_REPOSITORY`), `error/*-error.ts` (abstract base + Unavailable / Contract / Mapping), `*.mother.ts` (object mothers for tests).
- `application/`: one use case per file, e.g. `find-clients.ts`, with a single `execute()`.
- `infrastructure/`: `*-dto.ts` (Zod schema of the wire shape, `z.looseObject`), `*.adapter.ts` (DTO → `unknown`), `*-http.repository.ts`.
- Routed component at the feature root; sub-components in `ui/`.

HTTP repository pipeline (follow it exactly for new endpoints):
1. Request with `http.get<unknown>()`: the raw response is untrusted.
2. Validate the raw response with the DTO schema (`dtoSchema.parse`). On `ZodError`, throw `XxxContractError`: the backend broke the contract.
3. Map the DTO with `toDomain(dto)`, which returns `unknown` so the mapping cannot claim validity by itself.
4. Validate the result with the domain schema (`domainSchema.safeParse`). On failure, throw `XxxMappingError`: our mapping is wrong.
5. Catch any other error with `catchError` and throw `XxxUnavailableError`.

Rules:

- Components consume use cases through `rxResource` and branch the template on the typed error classes.
- Use `@Service` instead of `@Injectable`. Use cases and repositories use `@Service({ autoProvided: false })` and are provided in the route `providers` in `src/app/app.routes.ts`, never with `providedIn: 'root'`. App-wide singletons (e.g. `SimulateProduct`) use a bare `@Service()`.
- A new feature = the folder structure above + a route entry with its `providers` block.

## Shared state

`SaleStore` (`src/app/state/sale-store.ts`) and `src/app/data/` are legacy prototype code being removed. Do not add new state or data there; new work goes into a `feature/` or `behaviour/` slice.

## locale, design system

- `LOCALE_ID` is pinned to `es-ES` in `app.config.ts`: number/date pipes stay Spanish even if
  the Transloco language changes. Format money with `DecimalPipe`, not `toLocaleString`.
- Ebro components are Stencil web components rendered in shadow roots. Do not guess their tags, properties or events: before building UI, read `docs/ebro/index.md` (every component in the library, not only the ones already used) and open only the `docs/ebro/components/<tag>.md` pages you need; also check how they are used in existing code.
- Before writing styles, check `docs/ebro/tokens.md` for the `--eb-*` token or utility class that fits instead of hardcoding colors or sizes.
- `docs/ebro/` is generated by `npm run docs:ebro`: never edit it by hand, and regenerate it whenever `@ebrods/*` is upgraded.

## Mocking and tests

- MSW mocks live in `src/mocks/`. They are excluded from shipped bundles via `fileReplacements` in `angular.json`: do not replace this with an `isDevMode()` check.
- Unit/component tests: Vitest + `@testing-library/angular`. Unhandled requests fail the test, so stub every request with an MSW handler. Build fixtures with `*.mother.ts`, use `provideTranslocoTesting()`, and assert on what the user perceives (roles, text, test ids).
- Acceptance tests: Gherkin in `e2e/acceptance/features/`. Read `e2e/acceptance/README.md` before writing or changing a feature file. Never edit `.features-gen/` (generated).
- Only steps touch the browser; page objects in `e2e/support/pages/` use role/text locators; stub backend responses through the fixtures in `e2e/support/fixtures.ts`.
- Technical, non-business checks go in `e2e/tests/*.e2e.ts`, not in Gherkin.
- Testing Library's `screen` cannot see inside shadow roots: use the `within(shadowRoot(...))` helper pattern from `sale-stepper.testing.ts`. Required jsdom polyfills live in `src/test-setup.ts`.


## Key Conventions

- Strict TypeScript: index-signature access needs brackets (`process.env['CI']`).
- Each rule override in `eslint.config.js` has a written justification: read it before touching a rule, and never disable or change lint rules without asking.
- Selector prefixes: `app` for components/directives, `mfe` inside `src/app/mfe/`.
- No comments, except to explain *why* a non-obvious decision was made. Exception: document component inputs and outputs (`input()`, `output()`) with a brief JSDoc.
- Never run `git commit`, `git push` or any `gh` command. Leave all changes uncommitted for review.

## Backend

Real endpoints are proxied in `proxy.conf.json` (`/ibv-<domain>/v1/…` →
`api-dev.ibercaja.internal.ebroibv.ibercaja.es`); add new business domains inside the existing
alternation group. Endpoint paths are module-level constants in each HTTP repository —
`/ibv-channel-planning/v1/products` is connected to dev, while client search and simulation
still answer from MSW fixtures.
