/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Contains the list of form labels and their corresponding `autocomplete` value.
 */
const autocompleteFieldLookup = {
  username: 'username',
  'user name': 'username',
  'first name': 'given-name',
  'last name': 'family-name',
  'email address': 'email',
};

/**
 * Finds the autocomplete value from the given label.
 * For accessibility purposes certain fields should have an `autocomplete` attribute.
 * @param {String} fieldName the label of the form field
 * @returns autocomplete value for that label
 */
function getAutocompleteValue(fieldName) {
  if (!fieldName) return false;
  if (typeof fieldName !== 'string') return false;

  return autocompleteFieldLookup[fieldName.toLowerCase()];
}

export default getAutocompleteValue;
