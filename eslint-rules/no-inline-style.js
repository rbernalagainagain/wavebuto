'use strict';

/**
 * Guardrail 10 (CLAUDE.md) / spec.md §9.1: no inline style= attribute in a
 * template. Styles belong to src/styles.css or the component's own stylesheet,
 * where stylelint can hold them to the token contract; an inline style is
 * invisible to it.
 *
 * Bound forms are the same defect written differently, so [style],
 * [style.prop], [attr.style] and [ngStyle] are covered alongside the static
 * attribute.
 *
 * Matching is done on the key exactly as the author wrote it. Angular rewrites
 * [style.color] to a binding named "color", and angular-eslint then overwrites
 * the node's binding type with the string "BoundAttribute", so neither `name`
 * nor `type` identifies a style binding on its own. The key span survives both.
 */

const STYLE_KEY_PATTERN = /^(?:attr\.)?(?:style(?:\.|$)|ngStyle$)/;

function styleKey(node) {
  // keySpan is absent on plain text attributes; there the name is the key.
  const key = node.keySpan ? String(node.keySpan) : node.name;
  return STYLE_KEY_PATTERN.test(key) ? key : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow inline style attributes and style bindings in templates.',
    },
    schema: [],
    messages: {
      inlineStyle:
        'Inline "{{attr}}" on <{{tag}}> is not allowed (spec.md §9.1). Move this to the component stylesheet and reference a token from spec.md §9.2.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = context.sourceCode.parserServices;

    return {
      Element(node) {
        const tag = node.name.toLowerCase();
        for (const attr of [...node.attributes, ...node.inputs]) {
          const key = styleKey(attr);
          if (key === null) {
            continue;
          }
          context.report({
            loc: parserServices.convertNodeSourceSpanToLoc(attr.sourceSpan),
            messageId: 'inlineStyle',
            data: { attr: key, tag },
          });
        }
      },
    };
  },
};
