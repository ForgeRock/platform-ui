/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable operator-linebreak */

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
 * @param {String} value Validation value, can be a string or an array of strings
 * @returns {Boolean} Whether validation passed or not.
 */
export const url = (value) => {
  if (!value || value.length === 0) {
    return true;
  }

  try {
    if (isArray(value)) {
      return value.every((arrayValue) => !!(new URL(arrayValue)));
    }

    return !!(new URL(value));
  } catch (e) {
    return false;
  }
};

/**
 * validates a text field is an ipv4 address
 * @param {String} value
 * @returns {Boolean} Whether validation passed or not.
 */
export function ipv4(value) {
  const ip4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ip4Regex.test(value);
}

/**
 * Validates a text field is an ipv6 address
 * This regex is designed to match the various representations of IPv6 addresses,
 * including:
 * 1.  Standard 8-group hex notation (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334)
 * 2.  Compressed notation with '::' (e.g., 2001:db8::8a2e:370:7334)
 * 3.  Mixed notation with an IPv4 address at the end (e.g., ::ffff:192.0.2.128)
 *
 * It is broken down into several parts for readability and combined at the end.
 * @param {String} value
 * @returns {Boolean} Whether validation passed or not.
 */
export function ipv6(value) {
  // This Regex was created by Gemini AI. I have validated it against the RFC 4291 and it works for all suggested IPv6 addresses.
  // An individual hexadecimal group in an IPv6 address (1-4 hex characters)
  const hexGroup = '[0-9a-fA-F]{1,4}';

  // The IPv4 part of a mixed-notation address (e.g., 192.168.1.1)
  const ipv4Part = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

  // Regex for the full, uncompressed 8-group format
  const fullIPv6 = `(?:${hexGroup}:){7}${hexGroup}`;

  // Regex for addresses where '::' replaces one or more groups
  // It handles cases where '::' is at the beginning, middle, or end.
  const compressedIPv6 =
      `(?:(?:${hexGroup}:){1,7}:)|` + // 1-7 groups, then ::
      `(?:(?:${hexGroup}:){1,6}:${hexGroup})|` + // 1-6 groups, ::, then 1 group
      `(?:(?:${hexGroup}:){1,5}(?::${hexGroup}){1,2})|` + // 1-5 groups, ::, then 1-2 groups
      `(?:(?:${hexGroup}:){1,4}(?::${hexGroup}){1,3})|` + // 1-4 groups, ::, then 1-3 groups
      `(?:(?:${hexGroup}:){1,3}(?::${hexGroup}){1,4})|` + // 1-3 groups, ::, then 1-4 groups
      `(?:(?:${hexGroup}:){1,2}(?::${hexGroup}){1,5})|` + // 1-2 groups, ::, then 1-5 groups
      `(?:${hexGroup}:(?:(?::${hexGroup}){1,6}))|` + // 1 group, ::, then 1-6 groups
      `:(?:(?::${hexGroup}){1,7}|:)`; // :: at the beginning

  // Regex for mixed notation (IPv6 ending with an IPv4 address)
  const mixedNotation =
    `(?:(?:${hexGroup}:){1,6})?::ffff:${ipv4Part}|` + // Optional groups, ::ffff:, then IPv4
    `::ffff:${ipv4Part}`; // Just ::ffff: and IPv4

  const zoneIdentifies = '(?:%[0-9A-Za-z]+)?'; // Optional zone identifier (e.g., %eth0)

  // Combine all parts into a single regex.
  // The `^` and `$` anchors ensure the entire string must match.
  const ip6Regex = new RegExp(`^((${fullIPv6})|(${compressedIPv6})|(${mixedNotation}))${zoneIdentifies}$`);

  return ip6Regex.test(value);
}

/**
 * validates a text field represents solely the domain of a URL with no invalid characters.
 * a protocol is prepended to allow easier validation and to ensure one has not already been entered
 * @param {String} value
 * @returns {Boolean} Whether validation passed or not.
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
 * @returns {Boolean} Whether validation passed or not.
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
