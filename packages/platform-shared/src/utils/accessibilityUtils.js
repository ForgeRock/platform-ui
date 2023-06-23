/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
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

export { createErrorId, createAriaDescribedByList };
