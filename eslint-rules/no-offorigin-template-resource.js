'use strict';

/**
 * Guardrail 3 (CLAUDE.md) / CONSTITUTION.md §2.3: nothing off-origin.
 * Static <script src>, <link href>, and other resource-loading attributes
 * must not point outside the repo. Dynamic (bound) attribute values can't
 * be checked statically and are out of scope for this rule.
 *
 * <script> (and <style>) are special-cased: @angular/compiler classifies
 * them as PreparsedElementType.SCRIPT/STYLE and elides them from the
 * parsed template AST entirely, so the Element visitor below never sees
 * them. They're instead caught by a raw-text scan over the source.
 */

const RESOURCE_ATTRS_BY_TAG = {
  link: ['href'],
  iframe: ['src'],
  embed: ['src'],
  object: ['data'],
  source: ['src'],
  img: ['src'],
  audio: ['src'],
  video: ['src'],
  track: ['src'],
};

const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const SCRIPT_TAG_PATTERN = /<script\b[^>]*>/gi;
const SRC_ATTR_PATTERN = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

function isOffOrigin(rawValue) {
  const value = rawValue.trim();
  if (value === '' || value.startsWith('data:')) {
    return false;
  }
  if (value.startsWith('//')) {
    return true;
  }
  return SCHEME_PATTERN.test(value);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow off-origin resources (script/link/iframe/embed/etc.) in templates.',
    },
    schema: [],
    messages: {
      offOrigin:
        'Off-origin "{{attr}}" on <{{tag}}> is not allowed (CONSTITUTION.md §2.3). Serve this resource from the repo instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = context.sourceCode.parserServices;
    return {
      Program() {
        const text = context.sourceCode.getText();
        for (const match of text.matchAll(SCRIPT_TAG_PATTERN)) {
          const srcMatch = SRC_ATTR_PATTERN.exec(match[0]);
          const src = srcMatch && (srcMatch[1] ?? srcMatch[2]);
          if (src && isOffOrigin(src)) {
            context.report({
              loc: context.sourceCode.getLocFromIndex(match.index),
              messageId: 'offOrigin',
              data: { attr: 'src', tag: 'script' },
            });
          }
        }
      },
      Element(node) {
        const tag = node.name.toLowerCase();
        const resourceAttrs = RESOURCE_ATTRS_BY_TAG[tag];
        if (!resourceAttrs) {
          return;
        }
        for (const attr of node.attributes) {
          if (!resourceAttrs.includes(attr.name) || typeof attr.value !== 'string') {
            continue;
          }
          if (isOffOrigin(attr.value)) {
            context.report({
              loc: parserServices.convertNodeSourceSpanToLoc(attr.sourceSpan),
              messageId: 'offOrigin',
              data: { attr: attr.name, tag },
            });
          }
        }
      },
    };
  },
};
