/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * This store contains the theme information that has been retrieved from IDM. It is used to store
 * both the current theme being applied to the UI as well as the theme configuration that contains the
 * list of trees linked to themes, and lastly the list of themes for a given realm.
 */
// eslint-disable-next-line import/prefer-default-export
export const useThemeStore = defineStore('theme', () => {
  const isLegacyTheme = ref(false);
  const lastQueriedRealm = ref('');
  const realmThemes = ref({});
  const theme = ref(null);
  const themeConfig = ref(null);

  return {
    isLegacyTheme,
    lastQueriedRealm,
    realmThemes,
    theme,
    themeConfig,
  };
});
