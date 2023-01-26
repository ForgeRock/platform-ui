/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { has } from 'lodash';
import * as rules from 'vee-validate/dist/rules';

const urlHasPath = (url) => url.pathname && url.pathname !== '/';

export const urlWithoutPath = (value, i18n) => {
  try {
    const url = new URL(value);

    if (urlHasPath(url)) {
      return i18n.t('common.policyValidationMessages.urlWithoutPath');
    }

    return true;
  } catch (e) {
    return i18n.t('common.policyValidationMessages.urlWithoutPath');
  }
};

export const urlWithPath = (value, i18n) => {
  try {
    const url = new URL(value);

    if (!urlHasPath(url)) {
      return i18n.t('common.policyValidationMessages.urlWithPath');
    }

    return true;
  } catch (e) {
    return i18n.t('common.policyValidationMessages.urlWithPath');
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

export function testUniqueness(value, { otherValues }) {
  let uniqueValues;
  if (typeof otherValues === 'string') {
    uniqueValues = [otherValues];
  } else {
    uniqueValues = otherValues;
  }
  let returnValue = true;

  if (uniqueValues) {
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
        valid = valid && rules.email.validate(arrayValue.value);
      } else {
        valid = valid && rules.email.validate(arrayValue);
      }
    });
    return valid;
  }
  return rules.email.validate(value);
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
