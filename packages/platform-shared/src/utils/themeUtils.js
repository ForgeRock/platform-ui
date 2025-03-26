/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { convertBase64ToString, convertStringToBase64 } from '@forgerock/platform-shared/src/utils/encodeUtils';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import {
  deleteLegacyThemes,
  getRealmTheme,
  saveRealmTheme,
  saveThemeConfig,
} from '@forgerock/platform-shared/src/api/ThemeApi';
import i18n from '@/i18n';

/**
 * Base64 decode any script content in the passed theme
 * @param {Object} themeToDecode - details of theme
 * @returns {Object} the theme config with all scripts decoded from base64
 */
export function decodeThemeScripts(themeToDecode) {
  const decodedTheme = cloneDeep(themeToDecode);
  if (typeof decodedTheme.journeyFooterScriptTag === 'string' && decodedTheme.journeyFooterScriptTag !== '') {
    decodedTheme.journeyFooterScriptTag = convertBase64ToString(decodedTheme.journeyFooterScriptTag);
  }

  if (typeof decodedTheme.accountFooterScriptTag === 'string' && decodedTheme.accountFooterScriptTag !== '') {
    decodedTheme.accountFooterScriptTag = convertBase64ToString(decodedTheme.accountFooterScriptTag);
  }
  return decodedTheme;
}

/**
  * Base64 encode any script content in the passed themes to transmit over the API
  * @param {Object} themeToEncode - config metadata of themes
  * @returns {Object} the theme config with all scripts base64 encoded
  */
export function encodeThemeScripts(themeToEncode) {
  const encodedTheme = cloneDeep(themeToEncode);
  if (typeof encodedTheme.journeyFooterScriptTag === 'string' && encodedTheme.journeyFooterScriptTag !== '') {
    encodedTheme.journeyFooterScriptTag = convertStringToBase64(encodedTheme.journeyFooterScriptTag);
  }

  if (typeof encodedTheme.accountFooterScriptTag === 'string' && encodedTheme.accountFooterScriptTag !== '') {
    encodedTheme.accountFooterScriptTag = convertStringToBase64(encodedTheme.accountFooterScriptTag);
  }
  return encodedTheme;
}

/**
 * Determines if the id attempting to be used to save a theme is unique
 * @param {String} realm The realm that the theme is located in
 * @param {String} idToTest The id to test for uniqueness
 * @param {Number} additionalNumber Additional number to append to the id if needed for uniqueness
 * @returns {String} A unique id
 */
export async function getUniqueThemeId(realm, idToTest, additionalNumber = 0) {
  const incrementedNumber = additionalNumber + 1;
  const uniqueId = `${idToTest}${additionalNumber ? `-${incrementedNumber}` : ''}`;
  try {
    await getRealmTheme(uniqueId);
    return await getUniqueThemeId(realm, idToTest, incrementedNumber);
  } catch (error) {
    if (error.response?.status === 404) {
      return uniqueId;
    }
    throw error;
  }
}

async function convertIndividualLegacyTheme(realm, themeId, legacyTheme, themeConfig) {
  const newId = await getUniqueThemeId(realm, themeId);

  // Remove isDefault and save into themeConfig
  if (legacyTheme.isDefault) {
    themeConfig.defaultRealmThemeId[realm] = decodeURIComponent(themeId);
  }
  delete legacyTheme.isDefault;

  // Remove linkedTrees and save into themeConfig
  if (legacyTheme.linkedTrees?.length) {
    legacyTheme.linkedTrees.forEach((treeId) => {
      themeConfig.linkedTrees[realm][treeId] = themeId;
    });
  }

  delete legacyTheme.linkedTrees;

  return saveRealmTheme(newId, legacyTheme);
}

export async function convertLegacyThemesToNewFormat(legacyThemes, themeConfig) {
  const saveRequests = [];
  // Set isLegacy to false
  const themeStore = useThemeStore();
  themeStore.isLegacyTheme = false;
  if (!themeConfig.defaultRealmThemeId) {
    themeConfig.defaultRealmThemeId = {};
  }
  if (!themeConfig.linkedTrees) {
    themeConfig.linkedTrees = {};
  }

  Object.entries(legacyThemes).forEach(([realm, realmThemes]) => {
    if (!themeConfig.linkedTrees[realm]) {
      themeConfig.linkedTrees[realm] = {};
    }
    realmThemes.forEach((legacyTheme) => {
      // Convert id to new format
      let cleanRealm = realm;
      if (cleanRealm === '/') {
        cleanRealm = 'root';
      } else if (cleanRealm[0] === '/') {
        cleanRealm = cleanRealm.slice(1);
      }
      const encodedRealm = encodeURIComponent(cleanRealm);
      const themeIdentifier = (legacyTheme._id || legacyTheme.name).replace(/[^\w-]/g, '');
      const themeId = `ui/theme-${encodedRealm}-${encodeURIComponent(themeIdentifier)}`;

      // Add theme to save requests
      saveRequests.push(convertIndividualLegacyTheme(realm, themeId, legacyTheme, themeConfig));
    });
  });

  try {
    await Promise.all(saveRequests);
    await saveThemeConfig(themeConfig);

    // Delete old themes
    await deleteLegacyThemes();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('common.themes.errorConvertingThemes'));
  }
}
