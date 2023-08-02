<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  extend,
  isEmpty,
  isUndefined,
} from 'lodash';
import axios from 'axios';
import createRealmPath from '../../utils/createRealmPath';
import getFQDN from '../../utils/getFQDN';

const idmContext = getFQDN(process.env.VUE_APP_IDM_URL);
const amContext = getFQDN(process.env.VUE_APP_AM_URL);

/**
 * @description Rest API call mixin for global use
 */
export default {
  name: 'RestMixin',
  methods: {
    // Generated an axios ajax request service for consistent use of calls to IDM or AM
    getRequestService(config) {
      let baseURL = idmContext;
      let timeout = 15000;
      let headers = {
        'content-type': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
      };

      if (config) {
        switch (config.context) {
          case 'IDM':
            baseURL = idmContext;
            break;
          case 'AM':
            baseURL = amContext;
            break;
          default:
            config.context = 'IDM';
            baseURL = idmContext;
            break;
        }

        // Use Legacy API
        if (config.context === 'AM') {
          let amBase = `${amContext}/json/`;

          // can force request to a realm by passing in config.realm, else use the store value
          if (config.realm) {
            if (config.realm !== '/' && config.realm !== 'root') {
              const realmPath = createRealmPath(config.realm);
              amBase = `${amContext}/json/realms/root/${realmPath}`;
            }
          } else if (this.$store) {
            if (this.$store.state.realm && this.$store.state.realm !== '/' && this.$store.state.realm !== 'root') {
              const realmPath = createRealmPath(this.$store.state.realm);
              amBase = `${amContext}/json/realms/root/${realmPath}`;
            }
          }

          const requestDetails = {
            baseURL: amBase,
            headers: {
              'Content-type': 'application/json',
              'accept-api-version': config.apiVersion || 'protocol=2.1,resource=1.0',
            },
          };
          return axios.create(requestDetails);
        }

        if (config.baseURL) {
          baseURL = config.baseURL;
        }

        if (config.timeout) {
          timeout = config.timeout;
        }

        if (config.headers && !isEmpty(config.headers)) {
          headers = config.headers;
        }
      }

      if (this.$store) {
        headers = extend(headers, this.$store.state.authHeaders || {});
      }
      const instance = axios.create({
        baseURL,
        timeout,
        headers,
      });

      instance.interceptors.response.use((response) => response, (error) => {
        if (error.response && error.response.data && error.response.data.code === 401) {
          this.$router.push({ name: 'Login' });

          return Promise.reject(error);
        } if (isUndefined(error.response)) {
          // In the case of critical error
          return Promise.reject(new Error(error.message));
        }
        return Promise.reject(error);
      });

      return instance;
    },
    // Headers used for oauth requests and selfservice
    getAnonymousHeaders() {
      return this.$store.state.authHeaders || {};
    },
  },
};
</script>
