/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getLocaleBasedMenuItemLabel,
  getMenuItemTranslationKey,
  updateMenuItemsWithTranslations,
} from './menuItemTranslations';

jest.mock('axios');
// Mock i18n
jest.mock('@/i18n', () => ({
  global: {
    locale: 'fr',
    fallbackLocale: ['es', 'de'],
    t: jest.fn((key) => `translated:${key}`),
    availableLocales: ['en', 'fr', 'es'],
    messages: {
      en: { sideMenu: { home: 'Home EN' } },
      fr: {
        sideMenu: {
          home: 'Home FR',
          sub1: 'Sub 1 FR',
          dashboard: 'Dashboard FR',
          managed1: 'Managed 1 FR',
        },
      },
      es: { sideMenu: { home: 'Home ES' } },
    },
  },
}));

// Mock required constants
jest.mock('@forgerock/platform-shared/src/constants/endUserMenuConstants', () => ({
  END_USER_MENU_CONSTANTS: { MENU_ITEM_LABEL_LOCALE_PREFIX: 'sideMenu.endUser.' },
  CUSTOM_MENU_ITEM: { id: 'custom' },
  DIVIDER_MENU_ITEM: { id: 'divider' },
}));

// Mock
jest.mock('@forgerock/platform-shared/src/utils/overrideTranslations', () => ({
  getTranslationOverrides: jest.fn(() => Promise.resolve([
    { locale: 'fr', messages: { shared: { sideMenu: { home: 'Home FR Shared' }, overrides: { 'sideMenu.endUser.home': 'Home FR Override' } } }, enduser: { sideMenu: { home: 'Home FR Enduser' }, overrides: { 'sideMenu.endUser.home': 'Home FR Enduser Override' } } },
  ])),
}));

describe('menuItemTranslations.js', () => {
  describe('getLocaleBasedMenuItemLabel', () => {
    it('returns label for current locale', () => {
      const label = { fr: 'French', en: 'English' };
      expect(getLocaleBasedMenuItemLabel(label, 'key')).toBe('French');
    });

    it('returns label from fallback locale, when current locale is not available', () => {
      const label = { es: 'Spanish', en: 'English' };
      expect(getLocaleBasedMenuItemLabel(label, 'key')).toBe('Spanish');
    });

    it('returns label for "en" if no locale/fallback match', () => {
      const label = { en: 'English' };
      expect(getLocaleBasedMenuItemLabel(label, 'key')).toBe('English');
    });

    it('returns first available label if none match', () => {
      const label = { it: 'Italian', zh: 'Chinese' };
      expect(getLocaleBasedMenuItemLabel(label, 'key')).toBe('Italian');
    });

    it('returns translation from i18n if label is empty', () => {
      expect(getLocaleBasedMenuItemLabel({}, 'sideMenu.endUser.home')).toBe('translated:sideMenu.endUser.home');
    });
  });

  describe('getMenuItemTranslationKey', () => {
    it('returns label for managed object', () => {
      const menuItem = { isManagedObject: true, label: { fr: 'French' } };
      expect(getMenuItemTranslationKey(menuItem)).toBe('French');
    });

    it('returns translation key for non-managed object', () => {
      const menuItem = { id: 'home' };
      expect(getMenuItemTranslationKey(menuItem)).toBe('sideMenu.endUser.home');
    });
  });

  describe('updateMenuItemsWithTranslations', () => {
    it('updates menuItems and managedObjects with translations', async () => {
      const menuItems = [
        { id: 'home', labelKey: 'sideMenu.endUser.home' },
        { id: 'dashboard', labelKey: 'sideMenu.endUser.dashboard' },
      ];
      const managedObjects = [
        { id: 'managed1', labelKey: 'sideMenu.endUser.managed1' },
      ];
      await updateMenuItemsWithTranslations(menuItems, managedObjects);

      // Check that labels are set for menuItems
      expect(menuItems[0].label.fr).toBeDefined();
      expect(menuItems[1].label.fr).toBeDefined();
      // Check that labels are set for managedObjects
      expect(managedObjects[0].label.fr).toBeDefined();
    });

    it('handles menuItems with subItems', async () => {
      const menuItems = [
        {
          id: 'home',
          labelKey: 'sideMenu.endUser.home',
          subItems: [{ id: 'sub1', labelKey: 'sideMenu.endUser.sub1' }],
        },
      ];
      await updateMenuItemsWithTranslations(menuItems, []);
      expect(menuItems[0].subItems[0].label.fr).toBeDefined();
    });
  });
});
