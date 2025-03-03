/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Contains the list of form labels and their corresponding `autocomplete` value.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
 */
const autocompleteFieldLookup = {
  // identification
  username: 'username',
  'user name': 'username',
  password: 'current-password',
  prefix: 'honorific-prefix',
  'first name': 'given-name',
  'last name': 'family-name',
  'middle name': 'additional-name',
  'display name': 'nickname',
  nickname: 'nickname',
  'email address': 'email',
  'street address': 'street-address',
  // Phone
  'telephone number': 'tel',
  'phone number': 'tel',
  'country code': 'tel-country-code',
  'area code': 'tel-area-code',
  'phone extension': 'tel-extension',
  // preferences
  language: 'language',
  'preferred language': 'language',
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
