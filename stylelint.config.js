// @ts-check
'use strict';

/**
 * CLAUDE.md guardrail 10 as mechanical rules. Only stylelint's own rules are
 * used — no shared config, no plugin — so the pre-authorised "stylelint setup"
 * stays a single package.
 *
 * The fourth rule of the guardrail, "no inline style= in a template", cannot
 * live here: stylelint never sees an Angular template. It is enforced by
 * eslint-rules/no-inline-style.js instead, so `pnpm check` still fails on it.
 */

/** Absolute lengths are what "spacing literal" means. Relative and layout
 *  units describe proportion, not spacing, and durations are neither. */
const NON_SPACING_UNITS = ['%', 'fr', 'vw', 'vh', 'dvw', 'dvh', 'svh', 'lvh', 'ms', 's'];

/** @type {import('stylelint').Config} */
module.exports = {
  rules: {
    // The base stylesheet is the mobile stylesheet (CONSTITUTION.md §2.4).
    // A max-width query undoes a base rule instead of adding to it.
    'media-feature-name-disallowed-list': ['max-width'],

    // The focus ring is never removed to make something look tidier
    // (spec.md §9.8). Removing it is only defensible alongside an equivalent
    // visible indicator, which this rule deliberately makes a conscious
    // decision rather than a silent one.
    'declaration-property-value-disallowed-list': {
      outline: ['/^none$/', '/^0$/', '/^0px$/'],
      'outline-style': ['none'],
      'outline-width': ['/^0$/', '/^0px$/'],
    },

    // A local @import hides the dependency graph; an off-origin one is
    // already guardrail 3.
    'at-rule-disallowed-list': ['import'],
  },

  overrides: [
    {
      // Colour and spacing literals live in src/styles.css and nowhere else.
      // Components reference the tokens of spec.md §9.2.
      files: ['src/app/**/*.css'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': [
          'rgb',
          'rgba',
          'hsl',
          'hsla',
          'hwb',
          'lab',
          'lch',
          'oklab',
          'oklch',
          'color',
          'color-mix',
        ],
        // An allow-list keyed by a catch-all property pattern: every absolute
        // length is rejected wherever it appears, including in a custom
        // property declared locally to smuggle one past the token layer.
        'declaration-property-unit-allowed-list': { '/.+/': NON_SPACING_UNITS },
      },
    },
  ],
};
