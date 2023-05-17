/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
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

export function compareRealmSpecificResourceName(compareValue, resourceName) {
  if (!compareValue || !resourceName) {
    return false;
  }
  const lowerCaseCompareValue = compareValue.toLowerCase();
  return (!store.state.isFraas || lowerCaseCompareValue.startsWith(store.state.realm)) && lowerCaseCompareValue.endsWith(resourceName.toLowerCase());
}

export default { compareRealmSpecificResourceName };
