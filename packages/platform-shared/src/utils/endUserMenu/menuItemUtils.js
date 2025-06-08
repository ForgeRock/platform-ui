import { CONSTANTS } from '@forgerock/platform-shared/src/constants/endUserMenuConstants';
import i18n from '@/i18n';
import { getMenuItemTranslationKey } from './menuItemTranslations';
import { getTranslation } from '../translations';

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
      label: subItem.label,
    };
  });

  // Initialize selectedSubItems if not already set. Defaults to all subItem IDs.
  menuItem.selectedSubItems = menuItem.selectedSubItems || menuItem.subItems.map((subItem) => subItem.id);
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
    ...(menuItem.disabled ? { disabled: true } : {}),
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
    if (menuItem.id === CONSTANTS.INTERNAL_ROLE) {
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

// helper function to check if alpha users menu item should be hidden
export function checkIfAlphaUsersShouldBeHidden(item, hideAlphaUsersMenuItem) {
  // Hide alpha users menu item when governance lcm user is enabled,
  // to be informed via hideAlphaUsersMenuItem parameter
  return hideAlphaUsersMenuItem && (item.id === 'alpha_user' || item.privilegePath === 'managed/alpha_user');
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
export function getValidManagedObjectMenuId(idValue = '', notAllowedNames = [CONSTANTS.CUSTOM, CONSTANTS.DIVIDER], prefix = 'managed-') {
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
  const privilegeId = privilege.privilegePath === CONSTANTS.INTERNAL_ROLE
    ? CONSTANTS.INTERNAL_ROLE
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
        resourceName: privilege.privilegePath === CONSTANTS.INTERNAL_ROLE ? 'role' : privilege.privilegePath.split('/')[1],
      },
    },
  };
}
