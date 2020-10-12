<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  extend,
  isEmpty,
  isUndefined,
} from 'lodash';
import axios from 'axios';

const idmContext = process.env.VUE_APP_IDM_URL;
const amContext = process.env.VUE_APP_AM_URL;
// deconstruct the amContext to get the correct pathname to be used in dnsContext
const amContextURL = new URL(amContext);
// 'window.location.origin' comes from where the ui is running. The assumption here is
// there is a connection between where the ui is running and where openam is running.
const dnsContext = `${window.location.origin}${amContextURL.pathname}`;
/**
 * @description Rest API call mixin for global use
 */
export default {
  name: 'RestMixin',
  methods: {
    // Generated an axios ajax request service for consistent use of calls to IDM or AM
    getRequestService(config) {
      let baseURL = idmContext;
      let timeout = 5000;
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
          // if hostnames differ the assumption is this is a realm dns alias
          const isDNS = amContextURL.hostname !== window.location.hostname;
          let amBase = isDNS ? `${dnsContext}/json/` : `${amContext}/json/`;

          if (this.$store) {
            if (this.$store.state.realm && this.$store.state.realm !== '/' && this.$store.state.realm !== 'root') {
              amBase = isDNS ? `${dnsContext}/json/realms/root/realms/${this.$store.state.realm}` : `${amContext}/json/realms/root/realms/${this.$store.state.realm}`;
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
          // eslint-disable-next-line prefer-destructuring
          baseURL = config.baseURL;
        }

        if (config.timeout) {
          // eslint-disable-next-line prefer-destructuring
          timeout = config.timeout;
        }

        if (config.headers && !isEmpty(config.headers)) {
          // eslint-disable-next-line prefer-destructuring
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
