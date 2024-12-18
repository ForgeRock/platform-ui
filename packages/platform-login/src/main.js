/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'whatwg-fetch';
import 'core-js/stable';
import '@forgerock/platform-shared/src/utils/domCollectionsForEach';
import 'regenerator-runtime/runtime';

import { createApp } from 'vue';
import Notifications from '@kyvg/vue3-notification';
import PromisePoly from 'es6-promise';
import {
  Config,
  SessionManager,
} from '@forgerock/javascript-sdk';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import isWebStorageAvailable from '@forgerock/platform-shared/src/utils/webStorageTest';
import { overrideTranslations, setLocales } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import Vue3Sanitize from 'vue-3-sanitize';
import uuid from 'uuid/v4';
import { baseSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import { createPinia } from 'pinia';
import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { getUiConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { getAmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import { getAllLocales } from '@forgerock/platform-shared/src/utils/locale';
import { JAVASCRIPT_SDK_TIMEOUT } from '@forgerock/platform-shared/src/utils/constants';
import store from '@/store';
import i18n from './i18n';
import router from './router';
import App from './App';
import VueReCaptcha from './plugins/vueReCaptcha';

PromisePoly.polyfill();

const pinia = createPinia();

store.commit('SharedStore/setEnvironment', process.env);
store.commit('SharedStore/setBaseURLs', process.env);
store.commit('SharedStore/setWebStorageAvailable', isWebStorageAvailable());
store.commit('SharedStore/setNewMultiselectEnabled', process.env);

/**
 * Gets the root part of the transactionId to use in auth requests for this session.
 * This is taken from the transactionId query parameter (if one is present), otherwise a uuid is returned.
 * @returns {String} the root part of the transactionId
 */
function getRootTransactionId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('transactionId') ? urlParams.get('transactionId') : uuid();
}

const rootTransactionId = getRootTransactionId();
let authRequestNumber = 0;

// set the serverConfig with a timeout of 60 seconds this is required because the default timeout is 5 seconds and some trees can take longer to load
// @see IAM-6840
Config.set({
  serverConfig: {
    baseUrl: getFQDN(`${process.env.VUE_APP_AM_URL}/`),
    timeout: JAVASCRIPT_SDK_TIMEOUT,
  },
  middleware: [
    (req, action, next) => {
      // increment the request number
      authRequestNumber += 1;

      // Set a transaction ID that should identify this request of this auth session of this tree in logs
      req.init.headers.append('x-forgerock-transactionid', `${rootTransactionId}-request-${authRequestNumber}`);
      next();
    },
  ],
});

router.beforeEach((to, _from, next) => {
  if (to.name === 'logout') {
    const urlParams = new URLSearchParams(window.location.search);
    const goto = urlParams.get('goto') || '';
    const logout = (realm, validatedGoto) => {
      const logoutParams = { realmPath: realm || localStorage.getItem('originalLoginRealm') || 'root' };
      SessionManager.logout(logoutParams).then(() => {
        if (validatedGoto) {
          window.location.href = validatedGoto;
        } else {
          next('/');
        }
      });
    };
    const routeUrlParams = new URLSearchParams(to.query);
    let realm = routeUrlParams.get('realm');
    if (!realm && urlParams.get('realm') !== 'undefined') {
      realm = urlParams.get('realm');
    }

    if (goto) {
      // validate the goto param before logging out
      const validateGotoAndLogout = () => {
        let realmPath = realm;
        if (!realmPath.startsWith('/')) {
          realmPath = `/${realmPath}`;
        }
        generateAmApi({
          apiVersion: 'protocol=2.1,resource=3.0',
          path: `realms/root/realms${realmPath}`,
        }).post('users?_action=validateGoto', { goto: decodeURIComponent(goto) }, { withCredentials: true }).then((res) => {
          logout(realm, res.data.successURL);
        }).catch(() => {
          logout(realm);
        });
      };

      if (!realm) {
        // If no realm defined get it from am server info
        getAmServerInfo().then((res) => {
          realm = res.data?.realm === '/' ? 'root' : res.data.realm;
          validateGotoAndLogout();
        }).catch(() => {
          realm = 'root';
          validateGotoAndLogout();
        });
      } else {
        validateGotoAndLogout();
      }
    } else {
      logout(realm);
    }
  } else {
    next();
  }
});

const loadApp = () => {
  const app = createApp(App);
  app.use(Notifications);
  app.use(Vue3Sanitize, baseSanitizerConfig);
  app.use(VueReCaptcha);
  app.use(router);
  app.use(i18n);
  app.use(store);
  app.use(pinia);
  router.isReady().then(() => app.mount('#appRoot'));
};

/**
 * Attempts to get browser language from IDM
 * and translation overrides from IDM config
 * We will load the application regardless
 */
const startApp = () => {
  getUiConfig().then(({ data: { configuration: uiConfig } }) => {
    // Get & set locales
    const { locales, localeQueryString } = getAllLocales(uiConfig, true);
    setLocales(i18n, locales);
    document.getElementsByTagName('html')[0].setAttribute('lang', i18n.global.locale);

    if (localeQueryString) {
      // set request header for requests made by sdk
      const languageMiddleware = (req, _action, next) => {
        req.init.headers.append('accept-language', localeQueryString);
        next();
      };

      // add middleware to existing sdk config
      Config.set(Config.get({
        middleware: [languageMiddleware],
      }));
    }

    if (uiConfig?.platformSettings?.hostedJourneyPages === false) {
      store.commit('setHostedJourneyPagesState', false);
    }
  })
    .then(() => overrideTranslations(store.state.SharedStore.idmBaseURL, i18n, 'login'))
    .finally(() => loadApp());
};

// Checks if the window has been opened by a related config promotion ingress environment and stores this in session storage
const checkIfOpenedByIngressEnv = () => {
  // Check if web storage exists before trying to use it - see IAM-1873
  if (store.state.SharedStore.webStorageAvailable) {
    if (!sessionStorage.getItem('parentIsPromotionIngressEnvironment') && window.opener && store.state.SharedStore.fraasPromotionIngressUrl) {
      try {
        const openerOrigin = new URL(document.referrer).origin;
        const promotionIngressOrigin = new URL(store.state.SharedStore.fraasPromotionIngressUrl).origin;
        if (openerOrigin === promotionIngressOrigin) {
          sessionStorage.setItem('parentIsPromotionIngressEnvironment', true);
        }
      } catch {
        // Window has been opened in some other way, do nothing
      }
    }
  }
};

checkIfOpenedByIngressEnv();
startApp();
