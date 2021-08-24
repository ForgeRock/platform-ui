/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import store from '../store';
import getFQDN from '../utils/getFQDN';

/**
  * Generates an IDM Axios API instance
  * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
  * on extra information or override default properties https://github.com/axios/axios#request-config
  *
  * @returns {AxiosInstance}
  */
export function generateIdmApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.idmBaseURL,
    timeout: 5000,
    headers: {},
    ...requestOverride,
  };

  if (sessionStorage.getItem('accessToken')) {
    requestDetails.headers.Authorization = `Bearer ${sessionStorage.getItem('accessToken')}`;
  }

  const request = axios.create(requestDetails);

  request.interceptors.response.use(null, (error) => {
    // The journeys page is accessible to users with realm-admin priviledges,
    // however as is makes a call to openidm in order to access the Identities
    // Objects this causes a 403 if the user doesn't also have openidm-admin
    // priviledges. This is a temporary check to stop the redirect to forbidden
    // in that scenario. This check should be removed when a workaround has been found.
    const resUrl = new URL(getFQDN(error.response.config.url));
    if (resUrl.pathname !== '/openidm/config/managed' && window.location.hash !== '#/journeys' && store.state.SharedStore.currentPackage !== 'enduser') {
      if (error.response.status === 403) {
        window.location.hash = '#/forbidden';
        window.location.replace(window.location);
      }
      return Promise.reject(error);
    }
    return false;
  });

  return request;
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
  let headers = {
    'Content-type': 'application/json',
    'accept-api-version': resource.apiVersion,
  };
  if (requestOverride.headers) {
    headers = {
      ...headers,
      ...requestOverride.headers,
    };
  }

  const requestDetails = {
    baseURL: `${store.state.SharedStore.amBaseURL}/json/${resource.path}`,
    timeout: 5000,
    ...requestOverride,
    headers,
  };

  const request = axios.create(requestDetails);

  request.interceptors.response.use(null, (error) => {
    if (error?.response?.status === 403) {
      window.location.hash = '#/forbidden';
      window.location.replace(window.location);
    }
    return Promise.reject(error);
  });

  return request;
}
/**
 * Generates an FRaaS Logging Axios API instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateFraasLoggingApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.fraasLoggingKeyURL,
    timeout: 5000,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}
