/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { END_USER_MENU_CONSTANTS, GROUP_MENU_ITEM } from '@forgerock/platform-shared/src/constants/endUserMenuConstants';
import i18n from '@/i18n';
import { getMenuItemTranslationKey } from './menuItemTranslations';
import { getTranslation } from '../translations';

/**
 * Populates the `subItems` property of a menu item.
 * Enriches each sub-item with `icon`, `labelKey`, and `label`.
 * For GROUP items, routing fields (`routeTo`, `isManagedObject`, `url`) are
 * preserved on sub-items so navigation works in the end-user UI.
 * Divider sub-items pass through unchanged.
 * `selectedSubItems` is initialized for non-group items only (group items use
 * the sub-item order directly).
 *
 * @param {Object} menuItem - The menu item whose sub-items should be populated.
 * @param {Array<Object>} [menuItem.subItems] - Raw sub-items to enrich.
 * @param {Array<string>} [menuItem.selectedSubItems] - Pre-selected sub-item IDs (non-group).
 * @param {boolean} [menuItem.isGroup] - When true, skips selectedSubItems initialization.
 * @returns {Object} The updated menu item.
 */
function populateSubItems(menuItem) {
  if (!menuItem.subItems || !menuItem.subItems.length) {
    return menuItem;
  }

  menuItem.subItems = menuItem.subItems.map((subItem) => {
    // Divider sub-items pass through unchanged
    if (subItem.id === END_USER_MENU_CONSTANTS.DIVIDER) {
      return { ...subItem };
    }

    const subItemLabelKey = getMenuItemTranslationKey(subItem);
    const populatedSubItem = {
      id: subItem.id,
      icon: subItem.icon || subItem.id, // Fallback to id if no icon
      labelKey: subItemLabelKey,
      label: subItem.label,
    };

    // For GROUP items, preserve routing and managed-object properties on sub-items
    if (menuItem.isGroup) {
      if (subItem.routeTo) populatedSubItem.routeTo = subItem.routeTo;
      if (subItem.isManagedObject) populatedSubItem.isManagedObject = subItem.isManagedObject;
      if (subItem.url) populatedSubItem.url = subItem.url;
    }

    return populatedSubItem;
  });

  // GROUP items don't use selectedSubItems (they contain managed objects directly)
  if (!menuItem.isGroup) {
    // Initialize selectedSubItems if not already set. Defaults to all subItem IDs.
    menuItem.selectedSubItems = menuItem.selectedSubItems || menuItem.subItems.map((subItem) => subItem.id);
  }
  return menuItem;
}

/**
 * Normalizes list of menu items with bare minimum properties.
 * Enhances each menu item with a translation key, ensures an icon is set,
 * and populates sub-items.
 *
 * @param {Array<Object>} menuItems - The array of menu item objects to normalize.
 * @returns {Array<Object>} The normalized array of menu item objects, each with required properties.
 */
export function normalizeMenuItems(menuItems) {
  return menuItems.map((item) => {
    const labelKey = item?.labelKey || getMenuItemTranslationKey(item);
    const menuItem = {
      ...item,
      icon: item.icon || item.id, // Fallback to id if no icon
      labelKey,
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
    if ([END_USER_MENU_CONSTANTS.DIVIDER, END_USER_MENU_CONSTANTS.CUSTOM, END_USER_MENU_CONSTANTS.GROUP].includes(menuItem.id)) {
      // Allow duplicates for 'divider', 'custom', and 'group' menu items
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
 *   For GROUP items, sub-items carry `routeTo`, `isManagedObject`, and `url` to enable
 *   navigation in the end-user UI.
 *
 * @param {Object} item - The menu item object to process.
 * @returns {Object} The minimal menu item object to add in the theme.
 */
export function generateMinimalMenuItemForTheme(item) {
  if (item.id === END_USER_MENU_CONSTANTS.DIVIDER) {
    return { ...item }; // return the divider menu item as is
  }

  // helper function to create a menu item object with basic properties
  const menuFactory = (menuItem) => ({
    id: menuItem.id,
    icon: menuItem.icon,
    labelKey: menuItem.labelKey,
    label: menuItem.label || i18n.global.t(menuItem.labelKey),
    ...(menuItem.disabled ? { disabled: true } : {}),
  });

  if (item.id === END_USER_MENU_CONSTANTS.GROUP) {
    // GROUP items get a minimal serialization that preserves sub-item routing/managed-object info
    return {
      id: END_USER_MENU_CONSTANTS.GROUP,
      isGroup: true,
      icon: item.icon || GROUP_MENU_ITEM.icon,
      label: item.label || {},
      labelKey: item.labelKey || '',
      subItems: (item.subItems || []).map((subItem) => {
        if (subItem.id === END_USER_MENU_CONSTANTS.DIVIDER) {
          return { ...subItem };
        }
        return {
          ...menuFactory(subItem),
          ...(subItem.isDivider ? { isDivider: true } : {}),
          ...(subItem.routeTo ? { routeTo: subItem.routeTo } : {}),
          ...(subItem.isManagedObject ? { isManagedObject: true } : {}),
          ...(subItem.url ? { url: subItem.url } : {}),
        };
      }),
    };
  }

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
 * Creates a route object for given menu item.
 *
 * @param {Object} menuItem - The menu item object to create a route for.
 * @param {Object} [sourceMenuItem] - The source menu item object to get
 * route info.
 * @return {Object} The route object with the routeTo property.
 */
export function createMenuRouteObject(menuItem, sourceMenuItem) {
  if (menuItem.isManagedObject) {
    let routeParamObject = {};
    if (menuItem.id === END_USER_MENU_CONSTANTS.INTERNAL_ROLE) {
      routeParamObject = { resourceType: 'internal', resourceName: 'role' };
    } else {
      routeParamObject = { resourceType: 'managed', resourceName: menuItem.id };
    }

    return {
      routeTo: {
        name: 'ListResource',
        params: routeParamObject,
      },
    };
  }

  if (!menuItem.subItems?.length) {
    return { routeTo: sourceMenuItem?.routeTo };
  }

  return {};
}

/**
 * Helper function to check if alpha users menu item should be hidden.
 * @param {Object} item - The menu item to check.
 * @param {Boolean} hideAlphaUsersMenuItem - Flag to hide alpha users menu item.
 * @returns {Boolean} - Whether the alpha users menu item should be hidden.
 */
export function checkIfAlphaUsersShouldBeHidden(item, hideAlphaUsersMenuItem) {
  // Hide alpha users menu item when governance lcm user is enabled,
  // to be informed via hideAlphaUsersMenuItem parameter
  return hideAlphaUsersMenuItem && (item.id === 'alpha_user' || item.privilegePath === 'managed/alpha_user');
}

/**
 * Helper function to check if alpha roles menu item should be hidden.
 * @param {Object} item - The menu item to check.
 * @param {Boolean} hideAlphaRolesMenuItem - Flag to hide alpha roles menu item.
 * @returns {Boolean} - Whether the alpha roles menu item should be hidden.
 */
export function checkIfAlphaRolesShouldBeHidden(item, hideAlphaRolesMenuItem) {
  // Hide alpha roles menu item when governance lcm role is enabled,
  // to be informed via hideAlphaRolesMenuItem parameter
  return hideAlphaRolesMenuItem && (item.id === 'alpha_role' || item.privilegePath === 'managed/alpha_role');
}

/**
 * Returns the translation key for a menu item based on its properties.
 * @param {Object} menuItem - The menu item object.
 * @returns {Object} The badge information object for the menu item.
 */
export function getMenuBadgeInfo(menuItem) {
  if (menuItem?.showBadgeWithContentFromStore) {
    return { showBadgeWithContentFromStore: menuItem.showBadgeWithContentFromStore };
  }
  return {};
}

/**
 * Validates and Returns a valid id for a given menu id. If the provided id is not allowed,
 * returns an id with a prefix. Otherwise, returns original id.
 *
 * @param {string} [idValue] - The id value to check.
 * @param {Array<string>} notAllowedNames - List of not-allowed names (e.g., ['custom', 'divider']).
 * @param {string} [prefix='managed-'] - Prefix to add if the id is not allowed.
 */
export function getValidManagedObjectMenuId(idValue = '', notAllowedNames = [END_USER_MENU_CONSTANTS.CUSTOM, END_USER_MENU_CONSTANTS.DIVIDER, END_USER_MENU_CONSTANTS.GROUP], prefix = 'managed-') {
  if (notAllowedNames.includes(idValue)) {
    return `${prefix}${idValue}`;
  }
  return idValue;
}

/**
 * Creates a unique menu ID for a privilege based on privilegePath.
 * @param {Object} privilege - The privilege object.
 * @returns {string} The Menu ID.
 */
export function createPrivilegeMenuId(privilege) {
  const privilegeId = privilege.privilegePath === END_USER_MENU_CONSTANTS.INTERNAL_ROLE
    ? END_USER_MENU_CONSTANTS.INTERNAL_ROLE
    : privilege.privilegePath.split('/')[1];

  return getValidManagedObjectMenuId(privilegeId);
}

/**
 * Creates a managed object menu item based on the provided privilege object.
 * Discard alpha users if hideAlphaUsersMenuItem is true.
 *
 * @param {Object} privilege - The privilege object.
 * @param {boolean} hideAlphaUsersMenuItem - Flag to hide alpha users menu item.
 * @returns {Object|undefined} The managed object menu item or undefined.
 */
export function createManagedObjectMenuItem(privilege, hideAlphaUsersMenuItem) {
  if (checkIfAlphaUsersShouldBeHidden(privilege, hideAlphaUsersMenuItem)) {
    return undefined;
  }

  return {
    id: createPrivilegeMenuId(privilege),
    icon: privilege['mat-icon'] || 'check_box_outline_blank',
    label: { en: getTranslation(privilege.title) },
    isManagedObject: true,
    routeTo: {
      name: 'ListResource',
      params: {
        resourceType: privilege.privilegePath.startsWith('internal/') ? 'internal' : 'managed',
        resourceName: privilege.privilegePath === END_USER_MENU_CONSTANTS.INTERNAL_ROLE ? 'role' : privilege.privilegePath.split('/')[1],
      },
    },
  };
}
