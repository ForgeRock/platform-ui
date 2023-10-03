/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

// eslint-disable-next-line import/prefer-default-export
export const useBreadcrumbStore = defineStore('breadcrumb', () => {
  const returnRoute = ref('');
  const returnRouteText = ref('');

  return {
    returnRoute,
    returnRouteText,
  };
});
