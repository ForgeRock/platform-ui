/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import Vue from 'vue';
import ToggleButton from 'vue-js-toggle-button';
import Notifications from 'vue-notification';
import i18n from './i18n';
import router from './router';
import App from './App';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

Vue.config.productionTip = false;

Vue.use(Notifications);
Vue.use(ToggleButton);

new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
