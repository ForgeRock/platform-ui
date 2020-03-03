/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
