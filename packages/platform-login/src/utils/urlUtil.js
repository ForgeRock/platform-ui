/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  fromPairs, isEmpty, map,
} from 'lodash';

/**
 * Returns the query string from the URI
 * @returns {string} Unescaped query string or empty string if no query string was found
 */
function getCurrentQueryString() {
  const queryString = window.location.search;
  return queryString.substring(1, queryString.length);
}

/**
 * @description Creates an object of key value pairs from the passed in query string
 * @param {string} paramString A string containing a query string
 * @returns {object} An Object of key value pairs
 */
function parseParameters(paramString) {
  const object = isEmpty(paramString) ? {} : fromPairs(map(paramString.split('&'), (pair) => pair.split('=')));
  return object;
}

/**
 * Creates a query string from the passed urlParams, starting with & rather than ?
 * @param {URLSearchParams} urlParams to create a query string from)
 * @returns {String} a query string
 */
function createParamString(urlParams) {
  let stringParams = '';

  urlParams.forEach((value, key) => {
    if (key === 'authIndexValue' && urlParams.get('authIndexType') === 'service') {
      // Don't encode the tree names in the URL as these won't be matched correctly if they are
      stringParams += `&${key}=${value}`;
    } else {
      stringParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  });

  return stringParams;
}

/**
 * Updates browser history so that the URL only contains the passed realm, tree and general parameters
 * @param {String} realm the realm the include in the URL
 * @param {URLSearchParams} newUrlParams the url params to include in the URL
 */
function replaceUrlParams(realm, newUrlParams) {
  const { location: { hash } } = window;
  const newParamString = createParamString(newUrlParams);
  window.history.replaceState(null, null, `?realm=${realm}${newParamString}${hash}`);
}

export {
  getCurrentQueryString,
  parseParameters,
  createParamString,
  replaceUrlParams,
};
