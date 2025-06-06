/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { has, isArray } from 'lodash';
import isEmail from 'validator/lib/isEmail';
import { getSecret, getVariable } from '@forgerock/platform-shared/src/api/EsvApi';
import { getIdfromPlaceholder } from './esvUtils';

const urlHasPath = (url) => url.pathname && url.pathname !== '/';

export const urlWithoutPath = (value, i18n) => {
  try {
    const url = new URL(value);

    if (urlHasPath(url)) {
      return i18n.global.t('common.policyValidationMessages.urlWithoutPath');
    }

    return true;
  } catch (e) {
    return i18n.global.t('common.policyValidationMessages.urlWithoutPath');
  }
};

export const urlWithPath = (value, i18n) => {
  try {
    if (isArray(value)) {
      const invalid = value.some((element) => {
        try {
          const url = new URL(element);
          return !urlHasPath(url);
        } catch (e) {
          return true;
        }
      });
      if (invalid) {
        return i18n.global.t('common.policyValidationMessages.urlWithPath');
      }
    } else {
      const url = new URL(value);
      if (!urlHasPath(url)) {
        return i18n.global.t('common.policyValidationMessages.urlWithPath');
      }
    }

    return true;
  } catch (e) {
    return i18n.global.t('common.policyValidationMessages.urlWithPath');
  }
};

/**
 * validates a text field is a url
 * @param {String} value
 * @param {Object} i18n
 * @returns {Boolean}
 */
export const url = (value, i18n) => {
  if (value.length === 0) {
    return true;
  }

  try {
    if (isArray(value)) {
      return value.every((arrayValue) => !!(new URL(arrayValue)));
    }

    return !!(new URL(value));
  } catch (e) {
    return i18n.global.t('common.policyValidationMessages.validUrl');
  }
};

/**
 * validates a text field is an ipv4 address
 * @param {String} value
 * @returns {Boolean}
 */
export function ipv4(value) {
  const ip4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ip4Regex.test(value);
}

/**
 * validates a text field is an ipv6 address
 * @param {String} value
 * @returns {Boolean}
 */
export function ipv6(value) {
  const ip6Regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
  return ip6Regex.test(value);
}

/**
 * validates a text field represents solely the domain of a URL with no invalid characters.
 * a protocol is prepended to allow easier validation and to ensure one has not already been entered
 * @param {String} value
 * @returns {Boolean}
 */
export const urlDomainOnly = (value, i18n) => {
  const testValue = `http://${value}`;
  const noSpecialCharactersRegex = /^[a-zA-Z0-9-_.]+$/;
  try {
    const potentialUrl = new URL(testValue);
    const parts = value.split('.');
    if (urlHasPath(potentialUrl) || value.includes(':') || !parts[0] || !parts[1] || !noSpecialCharactersRegex.test(value)) {
      return i18n.global.t('common.policyValidationMessages.urlDomainOnly');
    }

    return true;
  } catch (e) {
    return i18n.global.t('common.policyValidationMessages.urlDomainOnly');
  }
};

/**
 * validates if the input params is present in the ESV variable lists or not
 * @param {String} esvId
 * @returns {boolean}
 */
const validateESVForVariable = async (esvId) => {
  try {
    const { status } = await getVariable(esvId);
    return (status === 200);
  } catch (e) {
    return false;
  }
};

/**
 * validates if the input params is present in the ESV secret lists or not
 * @param {String} esvId
 * @returns {boolean}
 */
const validateESVForSecret = async (esvId) => {
  try {
    const { status: secretReqStatus } = await getSecret(esvId);
    return (secretReqStatus === 200);
  } catch (e) {
    return false;
  }
};

/**
 * validates If the input params is a valid ESV or not
 * @param {String} value
 * @param {boolean} onlyCheckForVariable
 * @returns {boolean}
 */
export const isValidESV = async (value, onlyCheckForVariable) => {
  const esvId = getIdfromPlaceholder(value);
  const isValidESVVariable = await validateESVForVariable(esvId);
  if (onlyCheckForVariable) {
    return isValidESVVariable;
  }
  if (isValidESVVariable) {
    return true;
  }
  const isValidESVSecret = await validateESVForSecret(esvId);
  return isValidESVSecret;
};

/**
 * validates a text field is a url, a relative path or an ESV
 * @param {String} value
 * @returns {Boolean}
 */
export const validBookmarkUrl = (value) => {
  try {
    const relativePathRegex = /^(?:\/[a-zA-Z0-9-_?=#.&{}]+)+\/?$/g;
    return (relativePathRegex.test(value) || url(value));
  } catch (e) {
    return false;
  }
};

export function testUniqueness(value, { otherValues }) {
  let uniqueValues;
  if (typeof otherValues === 'string') {
    uniqueValues = [otherValues];
  } else {
    uniqueValues = otherValues;
  }
  let returnValue = true;

  if (uniqueValues && value) {
    uniqueValues.forEach((uniqueValue) => {
      if (uniqueValue.toLowerCase().trim() === value.toLowerCase().trim()) {
        returnValue = false;
      }
    });
  }
  return returnValue;
}

/**
 * Validates email addresses
 *
 * @param {String | String[] | Object} value - String or Array of strings to be validated
 * @returns {Boolean} True if valid or empty, false if invalid
 */
export function validEmail(value) {
  if (Array.isArray(value)) {
    let valid = true;
    value.forEach((arrayValue) => {
      // Checks if value is a Vue Ref
      if (has(arrayValue, 'value')) {
        valid = valid && (!arrayValue.value || isEmail(arrayValue.value));
      } else {
        valid = valid && (!arrayValue || isEmail(arrayValue));
      }
    });
    return valid;
  }
  // Checks if value is a Vue Ref
  if (has(value, 'value')) {
    return !value.value || isEmail(value.value);
  }

  return !value || isEmail(value);
}

export function minimumItems(value, { minItems }) {
  if (Array.isArray(value)) {
    if (value.length < minItems) {
      return false;
    }
  }
  if (Object.keys(value).length < minItems) {
    return false;
  }
  return true;
}
