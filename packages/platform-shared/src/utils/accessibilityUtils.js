/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Native interactive element tags
const NATIVE_INTERACTIVE_TAGS = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY', 'DETAILS', 'IFRAME', 'AUDIO', 'VIDEO'];

// ARIA interactive roles
const ARIA_INTERACTIVE_ROLES = ['button', 'link', 'checkbox', 'menuitem', 'option', 'radio', 'switch', 'textbox'];

/**
 * Creates a string id for errors. This enables form fields to reference this for accessibility. See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby
 * @param {String} fieldName the name of the form field
 * @returns The string id
 */
function createErrorId(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') return '';

  // Note: spaces are not valid in ids
  const errorName = fieldName.replace(/\s/g, '-').toLocaleLowerCase();

  return `${errorName}-error`;
}

/**
 * Creates a list of error ids to reference in the aria-describedby attribute. See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby
 * @param {String} fieldName the name of the form field
 * @param {List} errors a list of errors beloning to that form field
 * @returns a string containing all the ids of the errors that belong to this form field
 */
function createAriaDescribedByList(fieldName, errors) {
  if (!errors || !Array.isArray(errors)) return false;

  let ariaDescribedBy = '';
  errors.forEach((error, index) => {
    ariaDescribedBy += `${createErrorId((fieldName || '') + index)} `;
  });

  return ariaDescribedBy.trim() || false;
}

/**
 * Removes ARIA attributes that are not permitted on elements without a role.
 *
 * Removes aria-label from attributes when there is no role defined to avoid accessibility issues
 * related to "Elements must only use permitted Aria attributes" per ARIA 1.2 specification.
 *
 * Why this matters:
 * - ARIA attributes like aria-label require an element to have a role (implicit or explicit)
 * - Generic wrapper divs without roles cannot have aria-label
 * - Non-meaningful generic labels (e.g., callback_1, callback_2) confuse screen reader users
 * - Removing them allows screen readers to look for other more meaningful content
 *
 * @param {Object} attrs - The attributes object to filter
 * @returns {Object} Filtered attributes object with non-role ARIA attributes removed
 */
function removeNonRoleAriaAttributes(attrs = {}) {
  const newAttrs = { ...attrs };
  // Remove aria-label if no role is defined (aria-label requires an element with a role)
  if (!Object.prototype.hasOwnProperty.call(newAttrs, 'role') && Object.prototype.hasOwnProperty.call(newAttrs, 'aria-label')) {
    delete newAttrs['aria-label'];
  }
  return newAttrs;
}

/**
 * Detects whether an HTML string contains any interactive (keyboard-focusable) elements.
 * Use this to guard aria-hidden: a container should not be aria-hidden when it has
 * focusable descendants, as that creates a WCAG 2.1 § 4.1.2 mismatch between
 * keyboard accessibility and screen-reader visibility.
 *
 * Checks for:
 *   - Native interactive tags: button, input (non-hidden), select, textarea, details, summary, iframe, audio, video
 *   - Anchor tags with href attribute
 *   - Contenteditable elements
 *   - Elements with non-negative tabindex
 *   - ARIA interactive roles (button, link, checkbox, menuitem, option, radio, switch, textbox)
 *
 * @param {String} htmlString Raw HTML string to inspect
 * @returns {Boolean} true when at least one interactive element is present
 */
function hasInteractiveContent(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') return false;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const elements = Array.from(doc.body.querySelectorAll('*'));

  return elements.some((el) => {
    const tag = el.tagName;
    const role = el.getAttribute('role');
    const isDisabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

    // Check if element is not disabled
    if (isDisabled) return false;

    // Native interactive tag
    if (NATIVE_INTERACTIVE_TAGS.includes(tag)) {
      if (tag === 'INPUT' && el.getAttribute('type') === 'hidden') return false;
      if ((tag === 'AUDIO' || tag === 'VIDEO') && !el.hasAttribute('controls')) return false;
      return true;
    }

    // Anchor with href
    if (tag === 'A' && el.hasAttribute('href')) return true;

    // Contenteditable (true or empty string both enable editing)
    if (el.hasAttribute('contenteditable') && el.getAttribute('contenteditable') !== 'false') return true;

    // Keyboard focusable (non-negative tabindex)
    if (el.hasAttribute('tabindex')) {
      const tabindex = parseInt(el.getAttribute('tabindex'), 10);
      if (!Number.isNaN(tabindex) && tabindex >= 0) return true;
    }

    // ARIA interactive role
    if (role && ARIA_INTERACTIVE_ROLES.includes(role)) return true;

    return false;
  });
}

export {
  createErrorId,
  createAriaDescribedByList,
  hasInteractiveContent,
  removeNonRoleAriaAttributes,
};
