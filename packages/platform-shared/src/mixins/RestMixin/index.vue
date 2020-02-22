<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

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
import store from '../../store/index';

const idmContext = process.env.VUE_APP_IDM_URL;

/**
 * @description Rest API call mixin for global use
 */
export default {
  name: 'RestMixin',
  methods: {
    // Generated an axios ajax request service for consistent use of calls to IDM
    getRequestService(config) {
      let baseURL = idmContext;
      let timeout = 5000;
      let headers = {
        'content-type': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
      };

      if (config) {
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

      headers = extend(headers, store.state.ApplicationStore.authHeaders || {});
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
      const headers = store.state.ApplicationStore.authHeaders || {};
      return headers;
    },
  },
};
</script>
