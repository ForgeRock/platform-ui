/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { END_USER_MENU_CONSTANTS, CUSTOM_MENU_ITEM, DIVIDER_MENU_ITEM } from '@forgerock/platform-shared/src/constants/endUserMenuConstants';
import { getTranslationOverrides } from '@forgerock/platform-shared/src/utils/overrideTranslations';
import i18n from '@/i18n';

/**
 * Retrieves the label for the current locale or a fallback locale.
 * @param {Object} label - The label object containing translations for different locales.
 * @returns {string} The label for the current or fallback locale.
 */
export function getLocaleBasedMenuItemLabel(label = {}, labelKey) {
  const { locale, fallbackLocale } = i18n.global;

  if (label[locale]) {
    return label[locale];
  }

  if (Array.isArray(fallbackLocale)) {
    const foundFallbackLocale = fallbackLocale.find((fallback) => label[fallback]);
    if (foundFallbackLocale) {
      return label[foundFallbackLocale];
    }
  }

  // Fallback to 'en' if no locale or fallback matches
  if (label.en) {
    return label.en;
  }

  // Fallback's fallback, return the first available label or the translation key
  if (typeof label === 'object' && Object.keys(label).length > 0) {
    return Object.values(label)[0];
  }

  if (labelKey) {
    // If labelKey is provided, use it to get the translation
    return i18n.global.t(labelKey);
  }

  return '';
}

/**
 * Find translation key for a given menu item.
 * If menu item is a managed object, it uses the label to look for its translation key existence.
 * Otherwise, it constructs a translation key using the menu item's id with a prefix of sideMenu.endUser.
 *
 * @param {Object} menuItem - The menu item object to find the translation key for.
 * @returns {string} The translation key for the menu item.
 */
export function getMenuItemTranslationKey(menuItem) {
  return (menuItem.isManagedObject
    ? getLocaleBasedMenuItemLabel(menuItem.label)
    : `${END_USER_MENU_CONSTANTS.MENU_ITEM_LABEL_LOCALE_PREFIX}${menuItem.id}`);
}

/** Builds a label object for a menu item using translations from i18n and uiLocaleFiles.
 *
 * @param {string} id - The unique identifier of the menu item.
 * @param {string} labelKey - The translation key for the menu item.
 * @param {Array<Object>} uiLocaleFiles - The array of UI locale files containing translations.
 * @returns {Object} The label object containing translations for the menu item, e.g. { en: 'some label' }
 */
function buildLabel(id, labelKey, uiLocaleFiles) {
  const label = { en: i18n.global.t(labelKey) };

  // Check if the label exists in the i18n messages for the current locale
  i18n.global.availableLocales.forEach((locale) => {
    if (i18n.global.messages[locale].sideMenu?.[id]) {
      label[locale] = i18n.global.messages[locale].sideMenu[id];
    }
  });

  // override the label if found in the uiLocaleFiles in shared or enduser and in overrides
  uiLocaleFiles.forEach((uiLocaleFile) => {
    const { locale, messages } = uiLocaleFile;
    if (messages.shared?.sideMenu?.[id]) {
      label[locale] = messages.shared.sideMenu[id];
    } else if (messages.enduser?.sideMenu?.[id]) {
      label[locale] = messages.enduser.sideMenu[id];
    }
    if (messages.shared?.overrides?.[labelKey]) {
      label[locale] = messages.shared.overrides[labelKey];
    } else if (messages.enduser?.overrides?.[labelKey]) {
      label[locale] = messages.enduser.overrides[labelKey];
    }
  });
  return label;
}

/** Returns label object filled with translations for the given menu items.
 *
 * @param {Array<Object>} menuItems - The array of menu item objects to update with translations.
 * @param {Array<Object>} managedObjects - The array of managed object menu items to update with translations.
 * @returns {Object} label - The label object containing locale & translations for the menu item, e.g. { en: 'some label' }.
 */
export async function updateMenuItemsWithTranslations(menuItems, managedObjects) {
  try {
    const { locale, fallbackLocale } = i18n.global;
    const uiLocaleFiles = await getTranslationOverrides(locale, fallbackLocale, 'shared,enduser');
    // Update menu items with translations
    menuItems.forEach((menuItem) => {
      menuItem.label = buildLabel(menuItem.id, getMenuItemTranslationKey(menuItem), uiLocaleFiles);
      if (menuItem.subItems?.length) {
        menuItem.subItems.forEach((subItem) => {
          subItem.label = buildLabel(subItem.id, getMenuItemTranslationKey(subItem), uiLocaleFiles);
        });
      }
    });

    // Update managed objects with translations
    managedObjects.forEach((managedObjectMenuItem) => {
      managedObjectMenuItem.label = buildLabel(managedObjectMenuItem.id, getMenuItemTranslationKey(managedObjectMenuItem), uiLocaleFiles);
    });

    // update translations for custom and divider menu items
    [CUSTOM_MENU_ITEM, DIVIDER_MENU_ITEM].forEach((menuItem) => {
      menuItem.label = buildLabel(menuItem.id, getMenuItemTranslationKey(menuItem), uiLocaleFiles);
    });
  } catch (error) {
    // nothing to handle here, this is just to ensure that the menu items are still returned
    // even if translations are not available
  }
}
