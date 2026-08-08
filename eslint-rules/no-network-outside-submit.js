'use strict';

/**
 * Guardrail 1 (CLAUDE.md) / CONSTITUTION.md §2.1: exactly one module,
 * src/app/submit/, may talk to the network. This rule is applied to every
 * .ts file except src/app/submit/**, so any request surface found here is
 * a boundary violation, not a style nit.
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
  'Network access is only allowed in src/app/submit/ (CONSTITUTION.md §2.1). Move this call behind the submit module.';

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
