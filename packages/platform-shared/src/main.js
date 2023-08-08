/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import { extend, setInteractionMode } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import i18n from './i18n';
import 'core-js/stable';

// Add the required rule
extend('required', {
  ...required,
  message: i18n.t('common.policyValidationMessages.REQUIRED'),
});

setInteractionMode('passive');

Vue.config.productionTip = false;
new Vue({
  i18n,
  render: (h) => h(),
}).$mount('#app');
