/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

// eslint-disable-next-line import/prefer-default-export
export const useEsvInputStore = defineStore('esvInput', () => {
  const variables = ref([]);
  const secrets = ref([]);

  return {
    variables,
    secrets,
  };
});
