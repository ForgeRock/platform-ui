/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import { extend, setInteractionMode } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import ToggleButton from 'vue-js-toggle-button';
import Notifications from 'vue-notification';
import {
  SessionManager,
} from '@forgerock/javascript-sdk';
import i18n from './i18n';
import router from './router';
import App from './App';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

Vue.config.productionTip = false;

Vue.use(Notifications);
Vue.use(ToggleButton);

// Required rule - errors if no value is supplied
extend('required', {
  ...required,
  message: i18n.t('common.policyValidationMessages.REQUIRED'),
});
// Unique rule - errors if input value matches any of provided array of values
extend('unique', {
  params: ['otherValues'],
  validate(value, { otherValues }) {
    let uniqueValues;
    if (typeof otherValues === 'string') {
      uniqueValues = [otherValues];
    } else {
      uniqueValues = otherValues;
    }
    let returnValue = true;
    if (uniqueValues) {
      uniqueValues.forEach((uniqueValue) => {
        if (uniqueValue.toLowerCase().trim() === value.toLowerCase().trim()) {
          returnValue = false;
        }
      });
    }
    return returnValue;
  },
  message: i18n.t('common.policyValidationMessages.UNIQUE'),
});
setInteractionMode('passive');

router.beforeEach(async (to, _from, next) => {
  if (to.name === 'logout') {
    await SessionManager.logout();
    next('/');
  }
  next();
});

new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
