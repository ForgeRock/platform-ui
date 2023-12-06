/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createRealmPath from '@forgerock/platform-shared/src/utils/createRealmPath';
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
  return 'realms/root/realm-config';
}

/**
 * Get the api path to access the realm-config for the current realm
 * @returns {String} a realm config path
 */
function getCurrentRealmConfigPath() {
  return getRealmConfigPath(store.state.realm);
}

export default {
  getRealmConfigPath,
  getCurrentRealmConfigPath,
};
