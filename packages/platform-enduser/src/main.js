/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'whatwg-fetch';
import 'core-js/stable';

import {
  each,
  has,
  isNull,
  debounce,
} from 'lodash';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm.min';
import Notifications from 'vue-notification';
import PromisePoly from 'es6-promise';
import {
  ValidationObserver,
  ValidationProvider,
  extend,
  localize,
} from 'vee-validate';
import en from 'vee-validate/dist/locale/en.json';
import * as rules from 'vee-validate/dist/rules';
import Vue from 'vue';
import AppAuthHelper from 'appauthhelper/appAuthHelperCompat';
import SessionCheck from 'oidcsessioncheck';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import store from '@/store';
import router from './router';
import i18n from './i18n';
import App from './App';

// Turn off production warning messages
Vue.config.productionTip = false;

PromisePoly.polyfill();

// Ready translated locale messages
// IDM Context default
const idmContext = process.env.VUE_APP_IDM_URL;

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
  document.body.className = '';

  if (has(to, 'meta.bodyClass')) {
    document.body.className = (document.body.className + to.meta.bodyClass).trim();
  }

  if (has(to, 'meta.authenticate')) {
    if (isNull(store.state.UserStore.userId)) {
      const authInstance = axios.create({
        baseURL: idmContext,
        timeout: 5000,
        headers: store.state.authHeaders,
      });

      authInstance.post('/authentication?_action=login').then((userDetails) => {
        if (userDetails.data.authorization.id === 'openidm-admin') {
          // amadmin/openidm-admin don't need access to end user,
          // so send them back to the admin to avoid problems.
          window.location.href = process.env.VUE_APP_ADMIN_URL;
        }
        store.commit('UserStore/setUserId', userDetails.data.authorization.id);
        store.commit('UserStore/setManagedResource', userDetails.data.authorization.component);
        store.commit('UserStore/setRoles', userDetails.data.authorization.roles);
        axios.all([
          authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
          authInstance.post('privilege?_action=listPrivileges'),
          getSchema(userDetails.data.authorization.component, { baseURL: idmContext })]).then(axios.spread((profile, privilege, schema) => {
          store.commit('UserStore/setProfile', profile.data);
          store.commit('UserStore/setSchema', schema.data);
          store.commit('UserStore/setAccess', privilege.data);

          next();
        }));
      },
      () => {
        // Recheck class in case of double login load using from location
        document.body.className = '';

        if (has(from, 'meta.bodyClass')) {
          document.body.className = (document.body.className + from.meta.bodyClass).trim();
        }

        next({ name: 'Login' });
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

// Globally load bootstrap vue components for use
Vue.use(BootstrapVue);

// Register validation components for global use
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});

// How to add an extra validation rule
// Date rule added for workflow
extend('date_format', {
  validate(value) {
    return value.match(/^\d{2}[.//]\d{2}[.//]\d{4}$/);
  },
  message: () => 'Invalid date format',
});

// For now use vee validate loclization, need to eventually convert to vue i18n
localize('en', en);

/*
  Basic Notification Example:
  this.$notify({
      group: 'IDMMessages', // Currently the only group
      type: 'success', // Available types success, failure, info, warning
      title: this.$t('common.messages.saveSuccess'), //Translated string
      text: this.$t('pages.resources.mappingSave') // Translated string (can also be html)
  });
 */
Vue.use(Notifications);

// required to use PascalCase `RouterView` and `RouterLink` instead of `router-view` and `router-link`
const RouterView = Vue.component('router-view');
const RouterLink = Vue.component('router-link');

Vue.component('RouterView', RouterView);
Vue.component('RouterLink', RouterLink);

const loadApp = () => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    i18n,
    template: '<App/>',
    components: { App },
  });
};
/*
    We will load the application regardless
 */
const startApp = () => {
  const idmInstance = axios.create({
    baseURL: idmContext,
    timeout: 5000,
    headers: {},
  });

  axios.all([
    idmInstance.get('/info/uiconfig'),
    idmInstance.get('info/features?_queryFilter=true')]).then(axios.spread((uiConfig, availability) => {
    if (uiConfig.data.configuration.lang) {
      i18n.locale = uiConfig.data.configuration.lang;
    }
    store.commit('SharedStore/setUiConfig', uiConfig.data);

    if (uiConfig.data.configuration && uiConfig.data.configuration.platformSettings) {
      store.commit('setHostedPagesState', uiConfig.data.configuration.platformSettings.hostedPages === undefined ? true : uiConfig.data.configuration.platformSettings.hostedPages);
    }

    each(availability.data.result, (feature) => {
      if (feature.name === 'workflow') {
        store.commit('setWorkflowState', feature.enabled);
      }
    });

    return loadApp();
  }))
    .catch(() => loadApp());
};

const addAppAuth = () => {
  const AM_URL = store.state.SharedStore.amBaseURL;
  const urlParams = new URLSearchParams(window.location.search);
  const originalLoginRealm = sessionStorage.getItem('originalLoginRealm');
  const pageLoadUrlRealm = urlParams.get('realm');
  let realm = pageLoadUrlRealm || store.state.realm;

  /**
   * If there is an originalLoginRealm here it's because the realm was changed and the page was refreshed or
   * the user is already logged in to another realm. In this case we want to set the realm used to build the
   * realmPath below to the originally logged in realm. If we don't do this all the appAuthClient config settings
   * will be different from when the page was orignially logged in which causes REST calls to fail and breaks
   * logout because it tries to logout from the wrong realm.
  */
  if (originalLoginRealm) {
    realm = originalLoginRealm;
    sessionStorage.removeItem('originalLoginRealm');
  }

  let clickSession;
  let keypressSession;
  let pageFocus;
  let realmPath = '';
  if (realm !== '/' && realm !== 'root') {
    store.commit('setRealm', realm);

    if (realm.startsWith('/')) {
      realmPath = `realms/root/realms/${realm.substring(1)}/`;
    } else {
      realmPath = `realms/root/realms/${realm}/`;
    }
  }

  const commonSettings = {
    clientId: store.state.idmClientID,
    authorizationEndpoint: `${AM_URL}/oauth2/${realmPath}authorize`,
  };

  AppAuthHelper.init({
    clientId: commonSettings.clientId,
    authorizationEndpoint: commonSettings.authorizationEndpoint,
    tokenEndpoint: `${AM_URL}/oauth2/${realmPath}access_token`,
    revocationEndpoint: `${AM_URL}/oauth2/${realmPath}token/revoke`,
    endSessionEndpoint: `${AM_URL}/oauth2/${realmPath}connect/endSession`,
    identityProxyPreference: 'XHR',
    resourceServers: {
      [store.state.SharedStore.idmBaseURL]: 'fr:idm:*',
    },
    tokensAvailableHandler(claims) {
      store.commit('UserStore/setUserSearchAttribute', claims.sub);

      const sessionCheck = new SessionCheck({
        clientId: commonSettings.clientId,
        opUrl: commonSettings.authorizationEndpoint,
        subject: claims.sub,
        invalidSessionHandler() {
          window.logout(false);
        },
        sessionClaimsHandler(newClaims) {
          if (claims.auth_time !== newClaims.auth_time || claims.realm !== newClaims.realm) {
            this.invalidSessionHandler();
          }
          /**
           * Check that the originalLoginRealm session variable is set.
           * If not set it so we know what realm to use for logout.
           */
          if (!sessionStorage.getItem('originalLoginRealm')) {
            sessionStorage.setItem('originalLoginRealm', realm);
          }
        },
        cooldownPeriod: 5,
      });

      const triggerSession = () => {
        sessionCheck.triggerSessionCheck();
      };
      // check the validity of the session immediately
      triggerSession();

      // check with every route change thru router
      router.beforeEach((to, from, next) => {
        triggerSession();
        next();
      });

      // check with every captured event
      document.removeEventListener('click', clickSession);
      clickSession = document.addEventListener('click', debounce(triggerSession, 100));
      document.removeEventListener('keypress', keypressSession);
      keypressSession = document.addEventListener('keypress', debounce(triggerSession, 100));
      document.removeEventListener('focusin', pageFocus);
      pageFocus = document.addEventListener('focusin', debounce(triggerSession, 100));

      startApp();
    },
  }).then(
    // In this application, we want tokens immediately, before any user interaction is attempted
    () => AppAuthHelper.getTokens(),
  );

  // trigger logout from anywhere in the SPA by calling this global function
  window.logout = (clearHash = true) => {
    const loginRealm = sessionStorage.getItem('originalLoginRealm');
    /**
     * If there is an originalLoginRealm and that realm is different from the current realm
     * we need to set store.state.realm to it's original state so we can log out properly.
     */
    if (loginRealm && store.state.realm !== loginRealm) {
      store.commit('setRealm', loginRealm);
      sessionStorage.removeItem('originalLoginRealm');
    }
    // clear hash so user is not directed to previous hash on subsequent logins
    if (clearHash) window.location.hash = '';

    AppAuthHelper.logout().then(() => window.location.reload());
  };
};

store.commit('setEnvironment', process.env);
store.commit('SharedStore/setBaseURLs', process.env);
addAppAuth();
