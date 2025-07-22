/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { computed, watch } from 'vue';
import uuid from 'uuid/v4';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import {
  getThemerealm,
  getThemes,
  saveThemes,
} from '@forgerock/platform-shared/src/api/ThemeApi';
import i18n from '@forgerock/platform-shared/src/i18n';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import themeConstants from '@forgerock/platform-shared/src/constants/themeConstants';
import { getLocalizedString } from '@forgerock/platform-shared/src/utils/translations';
import {
  addDefaultsToTheme,
  decodeThemes,
  decodeThemeScripts,
  encodeThemes,
  removeThemeIdFromLocalStorage,
  updateThemerealmObject,
} from '../utils/themeUtils';

/**
 * Composable for integrating theme into views that will be used within
 * enduser and login, and theme data which is used in admin.
 */
export default function useTheme() {
  const themeStore = useThemeStore();
  const theme = computed(() => themeStore.theme || themeConstants.DEFAULT_THEME_PARAMS);
  const realmThemes = computed(() => themeStore.realmThemes);
  const localizedFavicon = computed(() => getLocalizedString(theme.value.favicon, i18n.global.locale, i18n.global.fallbackLocale));

  /**
   * Addes defaults to all themes on current realm and brings old formats to current format
   * @param {Object} themes Object containing all themes
   * @param {String} realm The current realm
   * @param {Array} existingThemes The existing themes in the store
   * @returns themes with defaults
   */
  function addDefaultsToAllThemes(themes, realm, existingThemes) {
    if (!themes.realm[realm]) {
      themes.realm[realm] = [];
    }
    Object.entries(themes.realm).forEach(([themeRealm, realmThemeArray]) => {
      if (!realmThemeArray || (Array.isArray(realmThemeArray) && !realmThemeArray.length)) { // Empty theme config
        themes.realm[themeRealm] = [{
          isDefault: true, name: 'Starter Theme',
        }];
      } else if (realmThemeArray.backgroundColor) {
        // This is an original theme where there is only a single theme per realm
        themes.realm[themeRealm] = [{
          ...realmThemeArray, isDefault: true, name: 'Starter Theme',
        }];
      }
      themes.realm[themeRealm].forEach((individualTheme) => {
        if (realm === themeRealm && existingThemes && individualTheme._id === undefined) {
          // For old themes that did not have an id, but one was generated, we need to make sure to use that same id
          individualTheme._id = existingThemes.find((existingTheme) => existingTheme.name === individualTheme.name)?._id || uuid();
        }
        addDefaultsToTheme(individualTheme);
      });
    });
    return themes;
  }

  async function getAllThemes(realm, existingThemes) {
    try {
      const { data: allThemes } = await getThemerealm();
      return decodeThemes(addDefaultsToAllThemes(allThemes, realm, existingThemes));
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingList'));
      throw error;
    }
  }
  /**
   * Gets all themes from current realm and sets them in the store
   * @param {String} realm The realm that the theme is located in
   * @param {Array} fields The fields to include in the query response
   */
  async function getRealmThemes(realm, fields = '*') {
    try {
      let decodedThemesWithDefaults;
      const { data: { result: themes } } = await getThemes({ realm, _queryFilter: 'true', _fields: fields });
      if (themes?.length) {
        decodedThemesWithDefaults = themes.map((individualTheme) => decodeThemeScripts(addDefaultsToTheme(individualTheme)));
      } else {
        const allThemes = await getAllThemes(realm);
        decodedThemesWithDefaults = allThemes?.realm[realm] || [];
      }
      themeStore.realmThemes = decodedThemesWithDefaults.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingList'));
      throw error;
    }
  }

  /**
   * Deletes a theme from the realm and clears the localStorage if theme-id is a match
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeId The id of the theme to delete
   */
  async function deleteTheme(realm, themeId) {
    try {
      const decodedThemes = await getAllThemes(realm, themeStore.realmThemes);
      const index = decodedThemes.realm[realm].findIndex((searchTheme) => searchTheme._id === themeId);
      decodedThemes.realm[realm].splice(index, 1);

      const { data: themes } = await saveThemes(encodeThemes(decodedThemes));
      themeStore.realmThemes = themes.realm[realm].sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    } catch (error) {
      showErrorMessage(error, i18n.global.t('hostedPages.theme.errorDeletingTheme'));
      throw error;
    } finally {
      removeThemeIdFromLocalStorage(themeId);
    }
  }

  /**
   * Gets the theme linked to a specific tree
   * @param {String} realm The realm that the theme is located in
   * @param {String} treeId The id of the tree to get the theme for
   * @returns
   */
  async function getTreeThemeId(realm = '/', treeId) {
    const params = { realm, _queryFilter: `linkedTrees eq "${treeId}"`, _fields: '_id' };
    const { data: { result } } = await getThemes(params);
    return result[0]?._id || result[0]?.name;
  }

  /**
   * Retrieves a theme within the specified realm from IDM
   * @param {String} realm The realm that the theme is located in
   * @param {String} _queryFilter The query filter to use when retrieving the theme
   * @param {Boolean} bailOnError Whether to show an error message if the theme cannot be retrieved
   * @param {String} themeIdentifier The id or name of the theme
   * @returns {Object} The theme object with defaults added
   */
  async function getTheme(realm = '/', _queryFilter, themeIdentifier, existingThemes) {
    let decodedTheme = {};
    try {
      const { data: { result } } = await getThemes({ realm, _queryFilter });
      if (result[0]) {
        decodedTheme = decodeThemeScripts(result[0]);
      } else {
        const allThemes = await getAllThemes(realm, existingThemes);
        themeStore.realmThemes = allThemes?.realm[realm] || [];
        if (_queryFilter.startsWith('isDefault')) {
          decodedTheme = themeStore.realmThemes.find((t) => t.isDefault);
        } else if (themeIdentifier) {
          decodedTheme = themeStore.realmThemes.find((t) => t._id === themeIdentifier || t.name === themeIdentifier);
          if (!decodedTheme) {
            removeThemeIdFromLocalStorage(themeIdentifier);
          }
        }
      }
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingTheme'));
    }
    return addDefaultsToTheme(decodedTheme);
  }

  /**
   * Gets the theme linked to a specific tree
   * @param {String} realm The realm that the theme is located in
   * @param {String} treeId The id of the tree to get the theme for
   * @returns
   */
  async function loadTreeTheme(realm = '/', treeId) {
    let decodedTheme = {};
    try {
      const { data: { result } } = await getThemes({ realm, _queryFilter: `linkedTrees eq "${treeId}"` });
      if (result[0]) {
        decodedTheme = decodeThemeScripts(result[0]);
        themeStore.theme = addDefaultsToTheme(decodedTheme);
      } else {
        themeStore.theme.name = '';
      }
    } catch {
      // No error needed, just no theme linked to tree
    }
  }

  /**
   * Loads the static theme into the store
   */
  function loadStaticTheme() {
    themeStore.theme = {
      logo: `${process.env.BASE_URL}images/ping-logo-square-color.svg`,
      logoHeight: 72,
      favicon: 'favicon.ico',
    };
  }

  /**
   * Gets specified theme and saves it to store
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeIdentifier The id or name of the theme to get
   */
  async function loadTheme(realm = '/', themeIdentifier) {
    let loadedTheme = {};
    if (!themeIdentifier) {
      loadedTheme = await getTheme(realm, 'isDefault eq true') || {};
    } else {
      const returnedTheme = await getTheme(realm, `_id eq "${themeIdentifier}" or name eq "${themeIdentifier}"`, themeIdentifier);
      loadedTheme = returnedTheme || {};
    }

    themeStore.theme = loadedTheme;
  }

  /**
   * Saves a theme into themerealm endpoint
   * @param {String} realm The realm that the theme is located in
   * @param {Object} themeData Data of theme to save
   */
  async function saveTheme(realm, themeData) {
    const themeToSave = cloneDeep(themeData);
    try {
      // Get all themes, update the one that matches the id, and save all themes
      const decodedThemes = await getAllThemes(realm, themeStore.realmThemes);
      updateThemerealmObject(decodedThemes.realm, themeToSave, realm);
      await saveThemes(encodeThemes(decodedThemes));
      themeStore.realmThemes = decodedThemes.realm[realm];
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorSavingTheme'));
      throw error;
    }
  }

  /**
   * Adds a theme to a specific tree
   * @param {String} themeId The id of the theme to get
   * @param {String} treeId Id of tree to link to the theme
   * @param {String} realm The realm that the theme is located in
   */
  async function addTreeTheme(themeId, treeId, realm) {
    const themeToSave = await getTheme(realm, `_id eq "${themeId}" or name eq "${themeId}"`, themeId, [{ _id: themeId, name: 'Starter Theme' }]);
    // only continue if theme does not have treeId already
    if (!themeToSave.linkedTrees.includes(treeId)) {
      // add treeId to this theme
      themeToSave.linkedTrees.push(treeId);
      await saveTheme(realm, themeToSave);
    }
  }

  /**
   * Removes a theme from a specific tree
   * @param {String} themeId The id of the theme to get
   * @param {String} treeId Id of tree to unlink from the theme
   * @param {String} realm The realm that the theme is located in
   */
  async function removeTreeTheme(themeId, treeId, realm) {
    const themeToSave = await getTheme(realm, `_id eq "${themeId}" or name eq "${themeId}"`);
    themeToSave.linkedTrees = themeToSave.linkedTrees.filter((tree) => tree !== treeId);
    await saveTheme(realm, themeToSave);
  }

  /**
   * Sets a theme as the default realm theme to use as a fallback
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeIdentifier The id of the theme to set as default (or name if id is not present)
   */
  async function setThemeAsDefault(realm, themeIdentifier) {
    try {
      // Get all themes, update the one that matches the id, and save all themes
      const decodedThemes = await getAllThemes(realm, themeStore.realmThemes);
      // Remove isDefault from any other themes
      const currentDefaultTheme = decodedThemes.realm[realm].find((realmTheme) => realmTheme.isDefault === true);
      if (currentDefaultTheme) {
        currentDefaultTheme.isDefault = false;
      }
      const themeIndex = decodedThemes.realm[realm].findIndex((decodedTheme) => decodedTheme._id === themeIdentifier || decodedTheme.name === themeIdentifier);
      decodedThemes.realm[realm][themeIndex].isDefault = true;
      await saveThemes(encodeThemes(decodedThemes));
      themeStore.realmThemes = decodedThemes.realm[realm].sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    } catch (error) {
      showErrorMessage(error, i18n.global.t('hostedPages.theme.errorSetDefault'));
      throw error;
    }
  }

  watch(themeStore.theme, (newTheme) => {
    theme.value = newTheme;
  });

  return {
    addTreeTheme,
    deleteTheme,
    getRealmThemes,
    getAllThemes,
    getTheme,
    getTreeThemeId,
    loadStaticTheme,
    loadTheme,
    loadTreeTheme,
    localizedFavicon,
    realmThemes,
    removeTreeTheme,
    saveTheme,
    setThemeAsDefault,
    theme,
  };
}
