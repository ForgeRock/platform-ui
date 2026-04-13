/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createRealmPath from '@forgerock/platform-shared/src/utils/createRealmPath';
import { getRealmFullPath } from '@forgerock/platform-shared/src/utils/realm';
import store from '@/store';

/**
 * Get the api path to access the realm-config for a given realm
 * @param {*} realm the realm to obtain the path for
 * @returns {String} a realm config path
 */
function getRealmConfigPath(realm) {
  const realmName = (realm === 'root') ? '/' : realm;
  const realmConfig = store.state.realms.find((stateRealm) => stateRealm.name === realmName);

  if (realmConfig !== undefined && realmConfig.name !== 'root' && realmConfig.name !== '/') {
    const slashSeparatedPath = `${realmConfig.parentPath}/${realmConfig.name}`;
    const realmPath = createRealmPath(slashSeparatedPath);
    return `realms/root/${realmPath}/realm-config`;
  }
  // For non-root realms not yet in the store (e.g. during realm creation), fall back
  // to the simple sub-realm path to avoid incorrectly targeting the root realm.
  if (realm !== 'root' && realmName !== '/') {
    return `realms/root/realms/${realm}/realm-config`;
  }
  return 'realms/root/realm-config';
}

/**
 * Get the api path to access the realm-config for the current realm
 * @returns {String} a realm config path
 */
function getCurrentRealmConfigPath() {
  return getRealmConfigPath(store.state.realm);
}

/**
 * Computes the full realm path (with a leading slash) for the current realm.
 * @returns {string} The full realm path, e.g. '/', '/alpha', or '/level1/level2'.
 */
function getCurrentRealmFullPath() {
  return getRealmFullPath(store.state.realm, store.state.realms);
}

export default {
  getRealmConfigPath,
  getCurrentRealmConfigPath,
  getCurrentRealmFullPath,
};
