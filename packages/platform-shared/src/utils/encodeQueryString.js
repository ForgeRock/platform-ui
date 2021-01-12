/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Converts an object literal into a query string, correctly url encoding the keys and values.
 *
 * @param {Object} params
 */
export default function encodeQueryString(params) {
  // empty object means empty query string
  if (!Object.keys(params).length) {
    return '';
  }

  // add underscore to key if not present
  Object.keys(params).forEach((key) => {
    if (key.charAt(0) !== '_') {
      params[`_${key}`] = params[key];
      delete params[key];
    }
  });

  const queryString = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  return `?${queryString}`;
}
