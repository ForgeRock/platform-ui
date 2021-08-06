/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
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
import overrideTranslations, { setLocales } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import VueSanitize from 'vue-sanitize';
import i18n from './i18n';
import router from './router';
import App from './App';

Vue.config.productionTip = false;

Vue.use(Notifications);
VueSanitize.defaults.allowedAttributes['*'] = ['class', 'style', 'data-testid'];
VueSanitize.defaults.allowedAttributes.img.push('height');
VueSanitize.defaults.allowedTags = [...VueSanitize.defaults.allowedTags, 'img'];
Vue.use(VueSanitize);

setInteractionMode('passive');

const idmContext = process.env.VUE_APP_IDM_URL;

Config.set({
  serverConfig: { baseUrl: getFQDN(`${process.env.VUE_APP_AM_URL}/`) },
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
    timeout: 5000,
    headers: {},
  });

  // check for locale query parameter
  const urlSearchParams = new URLSearchParams(window.location.search);
  const localeString = urlSearchParams.get('locale');
  if (localeString) {
    setLocales(i18n, localeString);

    // set request header for requests made by sdk
    const languageMiddleware = (req, action, next) => {
      req.init.headers['accept-language'] = localeString;
      next();
    };

    // add middleware to existing sdk config
    Config.set(Config.get({
      middleware: [languageMiddleware],
    }));
  }

  idmInstance.get('/info/uiconfig').then((uiConfig) => {
    if (uiConfig.data.configuration.lang && !localeString) {
      i18n.locale = uiConfig.data.configuration.lang;
    }
  })
    .then(() => overrideTranslations(idmContext, i18n, 'login'))
    .finally(() => loadApp());
};

startApp();
