/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'whatwg-fetch';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import Vue from 'vue';
import Notifications from 'vue-notification';
import {
  Config,
  SessionManager,
} from '@forgerock/javascript-sdk';
import { setInteractionMode } from 'vee-validate';
import axios from 'axios';
import getFQDN from '@forgerock/platform-shared/src/utils/getFQDN';
import isWebStorageAvailable from '@forgerock/platform-shared/src/utils/webStorageTest';
import overrideTranslations, { setLocales } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import VueSanitize from 'vue-sanitize';
import store from '@forgerock/platform-shared/src/store';
import uuid from 'uuid/v4';
import { defaultSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import i18n from './i18n';
import router from './router';
import App from './App';

Vue.config.productionTip = false;

Vue.use(Notifications);
Vue.use(VueSanitize, defaultSanitizerConfig);

setInteractionMode('passive');

const idmContext = process.env.VUE_APP_IDM_URL;

store.commit('SharedStore/setWebStorageAvailable', isWebStorageAvailable());

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

Config.set({
  serverConfig: { baseUrl: getFQDN(`${process.env.VUE_APP_AM_URL}/`) },
  middleware: [
    (req, action, next) => {
      // increment the request number
      authRequestNumber += 1;

      // Set a transaction ID that should identify this request of this auth session of this tree in logs
      req.init.headers['x-forgerock-transactionid'] = `${rootTransactionId}-request-${authRequestNumber}`;
      next();
    },
  ],
});

router.beforeEach((to, _from, next) => {
  if (to.name === 'logout') {
    SessionManager.logout().then(() => {
      next('/');
    });
  }
  next();
});

const loadApp = () => {
  new Vue({
    router,
    i18n,
    store,
    render: (h) => h(App),
  }).$mount('#app');
};

/**
 * Attempts to get browser language from IDM
 * and translation overrides from IDM config
 * We will load the application regardless
 */
const startApp = () => {
  const idmInstance = axios.create({
    baseURL: idmContext,
    timeout: 15000,
    headers: {},
  });

  idmInstance.get('/info/uiconfig').then((uiConfig) => {
    // check for locale query parameter
    const urlSearchParams = new URLSearchParams(window.location.search);
    const localeString = urlSearchParams.get('locale');
    if (localeString) {
      setLocales(i18n, localeString, uiConfig.data.configuration.defaultLocale || 'en');

      // set request header for requests made by sdk
      const languageMiddleware = (req, action, next) => {
        req.init.headers['accept-language'] = localeString;
        next();
      };

      // add middleware to existing sdk config
      Config.set(Config.get({
        middleware: [languageMiddleware],
      }));
    } else if (uiConfig.data.configuration.lang) {
      // if no query param, use the primary browser language
      setLocales(i18n, uiConfig.data.configuration.lang, uiConfig.data.configuration.defaultLocale || 'en');
    }
  })
    .then(() => overrideTranslations(idmContext, i18n, 'login'))
    .finally(() => loadApp());
};

startApp();
