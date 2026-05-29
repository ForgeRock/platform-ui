/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useJourneyEditorAsChildPageStore = defineStore('journeyEditorAsChildPage', () => {
  const editorIsChildPage = ref(false);
  const childJourneyId = ref('');
  const parentRoute = ref('');

  return {
    childJourneyId,
    editorIsChildPage,
    parentRoute,
  };
});
