/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Builds API URL using a search value
 *
 * @param {string} filterString - Required current search value
 * @param {array} displayFields - Required array of field names that we want to query on
 * @param {object} schemaProps - Required metadata of current schema
 */
// eslint-disable-next-line import/prefer-default-export
export function generateSearchQuery(filterString, displayFields, schemaProps) {
  let filterUrl = '';

  if (filterString.length > 0) {
    // remove nested properties
    const filteredFields = displayFields.filter((field) => (!field.includes('/')));

    filteredFields.forEach((field, index) => {
      let type = 'string';

      if (schemaProps?.[field]) {
        type = schemaProps[field].type;
      }

      if (type === 'number' && !Number.isNaN(Number(parseInt(filterString, 10)))) {
        // Search based on number and proper number value
        if ((index + 1) < filteredFields.length) {
          filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
        } else {
          filterUrl = `${filterUrl}${field} eq ${filterString}`;
        }
      } else if (type === 'boolean' && (filterString === 'true' || filterString === 'false')) {
        // Search based on boolean and proper boolean true/false
        if ((index + 1) < filteredFields.length) {
          filterUrl = `${filterUrl}${field} eq ${filterString} OR `;
        } else {
          filterUrl = `${filterUrl}${field} eq ${filterString}`;
        }
      } else if ((index + 1) < filteredFields.length) {
        // Fallback to general string search if all other criteria fails
        // IAM-1003 revealed an issue with some url encoding differences between
        // chrome and IE. Need to use %22 instead of " to avoid the encoding
        filterUrl = `${filterUrl}${field} sw "${filterString}" OR `;
      } else {
        filterUrl = `${filterUrl}${field} sw "${filterString}"`;
      }
    });
  } else {
    filterUrl = 'true';
  }

  return filterUrl;
}

/**
 * Filters out fields that are causing API failures when used in search queries.
 * Removes fields related to password management, date, and integer fields
 * @param {Array} displayFields - Array containing available display fields for the resource.
 * @returns {Array} The Filtered display fields array.
 */
export function filterFieldsForSearchQuery(displayFields) {
  const passwordFields = ['passwordLastChangedTime', 'passwordExpirationTime'];
  return displayFields.filter((field) => !passwordFields.includes(field) && !field.startsWith('frIndexedDate') && !field.startsWith('frUnindexedDate') && !field.startsWith('frIndexedInteger') && !field.startsWith('frUnindexedInteger'));
}
