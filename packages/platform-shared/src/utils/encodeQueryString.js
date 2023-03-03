/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Converts an object literal into a query string, correctly url encoding the keys and values.
 * @param {Object} params
 * @param {Boolean} appendUnderscores Optional parameter for query string that do not needs understore, default is true
 */
export default function encodeQueryString(params, appendUnderscores = true) {
  // empty object means empty query string
  if (!params || !Object.keys(params).length) {
    return '';
  }

  // add underscore to key if not present
  if (appendUnderscores) {
    Object.keys(params).forEach((key) => {
      if (key.charAt(0) !== '_') {
        params[`_${key}`] = params[key];
        delete params[key];
      }
    });
  }

  const queryString = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  return `?${queryString}`;
}
