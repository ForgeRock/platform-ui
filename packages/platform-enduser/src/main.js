/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
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
import Notifications from '@kyvg/vue3-notification';
import PromisePoly from 'es6-promise';
import { createApp } from 'vue';
import AppAuthHelper from 'appauthhelper-enduser/appAuthHelperCompat';
import SessionCheck from 'oidcsessioncheck-enduser';
import Vue3Sanitize from 'vue-3-sanitize';
import { createPinia } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getAmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import { getIgaUiConfig } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getSessionTimeoutInfo } from '@forgerock/platform-shared/src/api/SessionsApi';
import { overrideTranslations, setLocales } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import parseSub from '@forgerock/platform-shared/src/utils/OIDC';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { baseSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import BootstrapVue from 'bootstrap-vue';
import createRealmPath from '@forgerock/platform-shared/src/utils/createRealmPath';
import { getAllLocales } from '@forgerock/platform-shared/src/utils/locale';
import { getEntitlementList, getApplicationList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getUserPrivileges } from '@forgerock/platform-shared/src/api/PrivilegeApi';
import store from '@/store';
import router from './router';
import i18n from './i18n';
import App from './App';

const pinia = createPinia();

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
          getSchema(userDetails.data.authorization.component, { baseURL: idmContext })]).then(axios.spread((profile, schema) => {
          enduserStore.setProfile(profile.data);
          enduserStore.managedResourceSchema = schema.data;

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

const loadApp = () => {
  const app = createApp(App);
  app.use(BootstrapVue);
  app.use(router);
  app.use(store);
  app.use(i18n);
  app.use(pinia);
  app.use(Notifications);
  app.use(Vue3Sanitize, baseSanitizerConfig);
  router.isReady().then(() => app.mount('#appRoot'));
};
/*
    We will load the application regardless
 */
const startApp = async () => {
  try {
    const idmInstance = axios.create({
      baseURL: idmContext,
      headers: {},
    });

    const [uiConfig, availability] = await Promise.all([
      idmInstance.get('/info/uiconfig'),
      idmInstance.get('info/features?_queryFilter=true'),
    ]);

    const { locales } = getAllLocales(uiConfig.data.configuration);
    setLocales(i18n, locales);
    document.getElementsByTagName('html')[0].setAttribute('lang', i18n.global.locale);

    store.commit('SharedStore/setUiConfig', uiConfig.data);

    if (uiConfig.data.configuration && uiConfig.data.configuration.platformSettings) {
      store.commit('setHostedPagesState', uiConfig.data.configuration.platformSettings.hostedPages === undefined ? true : uiConfig.data.configuration.platformSettings.hostedPages);
    }

    each(availability.data.result, (feature) => {
      if (feature.name === 'workflow') {
        store.commit('setWorkflowState', feature.enabled);
      }
    });

    // get delegated admin permissions
    const { data: privilegesData } = await getUserPrivileges();
    store.commit('setPrivileges', privilegesData);

    // governance lcm
    if (store.state.SharedStore.governanceEnabled) {
      const { data } = await getIgaUiConfig();
      store.commit('setGovLcmSettings', data.lcmSettings);

      // user lcm
      if (data.lcmSettings?.user?.enabled) {
        // check if user can see any users
        if (privilegesData.find((privilege) => privilege.privilegePath === 'managed/alpha_user')) {
          store.commit('setGovLcmUser', { viewUser: true });
        }
      }

      // entitlement lcm
      if (data.lcmSettings?.entitlement?.enabled) {
        // check if user can see any entitlements or create for any app
        const [applications, entitlements] = await Promise.all([
          getApplicationList(null, {
            pageSize: 1,
            queryFilter: 'application.objectTypes.accountAttribute co ""',
          }),
          getEntitlementList(null, { pageSize: 1 }),
        ]);
        store.commit('setGovLcmEntitlement', {
          createEntitlement: applications.data?.totalCount > 0,
          viewEntitlement: entitlements.data?.totalCount > 0,
        });
      }
    }

    overrideTranslations(idmContext, i18n, 'enduser');
  } finally {
    loadApp();
  }
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
    realmPath = `${createRealmPath(realm)}/`;
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

  if (store.state.SharedStore.autoReportsEnabled) {
    resourceServers[store.state.SharedStore.autoAccessReportsUrl] = 'fr:idc:analytics:*';
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
            // if the realm comes in as '/' save it as 'root'
            localStorage.setItem('originalLoginRealm', (realm === '/') ? 'root' : realm);
          }
        },
        cooldownPeriod: 5,
      });

      const triggerSession = () => {
        sessionCheck.triggerSessionCheck();
        getSessionTimeoutInfo().then(({ data }) => {
          store.commit('SharedStore/setMaxIdleExpirationTime', data.maxIdleExpirationTime);
          store.commit('SharedStore/setMaxSessionExpirationTime', data.maxSessionExpirationTime);
        });
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

    // stop the router from watching hash changes so no ugly redirects happen whilst logging out
    router.listening = false;

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
store.commit('SharedStore/setNewMultiselectEnabled', process.env);

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
