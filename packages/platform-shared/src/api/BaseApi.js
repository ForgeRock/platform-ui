/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import store from '@/store';
import getFQDN from '../utils/getFQDN';

/**
  * Generates an IDM Axios API instance
  * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
  * on extra information or override default properties https://github.com/axios/axios#request-config
  *
  * @returns {AxiosInstance}
  */
export function generateIdmApi(requestOverride = {}, routeToForbidden = true) {
  const requestDetails = {
    baseURL: store.state.SharedStore.idmBaseURL,
    headers: {},
    ...requestOverride,
  };

  // Check if web storage exists before trying to use it - see IAM-1873
  if (store.state.SharedStore.webStorageAvailable && sessionStorage.getItem('accessToken')) {
    requestDetails.headers.Authorization = `Bearer ${sessionStorage.getItem('accessToken')}`;
  }

  const request = axios.create(requestDetails);

  request.interceptors.response.use(null, (error) => {
    // The journeys page is accessible to users with realm-admin priviledges,
    // however as it makes a call to openidm in order to access the Identities
    // Objects, this causes a 403 if the user doesn't also have openidm-admin
    // priviledges. This is a temporary check to stop the redirect to forbidden
    // in that scenario. This check should be removed when a workaround has been found.
    const { pathname } = new URL(getFQDN(error.response?.config.url));
    const { currentPackage } = store.state.SharedStore;
    if (pathname !== '/openidm/config/managed' && window.location.hash !== '#/journeys' && currentPackage !== 'enduser') {
      if (routeToForbidden && error.response?.status === 403) {
        window.location.hash = '#/forbidden';
        window.location.replace(window.location);
      }
      return Promise.reject(error);
    }

    // Used to verify IDM user privileges on the enduser package when the
    // /enduser/managed/{realm}_user call is rejected with a 403 error.
    if (currentPackage === 'enduser'
      && pathname.includes(`/enduser/managed/${store.state.realm}_user/`)
      && error.response?.status === 403) {
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
    'content-type': 'application/json',
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
 * Generates a FRaaS Log API key API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateFraasLogApiKeyApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.fraasLoggingKeyURL,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

export function generateHelixApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.helixEnvironmentUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates an Iga API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateIgaApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.igaApiUrl,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates a CDN API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateCdnApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: 'https://cdn.forgerock.com/platform/app-templates',
    headers: { 'Content-Encoding': 'gzip' },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates an IGA Workflow API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateIgaOrchestrationApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.igaOrchestrationApiUrl,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates a FRaaS Environment API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateFraasEnvironmentApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.fraasEnvironmentUrl,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}
/**
 * Generates a FRaaS monitoring API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateFraasMonitoringApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.fraasMonitoringURL,
    headers: {},
    ...requestOverride,
  };

  const request = axios.create(requestDetails);

  request.interceptors.response.use(null, (error) => {
    if (error?.response?.status === 401) {
      window.logout();
    }
    return Promise.reject(error);
  });

  return request;
}

/**
 * Generates an Analytics API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateAnalyticsApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.analyticsURL,
    headers: {},
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates an Analytics API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateAutoAccessApi(requestOverride = {}) {
  const tenantId = process.env.VUE_APP_AUTO_ACCESS_TENANT_ID;
  const requestDetails = {
    baseURL: store.state.SharedStore.autoAccessApiUrl,
    headers: {
      'X-TENANT-ID': tenantId,
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates an Analytics Reports API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateAutoAccessReports(requestOverride = {}) {
  const tenantId = process.env.VUE_APP_AUTO_ACCESS_TENANT_ID;
  const requestDetails = {
    baseURL: store.state.SharedStore.autoAccessReportsUrl,
    headers: {
      'X-TENANT-ID': tenantId,
      'Accept-API-Version': 'resource=1.0',
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates an Analytics Jas Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateAutoAccessJas(requestOverride = {}) {
  const tenantId = process.env.VUE_APP_AUTO_ACCESS_TENANT_ID;
  const requestDetails = {
    baseURL: store.state.SharedStore.autoAccessJasUrl,
    headers: {
      'X-TENANT-ID': tenantId,
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates a FRaaS promotion API Axios instance
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generateFraasPromotionApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: store.state.SharedStore.fraasPromotionUrl,
    headers: {
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}

/**
 * Generates a PingFederate API Axios instance
 * Version will not change, safe to hardcode to 1
 * We will only ever make calls against the Admin APIs, safe to hardcode the path
 * @param {object} requestOverride Takes an object of AXIOS parameters that can be used to either add
 * on extra information or override default properties https://github.com/axios/axios#request-config
 *
 * @returns {AxiosInstance}
 */
export function generatePingFederateApi(requestOverride = {}) {
  const requestDetails = {
    baseURL: `${store.state.SharedStore.pingFederateUrl}/pf-admin-api/v1`,
    headers: {
      accept: 'application/json',
      'X-XSRF-Header': 'PingFederate',
    },
    ...requestOverride,
  };

  return axios.create(requestDetails);
}
