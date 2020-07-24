<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  fromPairs, isNull, isEmpty, map,
} from 'lodash';
import store from '../../store/index';
import NotificationMixin from '../NotificationMixin';

export function getIdFromSession() {
  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=1.0,resource=2.0',
  }).post('/users?_action=idFromSession', {}, { withCredentials: true });
}

export function getUserInfo(session) {
  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=1.0,resource=2.0',
  }).get(`/users/${session.data.id}`, { withCredentials: true });
}

export function getConfigurationInfo() {
  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=1.0,resource=1.1',
  }).get('/serverinfo/*', { withCredentials: true, suppressEvents: true });
}
/**
 * @param {string} url - current url after successful login
 * If the url contains a 'goto' query (i.e. ?goto=www.test.com)
 * then validate the goto url.
 *
 * If it has been registered in AM, redirect the user to the url
 * Else redirect to the default login url.
 */
export function verifyGotoUrlAndRedirect(url, isAdmin) {
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const gotoUrl = JSON.stringify({ goto: urlParams.get('goto') });
  const realm = urlParams.get('realm');

  urlParams.delete('goto');
  urlParams.delete('gotoOnFail');
  urlParams.delete('realm');

  const ampersand = urlParams.toString.length ? '&' : '';
  const paramsToString = urlParams.toString().length
    ? `?${urlParams.toString()}`
    : '';
  const isDefaultPath = (path) => path === '/am/console';
  const redirectUserBasedOnType = () => {
    if (isAdmin) {
      // admin user
      return `${process.env.VUE_APP_ADMIN_URL}?realm=${realm}${ampersand}${paramsToString}`;
    }
    // end user
    return `${process.env.VUE_APP_ENDUSER_URL}?realm=${realm}${ampersand}${paramsToString}`;
  };

  return this.getRequestService({
    context: 'AM',
    apiVersion: 'protocol=2.1,resource=3.0',
  })
    .post('/users?_action=validateGoto', gotoUrl, { withCredentials: true })
    .then((res) => {
      if (
        !isDefaultPath(res.data.successURL)
        && res.data.successURL !== 'undefined'
      ) {
        if (res.data.successURL.startsWith('/')) {
          // url path
          if (!res.data.successURL.endsWith('#realms')) {
            const [path, hash] = res.data.successURL.split('#');
            return `${path}?${urlParams.toString()}#${hash}`;
          }
        }
        // external url or am/ui-admin
        return res.data.successURL;
      }
      if (isDefaultPath(res.data.successURL) && !isDefaultPath(url)) {
        return url;
      }
      return redirectUserBasedOnType();
    })
    .catch(() => redirectUserBasedOnType());
}

/**
 * Returns the query string from the URI
 * @returns {string} Unescaped query string or empty string if no query string was found
 */
export function getCurrentQueryString() {
  const queryString = window.location.search;

  return queryString.substr(1, queryString.length);
}

/**
 * @description Creates an object of key value pairs from the passed in query string
 * @param {string} paramString A string containing a query string
 * @returns {object} An Object of key value pairs
 */
export function parseParameters(paramString) {
  const object = isEmpty(paramString)
    ? {}
    : fromPairs(map(paramString.split('&'), (pair) => pair.split('=')));
  return object;
}
export default {
  name: 'LoginMixin',
  mixins: [NotificationMixin],
  methods: {
    logoutUser() {
      window.logout();
    },
    // One location for checking and redirecting a completed login for a user
    completeLogin() {
      if (!isNull(store.state.ApplicationStore.loginRedirect)) {
        this.$router.push(store.state.ApplicationStore.loginRedirect);
        store.dispatch('ApplicationStore/clearLoginRedirect');
      } else {
        this.$router.push('/');
      }
    },
    getIdFromSession,
    getUserInfo,
    getConfigurationInfo,
    verifyGotoUrlAndRedirect,
    getCurrentQueryString,
    parseParameters,
  },
};
</script>
