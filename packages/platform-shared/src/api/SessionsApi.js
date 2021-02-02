/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import store from '@/store';

const sessionsApiConfig = {
  path: 'sessions',
  apiVersion: 'protocol=2.1,resource=4.0',
};

/**
  * Returns an object containing an array of configured gateways or agents
  *
  * @returns {Promise}
  */
export function getSessionInfo(userId) {
  const realmQueryPath = store.state.realm !== 'root' ? `/${store.state.realm}` : '/';
  const params = { _queryFilter: `username eq "${userId}" and realm eq "${realmQueryPath}"` };
  return generateAmApi(sessionsApiConfig).get(
    '',
    { withCredentials: true, params },
  );
}

export function clearSessions(userId) {
  return getSessionInfo(userId).then(({ data: { result: results } }) => {
    if (results && results.length > 0) {
      const sessionHandles = results.map((result) => result.sessionHandle);
      const params = { _action: 'logoutByHandle' };
      return generateAmApi(sessionsApiConfig).post(
        '',
        { sessionHandles },
        { withCredentials: true, params },
      );
    }
    return Promise.resolve();
  });
}
