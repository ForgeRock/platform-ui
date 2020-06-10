/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import store from '@forgerock/platform-shared/src/store';

/**
  * Generates an IDM Axios API instance
  * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
  * on extra information or override default properties https://github.com/axios/axios#request-config
  *
  * @returns {AxiosInstance}
  */
export function generateIdmApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.idmBaseURL,
    timeout: 5000,
    headers: {},
    ...requestOverride,
  };

  if (sessionStorage.getItem('accessToken')) {
    requestDetails.headers.Authorization = `Bearer ${sessionStorage.getItem('accessToken')}`;
  }

  return axios.create(requestDetails);
}
/**
  * Generates an AM Axios API instance
  * @param {object} resource Takes an object takes a resource object. example:
  * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either
  * add on extra information or override default properties https://github.com/axios/axios#request-config
  *
  * @returns {AxiosInstance}
  */
export function generateAmApi(resource, requestOverride = {}) {
  const requestDetails = {
    baseURL: `${store.state.amBaseURL}/json/${resource.path}`,
    timeout: 5000,
    headers: {
      'Content-type': 'application/json',
      'accept-api-version': resource.apiVersion,
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}
