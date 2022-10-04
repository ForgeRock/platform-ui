/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi, generateIdmApi } from './BaseApi';
import getFQDN from '../utils/getFQDN';

const amInfoApi = {
  path: '',
  apiVersion: 'protocol=2.1,resource=1.0',
};
const idmInfoApi = {
  baseURL: getFQDN(process.env.VUE_APP_IDM_URL),
};

/**
  * Gets server info including iPlanetDirectoryPro cookie name
  * @returns {Promise}
  */
export function getAmServerInfo(realm) {
  if (realm && realm !== 'root' && realm !== '/') {
    return generateAmApi({
      path: `realms/root/realms/${realm}`,
      apiVersion: 'protocol=2.1,resource=1.0',
    }).get(
      'serverinfo/*',
      { withCredentials: true },
    );
  }

  return generateAmApi(amInfoApi).get(
    'serverinfo/*',
    { withCredentials: true },
  );
}

export function getIdmServerInfo() {
  return generateIdmApi(idmInfoApi).get(
    'info/version',
  );
}
