/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
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

  const request = axios.create(requestDetails);

  request.interceptors.response.use(null, (error) => {
    // The journeys page is accessible to users with realm-admin priviledges,
    // however as is makes a call to openidm in order to access the Identities
    // Objects this causes a 403 if the user doesn't also have openidm-admin
    // priviledges. This is a temporary check to stop the redirect to forbidden
    // in that scenario. This check should be removed when a workaround has been found.
    const resUrl = new URL(error.response.config.url);
    if (resUrl.pathname !== '/openidm/config/managed' && window.location.hash !== '#/journeys' && window.location.pathname !== '/enduser/') {
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
  const requestDetails = {
    baseURL: `${store.state.amBaseURL}/json/${resource.path}`,
    timeout: 5000,
    headers: {
      'Content-type': 'application/json',
      'accept-api-version': resource.apiVersion,
    },
    ...requestOverride,
  };

  const request = axios.create(requestDetails);

  request.interceptors.response.use(null, (error) => {
    if (error.response.status === 403) {
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
    baseURL: store.state.fraasLoggingKeyURL,
    timeout: 5000,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}
