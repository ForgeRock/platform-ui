/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
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
    // join array with /realms/ EX. one/realms/two
    .join('/realms/');
  return `realms/${realmPath}`;
}
