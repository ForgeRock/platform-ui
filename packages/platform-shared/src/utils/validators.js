/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { has, isArray } from 'lodash';
import { email } from '@vee-validate/rules';

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
 * @returns {Boolean}
 */
export const url = (value) => {
  try {
    return !!(new URL(value));
  } catch (e) {
    return false;
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
    const esvRegex = /^&{.+}$/g;
    return (url(value) || relativePathRegex.test(value) || esvRegex.test(value));
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

export function validEmail(value) {
  if (Array.isArray(value)) {
    let valid = true;
    value.forEach((arrayValue) => {
      if (has(arrayValue, 'value')) {
        valid = valid && email(arrayValue.value);
      } else {
        valid = valid && email(arrayValue);
      }
    });
    return valid;
  }
  return email(value);
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
