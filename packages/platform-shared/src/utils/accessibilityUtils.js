/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

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

export {
  createErrorId,
  createAriaDescribedByList,
  removeNonRoleAriaAttributes,
};
