/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getUiConfigNoSession } from '@forgerock/platform-shared/src/api/ConfigApi';
import i18n from '../i18n';
import store from '../store';

/**
 * @description This function retrieves the UI configuration from the server
 * and updates the i18n instance with the language specified in the configuration.
 * @returns {Promise<void>} A promise that resolves when the UI configuration is set.
 */
// eslint-disable-next-line import/prefer-default-export
export async function setUiConfig() {
  const { data } = await getUiConfigNoSession();

  const uiConfig = data.configuration;
  if (uiConfig?.lang) {
    i18n.global.locale = uiConfig.lang;
  }

  store.commit('SharedStore/setUiConfig', data);
}
