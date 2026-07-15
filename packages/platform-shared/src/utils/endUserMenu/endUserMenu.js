/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  END_USER_MENU_CONSTANTS,
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
  checkIfAlphaRolesShouldBeHidden,
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
 * @param {boolean} [params.exactList=false] - When true, treat configuredMenuItems as the complete
 *   set and do not append privileged managed objects that are absent from the list. Use when menu
 *   items come from a Navigation Profile policy rather than a theme (which is additive by default).
 * @param {boolean} [params.hideAlphaUsersMenuItem=false] - Flag to hide the alpha users menu item.
 * @param {boolean} [params.isEndUserUI=false] - Flag indicating if the menu is for the end user UI or admin UI.
 * @param {Array<Object>} [params.privileges=[]] - An array of user privilege objects.
 * @param {Object} [params.store={}] - The store context used to load menu items.
 * @returns {Array<Object>} The processed array of menu items, ready for rendering in the UI.
 */
export function generateEndUserMenuItems({
  configuredMenuItems = [],
  exactList = false,
  hideAlphaUsersMenuItem = false,
  hideAlphaRolesMenuItem = false,
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

  // When exactList is true the nav profile defines the complete set — do not append
  // managed objects the user has privileges for but didn't explicitly configure.
  if (!exactList) {
    const configuredMenuIdMap = new Map(configuredMenuItems.map((item) => [item.id, item]));
    // Register group sub-item IDs so managed objects consumed inside a group
    // are not also appended at the top level by the privilege-append logic.
    configuredMenuItems.forEach((item) => {
      if (item.id === END_USER_MENU_CONSTANTS.GROUP && item.subItems?.length) {
        item.subItems.forEach((sub) => configuredMenuIdMap.set(sub.id, sub));
      }
    });
    const privilegedMenuItems = privileges
      ?.sort((p1, p2) => p1.title.localeCompare(p2.title))
      .map((privilege) => {
        const privilegeMenuId = createPrivilegeMenuId(privilege);
        if (!configuredMenuIdMap.has(privilegeMenuId)) {
          return createManagedObjectMenuItem(privilege, hideAlphaUsersMenuItem);
        }
        return undefined;
      })?.filter(Boolean) || [];

    configuredMenuItems.push(...privilegedMenuItems);
  }

  return configuredMenuItems.map((menuItem) => {
    if (menuItem.disabled) {
      // If the menu item is disabled, skip processing it
      return undefined;
    }
    // Handle Special Menu Item Types First
    if (menuItem.id === END_USER_MENU_CONSTANTS.DIVIDER) {
      return { ...DIVIDER_MENU_ITEM };
    }

    if (menuItem.id === END_USER_MENU_CONSTANTS.CUSTOM) {
      return {
        displayName: getLocaleBasedMenuItemLabel(menuItem.label, menuItem.labelKey),
        icon: menuItem.icon,
        id: menuItem.id,
        isNav: true, // Custom links are also nav items
        url: isEndUserUI ? menuItem.url : '', // URL only if it's the end user UI to avoid any navigation in admin UI
      };
    }

    // Handle GROUP menu items — render with privilege-gated, ordered sub-items.
    // In the end-user UI each sub-item is vetted:
    //   - Dividers pass through.
    //   - Custom links use stored url.
    //   - Items in privilegesMap are shown with a derived routeTo.
    //   - All other items are omitted (managed objects require a privilege).
    // The group itself is omitted if no sub-items survive filtering.
    if (menuItem.id === END_USER_MENU_CONSTANTS.GROUP) {
      const groupSubItems = (menuItem.subItems || []).map((subItem) => {
        if (subItem.id === END_USER_MENU_CONSTANTS.DIVIDER) {
          return { ...DIVIDER_MENU_ITEM };
        }
        if (subItem.id === END_USER_MENU_CONSTANTS.CUSTOM) {
          return {
            id: subItem.id,
            displayName: getLocaleBasedMenuItemLabel(subItem.label, subItem.labelKey),
            icon: subItem.icon || subItem.id,
            url: isEndUserUI ? subItem.url : '',
          };
        }
        // In the end-user UI, use privilegesMap as the authoritative source.
        // A sub-item is only shown if either:
        //   (a) the user has a matching privilege for it (managed object), or
        //   (b) it is NOT a managed object and has a stored routeTo (e.g. dashboard, profile)
        if (isEndUserUI) {
          const privilege = privilegesMap.get(subItem.id);
          if (privilege) {
            if (checkIfAlphaUsersShouldBeHidden(subItem, hideAlphaUsersMenuItem)
              || checkIfAlphaRolesShouldBeHidden(subItem, hideAlphaRolesMenuItem)) {
              return null;
            }
            return {
              id: subItem.id,
              displayName: getLocaleBasedMenuItemLabel(subItem.label, subItem.labelKey),
              icon: subItem.icon || subItem.id,
              routeTo: createMenuRouteObject({ ...subItem, isManagedObject: true })?.routeTo,
            };
          }
          // Managed-object sub-items always require a privilege — omit even if routeTo is stored
          if (subItem.isManagedObject) {
            return null;
          }
          // Non-managed-object sub-item without a privilege match: keep only if it has a route
          if (!subItem.routeTo) {
            return null;
          }
          return {
            id: subItem.id,
            displayName: getLocaleBasedMenuItemLabel(subItem.label, subItem.labelKey),
            icon: subItem.icon || subItem.id,
            routeTo: subItem.routeTo,
          };
        }
        // Admin UI — show as-is
        return {
          id: subItem.id,
          displayName: getLocaleBasedMenuItemLabel(subItem.label, subItem.labelKey),
          icon: subItem.icon || subItem.id,
        };
      }).filter((subItem) => subItem?.id);
      if (isEndUserUI && !groupSubItems.length) {
        return null;
      }
      return {
        displayName: getLocaleBasedMenuItemLabel(menuItem.label, menuItem.labelKey),
        icon: menuItem.icon,
        id: menuItem.id,
        isGroup: true,
        isNav: true,
        subItems: groupSubItems,
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

    if (menuItem.id === 'accessModeling') {
      if (!flags.govRoleMining) {
        return undefined; // Skip Access Modeling menu item if govRoleMining is not enabled
      }
    }

    if (menuItem.id === 'myAccess') {
      finalSubItems = finalSubItems.filter((subItem) => subItem.id !== 'agents' || flags.governanceAgentsEnabled);
    }
    // handle enduser ui specific processing
    let routeObject = {};
    let managedObjectInfo = { isManagedObject: menuItem.isManagedObject };
    let badgeInfo = {};
    if (isEndUserUI) {
      // reject current menu item if it is a managed object and not part of the user privileges
      if (menuItem.isManagedObject) {
        if (!privilegesMap.has(menuItem.id) || checkIfAlphaUsersShouldBeHidden(menuItem, hideAlphaUsersMenuItem) || checkIfAlphaRolesShouldBeHidden(menuItem, hideAlphaRolesMenuItem)) {
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
 * @param {boolean} [exactList=false] - When true, treat themeMenuItems as the complete set and
 *   do not append items from allEndUserMenuItems that are absent from the theme list. Used when
 *   menu items come from a policy (per-group nav) rather than a theme (which is additive by default).
 * @returns {Array} The constructed menu items.
 */
export function buildMenuItemsFromTheme(themeMenuItems = [], allEndUserMenuItems = [], exactList = false) {
  const allMenuIdsMap = new Map(allEndUserMenuItems.map((item) => [item.id, item]));
  const visitedMenuIds = new Set();
  const menuItemsBuilt = themeMenuItems.map((menuItem) => {
    // Track visited menu IDs to avoid duplicates
    visitedMenuIds.add(menuItem.id);

    // update latest label translation from allEndUserMenuItems
    const matchingItem = allMenuIdsMap.get(menuItem.id);
    const noLabels = !menuItem.label || Object.keys(menuItem.label).length === 0;
    if (matchingItem && noLabels) {
      menuItem.label = matchingItem.label;
    }

    // invalidate unknown menu items
    const isUnknownMenuItem = !menuItem.isManagedObject
      && !allMenuIdsMap.has(menuItem.id)
      && ![END_USER_MENU_CONSTANTS.CUSTOM, END_USER_MENU_CONSTANTS.DIVIDER, END_USER_MENU_CONSTANTS.GROUP].includes(menuItem.id);
    if (isUnknownMenuItem) {
      return undefined;
    }

    return menuItem;
  }).filter(Boolean); // Filter out any undefined items

  // When exactList is true the configured items are treated as the complete set — no additions
  if (exactList) {
    return menuItemsBuilt;
  }

  // Consider menu items that were not visited, not disabled nor part of theme.endUserMenuItems or added newly
  const newMenuItems = allEndUserMenuItems.filter((menuItem) => !visitedMenuIds.has(menuItem.id) && !menuItem.disabled);
  if (newMenuItems.every((item) => item.id === END_USER_MENU_CONSTANTS.DIVIDER)) {
    // If all new items are dividers, we don't need to add them
    return menuItemsBuilt;
  }

  return [...menuItemsBuilt, ...newMenuItems];
}
