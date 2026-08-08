// @ts-check
'use strict';

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const wavebuto = require('./eslint-rules');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/app/submit/**'],
    plugins: { wavebuto },
    rules: {
      'wavebuto/no-network-outside-submit': 'error',
    },
  },
  {
    files: ['src/app/validation/**/*.ts'],
    plugins: { wavebuto },
    rules: {
      'wavebuto/validation-pure-boundary': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    plugins: { wavebuto },
    rules: {
      'wavebuto/no-offorigin-template-resource': 'error',
      'wavebuto/control-has-label': 'error',
    },
  },
);
