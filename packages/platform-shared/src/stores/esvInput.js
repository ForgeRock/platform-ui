/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEsvInputStore = defineStore('esvInput', () => {
  const loading = ref(false);
  const variables = ref([]);
  const secrets = ref([]);
  const listInUse = ref(false);
  const supportedTypes = ref('');

  return {
    loading,
    variables,
    secrets,
    listInUse,
    supportedTypes,
  };
});
