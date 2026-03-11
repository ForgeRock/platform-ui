/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Compares the provided value with its realm-specific object resource name using the resource name provided
 * @param {String} compareValue Value to compare
 * @param {String} resourceName Base resource name
 */

import store from '@/store';

/**
 * Computes the full realm path (with a leading slash) from the provided realm name and list.
 * @param {string} realm the current realm name
 * @param {Array} realms list of realm objects (each with `name` and `parentPath`)
 * @returns {string} The full realm path, e.g. '/', '/alpha', or '/level1/level2'.
 */
export function getRealmFullPath(realm, realms) {
  if (realm === 'root') return '/';
  const realmObj = (realms || []).find((r) => r.name === realm);
  if (realmObj?.parentPath && realmObj.parentPath !== '/') {
    return `${realmObj.parentPath}/${realm}`;
  }
  return `/${realm}`;
}

export function compareRealmSpecificResourceName(compareValue, resourceName) {
  if (!compareValue || !resourceName) {
    return false;
  }
  const lowerCaseCompareValue = compareValue.toLowerCase();
  return (!store.state.isFraas || lowerCaseCompareValue.startsWith(store.state.realm)) && lowerCaseCompareValue.endsWith(resourceName.toLowerCase());
}

export default { getRealmFullPath, compareRealmSpecificResourceName };
