/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep, each } from 'lodash';
import { computed, watch } from 'vue';
import uuid from 'uuid/v4';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import { getThemes, saveThemes } from '@forgerock/platform-shared/src/api/ThemeApi';
import i18n from '@forgerock/platform-shared/src/i18n';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import themeConstants from '@forgerock/platform-shared/src/constants/themeConstants';
import { getLocalizedString } from '@forgerock/platform-shared/src/utils/translations';
import { decodeThemes, encodeThemes } from '../utils/themeUtils';

/**
 * Composable for integrating theme into views that will be used within
 * enduser and login, and theme data which is used in admin.
 */
export default function useTheme() {
  const themeStore = useThemeStore();
  const theme = computed(() => themeStore.theme || themeConstants.DEFAULT_THEME_PARAMS);
  const realmThemes = computed(() => themeStore.realmThemes);
  const lastQueriedRealm = computed(() => themeStore.lastQueriedRealm);
  const localizedFavicon = computed(() => getLocalizedString(theme.value.favicon, i18n.global.locale, i18n.global.fallbackLocale));

  /**
   * Gets all themes from current realm and sets them in the store
   */
  async function getAllThemes() {
    try {
      const { data: themes } = await getThemes();
      themeStore.realmThemes = themes.realm;
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingList'));
      throw error;
    }
  }

  /**
   * Deletes a theme from the realm
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeId The id of the theme to delete
   */
  async function deleteTheme(realm, themeId) {
    try {
      const themesToSave = cloneDeep(realmThemes.value);
      const index = themesToSave[realm].findIndex((searchTheme) => searchTheme._id === themeId);
      themesToSave[realm].splice(index, 1);

      const { data: themes } = await saveThemes(encodeThemes({ _id: 'ui/themerealm', realm: themesToSave }));
      themeStore.realmThemes = themes.realm;
    } catch (error) {
      showErrorMessage(error, i18n.global.t('hostedPages.theme.errorDeletingTheme'));
      throw error;
    }
  }

  /**
   * Gets the theme linked to a specific tree
   * @param {String} realm The realm that the theme is located in
   * @param {String} treeId The id of the tree to get the theme for
   * @returns
   */
  async function getTreeTheme(realm = '/', treeId) {
    if (!realmThemes.value[realm]) {
      await getAllThemes();
    }
    const linkedTree = realmThemes.value[realm].find((realmTheme) => realmTheme.linkedTrees.includes(treeId));
    return linkedTree?._id || '';
  }

  /**
   * Retrieves a theme within the specified realm from IDM
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeIdentifier The id or name of the theme to retrieve
   */
  async function getTheme(realm = '/', themeIdentifier) {
    let decodedTheme = {};
    try {
      // Only query for all themes if we don't already have it stored in theme store
      if (themeStore.realmThemes[realm]) {
        decodedTheme = themeStore.realmThemes[realm]?.find((realmTheme) => realmTheme._id === themeIdentifier || realmTheme.name === themeIdentifier) || {};
      } else {
        const { data: themes } = await getThemes();
        if (themes.backgroundColor) {
          // This is an original theme where there is only a single theme
          decodedTheme = themes;
        } else {
          // themes are stored in an object with realm keys
          themeStore.realmThemes = decodeThemes(themes).realm;
          decodedTheme = themeStore.realmThemes[realm]?.find((realmTheme) => realmTheme._id === themeIdentifier || realmTheme.name === themeIdentifier) || {};
        }
      }
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingTheme'));
      throw error;
    }
    // Add in defaults for any missing values
    each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
      if (decodedTheme[key] === undefined) {
        decodedTheme[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
      }
    });
    if (!decodedTheme.journeyInputFocusBorderColor) {
      decodedTheme.journeyInputFocusBorderColor = decodedTheme.primaryColor;
    }
    if (!decodedTheme.accountCardInputFocusBorderColor) {
      decodedTheme.accountCardInputFocusBorderColor = decodedTheme.primaryColor;
    }
    return decodedTheme;
  }

  /**
   * Gets specified theme and saves it to store
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeId The id of the theme to get
   * @param {Boolean} queryByName Whether we need to query for theme by name
   * @param {Boolean} useStaticTheme Whether to use the static theme (FRaaS only)
   */
  async function loadTheme(realm = '/', themeId, queryByName = false, useStaticTheme) {
    let loadedTheme = {};
    themeStore.lastQueriedRealm = realm;
    if (useStaticTheme) {
      // Root realm on cloud tenants (Fraas) should always have static theme
      themeStore.theme = {
        logo: `${process.env.BASE_URL}images/ping-logo-square-color.svg`,
        logoHeight: 72,
        favicon: 'favicon.ico',
      };
      return;
    }
    if (!themeId) {
      // if no theme id is provided, use the realm's default theme
      if (!Object.keys(realmThemes.value).length) {
        // If we don't have themes, query for them
        await getAllThemes();
      }
      loadedTheme = realmThemes.value[realm]?.find((realmTheme) => realmTheme.isDefault) || {};
    } else {
      // If the theme is already loaded from the specified realm, don't query again
      if (themeId === theme.value._id && realm === lastQueriedRealm.value) {
        return;
      }
      loadedTheme = await getTheme(realm, themeId, queryByName) || {};
    }
    each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
      if (loadedTheme[key] === undefined) {
        loadedTheme[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
      }
    });
    // eslint-disable-next-line global-require
    const placeholderImage = require('@forgerock/platform-shared/src/assets/images/placeholder.svg');
    loadedTheme.logo = loadedTheme.logo || placeholderImage;

    themeStore.theme = loadedTheme;
  }

  /**
   * Retrieves the trees linked to a theme
   * @returns {Array} Array of tree ids linked to the theme
   */
  async function getTreesLinkedToTheme() {
    theme.value.linkedTrees = theme.value.linkedTrees.filter((linkedTree) => this.linkedTreesOptions.find((option) => option.value === linkedTree));
    return theme.value.linkedTrees;
  }

  /**
   * Saves a theme into themerealm endpoint
   * @param {String} realm The realm that the theme is located in
   * @param {Object} themeData Data of theme to save
   */
  async function saveTheme(realm, themeData) {
    const themeToSave = cloneDeep(themeData);
    // Add in defaults for any missing values
    each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
      if (themeToSave[key] === undefined) {
        themeToSave[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
      }
    });
    try {
      // Get all themes, update the one that matches the id, and save all themes
      const { data: themes } = await getThemes();
      const decodedThemes = decodeThemes(themes);
      const themeIndex = decodedThemes.realm[realm].findIndex((decodedTheme) => {
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
        decodedThemes.realm[realm].push(themeToSave);
      } else {
        decodedThemes.realm[realm][themeIndex] = themeToSave;
        // if new tree was linked to this theme, we need to remove that tree from other themes
        decodedThemes.realm[realm].forEach((decodedTheme, index) => {
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
      await saveThemes(encodeThemes(decodedThemes));
      themeStore.realmThemes = decodedThemes.realm;
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
    const themeToSave = await getTheme(realm, themeId);
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
    const themeToSave = await getTheme(realm, themeId);
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
      const { data: themes } = await getThemes();
      const decodedThemes = decodeThemes(themes);
      // Remove isDefault from any other themes
      const currentDefaultTheme = decodedThemes.realm[realm].find((realmTheme) => realmTheme.isDefault === true);
      if (currentDefaultTheme) {
        currentDefaultTheme.isDefault = false;
      }
      const themeIndex = decodedThemes.realm[realm].findIndex((decodedTheme) => decodedTheme._id === themeIdentifier || decodedTheme.name === themeIdentifier);
      decodedThemes.realm[realm][themeIndex].isDefault = true;
      await saveThemes(encodeThemes(decodedThemes));
      themeStore.realmThemes = decodedThemes.realm;
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
    getAllThemes,
    getTheme,
    getTreesLinkedToTheme,
    getTreeTheme,
    loadTheme,
    localizedFavicon,
    realmThemes,
    removeTreeTheme,
    saveTheme,
    setThemeAsDefault,
    theme,
  };
}
