/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  CONSTANTS,
  DEFAULT_MENU_ITEMS,
  DIVIDER_MENU_ITEM,
  LCM_SUBITEMS_ID_FLAG_MAP,
} from '@forgerock/platform-shared/src/constants/endUserMenuConstants';
import { fetchManagedObjectsAsMenuItems } from './managedObjectsAsMenu';
import { generateFeatureFlags } from './menuFeatureFlags';
import { filterAvailableEndUserMenuItems } from './menuFilter';
import { getLocaleBasedMenuItemLabel, updateMenuItemsWithTranslations } from './menuItemTranslations';
import {
  checkIfAlphaUsersShouldBeHidden,
  createManagedObjectMenuItem,
  createMenuRouteObject,
  createPrivilegeMenuId,
  getMenuBadgeInfo,
  getUniqueMenuItems,
  normalizeMenuItems,
} from './menuItemUtils';

/**
 * Retrieves and normalizes all end user menu items based on user privileges/ managed objects and store context.
 *
 * @async
 * @function getAllEndUserMenuItems
 * @param {Object} [options={}] - The parameters object.
 * @param {Object} [options.store={}] - The store context used to load menu items.
 * @param {boolean} [options.getTranslations = false] - Whether to fetch translations for menu items.
 * @returns {Promise<Array>} A promise that resolves to an array of normalized, unique menu items for the admin UI.
 */
export async function getAllEndUserMenuItems({ store = {}, getTranslations = false } = {}) {
  let availableEndUserMenuItems = [];
  let flags = {};
  try {
    flags = generateFeatureFlags(store);
    availableEndUserMenuItems = await filterAvailableEndUserMenuItems(DEFAULT_MENU_ITEMS, flags);
  } catch (error) {
    // Nothing to handle here,
  }
  // fetch managed objects to be used as menu items
  const managedObjects = await fetchManagedObjectsAsMenuItems(store);
  // process translations for menu items
  if (getTranslations) {
    try {
      await updateMenuItemsWithTranslations(availableEndUserMenuItems, managedObjects);
    } catch (error) {
      // Nothing to handle here,
    }
  }
  // managed objects to be at the end of the menu items
  const menuItems = availableEndUserMenuItems.concat(managedObjects);

  // Remove duplicates based on id
  const uniqueMenuItems = getUniqueMenuItems(menuItems);
  return normalizeMenuItems(uniqueMenuItems);
}

/**
 * Generates a list of actual menu items for the end user menu to render them, processing custom, divider, and regular menu items,
 * and handling sub-items and UI-specific properties.
 *
 * @param {Object} params - The parameters object.
 * @param {Array<Object>} [params.configuredMenuItems=[]] - The array of configured menu item objects.
 * @param {boolean} [params.hideAlphaUsersMenuItem=false] - Flag to hide the alpha users menu item.
 * @param {boolean} [params.isEndUserUI=false] - Flag indicating if the menu is for the end user UI or admin UI.
 * @param {Array<Object>} [params.privileges=[]] - An array of user privilege objects.
 * @param {Object} [options.store={}] - The store context used to load menu items.
 * @returns {Array<Object>} The processed array of menu items, ready for rendering in the UI.
 */
export function generateEndUserMenuItems({
  configuredMenuItems = [],
  hideAlphaUsersMenuItem = false,
  isEndUserUI = false,
  privileges = [],
  store = {},
}) {
  // Helper function to process sub-items
  const processSubItemForEndUser = (subItem) => ({
    id: subItem.id,
    displayName: getLocaleBasedMenuItemLabel(subItem.label, subItem.labelKey),
    ...(isEndUserUI ? { routeTo: subItem.routeTo } : {}),
  });

  const privilegesMap = new Map();
  if (Array.isArray(privileges)) {
    privileges.forEach((privilege) => {
      const menuId = createPrivilegeMenuId(privilege);
      privilegesMap.set(menuId, privilege);
    });
  }

  let allEndUserMenuItemsMap;
  const flags = generateFeatureFlags(store);

  // Include those privileged menu items which are not part of configuredMenuItems
  const configuredMenuIds = new Map(configuredMenuItems.map((item) => [item.id, item]));
  const privilegedMenuItems = privileges
    ?.sort((p1, p2) => p1.title.localeCompare(p2.title)) // sort privileges by title
    .map((privilege) => {
      const menuId = createPrivilegeMenuId(privilege);
      if (!configuredMenuIds.has(menuId)) {
        return createManagedObjectMenuItem(privilege, hideAlphaUsersMenuItem);
      }
      return undefined; // Already consumed or not valid
    })?.filter(Boolean) || []; // Filter out undefined

  // Append privileged menu items at the bottom of the list
  configuredMenuItems.push(...privilegedMenuItems);

  return configuredMenuItems.map((menuItem) => {
    if (menuItem.disabled) {
      // If the menu item is disabled, skip processing it
      return undefined;
    }
    // Handle Special Menu Item Types First
    if (menuItem.id === CONSTANTS.DIVIDER) {
      return { ...DIVIDER_MENU_ITEM };
    }

    if (menuItem.id === CONSTANTS.CUSTOM) {
      return {
        displayName: getLocaleBasedMenuItemLabel(menuItem.label, menuItem.labelKey),
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
        ? actualSelectedSubItems.map(processSubItemForEndUser)
        : undefined; // no matching subitems found
    } else if (menuItem.subItems?.length) {
      // If no selectedSubItems, but regular subItems exist
      finalSubItems = menuItem.subItems.map(processSubItemForEndUser);
    }

    // handle LCM menu item according to the feature flags
    if (menuItem.id === 'lcm') {
      if (!flags.ifGovernance) {
        return undefined; // Skip LCM menu item if governance is not enabled
      }

      // If LCM menu item is present, ensure it has eligible subItems populated
      finalSubItems = finalSubItems.filter((subItem) => {
        const flag = LCM_SUBITEMS_ID_FLAG_MAP[subItem.id];
        return flags[flag]; // Only include subItems if the corresponding flag is true
      });

      // Skip LCM menu item if no eligible subItems are found
      if (finalSubItems.length === 0) {
        return undefined;
      }
    }

    // handle enduser ui specific processing
    let routeObject = {};
    let managedObjectInfo = { isManagedObject: menuItem.isManagedObject };
    let badgeInfo = {};
    if (isEndUserUI) {
      // reject current menu item if it is a managed object and not part of the user privileges
      if (menuItem.isManagedObject) {
        if (!privilegesMap.has(menuItem.id) || checkIfAlphaUsersShouldBeHidden(menuItem, hideAlphaUsersMenuItem)) {
          return undefined;
        }
      }

      if (!allEndUserMenuItemsMap) {
        // Initialize the map of all end user menu items only once
        allEndUserMenuItemsMap = new Map(DEFAULT_MENU_ITEMS.map((item) => [item.id, item]));
      }

      const rawMenuItem = allEndUserMenuItemsMap.get(menuItem.id);
      routeObject = createMenuRouteObject(menuItem, rawMenuItem);
      badgeInfo = getMenuBadgeInfo(rawMenuItem);
      if (finalSubItems?.length) {
        // If subItems exist, ensure they have the necessary properties
        const rawSubItemsMap = new Map(rawMenuItem.subItems.map((subItem) => [subItem.id, subItem]));
        finalSubItems = finalSubItems.map((subItem) => {
          const rawSubMenuItem = rawSubItemsMap.get(subItem.id);
          const subMenuBadgeInfo = getMenuBadgeInfo(rawSubMenuItem);
          return {
            ...subItem,
            ...subMenuBadgeInfo,
            routeTo: (rawMenuItem && Array.isArray(rawMenuItem.subItems))
              ? rawSubMenuItem?.routeTo
              : undefined,
          };
        });
      }

      // no need of isManagedObject in end user UI
      managedObjectInfo = {};
    }

    // Return the final menu item object with all necessary properties
    return {
      // If no icon is provided, fallback to using the menu item's id as the icon name.
      // Note: This assumes that the menuItem.id corresponds to a valid icon name in your icon set.
      icon: menuItem.icon || menuItem.id,
      displayName: getLocaleBasedMenuItemLabel(menuItem.label, menuItem.labelKey),
      id: menuItem.id,
      isNav: true,
      subItems: finalSubItems,
      ...routeObject,
      ...managedObjectInfo,
      ...badgeInfo,
    };
  }).filter(Boolean); // Filter out any undefined items
}

/**
 * Builds menu items from the provided theme and all end user menu items.
 *
 * @param {Array} themeMenuItems - The menu items from the theme.
 * @param {Array} allEndUserMenuItems - All available end user menu items.
 * @returns {Array} The constructed menu items.
 */
export function buildMenuItemsFromTheme(themeMenuItems = [], allEndUserMenuItems = []) {
  const allMenuIdsMap = new Map(allEndUserMenuItems.map((item) => [item.id, item]));
  const visitedMenuIds = new Set();
  const menuItemsBuilt = themeMenuItems.map((menuItem) => {
    // Process each menu item as needed
    visitedMenuIds.add(menuItem.id);

    if (menuItem.disabled) {
      // If the menu item is disabled, skip processing it
      return undefined;
    }

    // update latest label translation from allEndUserMenuItems
    const matchingItem = allMenuIdsMap.get(menuItem.id);
    if (matchingItem) {
      menuItem.label = matchingItem.label;
    }

    // invalidate unknown menu items
    const isUnknownMenuItem = !menuItem.isManagedObject
      && !allMenuIdsMap.has(menuItem.id)
      && ![CONSTANTS.CUSTOM, CONSTANTS.DIVIDER].includes(menuItem.id);
    if (isUnknownMenuItem) {
      return undefined;
    }

    return menuItem;
  }).filter(Boolean); // Filter out any undefined items

  // Consider menu items that were not visited, not disabled nor part of theme.endUserMenuItems
  allEndUserMenuItems.forEach((menuItem) => {
    if (!visitedMenuIds.has(menuItem.id)) {
      menuItemsBuilt.push(menuItem);
    }
  });

  return menuItemsBuilt;
}
