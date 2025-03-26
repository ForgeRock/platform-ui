/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import Notifications from '@kyvg/vue3-notification';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import App from './App';
import i18n from './i18n';
import router from './router';
import store from './store';
import { useAuth } from './composables/useAuth';

// header required for openidm requests configured globally to affect all requests
axios.defaults.headers.common['x-requested-with'] = 'XMLHttpRequest';

function loadApp() {
  const app = createApp(App);
  app.use(router);
  app.use(i18n);
  app.use(store);
  app.use(createPinia());
  app.use(Notifications);
  router.isReady().then(() => app.mount('#appRoot'));
}

loadApp();

// Set the stores data
store.commit('SharedStore/setBaseURLs', process.env);

// Create the logout method
const { initializeLogout } = useAuth();
initializeLogout();
