/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import 'core-js/stable';
import { defineRule } from 'vee-validate';
import { required } from '@vee-validate/rules';
import ResizableTable from './directives/ResizableTable/ResizableTable';
import i18n from './i18n';

// Add the required rule
defineRule('required', (value) => required(value) || i18n.global.t('common.policyValidationMessages.REQUIRED'));

Vue.config.productionTip = false;
Vue.directive('resizable-table', ResizableTable);
new Vue({
  i18n,
  render: (h) => h(),
}).$mount('#appRoot');
