/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';
import { isObject } from 'lodash';

/**
 * RegExp to determine if a property is a placeholder
 * must be a string with numbers/letters/fullstops and enclosed by &{}
 */
export const PLACEHOLDER_REGEX = /^([\w '"",.:/$£@]+)?(&{(([\w])+(.[\w]+)*)})([\w '"",.:/$£@]+)?$/;

/**
 * List of ESV variable types
 */
export const ESVTypes = [
  'string',
  'list',
  'array',
  'object',
  'bool',
  'int',
  'number',
];

/**
 * List of field types for which we support entering ESV placeholders
 */
const SUPPORTED_PLACEHOLDER_FIELDS = [
  'array',
  'checkbox',
  'password',
  'string',
  'text',
  'number',
  'integer',
  'select',
  'selectWithActions',
];

/**
 * List of field types for which we support entering ESV secrets
 */
const FIELDS_ALLOWING_SECRET_INPUT = [
  'string',
  'text',
  'password',
];

/**
 * Converts ESV ids to the equivalent placeholder which would be used to inject the ESV into config
 * @param {String} _id the _id to convert into a placeholder
 * @returns {String} an ESV placeholder
 */
export function formatIdAsPlaceholder(_id) {
  return `&{${_id.replace(/[-]/g, '.')}}`;
}

/**
 * Converts ESV dates to a human readable format
 * @param {String} date an unformatted ESV timestamp
 * @returns {String} a human readable date
 */
export function formatDate(date) {
  return dayjs(date).format('MMM DD, YYYY hh:mm A');
}

/**
 * Determines whether the passed value contains an $purpose based placeholder
 * @param {*} value the value to evaluate
 * @returns {Boolean} whether the field contains a $purpose based placeholder
 */
export function valueIsPurposePlaceholder(value) {
  return isObject(value) && Object.keys(value).includes('$purpose');
}

/**
 * Filters and processes secret version data for rendering
 * @param {Array} versionData secret version data to process
 * @returns {Array} filtered and processed secret version data
 */
export function processSecretVersionData(versionData) {
  // Don't display or set logic based on deleted/destroyed secret versions
  const usableVersions = versionData.filter((result) => result.status !== 'DESTROYED');

  const latestVersion = usableVersions[0].version;
  // The latest secret version can only be deleted if the previous version is enabled
  const canDeleteLatestVersion = usableVersions.length > 1 && usableVersions[1].status === 'ENABLED';

  return usableVersions.map((result) => ({
    ...result,
    value: '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■', // placeholder to render as the secret value
    canDisable: result.version !== latestVersion, // the latest version can't be disabled
    canDelete: result.version !== latestVersion || canDeleteLatestVersion, // can delete every version except the latest when the previous is disabled
    createDate: formatDate(result.createDate),
    status: result.status === 'ENABLED',
  }));
}

/**
 * Maps boolean secret version statuses used in the ESV UI to the strings used by the API
 * @param {Boolean} versionStatus the status to map
 * @returns {String} the API friendly equivalent to the passed boolean
 */
export function mapBooleanToSecretVersionStatus(versionStatus) {
  return versionStatus ? 'ENABLED' : 'DISABLED';
}

/**
 * Determines which ESV expression type is relevant for a given input field type
 * @param {String} fieldType the input field type provided by the field component
 * @returns {String} the relevant ESV expression type
 */
export function determineEsvTypeForField(fieldType) {
  switch (fieldType) {
    case 'string':
    case 'text':
    case 'password':
    case 'select':
    case 'selectWithActions':
      return 'string';
    case 'checkbox':
    case 'boolean':
      return 'bool';
    case 'number':
      return 'number';
    case 'integer':
      return 'int';
    case 'object':
      return 'object';
    case 'array':
      return 'array';
    default:
      throw new Error(`Unable to determine ESVs to show for the field type ${fieldType}`);
  }
}

/**
 * Coerces a placeholder from its value to esv object notation where the key is
 * the placeholders type so it can be saved correctly in the backend.
 * e.g the string placeholder '&{esv.test1}' should become { $string: '&{esv.test1}' }
 * @param {String} fieldType the type of input the placeholder was entered into
 * @param {String} placeholder the placeholder value
 * @returns {Object} the object describing how the backend should coerce the placeholder
 */
export function coercePlaceholderByType(fieldType, placeholder) {
  const type = determineEsvTypeForField(fieldType);
  return { [`$${type}`]: placeholder };
}

/**
 * Determines whether the passed value contains an ESV placeholder
 * @param {*} fieldValue the value of a field to evaluate
 * @returns {Boolean} whether the field contains a placeholder
 */
export function doesValueContainPlaceholder(fieldValue) {
  if (!fieldValue || fieldValue === null || fieldValue === undefined) return false;

  switch (typeof fieldValue) {
    case 'object': {
      const values = Object.values(fieldValue);
      const objectHasEsvPlaceholder = values.length === 1 && PLACEHOLDER_REGEX.test(values[0]);
      return objectHasEsvPlaceholder || valueIsPurposePlaceholder(fieldValue);
    }
    case 'string': {
      return PLACEHOLDER_REGEX.test(fieldValue);
    }
    default: {
      return false;
    }
  }
}

/**
 * Retrieves the placeholder key from a field value containing a placeholder to display to users
 * @param {*} fieldValueWithPlaceholder the value of a field containing a placeholder
 * @returns {String} the placeholder key to display to users
 */
export function getPlaceholderValueToDisplay(fieldValueWithPlaceholder) {
  switch (typeof fieldValueWithPlaceholder) {
    case 'object': {
      if (valueIsPurposePlaceholder(fieldValueWithPlaceholder)) {
        return JSON.stringify(fieldValueWithPlaceholder);
      }
      return Object.values(fieldValueWithPlaceholder)[0];
    }
    case 'string': {
      return fieldValueWithPlaceholder;
    }
    default: {
      throw new Error('Invalid field type');
    }
  }
}

/**
 * Determines whether a field type is supported for entering ESV placeholders
 * @param {String} fieldType the field type to evaluate
 * @returns {Boolean} whether the field type is supported
 */
export function isFieldTypeSupportedForPlaceholderEntry(fieldType) {
  if (typeof fieldType !== 'string') return false;
  return SUPPORTED_PLACEHOLDER_FIELDS.includes(fieldType);
}

/**
 * Determines whether ESV secrets should be shown for a field type
 * @param {String} fieldType the field type to evaluate
 * @returns {Boolean} whether secrets should be shown for the field type
 */
export function showEsvSecretsForField(fieldType) {
  if (typeof fieldType !== 'string') return false;
  return FIELDS_ALLOWING_SECRET_INPUT.includes(fieldType);
}

/**
 * Convert the provided placeholder value to _id
 * @param {String} an ESV placeholder
 * @returns {String} _id of the placeholder
 */
export function getIdfromPlaceholder(value) {
  return `${value.slice(2, -1).replaceAll('.', '-')}`;
}
