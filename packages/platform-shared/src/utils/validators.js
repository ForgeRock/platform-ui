/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { has, isArray } from 'lodash';
import isEmail from 'validator/lib/isEmail';
import { getIdfromPlaceholder } from './esvUtils';
import { getSecret, getVariable } from '../../../platform-admin/src/api/EsvApi';

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

export const isValidESV = async (value) => {
  const esvId = getIdfromPlaceholder(value);
  try {
    const { status } = await getVariable(esvId);
    return (status === 200);
  } catch (e) {
    try {
      const { status: secretReqStatus } = await getSecret(esvId);
      return (secretReqStatus === 200);
    } catch (ex) {
      return false;
    }
  }
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
