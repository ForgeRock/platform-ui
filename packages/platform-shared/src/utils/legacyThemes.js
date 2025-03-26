/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import uuid from 'uuid/v4';
import {
  getLegacyThemes,
  saveLegacyThemes,
} from '@forgerock/platform-shared/src/api/ThemeApi';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import { decodeThemeScripts, encodeThemeScripts } from './themeUtils';

/**
 * Base64 decode any script content in the passed legacy themes
 * @param {Object} legacyThemes - details of themes
 * @returns {Object} the theme config with all scripts decoded from base64
 */
export function decodeLegacyThemes(legacyThemes) {
  const decodedThemes = cloneDeep(legacyThemes);
  Object.keys(decodedThemes.realm).forEach((key) => {
    if (Array.isArray(decodedThemes.realm[key])) {
      decodedThemes.realm[key].forEach((decodedTheme) => {
        decodeThemeScripts(decodedTheme);
      });
    }
  });
  return decodedThemes;
}

/**
 * Base64 encode any script content in the passed themes to transmit over the API
 * @param {Object} legacyThemes - config metadata of themes
 * @returns {Object} the theme config with all scripts base64 encoded
 */
export function encodeLegacyThemes(legacyThemes) {
  const encodedThemes = cloneDeep(legacyThemes);
  Object.keys(encodedThemes.realm).forEach((key) => {
    if (Array.isArray(encodedThemes.realm[key])) {
      encodedThemes.realm[key].forEach((encodedTheme) => {
        encodeThemeScripts(encodedTheme);
      });
    }
  });
  return encodedThemes;
}

/**
 * Deletes a legacy theme from the realm
 * @param {String} realm The realm that the theme is located in
 * @param {String} themeId The id of the theme to delete
 */
export async function deleteLegacyTheme(realm, themeId, realmThemes) {
  const themesToSave = cloneDeep(realmThemes);
  const index = themesToSave[realm].findIndex((searchTheme) => searchTheme._id === themeId);
  realmThemes[realm].splice(index, 1);

  const { data: legacyThemes } = await saveLegacyThemes(encodeLegacyThemes({ _id: 'ui/themerealm', realm: realmThemes }));
  return decodeLegacyThemes(legacyThemes).realm;
}

/**
 * Retrieves a legacy theme within the specified realm from IDM
 * @param {String} realm The realm that the theme is located in
 * @param {String} themeIdentifier The id or name of the theme to retrieve
 */
export async function getLegacyTheme(realm, themeIdentifier) {
  const themeStore = useThemeStore();
  // Only query for all legacy themes if we don't already have it stored in theme store
  if (themeStore.realmThemes[realm]) {
    return themeStore.realmThemes[realm]?.find((realmTheme) => realmTheme._id === themeIdentifier || realmTheme.name === themeIdentifier) || {};
  }
  const { data: legacyThemesResponse } = await getLegacyThemes();
  if (legacyThemesResponse.backgroundColor) {
    // This is an original theme where there is only a single theme
    return legacyThemesResponse;
  }
  // legacy themes are stored in an object with realm keys
  themeStore.realmThemes = decodeLegacyThemes(legacyThemesResponse).realm;
  return themeStore.realmThemes[realm]?.find((realmTheme) => realmTheme._id === themeIdentifier || realmTheme.name === themeIdentifier) || {};
}

/**
 * Saves a legacy theme to either the legacy endpoint or the new config endpoint
 * @param {String} realm The realm that the theme is located in
 * @param {Object} themeData Data of theme to save
 * @param {Array} linkedTrees Trees to link to the theme
 * @param {Boolean} linkedTreesUpdated Whether the linked trees array has updated from the original theme
 * @param {Boolean} silentError Whether to show toast error message
 */
export async function saveLegacyTheme(realm, themeToSave, linkedTrees) {
  if (!themeToSave._id) {
    themeToSave._id = uuid();
  }
  const themeStore = useThemeStore();
  themeToSave.linkedTrees = linkedTrees;
  // For legacy, get all themes, update the one that matches the id, and save all themes
  const { data: legacyThemes } = await getLegacyThemes();
  const decodedThemes = decodeLegacyThemes(legacyThemes);
  const themeIndex = decodedThemes.realm[realm].findIndex((legacyTheme) => {
    if (legacyTheme._id) {
      return legacyTheme._id === themeToSave._id;
    }
    return legacyTheme.name === themeToSave.name;
  });
  if (themeIndex === -1) {
    themeToSave.isDefault = false;
    decodedThemes.realm[realm].push(themeToSave);
  } else {
    decodedThemes.realm[realm][themeIndex] = themeToSave;
    // if new tree was linked to this theme, we need to remove that tree from other themes
    decodedThemes.realm[realm].forEach((legacyTheme, index) => {
      if (index !== themeIndex && themeToSave.linkedTrees) {
        themeToSave.linkedTrees.forEach((treeName) => {
          if (legacyTheme.linkedTrees) {
            const treeIndex = legacyTheme.linkedTrees.indexOf(treeName);
            if (treeIndex > -1) {
              legacyTheme.linkedTrees.splice(treeIndex, 1);
            }
          }
        });
      }
    });
  }
  await saveLegacyThemes(encodeLegacyThemes(decodedThemes));
  themeStore.realmThemes = decodedThemes.realm;
}

/**
 * Sets a legacy theme as the default realm theme to use as a fallback
 * @param {String} realm The realm that the theme is located in
 * @param {String} themeIdentifier The id of the theme to set as default (or name if id is not present)
 */
export async function setLegacyThemeAsDefault(realm, themeIdentifier) {
  const themeStore = useThemeStore();
  // For legacy, get all themes, update the one that matches the id, and save all themes
  const { data: legacyThemes } = await getLegacyThemes();
  const decodedThemes = decodeLegacyThemes(legacyThemes);
  // Remove isDefault from any other themes
  const currentDefaultTheme = decodedThemes.realm[realm].find((realmTheme) => realmTheme.isDefault === true);
  if (currentDefaultTheme) {
    currentDefaultTheme.isDefault = false;
  }
  const themeIndex = decodedThemes.realm[realm].findIndex((legacyTheme) => legacyTheme._id === themeIdentifier || legacyTheme.name === themeIdentifier);
  decodedThemes.realm[realm][themeIndex].isDefault = true;
  await saveLegacyThemes(encodeLegacyThemes(decodedThemes));
  themeStore.realmThemes = decodedThemes.realm;
}
