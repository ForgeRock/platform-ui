/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

// eslint-disable-next-line import/prefer-default-export
export const useKbaChoicesStore = defineStore('kbaChoices', () => {
  const choices = ref({});

  function storeChoice(choice, callBackIndex) {
    choices.value[callBackIndex] = choice;
  }

  function getOtherChoices(currentCallbackIndex) {
    return Object.entries(choices.value)
      .filter(([key]) => key !== currentCallbackIndex.toString())
      .map(([, value]) => value);
  }

  return {
    choices,
    storeChoice,
    getOtherChoices,
  };
});
