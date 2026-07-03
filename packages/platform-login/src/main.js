/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'whatwg-fetch';
import 'core-js/stable';
import 'abort-controller/polyfill.js';
import 'text-encoding-polyfill';
import '@forgerock/platform-shared/src/utils/domCollectionsForEach';
import 'regenerator-runtime/runtime';

import { createApp, markRaw } from 'vue';
import Notifications from '@kyvg/vue3-notification';
import PromisePoly from 'es6-promise';
import { journey } from '@forgerock/journey-client';
import isWebStorageAvailable from '@forgerock/platform-shared/src/utils/webStorageTest';
import { overrideTranslations, setLocales } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import Vue3Sanitize from 'vue-3-sanitize';
import { v4 as uuid } from 'uuid';
import { baseSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import { createPinia } from 'pinia';
import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { getUiConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { getAmServerInfo } from '@forgerock/platform-shared/src/api/ServerinfoApi';
import { getDefaultLocale } from '@forgerock/platform-shared/src/api/UilocaleApi';
import { filterActiveLocales } from '@forgerock/platform-shared/src/utils/uilocaleUtil';
import {
  buildAmBaseUrl,
  buildWellknownUrl,
  normalizeRealm,
} from '@forgerock/platform-shared/src/utils/amUrlUtils';
import { sdkTimeoutMiddleware } from '@forgerock/platform-shared/src/utils/sdkTimeoutMiddleware';
import { useJourneyClientStore } from '@forgerock/platform-shared/src/stores/journeyClient';
import { getAllLocales } from '@forgerock/platform-shared/src/utils/locale';
import {
  doURLParamsContainAnyResumptionParameter,
  hasReentryToken,
} from './utils/authResumptionUtil';
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

/**
 * Stamps a per-request transactionId header for journey-client traffic.
 * Increments `authRequestNumber` so each request in this auth session is unique.
 */
const transactionIdMiddleware = (req, _action, next) => {
  authRequestNumber += 1;
  req.headers.append('x-forgerock-transactionid', `${rootTransactionId}-request-${authRequestNumber}`);
  next();
};

router.beforeEach(async (to, _from, next) => {
  if (to.name === 'logout') {
    const urlParams = new URLSearchParams(window.location.search);
    const goto = urlParams.get('goto') || '';
    const logout = async (realm, validatedGoto) => {
      const realmPath = normalizeRealm(realm || localStorage.getItem('originalLoginRealm'));
      const redirect = () => {
        if (validatedGoto) {
          window.location.href = validatedGoto;
        } else {
          next('/');
        }
      };
      try {
        let logoutClient = useJourneyClientStore(pinia).client;
        // If bootstrap failed (wellknown unreachable at startup) the store
        // has no client. Create a one-shot client here so terminate() can
        // still invalidate the AM session before redirecting.
        if (!logoutClient) {
          logoutClient = await journey({
            config: {
              ...(store.state.SharedStore.isFraas
                ? { serverConfig: { wellknown: buildWellknownUrl(realmPath) } }
                : { serverConfig: { baseUrl: buildAmBaseUrl() }, realmPath }),
            },
            requestMiddleware: [sdkTimeoutMiddleware, transactionIdMiddleware],
          });
        }
        await logoutClient.terminate();
        // terminate() returns errors as `GenericError` rather than throwing —
        // either way, still redirect so the user isn't stranded.
      } catch {
        // Terminate failure is deliberately fail-open: the redirect proceeds.
      }
      redirect();
    };
    const routeUrlParams = new URLSearchParams(to.query);
    let realm = routeUrlParams.get('realm');
    if (!realm && urlParams.get('realm') !== 'undefined') {
      realm = urlParams.get('realm');
    }

    if (goto) {
      const validateGotoAndLogout = async (resolvedRealm) => {
        let realmPath = resolvedRealm;
        if (!realmPath.startsWith('/')) {
          realmPath = `/${realmPath}`;
        }
        try {
          const res = await generateAmApi({
            apiVersion: 'protocol=2.1,resource=3.0',
            path: `realms/root/realms${realmPath}`,
          }).post('users?_action=validateGoto', { goto: decodeURIComponent(goto) }, { withCredentials: true });
          await logout(resolvedRealm, res.data.successURL);
        } catch {
          await logout(resolvedRealm);
        }
      };

      if (!realm) {
        // No realm in URL — fetch it from AM server info before validating goto
        try {
          const res = await getAmServerInfo();
          realm = res.data?.realm === '/' ? 'root' : res.data.realm;
        } catch {
          realm = 'root';
        }
      }
      await validateGotoAndLogout(realm);
    } else {
      await logout(realm);
    }
  } else {
    next();
  }
});

const loadApp = () => {
  const app = createApp(App);
  app.use(Notifications);
  app.use(Vue3Sanitize, baseSanitizerConfig);
  app.use(VueReCaptcha, {
    loaderOptions: {
      renderParameters: {
        hl: i18n.global.locale || 'en', // initial locale on app load
      },
    },
  });
  app.use(router);
  app.use(i18n);
  app.use(store);
  app.use(pinia);
  router.isReady().then(() => app.mount('#appRoot'));
};

/**
 * Attempts to get browser language from IDM
 * and translation overrides from IDM config
 * We will load the application regardless.
 *
 * The journey-client bootstrap lives here (rather than at module top) because
 * it is async and must compose the locale-aware `accept-language` middleware
 * alongside the transactionId middleware in a single `requestMiddleware: [...]`
 * array (the new SDK does not support a second `Config.set` to add middleware
 * later — README §"Request Middleware").
 */
const startApp = () => {
  Promise.all([getUiConfig(), getDefaultLocale().catch(() => null)])
    .then(async ([{ data: { configuration: uiConfig } }, defaultLocaleResponse]) => {
      const uilocaleDefaultLang = defaultLocaleResponse?.data?.defaultLocale;
      // Get & set locales
      const { locales, localeQueryString } = getAllLocales(uiConfig, true, uilocaleDefaultLang);
      // Filter out inactive locales (keep 'en' regardless)
      const activeLocales = await filterActiveLocales(locales);
      setLocales(i18n, activeLocales);
      document.getElementsByTagName('html')[0].setAttribute('lang', i18n.global.locale);

      if (uiConfig?.platformSettings?.hostedJourneyPages === false) {
        store.commit('setHostedJourneyPagesState', false);
      }

      // Locale-aware request middleware — only added when the resolved locale
      // produces a non-empty query string.
      const languageMiddleware = (req, _action, next) => {
        req.headers.append('accept-language', localeQueryString);
        next();
      };

      // Bootstrap realm choice
      const hashQuery = window.location.hash.split('?')[1] || '';
      const search = new URLSearchParams(window.location.search);
      const searchRealm = search.get('realm');
      const hashRealm = new URLSearchParams(hashQuery).get('realm');
      // Same signal the Login view uses to detect a return from an external
      // redirect: known resumption query params, or the reentry cookie AM set
      // on the outbound hop (covers returns whose params are not in the list).
      const isOAuthReturn = doURLParamsContainAnyResumptionParameter(search) || hasReentryToken();
      let idpResumeRealm = null;
      if (isOAuthReturn && !searchRealm && !hashRealm) {
        try {
          const raw = localStorage.getItem('treeResumeData');
          if (raw) {
            idpResumeRealm = JSON.parse(raw)?.realmAtRedirect || null;
          }
        } catch {
          // ignore storage / parse errors — fall back to 'root'
        }
      }
      const realmParam = searchRealm || hashRealm || idpResumeRealm || 'root';
      const bootstrapRealm = normalizeRealm(realmParam);
      const journeyConfig = store.state.SharedStore.isFraas
        ? { serverConfig: { wellknown: buildWellknownUrl(bootstrapRealm) } }
        : { serverConfig: { baseUrl: buildAmBaseUrl() }, realmPath: bootstrapRealm };
      // journey-client ignores `serverConfig.timeout` — the 60s request
      // timeout is applied per-request by sdkTimeoutMiddleware instead.
      const requestMiddleware = [
        sdkTimeoutMiddleware,
        transactionIdMiddleware,
        ...(localeQueryString ? [languageMiddleware] : []),
      ];

      try {
        const client = await journey({
          config: journeyConfig,
          requestMiddleware,
        });
        useJourneyClientStore(pinia).client = markRaw(client);
      } catch {
        // No client is stored on failure; Login's null-client guard surfaces
        // the issueConnecting error.
      }
    })
    .then(() => overrideTranslations(i18n, 'login'))
    .finally(() => loadApp());
};

// Checks if the window has been opened by a related config promotion ingress environment. There is a possibility that
// the ingress could be coming from one of several possible domains. For example when the customers is using mtls. We
// need to check all the URLs white-listed server side specified either in the list env var or the legacy single ingress
// env var and store the corresponding URL in local storage if a match is found
export const checkIfOpenedByIngressEnv = (referrer, opener) => {
  // Check if web storage exists before trying to use it - see IAM-1873
  if (store.state.SharedStore.webStorageAvailable) {
    if (!sessionStorage.getItem('parentIsPromotionIngressEnvironment') && opener && store.state.SharedStore.fraasPromotionIngressUrl) {
      try {
        const openerOrigin = new URL(referrer).origin;
        const allowableUrls = store.state.SharedStore.fraasPromotionAllowableIngressUrls;
        const allowableIngressUrls = [
          ...(allowableUrls ? allowableUrls.split(',') : [store.state.SharedStore.fraasPromotionIngressUrl]),
        ];
        allowableIngressUrls.forEach((url) => {
          const promotionIngressOrigin = new URL(url).origin;
          if (openerOrigin === promotionIngressOrigin) {
            sessionStorage.setItem('parentIsPromotionIngressEnvironment', true);
            sessionStorage.setItem('fraasPromotionIngressUrl', promotionIngressOrigin);
          }
        });
      } catch {
        // Window has been opened in some other way, do nothing
      }
    }
  }
};

checkIfOpenedByIngressEnv(document.referrer, window.opener);
startApp();
