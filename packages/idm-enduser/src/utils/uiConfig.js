/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getUiConfigNoSession } from '@forgerock/platform-shared/src/api/ConfigApi';
import i18n from '../i18n';
import store from '../store';

/**
 * @description This function retrieves the UI configuration from the server
 * and updates the i18n instance with the language specified in the configuration.
 * @returns {Promise<void>} A promise that resolves when the UI configuration is set.
 */
export async function setUiConfig() {
  const { data } = await getUiConfigNoSession();

  const uiConfig = data.configuration;
  if (uiConfig?.lang) {
    i18n.global.locale = uiConfig.lang;
  }

  store.commit('SharedStore/setUiConfig', data);
}
