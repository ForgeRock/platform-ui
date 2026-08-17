/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from './BaseApi';
import createRealmPath from '../utils/createRealmPath';

/**
 * Fetches a user from the AM users endpoint
 *
 * @param {String} realm - the realm the user belongs to (e.g. 'alpha')
 * @param {String} userId - the user id (e.g. the username claim of a consent_request JWT)
 * @returns {Promise} Resolves to the user resource
 */
export function getUser(realm, userId) {
  const realmPath = createRealmPath(realm || 'root');
  return generateAmApi(
    {
      path: `realms/root/${realmPath}`,
      apiVersion: 'protocol=1.0,resource=2.0',
    },
  ).get(
    `users/${encodeURIComponent(userId)}`,
    { withCredentials: true },
  );
}
