'use strict';

/**
 * Guardrail 1 (CLAUDE.md) / CONSTITUTION.md §2.1: exactly two places may
 * talk to the network -- src/app/submit/ (the submission) and
 * src/app/i18n/translation-http-loader.ts (the site's own translation files).
 * This rule is applied to every .ts file except those two, so any request
 * surface found here is a boundary violation, not a style nit.
 */

const REQUEST_LIBRARY_MODULES = new Set([
  '@angular/common/http',
  'axios',
  'superagent',
  'node-fetch',
  'got',
  'ky',
]);

const MESSAGE =
  'Network access is only allowed in src/app/submit/ and the translation loader (CONSTITUTION.md §2.1). Move this call behind the submit module.';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow network access outside src/app/submit/.',
    },
    schema: [],
    messages: {
      noNetwork: MESSAGE,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      "CallExpression[callee.type='Identifier'][callee.name='fetch']"(node) {
        context.report({ node, messageId: 'noNetwork' });
      },
      "NewExpression[callee.type='Identifier'][callee.name='XMLHttpRequest']"(node) {
        context.report({ node, messageId: 'noNetwork' });
      },
      "CallExpression[callee.type='MemberExpression'][callee.object.name='navigator'][callee.property.name='sendBeacon']"(
        node,
      ) {
        context.report({ node, messageId: 'noNetwork' });
      },
      ImportDeclaration(node) {
        if (REQUEST_LIBRARY_MODULES.has(node.source.value)) {
          context.report({ node, messageId: 'noNetwork' });
        }
      },
    };
  },
};
