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
import {
  decodeThemes,
  encodeThemes,
  updateThemerealmObject,
  removeThemeIdFromLocalStorage,
} from '../utils/themeUtils';

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
   * Addes defaults to all themes and brings old formats to current format
   * @param {Object} themes Object containing all themes
   * @returns themes with defaults
   */
  function addDefaultsToAllThemes(themes) {
    Object.entries(themes.realm).forEach(([realm, realmThemeArray]) => {
      if (!realmThemeArray) { // Empty theme config
        const starterTheme = {
          ...themeConstants.DEFAULT_THEME_PARAMS, _id: uuid(), isDefault: true, name: 'Starter Theme',
        };
        themes.realm[realm] = [starterTheme];
      } else if (realmThemeArray.backgroundColor) {
        // This is an original theme where there is only a single theme per realm
        themes.realm[realm] = [{
          ...themeConstants.DEFAULT_THEME_PARAMS, ...realmThemeArray, _id: uuid(), isDefault: true, name: 'Starter Theme',
        }];
      }
      themes.realm[realm].forEach((individualTheme) => {
        if (!individualTheme._id) {
          individualTheme._id = uuid();
        }
        each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
          if (individualTheme[key] === undefined) {
            individualTheme[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
          }
        });
      });
    });
    return themes;
  }

  /**
   * Gets all themes and sets them in the store
   */
  async function getAllThemes() {
    try {
      const { data: themes } = await getThemes();
      themeStore.realmThemes = decodeThemes(addDefaultsToAllThemes(themes)).realm;
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
      const themesToSave = cloneDeep(realmThemes.value);
      const index = themesToSave[realm].findIndex((searchTheme) => searchTheme._id === themeId);
      themesToSave[realm].splice(index, 1);

      const { data: themes } = await saveThemes(encodeThemes({ _id: 'ui/themerealm', realm: themesToSave }));
      themeStore.realmThemes = themes.realm;
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
  async function getTreeTheme(realm = '/', treeId) {
    if (!realmThemes.value[realm]) {
      await getAllThemes();
    }
    const linkedTree = realmThemes.value[realm].find((realmTheme) => realmTheme.linkedTrees.includes(treeId));
    return linkedTree?._id || '';
  }

  /**
   * Retrieves a theme within the specified realm from IDM
   * if the theme is not found, it will return the default theme and remove the themeId from localStorage
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeIdentifier The id or name of the theme to retrieve
   */
  async function getTheme(realm = '/', themeIdentifier) {
    let decodedTheme = {};
    try {
      // Only query for all themes if we don't already have it stored in theme store
      if (!themeStore.realmThemes[realm]) {
        await getAllThemes();
      }
      decodedTheme = themeStore.realmThemes[realm]?.find((realmTheme) => realmTheme._id === themeIdentifier || realmTheme.name === themeIdentifier);
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingTheme'));
      throw error;
    }
    if (!decodedTheme) {
      removeThemeIdFromLocalStorage(themeIdentifier);
      // If we don't have a theme, set the default theme
      decodedTheme = themeStore.realmThemes[realm]?.find((realmTheme) => realmTheme.isDefault) ?? {};
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
   * Saves a theme into themerealm endpoint
   * @param {String} realm The realm that the theme is located in
   * @param {Object} themeData Data of theme to save
   */
  async function saveTheme(realm, themeData) {
    const themeToSave = cloneDeep(themeData);
    try {
      // Get all themes, update the one that matches the id, and save all themes
      if (!themeStore.realmThemes[realm]) {
        await getAllThemes();
      }
      const themes = { realm: themeStore.realmThemes };
      const decodedThemes = decodeThemes(themes);
      updateThemerealmObject(decodedThemes.realm, themeToSave, realm);
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
      if (!themeStore.realmThemes[realm]) {
        await getAllThemes();
      }
      const decodedThemes = { realm: themeStore.realmThemes };
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
