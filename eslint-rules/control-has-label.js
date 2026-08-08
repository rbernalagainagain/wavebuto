'use strict';

/**
 * Guardrail 7 (CLAUDE.md) / CONSTITUTION.md §4: every control has an
 * associated label; placeholder text is not a label. This is the
 * control-to-label direction -- angular-eslint's built-in
 * label-has-associated-control rule only checks the reverse (that a
 * <label> points at some control), so a bare, unlabelled <input> would
 * otherwise pass unnoticed.
 */

const CONTROL_TAGS = new Set(['input', 'select', 'textarea']);
const EXEMPT_INPUT_TYPES = new Set(['hidden']);

function findAttr(node, name) {
  return [...node.attributes, ...node.inputs].find((attr) => attr.name === name);
}

function isInsideLabel(node) {
  let current = node.parent;
  while (current) {
    if (current.type === 'Element' && current.name.toLowerCase() === 'label') {
      return true;
    }
    current = current.parent;
  }
  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '[Accessibility] Ensures every form control has an associated label.',
    },
    schema: [],
    messages: {
      missingLabel:
        '<{{tag}}> must have an associated <label> (via for/id, wrapping, or aria-label/aria-labelledby); placeholder text is not a label (CONSTITUTION.md §4).',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = context.sourceCode.parserServices;
    let controls = [];
    let labelFors = new Set();

    return {
      Element(node) {
        const tag = node.name.toLowerCase();
        if (tag === 'label') {
          const forAttr = node.attributes.find((attr) => attr.name === 'for');
          if (forAttr && typeof forAttr.value === 'string') {
            labelFors.add(forAttr.value);
          }
        }
        if (CONTROL_TAGS.has(tag)) {
          controls.push(node);
        }
      },
      onCodePathEnd() {
        for (const node of controls) {
          const typeAttr = node.attributes.find((attr) => attr.name === 'type');
          if (typeAttr && EXEMPT_INPUT_TYPES.has(typeAttr.value)) {
            continue;
          }

          const idAttr = findAttr(node, 'id');
          const hasForLabel =
            !!idAttr && typeof idAttr.value === 'string' && labelFors.has(idAttr.value);
          const hasAriaLabel = !!findAttr(node, 'aria-label');
          const hasAriaLabelledby = !!findAttr(node, 'aria-labelledby');

          if (hasForLabel || hasAriaLabel || hasAriaLabelledby || isInsideLabel(node)) {
            continue;
          }

          context.report({
            loc: parserServices.convertNodeSourceSpanToLoc(node.sourceSpan),
            messageId: 'missingLabel',
            data: { tag: node.name },
          });
        }
        controls = [];
        labelFors = new Set();
      },
    };
  },
};
