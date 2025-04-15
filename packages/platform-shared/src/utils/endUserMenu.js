/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DEFAULT_MENU_ITEMS, DIVIDER_MENU_ITEM } from '@forgerock/platform-shared/src/constants/endUserMenuConstants';
import { fetchManagedObjectsAsMenuItems } from '@forgerock/platform-shared/src/utils/managedObjectsAsMenu';
import { filterAvailableEndUserMenuItems } from '@forgerock/platform-shared/src/utils/endUserMenuFilter';
import { getTranslation } from '@forgerock/platform-shared/src/utils/translations';
import i18n from '@/i18n';

// local constant strings to avoid any repetition
const CONSTANTS = {
  CUSTOM: 'custom',
  DIVIDER: 'divider',
  MENU_ITEM_LABEL_LOCALE_PREFIX: 'sideMenu.endUser.',
};

// Cache for available end user menu items to avoid recomputation
let availableEndUserMenuItemsCached = [];

/**
 * Find translation key for a given menu item.
 * If menu item is a managed object, it uses the label to look for its translation key existence.
 * Otherwise, it constructs a translation key using the menu item's id with a prefix of sideMenu.endUser.
 *
 * @param {Object} menuItem - The menu item object to find the translation key for.
 * @returns {string} The translation key for the menu item.
 */
function getMenuItemTranslationKey(menuItem) {
  return (menuItem.isManagedObject
    ? getTranslation(menuItem.label)
    : `${CONSTANTS.MENU_ITEM_LABEL_LOCALE_PREFIX}${menuItem.id}`);
}

/**
 * Generates menu item objects with minimal and basic needed properties for it to be saved into theme object.
 * This is used to render the menu items in the UI.
 * - If the item is a divider, returns as is.
 * - Otherwise, constructs a new object with required properties:
 *   - id: The unique identifier of the menu item.
 *   - icon: The icon associated with the menu item.
 *   - labelKey: The key used for localization.
 *   - label: The display label, either from the item or translated using i18n.
 *   - selectedSubItems: (optional) Array of selected sub-item IDs, if subItems exist.
 *   - isManagedObject: (optional) Indicates if the item is a managed object.
 *   - url: (optional) The URL associated with the menu item.
 *
 * @param {Object} item - The menu item object to process.
 * @returns {Object} The minimal menu item object to add in the theme.
 */
export function generateMinimalMenuItemForTheme(item) {
  if (item.id === CONSTANTS.DIVIDER) {
    return { ...item }; // return the divider menu item as is
  }

  // helper function to create a menu item object with basic properties
  const menuFactory = (menuItem) => ({
    id: menuItem.id,
    icon: menuItem.icon,
    labelKey: menuItem.labelKey,
    label: menuItem.label || i18n.global.t(menuItem.labelKey),
  });

  const menuObject = menuFactory(item);
  if (item.subItems?.length) {
    menuObject.selectedSubItems = item.selectedSubItems || item.subItems.map((subItem) => subItem.id);
    menuObject.subItems = item.subItems.map((subItem) => menuFactory(subItem));
  }

  // Keep isManagedObject and url only if they exist
  // This is to ensure that we don't add unnecessary properties to the theme object
  if (item?.isManagedObject) {
    menuObject.isManagedObject = item.isManagedObject;
  }

  if (item?.url) {
    menuObject.url = item.url;
  }

  return menuObject;
}

/**
 * Populates the `subItems` property of a menu item with additional fields such as `icon`, `labelKey`, and `label`.
 * Also initializes the `selectedSubItems` property if it is not already set.
 *
 * @param {Object} menuItem - The menu item object to populate.
 * @param {Array<Object>} [menuItem.subItems] - The sub-items of the menu item.
 * @param {Array<string>} [menuItem.selectedSubItems] - The IDs of selected sub-items.
 * @returns {Object} The updated menu item with populated sub-items and selected sub-items.
 */
function populateSubItems(menuItem) {
  if (!menuItem.subItems || !menuItem.subItems.length) {
    return menuItem;
  }

  menuItem.subItems = menuItem.subItems.map((subItem) => {
    const subItemLabelKey = getMenuItemTranslationKey(subItem);
    return {
      id: subItem.id,
      icon: subItem.icon || subItem.id, // Fallback to id if no icon
      labelKey: subItemLabelKey,
      label: subItem.label || i18n.global.t(subItemLabelKey),
    };
  });

  // Initialize selectedSubItems if not already set. Defaults to all subItem IDs.
  menuItem.selectedSubItems = menuItem.selectedSubItems || menuItem.subItems.map((subItem) => subItem.id);
  return menuItem;
}

/**
 * Normalizes list of menu items for use in the Admin UI.
 * Enhances each menu item with a translation key, ensures an icon is set,
 * and populates sub-items.
 *
 * @param {Array<Object>} menuItems - The array of menu item objects to normalize.
 * @returns {Array<Object>} The normalized array of menu item objects, each with required properties.
 */
export function normalizeMenuItemsForAdminUI(menuItems) {
  return menuItems.map((item) => {
    const labelKey = getMenuItemTranslationKey(item);
    const menuItem = {
      ...item,
      id: item.id,
      icon: item.icon || item.id, // Fallback to id if no icon
      labelKey,
      label: item.label || i18n.global.t(labelKey),
    };

    return populateSubItems(menuItem);
  });
}

/**
 * Returns a new array containing unique menu items from the provided array.
 * Menu items are considered unique based on their `id` property, except for items with
 * an `id` of 'divider' or 'custom', which are allowed to be duplicated.
 *
 * @param {Array<{id: string, [key: string]: any}>} menuItems - The array of menu item objects to filter.
 * @returns {Array<Object>} An array of unique menu item objects.
 */
export function getUniqueMenuItems(menuItems = []) {
  const uniqueMenuItems = [];
  const seenMenuIds = new Set();

  menuItems.forEach((menuItem) => {
    if (menuItem.id === CONSTANTS.DIVIDER || menuItem.id === CONSTANTS.CUSTOM) {
      // Allow duplicates for 'divider' and 'custom' menu items
      uniqueMenuItems.push(menuItem);
      return;
    }

    if (!seenMenuIds.has(menuItem.id)) {
      seenMenuIds.add(menuItem.id);
      uniqueMenuItems.push(menuItem);
    }
  });

  return uniqueMenuItems;
}

/**
 * Generates a set of feature flags based on the provided store's state.
 * Governance menu items are only available in the alpha realm under governance environment.
 *
 * @param {Object} store - The Vuex store object containing application state.
 * @returns {Object} An object containing feature flags for filtering end user menu items.
 *
 */
function generateFeatureFlags(store) {
  if (!store || !store.state) {
    return [];
  }

  const {
    govLcmEnabled,
    govLcmUser,
    govLcmEntitlement,
    realm,
    SharedStore,
  } = store.state;

  const {
    autoAccessEnabled,
    autoReportsEnabled,
    governanceEnabled,
    workforceEnabled,
  } = SharedStore;

  const ifGovernance = governanceEnabled && realm === 'alpha'; // governance menu items are only available in alpha realm

  // flag object which contains all the specific flags for filtering the enduser menu items
  return {
    autoAccessEnabled,
    autoReportsEnabled,
    govLcmEnabled,
    govLcmEntitlement,
    govLcmUser,
    ifGovernance,
    realm,
    workforceEnabled,
  };
}

/**
 * Retrieves and normalizes all end user menu items based on user privileges/ managed objects and store context.
 *
 * @async
 * @function getAllEndUserMenuItems
 * @param {Object} [options={}] - The parameters object.
 * @param {Array} [options.privileges=[]] - An array of user privilege objects.
 * @param {Object} [options.store={}] - The store context used to load menu items.
 * @returns {Promise<Array>} A promise that resolves to an array of normalized, unique menu items for the admin UI.
 */
export async function getAllEndUserMenuItems({ privileges = [], store = {} } = {}) {
  // If menuItem has been not computed yet, compute it for once
  if (!availableEndUserMenuItemsCached?.length) {
    const flags = generateFeatureFlags(store);
    availableEndUserMenuItemsCached = await filterAvailableEndUserMenuItems(DEFAULT_MENU_ITEMS, flags);
  }

  // If no privileges are provided, fetch managed objects as menu items
  // Otherwise, use the provided privileges directly to be the managed objects
  const managedObjects = Array.isArray(privileges) && privileges.length
    ? privileges
    : await fetchManagedObjectsAsMenuItems(store);

  // managed objects to be at the end of the menu items
  const menuItems = availableEndUserMenuItemsCached.concat(managedObjects);

  // Remove duplicates based on id
  const uniqueMenuItems = getUniqueMenuItems(menuItems);
  return normalizeMenuItemsForAdminUI(uniqueMenuItems);
}

/**
 * Generates a list of actual menu items for the end user menu to render them, processing custom, divider, and regular menu items,
 * and handling sub-items and UI-specific properties.
 *
 * @param {Object} params - The parameters object.
 * @param {Array<Object>} [params.configuredMenuItems=[]] - The array of configured menu item objects.
 * @param {boolean} [params.isEndUserUI=false] - Flag indicating if the menu is for the end user UI or admin UI.
 * @returns {Array<Object>} The processed array of menu items, ready for rendering in the UI.
 */
export function generateEndUserMenuItems({ configuredMenuItems = [], isEndUserUI = false }) {
  // Helper function to process sub-items
  const processSubItem = (subItem) => ({
    id: subItem.id,
    displayName: subItem.label || `${CONSTANTS.MENU_ITEM_LABEL_LOCALE_PREFIX}${subItem.id}`,
    ...(isEndUserUI ? { routeTo: subItem.routeTo } : {}),
  });

  return configuredMenuItems.map((menuItem) => {
    // Handle Special Menu Item Types First
    if (menuItem.id === CONSTANTS.DIVIDER) {
      return { ...DIVIDER_MENU_ITEM };
    }

    if (menuItem.id === CONSTANTS.CUSTOM) {
      return {
        displayName: menuItem.label || getMenuItemTranslationKey(menuItem),
        icon: menuItem.icon,
        id: menuItem.id,
        isNav: true, // Custom links are also nav items
        url: isEndUserUI ? menuItem.url : '', // URL only if it's the end user UI to avoid any navigation in admin UI
      };
    }

    // --- Process Regular Menu Items ---
    let finalSubItems;

    if (menuItem.selectedSubItems?.length) {
      // If selectedSubItems exist, map them to actual subItem objects first
      // and filter out any IDs that don't match a subItem
      const actualSelectedSubItems = menuItem.selectedSubItems
        .map((itemId) => menuItem.subItems?.find((sub) => sub.id === itemId))
        .filter(Boolean);

      finalSubItems = actualSelectedSubItems.length > 0
        ? actualSelectedSubItems.map(processSubItem)
        : undefined; // no matching subitems found
    } else if (menuItem.subItems?.length) {
      // If no selectedSubItems, but regular subItems exist
      finalSubItems = menuItem.subItems.map(processSubItem);
    }

    return {
      displayName: menuItem.label || getMenuItemTranslationKey(menuItem),
      icon: menuItem.icon || menuItem.id, // Fallback to id if no icon
      id: menuItem.id,
      isNav: true,
      // routeTo is only included if it's the end user UI AND it is not a parent menu item
      ...(isEndUserUI && !finalSubItems ? { routeTo: menuItem.routeTo } : {}),
      subItems: finalSubItems,
      ...(isEndUserUI ? {} : { isManagedObject: menuItem.isManagedObject }),
    };
  });
}
