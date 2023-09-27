/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'whatwg-fetch';
import 'core-js/stable';
import {
  each,
  has,
  debounce,
} from 'lodash';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm.min';
import Notifications from 'vue-notification';
import PromisePoly from 'es6-promise';
import {
  setInteractionMode,
  ValidationObserver,
  ValidationProvider,
} from 'vee-validate';
import Vue from 'vue';
import AppAuthHelper from 'appauthhelper-enduser/appAuthHelperCompat';
import SessionCheck from 'oidcsessioncheck-enduser';
import VueSanitize from 'vue-sanitize';
import { createPinia, PiniaVuePlugin } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getAmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import overrideTranslations, { setLocales } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import parseSub from '@forgerock/platform-shared/src/utils/OIDC';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { baseSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import store from '@/store';
import router from './router';
import i18n from './i18n';
import App from './App';

// Turn off production warning messages
Vue.config.productionTip = false;

// Register validation components for global use
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

Vue.use(VueSanitize, baseSanitizerConfig);

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

setInteractionMode('passive');

PromisePoly.polyfill();

// Ready translated locale messages
// IDM Context default
const idmContext = getFQDN(process.env.VUE_APP_IDM_URL);

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
  const userStore = useUserStore(pinia);
  const enduserStore = useEnduserStore(pinia);
  document.body.className = '';

  if (has(to, 'meta.bodyClass')) {
    document.body.className = (document.body.className + to.meta.bodyClass).trim();
  }

  if (has(to, 'meta.authenticate')) {
    // Retrieve user data to check if the user can access this resource and for future role checks
    if (userStore.userId === '') {
      const authInstance = axios.create({
        baseURL: idmContext,
        headers: store.state.authHeaders,
      });

      authInstance.post('/authentication?_action=login').then((userDetails) => {
        if (userDetails.data.authorization.id === 'openidm-admin') {
          // amadmin/openidm-admin don't need access to end user,
          // so send them back to the admin to avoid problems.
          window.location.href = process.env.VUE_APP_ADMIN_URL;
        }
        userStore.userId = userDetails.data.authorization.id;
        userStore.managedResource = userDetails.data.authorization.component;
        userStore.idmRoles = userDetails.data.authorization.roles;

        axios.all([
          authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
          authInstance.post('privilege?_action=listPrivileges'),
          getSchema(userDetails.data.authorization.component, { baseURL: idmContext })]).then(axios.spread((profile, privilege, schema) => {
          enduserStore.setProfile(profile.data);
          enduserStore.managedResourceSchema = schema.data;
          enduserStore.access = privilege.data;

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
    pinia,
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
    headers: {},
  });

  axios.all([
    idmInstance.get('/info/uiconfig'),
    idmInstance.get('info/features?_queryFilter=true')]).then(axios.spread((uiConfig, availability) => {
    if (uiConfig.data.configuration.lang) {
      setLocales(i18n, uiConfig.data.configuration.lang, uiConfig.data.configuration.defaultLocale || 'en');
      document.getElementsByTagName('html')[0].setAttribute('lang', uiConfig.data.configuration.lang);
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
  }))
    .then(() => overrideTranslations(idmContext, i18n, 'enduser'))
    .finally(() => loadApp());
};

const addAppAuth = (realm) => {
  const AM_URL = store.state.SharedStore.amBaseURL;
  let postLogoutUrlClaim;

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

  const resourceServers = {
    [store.state.SharedStore.idmBaseURL]: 'fr:idm:*',
  };

  if (store.state.SharedStore.governanceEnabled) {
    resourceServers[store.state.SharedStore.igaApiUrl] = 'fr:iga:*';
  }

  if (store.state.SharedStore.autoAccessEnabled) {
    resourceServers[store.state.SharedStore.autoAccessJasUrl] = 'fr:autoaccess:*';
    resourceServers[store.state.SharedStore.autoAccessApiUrl] = 'fr:autoaccess:*';
  }

  AppAuthHelper.init({
    clientId: commonSettings.clientId,
    authorizationEndpoint: commonSettings.authorizationEndpoint,
    tokenEndpoint: `${AM_URL}/oauth2/${realmPath}access_token`,
    revocationEndpoint: `${AM_URL}/oauth2/${realmPath}token/revoke`,
    endSessionEndpoint: `${AM_URL}/oauth2/${realmPath}connect/endSession`,
    identityProxyPreference: 'XHR',
    resourceServers,
    tokensAvailableHandler(claims) {
      const sub = parseSub(claims);
      const userStore = useUserStore(pinia);
      userStore.userSearchAttribute = sub;
      // if there is a post_logout_url claim set postLogoutUrlClaim here for use in window.logout()
      postLogoutUrlClaim = claims.post_logout_url;
      const sessionCheck = new SessionCheck({
        clientId: commonSettings.clientId,
        opUrl: commonSettings.authorizationEndpoint,
        subject: claims.sub,
        invalidSessionHandler(reason) {
          /**
          * If the reason for the invalid session is a subject_mismatch we always want to
          * reload the page after logout whether there is a post_logout_url claim or not.
          */
          window.logout(false, reason !== 'subject_mismatch');
        },
        sessionClaimsHandler(newClaims) {
          if (claims.auth_time !== newClaims.auth_time || claims.realm !== newClaims.realm) {
            window.logout(false);
          }
          /**
           * Check that the originalLoginRealm session variable is set.
           * If not set it so we know what realm to use for logout.
           */
          if (!localStorage.getItem('originalLoginRealm')) {
            localStorage.setItem('originalLoginRealm', realm);
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
  window.logout = (clearHash = true, invalidSession = false) => {
    const loginRealm = localStorage.getItem('originalLoginRealm');
    /**
     * If there is an originalLoginRealm and that realm is different from the current realm
     * we need to set store.state.realm to it's original state so we can log out properly.
     */
    if (loginRealm) {
      if (store.state.realm !== loginRealm) {
        store.commit('setRealm', loginRealm);
      }
      localStorage.removeItem('originalLoginRealm');
    }
    // clear hash so user is not directed to previous hash on subsequent logins
    if (clearHash) window.location.hash = '';

    AppAuthHelper.logout().then(() => {
      /**
       * If there is a postLogoutUrlClaim and the logout button was clicked (clearHash === true)
       * or this is an invalid session (invalidSession === true) redirect to the sanitized postLogoutUrlClaim.
       * Otherwise reload the page.
       */
      if (postLogoutUrlClaim && sanitizeUrl(postLogoutUrlClaim) !== 'about:blank' && (clearHash || invalidSession)) {
        window.location.href = postLogoutUrlClaim;
      } else {
        window.location.reload();
      }
    });
  };
};

store.commit('setEnvironment', process.env);
store.commit('SharedStore/setBaseURLs', process.env);
store.commit('SharedStore/setCurrentPackage', 'enduser');
store.commit('SharedStore/setFeatureFlags', process.env);

async function getRealm() {
  const urlParams = new URLSearchParams(window.location.search);
  const originalLoginRealm = localStorage.getItem('originalLoginRealm');
  const pageLoadUrlRealm = urlParams.get('realm');
  let realm = pageLoadUrlRealm;

  /**
   * If there is an originalLoginRealm here it's because the realm was changed and the page was refreshed or
   * the user is already logged in to another realm. In this case we want to set the realm used to build the
   * realmPath below to the originally logged in realm. If we don't do this all the appAuthClient config settings
   * will be different from when the page was orignially logged in which causes REST calls to fail and breaks
   * logout because it tries to logout from the wrong realm.
  */
  if (originalLoginRealm) {
    realm = originalLoginRealm;
    store.commit('setRealm', realm);
    localStorage.removeItem('originalLoginRealm');
  } else if (!realm) {
    // If no realm defined in the url params and no originalLoginRealm defined get it from am server info
    try {
      const res = await getAmServerInfo();
      realm = res.data?.realm === '/' ? 'root' : res.data.realm;
    } catch (e) {
      realm = 'root';
    }
  }

  return realm;
}

getRealm().then((realm) => {
  addAppAuth(realm);
});
