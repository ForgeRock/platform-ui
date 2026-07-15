/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createRealmPath from '@forgerock/platform-shared/src/utils/createRealmPath';
import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';

function authorizationPolicyApiConfig(realm) {
  const realmPath = createRealmPath(realm);
  const path = realmPath ? `realms/root/${realmPath}/policies` : 'realms/root/policies';
  return {
    path,
    apiVersion: 'protocol=1.0,resource=2.0',
  };
}

/**
 * Evaluates a policy tree against the AM policy evaluation endpoint.
 * @param {String} realm Realm name
 * @param {Object} payload Policy evaluation payload (resource, application, environment, etc.)
 * @param {Boolean} routeToForbidden When false, a 403 response is propagated as a
 *   rejected promise instead of redirecting to the forbidden page. Pass false for background
 *   evaluations (e.g. end-user menu policy lookups) where a 403 is an expected no-policy state.
 * @returns {Promise} Resolves with an array of policy evaluation result objects
 */
export function evaluateAuthorizationPolicy(realm, payload, routeToForbidden = true) {
  return generateAmApi(authorizationPolicyApiConfig(realm), {}, routeToForbidden).post(
    '/?_action=evaluateTree',
    payload,
    { withCredentials: true },
  );
}
