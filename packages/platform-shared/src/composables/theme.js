/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep, each, pickBy } from 'lodash';
import { computed, watch } from 'vue';
import uuid from 'uuid/v4';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
import {
  deleteRealmTheme,
  getRealmThemes,
  getRealmThemeByName,
  getRealmTheme,
  getThemeMetadata,
  getLegacyThemes,
  saveRealmTheme,
  saveThemeConfig,
} from '@forgerock/platform-shared/src/api/ThemeApi';
import i18n from '@forgerock/platform-shared/src/i18n';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import themeConstants from '@forgerock/platform-shared/src/constants/themeConstants';
import { getLocalizedString } from '@forgerock/platform-shared/src/utils/translations';
import {
  deleteLegacyTheme,
  getLegacyTheme,
  saveLegacyTheme,
  setLegacyThemeAsDefault,
} from '../utils/legacyThemes';
import { decodeThemeScripts, encodeThemeScripts, getUniqueThemeId } from '../utils/themeUtils';

/**
 * Composable for integrating theme into views that will be used within
 * enduser and login, and theme data which is used in admin.
 */
export default function useTheme() {
  const themeStore = useThemeStore();
  const theme = computed(() => themeStore.theme || themeConstants.DEFAULT_THEME_PARAMS);
  const realmThemes = computed(() => themeStore.realmThemes);
  const isLegacyTheme = computed(() => themeStore.isLegacyTheme);
  const lastQueriedRealm = computed(() => themeStore.lastQueriedRealm);
  const themeConfig = computed(() => themeStore.themeConfig);
  const localizedFavicon = computed(() => getLocalizedString(theme.value.favicon, i18n.global.locale, i18n.global.fallbackLocale));

  /**
   * Gets all themes from current realm and sets them in the store
   * @param {String} realm Current realm
   * @param {Array} fields Fields to retrieve from the API
   */
  async function getAllThemes(realm = '/', fields = '*') {
    if (!isLegacyTheme.value) {
      try {
        const { data: { result: allThemes } } = await getRealmThemes(realm, fields.toString());
        if (allThemes?.length) {
          themeStore.realmThemes[realm] = allThemes;
        } else {
          themeStore.isLegacyTheme = true;
        }
      } catch (error) {
        showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingList'));
        throw error;
      }
    }
    if (isLegacyTheme.value) {
      try {
        const { data: legacyThemes } = await getLegacyThemes();
        themeStore.realmThemes = legacyThemes.realm;
      } catch (error) {
        showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingList'));
        throw error;
      }
    }
  }

  /**
   * Retrieves the theme config and sets it in the store
   */
  async function loadThemeConfig() {
    try {
      const { data } = await getThemeMetadata();
      themeStore.themeConfig = data;
      if (!data.defaultRealmThemeId) {
        themeStore.isLegacyTheme = true;
      }
    } catch (error) {
      themeStore.isLegacyTheme = true;
      showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingThemeConfig'));
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
      if (isLegacyTheme.value) {
        themeStore.realmThemes = await deleteLegacyTheme(realm, themeId, realmThemes.value);
      } else {
        await deleteRealmTheme(`ui/${encodeURIComponent(themeId.substring(3))}`);
        if (themeConfig.value.linkedTrees?.[realm]) {
          Object.entries(themeConfig.value.linkedTrees[realm]).forEach(([treeId, linkedTreeThemeId]) => {
            if (linkedTreeThemeId === themeId) {
              delete themeConfig.value.linkedTrees[realm][treeId];
            }
          });
          await saveThemeConfig(themeConfig.value);
        }
        realmThemes.value[realm] = realmThemes.value[realm].filter((realmTheme) => realmTheme._id !== themeId);
      }
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
    if (isLegacyTheme.value) {
      const linkedTree = realmThemes.value[realm].find((realmTheme) => realmTheme.linkedTrees.includes(treeId));
      return linkedTree?._id || '';
    }
    await loadThemeConfig();
    const treeThemeId = themeConfig.value.linkedTrees?.[realm]?.[treeId] || '';
    return treeThemeId;
  }

  /**
   * Retrieves a theme within the specified realm (or legacy theme if not found) from IDM
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeIdentifier The id or name of the theme to retrieve
   * @param {Boolean} queryByName Whether we need to query for theme by name
   */
  async function getTheme(realm = '/', themeIdentifier, queryByName = false) {
    let decodedTheme = {};
    if (themeIdentifier) {
      if (!isLegacyTheme.value) {
        try {
          let realmTheme;
          if (queryByName) {
            // When we only know the theme's name, we need to query using name rather than id
            const { data: { result: [returnedTheme] } } = await getRealmThemeByName(realm, themeIdentifier);
            realmTheme = returnedTheme;
          } else if (themeIdentifier.startsWith('ui/theme-')) {
            const { data } = await getRealmTheme(themeIdentifier);
            realmTheme = data;
          }

          // If we have a theme at this point, we know it is a modern (non-legacy theme)
          if (realmTheme) {
            decodedTheme = decodeThemeScripts(realmTheme);
          } else {
            themeStore.isLegacyTheme = true;
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // If not found, set isLegacyTheme to get legacy theme (using realm) instead
            themeStore.isLegacyTheme = true;
          } else {
            showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingTheme'));
            throw error;
          }
        }
      }
      if (isLegacyTheme.value) {
        try {
          decodedTheme = await getLegacyTheme(realm, themeIdentifier);
        } catch (error) {
          showErrorMessage(error, i18n.global.t('common.themes.errorRetrievingList'));
          throw error;
        }
      }
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
   * Gets specified theme (current or legacy) and saves it to store
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeId The id of the theme to get
   * @param {Boolean} queryByName Whether we need to query for theme by name
   * @param {Boolean} useStaticTheme Whether to use the static theme (FRaaS only)
   */
  async function loadTheme(realm = '/', themeId, queryByName = false, useStaticTheme) {
    let loadedTheme = {};
    themeStore.lastQueriedRealm = realm;
    let themeIdToLoad = themeId;
    if (useStaticTheme) {
      // Root realm on cloud tenants (Fraas) should always have static theme
      themeStore.theme = {
        logo: `${process.env.BASE_URL}images/ping-logo-square-color.svg`,
        logoHeight: 72,
        favicon: 'favicon.ico',
      };
      return;
    }
    if (!themeIdToLoad) {
      // if no theme id is provided, use the realm's default theme
      if (!themeConfig.value) {
        try {
          // ensure theme config is available for the case where we need to use default id
          await loadThemeConfig();
        } catch {
          // If we can't load the theme config, it should mean we are using legacy themes
        }
      }
      if (themeConfig.value?.defaultRealmThemeId) {
        // else use the default theme for the realm
        themeIdToLoad = themeConfig.value.defaultRealmThemeId[realm];
      } else {
        if (!Object.keys(realmThemes.value).length) {
          // If we don't have legacy themes, query for them
          await getAllThemes();
        }
        loadedTheme = realmThemes.value[realm]?.find((realmTheme) => realmTheme.isDefault);
      }
    }
    if (themeIdToLoad) {
      // If the theme is already loaded from the specified realm, don't query again
      if (themeIdToLoad === theme.value._id && realm === lastQueriedRealm.value) {
        return;
      }

      try {
        loadedTheme = await getTheme(realm, themeIdToLoad, queryByName);
      } finally {
        if (!loadedTheme) {
          loadedTheme = cloneDeep(themeConstants.DEFAULT_THEME_PARAMS);
        }
      }
    }
    // eslint-disable-next-line global-require
    const placeholderImage = require('@forgerock/platform-shared/src/assets/images/placeholder.svg');
    loadedTheme.logo = loadedTheme.logo || placeholderImage;

    themeStore.theme = loadedTheme;
  }

  /**
   * Retrieves the trees linked to a theme
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeId The id of the theme to get
   * @returns {Array} Array of tree ids linked to the theme
   */
  async function getTreesLinkedToTheme(realm, themeId) {
    if (isLegacyTheme.value) {
      theme.value.linkedTrees = theme.value.linkedTrees.filter((linkedTree) => this.linkedTreesOptions.find((option) => option.value === linkedTree));
      return theme.value.linkedTrees;
    }
    await loadThemeConfig();
    const linkedTreesOnRealm = themeConfig.value.linkedTrees?.[realm] || {};
    const linkedTreesObject = pickBy(linkedTreesOnRealm, (linkedTreeThemeId) => linkedTreeThemeId === themeId);
    return Object.keys(linkedTreesObject);
  }

  /**
   * Links theme to one or more trees
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeId The id of the theme to get
   * @param {Array} treeIds List of tree ids to link to the theme
   * @param {Boolean} fullClear Whether to remove all other themes from the trees before adding new themes
   */
  async function linkThemeToTrees(realm, themeId, treeIds, fullClear = false) {
    try {
      if (!themeConfig.value.linkedTrees) {
        themeConfig.value.linkedTrees = {};
      }
      if (!themeConfig.value.linkedTrees[realm]) {
        themeConfig.value.linkedTrees[realm] = {};
      }
      if (fullClear) {
        // Remove this theme from entire linkedTrees object
        Object.entries(themeConfig.value.linkedTrees[realm]).forEach(([treeId, linkedTreeThemeId]) => {
          if (linkedTreeThemeId === themeId) {
            delete themeConfig.value.linkedTrees[realm][treeId];
          }
        });
      } else {
        // Remove linked trees that were previously linked to the theme
        Object.keys(themeConfig.value.linkedTrees[realm]).forEach((treeId) => {
          if (treeIds.includes(treeId)) {
            delete themeConfig.value.linkedTrees[realm][treeId];
          }
        });
      }
      if (themeId) {
        treeIds.forEach((treeId) => {
          themeConfig.value.linkedTrees[realm][treeId] = themeId;
        });
      }
      await saveThemeConfig(themeConfig.value);
    } catch (error) {
      showErrorMessage(error, i18n.global.t('common.themes.errorLinkingTree'));
    }
  }

  /**
   * Saves a theme to either the legacy endpoint or the new config endpoint
   * @param {String} realm The realm that the theme is located in
   * @param {Object} themeData Data of theme to save
   * @param {Array} linkedTrees Trees to link to the theme
   * @param {Boolean} linkedTreesUpdated Whether the linked trees array has updated from the original theme
   * @param {Boolean} silentError Whether to show toast error message
   */
  async function saveTheme(realm, themeData, linkedTrees = [], linkedTreesUpdated, silentError = false) {
    const themeToSave = cloneDeep(themeData);
    // Add in defaults for any missing values
    each(themeConstants.DEFAULT_THEME_PARAMS, (value, key) => {
      if (themeToSave[key] === undefined) {
        themeToSave[key] = themeConstants.DEFAULT_THEME_PARAMS[key];
      }
    });
    if (isLegacyTheme.value) {
      try {
        await saveLegacyTheme(realm, themeToSave, linkedTrees);
      } catch (error) {
        showErrorMessage(error, i18n.global.t('common.themes.errorSavingTheme'));
        throw error;
      }
    } else {
      try {
        const encodedTheme = encodeThemeScripts(themeToSave);
        const { data } = await saveRealmTheme(themeToSave._id, encodedTheme);
        themeStore.theme = decodeThemeScripts(data);
        if (linkedTreesUpdated) {
          linkThemeToTrees(realm, themeToSave._id, linkedTrees, true);
        }
      } catch (error) {
        if (!silentError) {
          showErrorMessage(error, i18n.global.t('common.themes.errorSavingTheme'));
        }
        throw error;
      }
    }
  }

  /**
   * Adds a theme to a specific tree
   * @param {String} themeId The id of the theme to get
   * @param {String} treeId Id of tree to link to the theme
   * @param {String} realm The realm that the theme is located in
   */
  async function addTreeTheme(themeId, treeId, realm) {
    if (isLegacyTheme.value) {
      const themeToSave = await getTheme(realm, themeId);
      const linkedTrees = themeToSave.linkedTrees || [];
      // only continue if theme does not have treeId already
      if (!linkedTrees.includes(treeId)) {
        // add treeId to this theme
        linkedTrees.push(treeId);
        await saveTheme(realm, themeToSave, linkedTrees);
      }
    } else {
      linkThemeToTrees(realm, themeId, [treeId], false);
    }
  }

  /**
   * Removes a theme from a specific tree
   * @param {String} themeId The id of the theme to get
   * @param {String} treeId Id of tree to unlink from the theme
   * @param {String} realm The realm that the theme is located in
   */
  async function removeTreeTheme(themeId, treeId, realm) {
    if (isLegacyTheme.value) {
      const themeToSave = await getTheme(realm, themeId);
      const linkedTrees = themeToSave.linkedTrees.filter((tree) => tree !== treeId);
      await saveTheme(realm, themeToSave, linkedTrees, true);
    } else {
      linkThemeToTrees(realm, '', [treeId], false);
    }
  }

  /**
   * Sets a theme as the default realm theme to use as a fallback
   * @param {String} realm The realm that the theme is located in
   * @param {String} themeIdentifier The id of the theme to set as default (or name if id is not present)
   */
  async function setThemeAsDefault(realm, themeIdentifier) {
    if (isLegacyTheme.value) {
      try {
        await setLegacyThemeAsDefault(realm, themeIdentifier);
      } catch (error) {
        showErrorMessage(error, i18n.global.t('hostedPages.theme.errorSetDefault'));
        throw error;
      }
    } else {
      themeConfig.value.defaultRealmThemeId[realm] = themeIdentifier;
      try {
        await saveThemeConfig(themeConfig.value);
      } catch (error) {
        showErrorMessage(error, i18n.global.t('hostedPages.theme.errorSetDefault'));
        throw error;
      }
    }
  }

  /**
   * Determines if the id attempting to be used to save a theme is unique
   * @param {String} realm The realm that the theme is located in
   * @param {String} idToTest The id to test for uniqueness
   * @param {Number} additionalNumber Additional number to append to the id if needed for uniqueness
   * @returns {String} A unique id
   */
  async function getUniqueId(realm, idToTest) {
    if (isLegacyTheme.value) {
      return uuid();
    }
    return getUniqueThemeId(realm, idToTest);
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
    getUniqueId,
    isLegacyTheme,
    loadTheme,
    localizedFavicon,
    realmThemes,
    removeTreeTheme,
    saveTheme,
    setThemeAsDefault,
    loadThemeConfig,
    theme,
    themeConfig,
  };
}
