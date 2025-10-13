/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Notifications from '@kyvg/vue3-notification';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import Vue3Sanitize from 'vue-3-sanitize';
import { baseSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';
import App from './App';
import i18n from './i18n';
import router from './router';
import store from './store';
import { useAuth } from './composables/useAuth';
import { setUiConfig } from './utils/uiConfig';

/* The next lines correspond to data that should be loaded before the app is mounted */

// header required for openidm requests configured globally to affect all requests
axios.defaults.headers.common['x-requested-with'] = 'XMLHttpRequest';

// set the base URL for the API requests
store.commit('SharedStore/setBaseURLs', process.env);
store.commit('setAuthHeaders', {
  'X-OpenIDM-NoSession': true,
  'X-OpenIDM-Password': 'anonymous',
  'X-OpenIDM-Username': 'anonymous',
  'cache-control': 'no-cache',
});

// load the ui configuration, required for translations
try {
  await setUiConfig();
} catch {
  // Do nothing not critical, system will fallback the ui config to default values
}

// Create the logout method
const { initializeLogout } = useAuth();
initializeLogout();

/* When the data is loaded, we can mount the app */

function loadApp() {
  const app = createApp(App);
  app.use(BootstrapVue);
  app.use(router);
  app.use(i18n);
  app.use(store);
  app.use(createPinia());
  app.use(Notifications);
  app.use(Vue3Sanitize, baseSanitizerConfig);
  router.isReady().then(() => app.mount('#appRoot'));
}

loadApp();
