/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import apiUtils from './utils/apiUtils';

const apiVersion = 'protocol=2.1,resource=3.0';
const getTreeApiConfig = (realm) => {
  const configPath = realm ? apiUtils.getRealmConfigPath(realm) : apiUtils.getCurrentRealmConfigPath();
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

/**
  * Returns a list of available node types
  *
  * @returns {Promise}
  */
export function actionNodeListLatestTypes() { // eslint-disable-line
  return generateAmApi(getTreeApiConfig()).post(
    '/nodes?_action=listLatestTypes',
    {},
    { withCredentials: true },
  );
}
