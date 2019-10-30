import Vue from 'vue';
import ToggleButton from 'vue-js-toggle-button';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';
import i18n from './i18n';
import router from './router';
import App from './App';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

Vue.config.productionTip = false;
Vue.use(VeeValidate, { inject: false, fastExit: false });

Vue.use(Notifications);
Vue.use(ToggleButton);

new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
