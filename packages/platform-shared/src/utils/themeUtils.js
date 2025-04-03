/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep, each } from 'lodash';
import { convertBase64ToString, convertStringToBase64 } from '@forgerock/platform-shared/src/utils/encodeUtils';
import themeConstants from '@forgerock/platform-shared/src/constants/themeConstants';
import uuid from 'uuid/v4';

import store from '@/store';
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
 * Base64 decode any script content in the provided themes
 * @param {Object} themes - details of themes
 * @returns {Object} the theme config with all scripts decoded from base64
 */
export function decodeThemes(themes) {
  const decodedThemes = cloneDeep(themes);
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
 * @param {Object} themes - metadata of themes
 * @returns {Object} the theme config with all scripts base64 encoded
 */
export function encodeThemes(themes) {
  const encodedThemes = cloneDeep(themes);
  Object.keys(encodedThemes.realm).forEach((key) => {
    if (Array.isArray(encodedThemes.realm[key])) {
      encodedThemes.realm[key].forEach((encodedTheme) => {
        encodeThemeScripts(encodedTheme);
      });
    }
  });
  return encodedThemes;
}

/*
 * Adds a provided theme to the themerealm endpoint object, or updates an existing theme
 * @param {Object} decodedThemes The themerealm endpoint object in a decoded state
 * @param {Object} themeToSave Individual theme object to add/update
 * @param {String} realm The current realm theme belongs to
 */
export function updateThemerealmObject(decodedThemes, themeToSave, realm) {
  // Add in defaults for any missing values
  each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
    if (themeToSave[key] === undefined) {
      themeToSave[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
    }
  });
  const themeIndex = decodedThemes[realm].findIndex((decodedTheme) => {
    if (decodedTheme._id) {
      return decodedTheme._id === themeToSave._id;
    }
    return decodedTheme.name === themeToSave.name;
  });
  if (!themeToSave._id) {
    themeToSave._id = uuid();
  }
  if (themeIndex === -1) {
    themeToSave.isDefault = false;
    decodedThemes[realm].push(themeToSave);
  } else {
    decodedThemes[realm][themeIndex] = themeToSave;
    // if new tree was linked to this theme, we need to remove that tree from other themes
    decodedThemes[realm].forEach((decodedTheme, index) => {
      if (index !== themeIndex && themeToSave.linkedTrees) {
        themeToSave.linkedTrees.forEach((treeName) => {
          if (decodedTheme.linkedTrees) {
            const treeIndex = decodedTheme.linkedTrees.indexOf(treeName);
            if (treeIndex > -1) {
              decodedTheme.linkedTrees.splice(treeIndex, 1);
            }
          }
        });
      }
    });
  }
}

/*
* Remove the theme id from local storage if it matches the provided theme id
* @param {String} themeId - The theme id to check
* @returns void
*/
export function removeThemeIdFromLocalStorage(themeId) {
  if (store.state.SharedStore.webStorageAvailable) {
    const storedThemeId = localStorage.getItem('theme-id');
    if (storedThemeId === themeId) {
      localStorage.removeItem('theme-id');
    }
  }
}
