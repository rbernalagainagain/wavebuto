'use strict';

/**
 * Guardrail 2 (CLAUDE.md) / CONSTITUTION.md §2.2: src/app/validation/
 * imports nothing but types and `zod`, and contains pure functions over
 * values only -- no DOM access, no Angular runtime, no network. Applied only
 * to files under src/app/validation/.
 */

// The one runtime import guardrail 2 allows: the schema library itself.
const ALLOWED_RUNTIME_IMPORTS = new Set(['zod']);

const DISALLOWED_GLOBALS = new Set([
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'fetch',
  'XMLHttpRequest',
  'alert',
  'confirm',
  'prompt',
]);

const NON_TYPE_IMPORT_MESSAGE =
  'src/app/validation/ may only import types and `zod` (CONSTITUTION.md §2.2). Use `import type` for this import.';
const GLOBAL_MESSAGE =
  '"{{name}}" is not allowed in src/app/validation/ -- it must stay DOM- and Angular-free (CONSTITUTION.md §2.2).';

function isDeclarationSiteOfName(node) {
  const parent = node.parent;
  return (
    parent.type === 'ImportSpecifier' ||
    parent.type === 'ImportDefaultSpecifier' ||
    parent.type === 'ImportNamespaceSpecifier' ||
    ((parent.type === 'Property' || parent.type === 'PropertyDefinition') &&
      parent.key === node &&
      !parent.computed) ||
    (parent.type === 'MemberExpression' && parent.property === node && !parent.computed)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Restrict src/app/validation/ to pure, type-only imports (plus zod) with no DOM or Angular globals.',
    },
    schema: [],
    messages: {
      nonTypeImport: NON_TYPE_IMPORT_MESSAGE,
      disallowedGlobal: GLOBAL_MESSAGE,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.specifiers.length === 0) {
          return;
        }
        if (ALLOWED_RUNTIME_IMPORTS.has(node.source.value)) {
          return;
        }
        const isTypeOnly =
          node.importKind === 'type' ||
          node.specifiers.every((specifier) => specifier.importKind === 'type');
        if (!isTypeOnly) {
          context.report({ node, messageId: 'nonTypeImport' });
        }
      },
      Identifier(node) {
        if (!DISALLOWED_GLOBALS.has(node.name)) {
          return;
        }
        if (isDeclarationSiteOfName(node)) {
          return;
        }
        context.report({ node, messageId: 'disallowedGlobal', data: { name: node.name } });
      },
    };
  },
};
