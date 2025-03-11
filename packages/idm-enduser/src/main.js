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
import App from './App';
import i18n from './i18n';
import router from './router';
import store from './store';
import { useApplicationStore } from './stores/application';

function loadApp() {
  const pinia = createPinia();
  const app = createApp(App);
  app.use(router);
  app.use(i18n);
  app.use(store);
  app.use(pinia);
  app.use(Notifications);
  router.isReady().then(() => app.mount('#appRoot'));
}

loadApp();

// Set application store from env
const applicationStore = useApplicationStore();
applicationStore.idmUrl = process.env.VUE_APP_IDM_URL;
