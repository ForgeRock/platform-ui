/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
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
 * Decodes a JWT token
 */
export function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => (
    `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`
  )).join(''));
  return JSON.parse(jsonPayload);
}

/**
 * Gets an alternate field type based on policy requirements
 *
 * @param {Array} policyRequirements
 * @returns {String} - dataType string
 */
export function getAlternateFieldType(policyRequirements) {
  let dataType = '';
  // Check policyRequirements for date policies and set dataType accordingly
  if (policyRequirements.includes('VALID_DATE_TIME_FORMAT')) {
    dataType = 'datetime';
  } else if (policyRequirements.includes('VALID_DATE') || policyRequirements.includes('VALID_DATE_FORMAT')) {
    dataType = 'date';
  } else if (policyRequirements.includes('VALID_TIME_FORMAT')) {
    dataType = 'time';
  } else if (policyRequirements.includes('VALID_ENUM_VALUE')) {
    dataType = 'select';
  }
  return dataType;
}

/**
 * Finds the autocomplete value from the given label.
 * For accessibility purposes certain fields should have an `autocomplete` attribute.
 * @param {String} fieldName the label of the form field
 * @returns autocomplete value for that label
 */
export function getAutocompleteValue(fieldName) {
  if (!fieldName) return false;
  if (typeof fieldName !== 'string') return false;

  return autocompleteFieldLookup[fieldName.toLowerCase()];
}

/**
 * Gets the field validation for a given set of policy requirements
 *
 * @param {Array} policyRequirements policy requirements for the field
 * @returns {String} validation rules separated by pipes, or an empty string
 */
export function getFieldValidation(policyRequirements) {
  const validation = [];
  if (policyRequirements.includes('VALID_EMAIL_ADDRESS_FORMAT')) {
    validation.push('email');
  }
  if (policyRequirements.includes('REQUIRED')) {
    validation.push('required');
  }
  return validation.length ? validation.join('|') : null;
}

/**
 * @description Used to get link to start of tree from stepParams
 * @param {Object} stepParams desctuctured object containing tree, realmPath strings
 * @returns {string} returns string url
 */
export function getLinkToTreeStart({ tree, realmPath, query: { goto, gotoOnFail } }) {
  const gotosString = `${goto ? `&goto=${encodeURIComponent(goto)}` : ''}${gotoOnFail ? `&gotoOnFail=${encodeURIComponent(gotoOnFail)}` : ''}`;
  return `/am/XUI/?realm=${realmPath}&authIndexType=service&authIndexValue=${tree}${gotosString}`;
}

/**
 * @description Returns boolean true if payload has session timeout error code
 * @param {Object} payload - step payload data
 * @param {Boolean} suspendedIdWasSet - Whether suspendId was set upon navigation to this step
 * @returns {Boolean}
 */
export function isSessionTimedOut(payload, suspendedIdWasSet) {
  return (
    (payload.detail && payload.detail.errorCode === '110')
        || (suspendedIdWasSet && payload.code.toString() === '401')
  );
}
