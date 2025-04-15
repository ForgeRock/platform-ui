/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as endUserMenuFilter from '@forgerock/platform-shared/src/utils/endUserMenuFilter';
import * as endUserMenu from './endUserMenu';
/**
 * @jest-environment jsdom
 */

jest.mock('@forgerock/platform-shared/src/utils/translations', () => ({
  getTranslation: jest.fn((key) => `translated.${key}`),
}));
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/api/ConfigApi', () => ({
  getConfig: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/utils/fraasUtils', () => jest.fn((items) => items));

jest.mock('@/i18n', () => ({
  global: {
    t: jest.fn((key) => `i18n.${key}`),
  },
}));

describe('endUserMenu utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMinimalMenuItemForTheme', () => {
    it('returns divider as is', () => {
      const item = { id: 'divider', icon: 'horizontal_rule', isDivider: true };
      expect(endUserMenu.generateMinimalMenuItemForTheme(item)).toEqual(item);
    });

    it('extracts properties and computes label', () => {
      const item = { id: 'dashboard', icon: 'icon', labelKey: 'label.key' };
      expect(endUserMenu.generateMinimalMenuItemForTheme(item)).toMatchObject({
        id: 'dashboard',
        icon: 'icon',
        labelKey: 'label.key',
        label: 'i18n.label.key',
      });
    });

    it('handles subItems and selectedSubItems', () => {
      const item = {
        id: 'inbox',
        icon: 'icon',
        labelKey: 'label.key',
        subItems: [{ id: 'a', icon: 'a', labelKey: 'label.key.a' }, { id: 'b', icon: 'b', labelKey: 'label.key.b' }],
      };
      const minimalItem = endUserMenu.generateMinimalMenuItemForTheme(item);
      expect(minimalItem.selectedSubItems).toEqual(['a', 'b']);
      expect(minimalItem.subItems).toHaveLength(2);
      expect(minimalItem.subItems[0]).toMatchObject({
        id: 'a',
        icon: 'a',
        labelKey: 'label.key.a',
        label: 'i18n.label.key.a',
      });
      expect(minimalItem.subItems[1]).toMatchObject({
        id: 'b',
        icon: 'b',
        labelKey: 'label.key.b',
        label: 'i18n.label.key.b',
      });
    });

    it('includes isManagedObject and url if present', () => {
      const item = {
        id: 'custom',
        icon: 'icon',
        labelKey: 'label.key',
        isManagedObject: true,
        url: '/some-url',
      };
      expect(endUserMenu.generateMinimalMenuItemForTheme(item)).toMatchObject({
        isManagedObject: true,
        url: '/some-url',
      });

      // ensure url/ isManagedObject are not added if not present
      const itemWithoutUrl = {
        id: 'custom',
        icon: 'icon',
        labelKey: 'label.key',
      };
      expect(endUserMenu.generateMinimalMenuItemForTheme(itemWithoutUrl).url).toBeUndefined();

      const nonManagedItem = {
        id: 'abc',
        icon: 'icon',
        labelKey: 'label.key',
      };
      expect(endUserMenu.generateMinimalMenuItemForTheme(nonManagedItem).isManagedObject).toBeUndefined();
    });
  });

  describe('normalizeMenuItemsForAdminUI', () => {
    it('enriches menu items with label and labelKey', () => {
      const items = [{ id: 'dashboard', icon: 'icon' }];
      const result = endUserMenu.normalizeMenuItemsForAdminUI(items);
      expect(result[0]).toMatchObject({
        id: 'dashboard',
        icon: 'icon',
        labelKey: 'sideMenu.endUser.dashboard',
        label: 'i18n.sideMenu.endUser.dashboard',
      });
    });

    it('populates subItems', () => {
      const items = [{
        id: 'inbox',
        icon: 'icon',
        subItems: [{ id: 'approvals' }],
      }];
      const result = endUserMenu.normalizeMenuItemsForAdminUI(items);
      expect(result[0].subItems[0]).toMatchObject({
        id: 'approvals',
        labelKey: 'sideMenu.endUser.approvals',
        label: 'i18n.sideMenu.endUser.approvals',
      });
    });
  });

  describe('getUniqueMenuItems', () => {
    it('removes duplicates except divider/custom', () => {
      const items = [
        { id: 'a' },
        { id: 'divider' },
        { id: 'a' },
        { id: 'custom' },
        { id: 'custom' },
        { id: 'b' },
      ];
      const result = endUserMenu.getUniqueMenuItems(items);
      expect(result).toEqual([
        { id: 'a' },
        { id: 'divider' },
        { id: 'custom' },
        { id: 'custom' },
        { id: 'b' },
      ]);
    });

    it('returns empty array for undefined', () => {
      expect(endUserMenu.getUniqueMenuItems(undefined)).toEqual([]);
    });
  });

  describe('getAllEndUserMenuItems', () => {
    it('computes menu items for the first time', async () => {
      jest.spyOn(ConfigApi, 'getConfig').mockResolvedValue({ data: { objects: [] } });
      const filterAvailableEndUserMenuItemsMock = jest.fn().mockReturnValue([{ id: 'item1' }]);
      endUserMenuFilter.filterAvailableEndUserMenuItems = filterAvailableEndUserMenuItemsMock;
      await endUserMenu.getAllEndUserMenuItems();
      expect(filterAvailableEndUserMenuItemsMock).toHaveBeenCalled();
    });

    it('returns cached menu items on subsequent calls', async () => {
      jest.spyOn(ConfigApi, 'getConfig').mockResolvedValue({ data: { objects: [] } });
      const filterAvailableEndUserMenuItemsMock = jest.fn();
      endUserMenuFilter.filterAvailableEndUserMenuItems = filterAvailableEndUserMenuItemsMock;
      await endUserMenu.getAllEndUserMenuItems();
      expect(filterAvailableEndUserMenuItemsMock).not.toHaveBeenCalled();
    });

    it('returns configured end user menu items with managed objects', async () => {
      const managedObjects = [
        { name: 'alpha_users', schema: { 'mat-icon': 'users', title: 'Alpha Users' } },
      ];
      jest.spyOn(ConfigApi, 'getConfig').mockResolvedValue({ data: { objects: managedObjects } });
      const result = await endUserMenu.getAllEndUserMenuItems();
      expect(result.filter((obj) => obj.id === managedObjects[0].name).length).toBe(1);
    });

    it('returns configured end user menu items with governance items enabled', async () => {
      jest.resetModules();
      // eslint-disable-next-line global-require
      const endUserMenuLocal = require('./endUserMenu'); // Re-import to reset cached items
      jest.spyOn(ConfigApi, 'getConfig').mockResolvedValue({ data: { objects: [] } });

      const store = {
        state: {
          realm: 'alpha',
          SharedStore: {
            governanceEnabled: true,
          },
        },
      };
      const governanceMenuIds = ['inbox', 'myAccess', 'directory', 'requests'];
      const result = await endUserMenuLocal.getAllEndUserMenuItems({ store });
      expect(result.filter((obj) => governanceMenuIds.includes(obj.id)).length).toBe(governanceMenuIds.length);
    });
  });

  describe('generateEndUserMenuItems', () => {
    it('returns dividerMenuItem for divider', () => {
      const items = [{ id: 'divider' }];
      expect(endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items })[0].id).toBe('divider');
    });

    it('returns customMenuItem with url for end user UI', () => {
      const items = [{
        id: 'custom',
        icon: 'link',
        label: 'Custom',
        url: '/custom',
      }];
      const result = endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items, isEndUserUI: true });
      expect(result[0]).toMatchObject({
        displayName: 'Custom',
        icon: 'link',
        id: 'custom',
        isNav: true,
        url: '/custom',
      });
    });

    it('processes regular menu items with subItems', () => {
      const items = [{
        id: 'inbox',
        icon: 'icon',
        label: 'Inbox',
        subItems: [{ id: 'approvals', label: 'Approvals', routeTo: { name: 'approvals' } }],
      }];
      const result = endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items, isEndUserUI: true });
      expect(result[0]).toMatchObject({
        displayName: 'Inbox',
        icon: 'icon',
        id: 'inbox',
        isNav: true,
        subItems: [{ id: 'approvals', displayName: 'Approvals', routeTo: { name: 'approvals' } }],
      });
    });

    it('includes isManagedObject for admin UI', () => {
      const items = [{ id: 'alpha_users', icon: 'icon', isManagedObject: true }];
      const result = endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items, isEndUserUI: false });
      expect(result[0].isManagedObject).toBe(true);
    });

    it('should add translation key for a menu item displayname when label does not exist', () => {
      const items = [{ id: 'dashboard', icon: 'icon' }];
      const result = endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items, isEndUserUI: true });
      expect(result[0]).toMatchObject({
        displayName: 'sideMenu.endUser.dashboard',
        icon: 'icon',
        id: 'dashboard',
        isNav: true,
      });
    });

    it('should not add routeTo for admin ui package', () => {
      const items = [{ id: 'dashboard', icon: 'icon', routeTo: { name: 'Dashboard' } }];
      const result = endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items, isEndUserUI: false });
      expect(result[0].routeTo).toBeUndefined();
    });

    it('should add routeTo for enduser ui package', () => {
      const items = [{
        id: 'item1',
        icon: 'icon',
        routeTo: { name: 'Item 1' },
      },
      {
        id: 'item2',
        icon: 'icon',
        routeTo: { name: 'Item 2' },
        selectedSubItems: ['sub2'],
        subItems: [{ id: 'sub2', routeTo: { name: 'Sub Item 2' } }],
      }];
      const result = endUserMenu.generateEndUserMenuItems({ configuredMenuItems: items, isEndUserUI: true });
      expect(result[0].routeTo).toBeDefined();
      expect(result[1].routeTo).toBeUndefined();
      expect(result[1].subItems[0].routeTo).toBeDefined();
    });
  });
});
