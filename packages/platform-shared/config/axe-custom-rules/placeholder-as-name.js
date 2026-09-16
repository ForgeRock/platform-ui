/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Custom axe-core rule: flags text fields whose accessible name relies on the
 * placeholder attribute (WCAG 3.3.2 Labels or Instructions, 1.3.1 Info and
 * Relationships, 4.1.2 Name, Role, Value).
 *
 * Stock axe-core's `label` rule treats a placeholder as a sufficient name
 * source, so an input with `aria-label` equal to its placeholder — or with a
 * placeholder and no name at all — passes stock axe even though the visible
 * hint disappears on input and several AT/speech-input stacks ignore
 * placeholder-derived names. This stricter rule implements the manual-review
 * heuristic instead, and is enabled by default for every axe run through
 * getAxe()/runA11yTest():
 *
 *  - A real <label> element (associated via for/id or wrapping) always counts
 *    as a persistent label -> pass, even when its text equals the placeholder.
 *  - Disabled and readonly inputs are skipped (not user-interactable).
 *  - Otherwise, if every remaining name source (aria-labelledby, aria-label,
 *    title) is absent or its text equals the placeholder -> fail.
 *  - No placeholder and no remaining name sources -> not applicable; the
 *    stock `label` rule already covers missing accessible names.
 *
 * To exempt a known false positive in one test, disable the rule for that
 * run: runA11yTest(wrapper, { rules: { 'placeholder-as-label':
 * { enabled: false } } }) — see jest-axe-config.js.
 */

const TEXT_LIKE_INPUT_TYPES = ['text', 'search', 'tel', 'url', 'email', 'password', 'number'];

/**
 * Whether the node is a text-entry field the rule applies to.
 * @param {HTMLElement} node
 * @returns {boolean} true for textareas and text-like input types
 */
function isTextLike(node) {
  if (node.tagName === 'TEXTAREA') return true;
  if (node.tagName !== 'INPUT') return false;
  const type = (node.getAttribute('type') || 'text').toLowerCase();
  return TEXT_LIKE_INPUT_TYPES.includes(type);
}

/**
 * Text of the persistent <label> for this node, if one exists — either
 * associated via for/id or by wrapping the node.
 * @param {HTMLElement} node
 * @returns {string} trimmed label text, or '' when no <label> exists
 */
function labelSourceText(node) {
  if (node.id) {
    const associated = node.ownerDocument.querySelector(`label[for="${CSS.escape(node.id)}"]`);
    if (associated) return (associated.textContent || '').trim();
  }
  let parent = node.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') return (parent.textContent || '').trim();
    parent = parent.parentElement;
  }
  return '';
}

/**
 * Text of every non-<label> accessible-name source on the node.
 * @param {HTMLElement} node
 * @returns {string[]} trimmed texts from aria-labelledby targets, aria-label, and title
 */
function ariaNameSourceTexts(node) {
  const sources = [];
  (node.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).forEach((id) => {
    const el = node.ownerDocument.getElementById(id);
    if (el) sources.push((el.textContent || '').trim());
  });
  const ariaLabel = (node.getAttribute('aria-label') || '').trim();
  if (ariaLabel) sources.push(ariaLabel);
  const title = (node.getAttribute('title') || '').trim();
  if (title) sources.push(title);
  return sources;
}

/**
 * axe-core check run against each node the rule gathers. Returns true to pass
 * and false to flag the node. Applicability filtering (disabled, readonly)
 * lives here because check specs support no `matcher` property.
 * @param {HTMLElement} node
 * @returns {boolean}
 */
export const placeholderAsNameCheck = {
  id: 'placeholder-as-name',
  evaluate(node) {
    if (node.disabled || node.getAttribute('aria-disabled') === 'true') return true;
    if (node.readOnly || node.getAttribute('aria-readonly') === 'true') return true;
    const placeholder = (node.getAttribute('placeholder') || '').trim();
    if (labelSourceText(node)) return true; // persistent <label> exists
    if (!placeholder) return true; // no name sources: stock `label` rule covers this
    const ariaSources = ariaNameSourceTexts(node).filter((text) => text);
    if (ariaSources.length === 0) return false; // name computed from placeholder alone
    return !ariaSources.every((text) => text.toLowerCase() === placeholder.toLowerCase());
  },
  metadata: {
    impact: 'serious',
    messages: {
      pass: 'Accessible name is independent of the placeholder',
      fail: 'Accessible name relies on the placeholder — add a persistent, programmatically associated <label> (WCAG 3.3.2)',
    },
  },
};

/**
 * axe-core rule spec registered via getAxe()'s globalOptions. `matches` (a
 * function form axe-core supports at rule level) narrows gathered nodes to
 * user-editable text fields before the check's evaluate() runs.
 */
export const placeholderAsNameRule = {
  id: 'placeholder-as-label',
  selector: 'input, textarea',
  matches(node) {
    return isTextLike(node) && !node.disabled && !node.readOnly;
  },
  any: ['placeholder-as-name'],
  enabled: true,
  tags: ['wcag331', 'wcag131', 'cat.forms'],
  metadata: {
    description: 'Flags fields whose accessible name comes from the placeholder rather than a persistent label',
    help: 'Avoid using the placeholder as the accessible name',
    helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
  },
};
