/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { generateAmApi, generateIdmApi } from './BaseApi';

const amInfoApi = {
  path: '',
  apiVersion: 'protocol=2.1,resource=1.0',
};
const idmInfoApi = {
  baseURL: process.env.VUE_APP_IDM_URL,
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
