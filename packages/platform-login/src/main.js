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

/*
    Basic Notification Example:
    this.$notify({
        group: 'IDMMessages', // Currently the only group
        type: 'success', // Available types success, failure, info, warning
        title: this.$t('common.messages.saveSuccess'), //Translated string
        text: this.$t('pages.resources.mappingSave') // Translated string (can also be html)
    });
 */
Vue.use(Notifications);
Vue.use(ToggleButton);

// Global mixin for making openIDM REST calls
Vue.mixin({
  methods: {
    displayNotification(notificationType, message) {
      /* istanbul ignore next */
      this.$notify({
        group: 'IDMMessages',
        type: notificationType,
        text: message,
      });
    },
  },
});

new Vue({
  router,
  i18n,
  render: h => h(App),
}).$mount('#app');
