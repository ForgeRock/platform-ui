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
  Object.keys(decodedThemes.realm).forEach((realm) => {
    if (Array.isArray(decodedThemes.realm[realm])) {
      decodedThemes.realm[realm] = decodedThemes.realm[realm].map((decodedTheme) => decodeThemeScripts(decodedTheme));
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
  Object.keys(encodedThemes.realm).forEach((realm) => {
    if (Array.isArray(encodedThemes.realm[realm])) {
      encodedThemes.realm[realm] = encodedThemes.realm[realm].map((encodedTheme) => encodeThemeScripts(encodedTheme));
    }
  });
  return encodedThemes;
}

/**
 * Adds default values to the theme object if they are not present
 * @param {Object} decodedTheme The theme object to add defaults to
 * @returns The theme object with defaults added
 */
export function addDefaultsToTheme(decodedTheme = {}) {
  if (decodedTheme._id === undefined) {
    decodedTheme._id = uuid();
  }
  // eslint-disable-next-line global-require
  const placeholderImage = require('@forgerock/platform-shared/src/assets/images/placeholder.svg');
  decodedTheme.logo = decodedTheme.logo || placeholderImage;
  // Add in defaults for any missing values
  each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
    if (decodedTheme[key] === undefined) {
      decodedTheme[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
    }
  });
  decodedTheme.journeyInputFocusBorderColor = decodedTheme.journeyInputFocusBorderColor || decodedTheme.primaryColor;
  decodedTheme.accountCardInputFocusBorderColor = decodedTheme.accountCardInputFocusBorderColor || decodedTheme.primaryColor;
  return decodedTheme;
}

/*
 * Adds a provided theme to the themerealm endpoint object, or updates an existing theme
 * @param {Object} themes The themerealm endpoint object
 * @param {Object} themeToSave Individual theme object to add/update
 * @param {String} realm The current realm theme belongs to
 */
export function updateThemerealmObject(themes, themeToSave, realm) {
  const themeIndex = themes[realm].findIndex((theme) => {
    if (theme._id !== undefined && themeToSave._id !== undefined) {
      return theme._id === themeToSave._id;
    }
    return theme.name === themeToSave.name;
  });

  if (themeIndex === -1) {
    themeToSave.isDefault = false;
    themes[realm].push(addDefaultsToTheme(themeToSave));
  } else {
    Object.entries(themeToSave).forEach(([key, value]) => {
      themes[realm][themeIndex][key] = value;
    });
    themes[realm][themeIndex] = addDefaultsToTheme(themes[realm][themeIndex]);
    // if new tree was linked to this theme, we need to remove that tree from other themes
    themes[realm].forEach((theme, index) => {
      if (index !== themeIndex && themeToSave.linkedTrees) {
        themeToSave.linkedTrees.forEach((treeName) => {
          if (theme.linkedTrees) {
            const treeIndex = theme.linkedTrees.indexOf(treeName);
            if (treeIndex > -1) {
              theme.linkedTrees.splice(treeIndex, 1);
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

/**
 * If theme with the same name but different _id is found, create unique name
 * @param {Object} themeData The theme data to check for uniqueness
 * @param {Object} themes The themes object containing all themes
 * @param {String} realm The current realm where the theme belongs
 */
export function setUniqueThemeName(themeData, themes, realm) {
  let finalNameFound = false;
  let iterationCount = 0; // Track the number of iterations
  while (!finalNameFound && iterationCount < 100) {
    const duplicateNameTheme = themes.realm[realm].find((theme) => theme.name === themeData.name);
    if (duplicateNameTheme && duplicateNameTheme?._id !== themeData._id) {
      themeData.name = `${themeData.name}(2)`;
      if (!themes.realm[realm].find((theme) => theme.name === themeData.name)) {
        finalNameFound = true;
      }
    } else {
      finalNameFound = true;
    }
    iterationCount += 1;
  }
}
