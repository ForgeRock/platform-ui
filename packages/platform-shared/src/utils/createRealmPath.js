/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default function createRealmPath(realm) {
  if (realm === '/' || realm === 'root') {
    return '';
  }
  const realmPath = realm
    // make array of names by splitting on /
    .split('/')
    // check array for empty strings keep only realm names
    .filter((realmName) => realmName.length >= 1)
    // filter out any realm names that equal to "realms"
    // so we prevent an undesired repetitive output in the
    // join method below such as realms/realms/realms.
    .filter((realmName) => realmName !== 'realms')
    // join array with /realms/ EX. firstRealm/realms/secondRealm
    .join('/realms/');
  return `realms/${realmPath}`;
}
