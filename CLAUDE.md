# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Wavebuto is an Angular 22 application, currently at the freshly-scaffolded stage (generated via Angular CLI 22.1.2, no custom features implemented yet beyond the default starter page in `src/app/app.html`). There is no established feature architecture to follow yet — when adding the first real features, set conventions deliberately since future work will follow whatever pattern is established first.

## Commands

Package manager is **pnpm** (required — see `packageManager`/`engines` in `package.json`). Do not use npm/yarn lockfiles.

- `pnpm start` / `pnpm ng serve` — dev server at `http://localhost:4200/`, auto-reloads on source changes.
- `pnpm build` — production build (SSR + static prerendering) to `dist/`.
- `pnpm watch` — development-configuration build in watch mode.
- `pnpm test` — runs unit tests via the Vitest-based Angular builder (`@angular/build:unit-test`), jsdom environment.
- `ng test --include src/app/app.spec.ts` — run a single spec file (glob-based; `--include` accepts a path or pattern).
- `ng test --filter '^App'` — run only tests/suites whose name matches a regex.
- `ng test --watch=false` — single run, no watch (watch defaults to on in TTY).
- `ng generate component <name>` — scaffold a new component (see `ng generate --help` for other schematics).

There is no configured lint script/ESLint setup in this repo currently.

Formatting is enforced via Prettier (`.prettierrc`: 100-char width, single quotes, Angular parser for `.html` files) and `.editorconfig` (2-space indent, single quotes in `.ts`, LF, final newline).

## Architecture

- **Standalone components, no NgModules.** `App` (`src/app/app.ts`) is the root standalone component bootstrapped directly in `src/main.ts` via `bootstrapApplication`.
- **SSR + hydration + static prerendering are all wired up already** — this is not opt-in scaffolding to add later:
  - `src/app/app.config.ts` — client-side providers: router, `provideBrowserGlobalErrorListeners()`, `provideClientHydration()`.
  - `src/app/app.config.server.ts` — merges `appConfig` with `provideServerRendering(withRoutes(serverRoutes))` for the server build.
  - `src/app/app.routes.server.ts` — per-route render-mode config (`RenderMode.Prerender`, etc.) consumed by the server config; currently a catch-all prerender rule.
  - `src/main.server.ts` — server entry point (`bootstrap` function used by the Angular SSR build).
  - `angular.json` build target has `"outputMode": "static"` and a `server` entry point — build output includes prerendered pages.
  - When adding routes, update both `src/app/app.routes.ts` (client router) and `src/app/app.routes.server.ts` (server render mode per route) — they are separate files that must stay in sync.
- **Testing**: Vitest is the configured unit test runner (via the Angular CLI's `@angular/build:unit-test` builder, not run standalone). Specs live alongside source as `*.spec.ts` and use Angular's `TestBed`.
- **TypeScript config** is split three ways from a shared `tsconfig.json`: `tsconfig.app.json` (app build, excludes specs), `tsconfig.spec.json` (specs only, includes `vitest/globals` types). Notable strict options enabled at the root: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `strictInjectionParameters`, `strictInputAccessModifiers`.
- Static assets go in `public/` (mapped to app root via the `assets` glob in `angular.json`).
