/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DIVIDER_MENU_ITEM, END_USER_MENU_CONSTANTS } from '../../constants/endUserMenuConstants';
import {
  getAllEndUserMenuItems,
  generateEndUserMenuItems,
  buildMenuItemsFromTheme,
} from './endUserMenu';

import * as managedObjectsAsMenu from './managedObjectsAsMenu';
import * as menuFeatureFlags from './menuFeatureFlags';
import * as menuFilter from './menuFilter';
import * as menuItemTranslations from './menuItemTranslations';
import * as menuItemUtils from './menuItemUtils';

// Mocks
jest.mock('./managedObjectsAsMenu');
jest.mock('./menuFeatureFlags');
jest.mock('./menuFilter');
jest.mock('./menuItemTranslations');

const DEFAULT_MENU_ITEMS = [
  { id: 'home', icon: 'home', labelKey: 'sideMenu.endUser.home' },
  { id: 'divider' },
  {
    id: 'custom',
    icon: 'link',
    labelKey: 'sideMenu.endUser.custom',
    label: { en: 'Custom' },
    url: 'https://custom.com',
  },
  {
    id: 'inbox',
    icon: 'inbox',
    labelKey: 'sideMenu.endUser.inbox',
    label: { en: 'Inbox' },
    subItems: [
      {
        id: 'approvals',
        labelKey: 'sideMenu.endUser.approvals',
        label: { en: 'Approvals' },
        routeTo: { name: 'Approvals' },
      },
      {
        id: 'tasks',
        labelKey: 'sideMenu.endUser.tasks',
        label: { en: 'Tasks' },
        routeTo: { name: 'Tasks' },
      },
    ],
  },
  {
    id: 'lcm',
    icon: 'lcm',
    labelKey: 'sideMenu.endUser.lcm',
    subItems: [
      { id: 'lcmUsers', labelKey: 'sideMenu.endUser.lcmUsers' },
      { id: 'lcmEntitlements', labelKey: 'sideMenu.endUser.lcmEntitlements' },
    ],
  },
  {
    id: 'access',
    icon: 'access',
    labelKey: 'sideMenu.endUser.access',
    subItems: [
      { id: 'sub1', labelKey: 'sideMenu.endUser.sub1' },
      { id: 'sub2', labelKey: 'sideMenu.endUser.sub2' },
    ],
    selectedSubItems: ['sub1'],
  },
];

describe('endUserMenu.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Provide default implementations for all imported constants
    jest.spyOn(menuFeatureFlags, 'generateFeatureFlags').mockReturnValue({
      govLcmUser: true,
      ifGovernance: true,
      realm: 'alpha',
    });
    jest.spyOn(menuFilter, 'filterAvailableEndUserMenuItems').mockResolvedValue(DEFAULT_MENU_ITEMS);
    jest.spyOn(managedObjectsAsMenu, 'fetchManagedObjectsAsMenuItems').mockResolvedValue([
      {
        id: 'managed1',
        icon: 'managed',
        labelKey: 'sideMenu.endUser.managed1',
        isManagedObject: true,
      },
    ]);
    jest.spyOn(menuItemTranslations, 'updateMenuItemsWithTranslations').mockResolvedValue();
    jest.spyOn(menuItemTranslations, 'getLocaleBasedMenuItemLabel').mockImplementation((label, key) => label?.en || key);
    jest.spyOn(menuItemUtils, 'getUniqueMenuItems').mockImplementation((items) => items);
    jest.spyOn(menuItemUtils, 'normalizeMenuItems').mockImplementation((items) => items);
  });

  describe('getAllEndUserMenuItems', () => {
    it('should return normalized, unique menu items with managed objects', async () => {
      const result = await getAllEndUserMenuItems({ store: {}, getTranslations: false });
      expect(menuFeatureFlags.generateFeatureFlags).toHaveBeenCalled();
      expect(menuFilter.filterAvailableEndUserMenuItems).toHaveBeenCalled();
      expect(managedObjectsAsMenu.fetchManagedObjectsAsMenuItems).toHaveBeenCalled();
      expect(menuItemUtils.getUniqueMenuItems).toHaveBeenCalled();
      expect(menuItemUtils.normalizeMenuItems).toHaveBeenCalled();
      expect(result).toEqual([
        ...DEFAULT_MENU_ITEMS,
        {
          id: 'managed1',
          icon: 'managed',
          labelKey: 'sideMenu.endUser.managed1',
          isManagedObject: true,
        },
      ]);
    });

    it('should call updateMenuItemsWithTranslations if getTranslations is true', async () => {
      await getAllEndUserMenuItems({ store: {}, getTranslations: true });
      expect(menuItemTranslations.updateMenuItemsWithTranslations).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      menuFeatureFlags.generateFeatureFlags.mockImplementationOnce(() => { throw new Error('fail'); });
      await expect(getAllEndUserMenuItems({ store: {} })).resolves.toBeInstanceOf(Array);
    });
  });

  describe('generateEndUserMenuItems', () => {
    it('should process divider menu item', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ id: END_USER_MENU_CONSTANTS.DIVIDER }],
        store: {},
      });
      expect(result[0]).toEqual(DIVIDER_MENU_ITEM);
    });

    it('should process custom menu item', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[2]],
        isEndUserUI: true,
        store: {},
      });
      expect(result[0]).toMatchObject({
        displayName: 'Custom',
        icon: 'link',
        id: 'custom',
        isNav: true,
        url: 'https://custom.com',
      });
    });

    it('should process regular menu item with subItems', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[3]],
        store: {},
      });
      expect(result[0]).toMatchObject({
        icon: 'inbox',
        displayName: expect.any(String),
        id: 'inbox',
        isNav: true,
        subItems: [{ id: 'approvals', displayName: expect.any(String) }, { id: 'tasks', displayName: expect.any(String) }],
      });
    });

    it('should skip disabled menu items', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ id: 'home', disabled: true }],
        store: {},
      });
      expect(result).toEqual([]);
    });

    it('should filter out LCM menu item if governance is not enabled', () => {
      menuFeatureFlags.generateFeatureFlags.mockReturnValueOnce({ ifGovernance: false });
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[4]],
        store: {},
      });
      expect(result).toEqual([]);
    });

    it('should filter out LCM menu item if govLcmUser and govLcmEntitlement are not enabled, even it is governance', () => {
      menuFeatureFlags.generateFeatureFlags.mockReturnValueOnce({ ifGovernance: true, govLcmUser: false, govLcmEntitlement: false });
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[4]],
        store: {},
      });
      expect(result).toEqual([]);
    });

    it('should filter out LCM user menu item if govLcmUser is not enabled', () => {
      menuFeatureFlags.generateFeatureFlags.mockReturnValueOnce({ ifGovernance: true, govLcmUser: false, govLcmEntitlement: true });
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[4]],
        store: {},
      });
      expect(result[0].id).toEqual('lcm');
      expect(result[0].subItems[0].id).toEqual('lcmEntitlements');
      expect(result.find((item) => item.id === 'lcmUsers')).toBeUndefined();
    });

    it('should filter out LCM entitlement menu item if govLcmEntitlement is not enabled', () => {
      menuFeatureFlags.generateFeatureFlags.mockReturnValueOnce({ ifGovernance: true, govLcmUser: true, govLcmEntitlement: false });
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[4]],
        store: {},
      });
      expect(result[0].id).toEqual('lcm');
      expect(result[0].subItems[0].id).toEqual('lcmUsers');
      expect(result.find((item) => item.id === 'lcmEntitlements')).toBeUndefined();
    });

    it('should include LCM submenu items if they are enabled', () => {
      menuFeatureFlags.generateFeatureFlags.mockReturnValueOnce({ ifGovernance: true, govLcmUser: true, govLcmEntitlement: true });
      const result = generateEndUserMenuItems({
        configuredMenuItems: [DEFAULT_MENU_ITEMS[4]],
        store: {},
      });
      expect(result[0].id).toEqual('lcm');
      expect(result[0].subItems[0].id).toEqual('lcmUsers');
      expect(result[0].subItems[1].id).toEqual('lcmEntitlements');
    });

    it('should filter out alpha users menu item if hideAlphaUsersMenuItem is true', () => {
      const privilege = {
        privilegePath: 'managed/alpha_user',
        id: 'alpha_user',
        title: 'Alpha',
        'mat-icon': 'icon',
      };
      const result = generateEndUserMenuItems({
        configuredMenuItems: [],
        privileges: [privilege],
        hideAlphaUsersMenuItem: true,
        store: {},
      });
      expect(result).toEqual([]);
    });

    it('should consider only selected subitems', () => {
      const menuItem = JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS[3]));
      menuItem.selectedSubItems = ['approvals'];
      const result = generateEndUserMenuItems({
        configuredMenuItems: [menuItem],
        store: {},
        isEndUserUI: true,
      });
      expect(result[0].subItems).toHaveLength(menuItem.selectedSubItems.length);
      expect(result[0].subItems[0].id).toEqual('approvals');
      expect(result[0].subItems[1]).toBeUndefined();
    });

    describe('with and without isEndUserUI option', () => {
      it('should not allow non privileged managed objects in end user UI', () => {
        const privilege = { privilegePath: 'managed/managed1', title: 'Managed', 'mat-icon': 'icon' };
        const managedObjectMenuItem = [{ id: 'managed1', isManagedObject: true }, { id: 'managed2', isManagedObject: true }];
        const result = generateEndUserMenuItems({
          configuredMenuItems: managedObjectMenuItem,
          privileges: [privilege],
          store: {},
          isEndUserUI: true,
        });
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('managed1');
        expect(result[0].id).not.toBe('managed2');
      });

      it('should not allow alpha_user managed object when realm is alpha and lcmUser is enabled', () => {
        const privilege = { privilegePath: 'managed/alpha_user', title: 'Alpha', 'mat-icon': 'icon' };
        jest.spyOn(menuFeatureFlags, 'generateFeatureFlags').mockReturnValue({
          govLcmUser: true,
          ifGovernance: true,
          realm: 'alpha',
        });
        const result = generateEndUserMenuItems({
          configuredMenuItems: [{ id: 'alpha_user', isManagedObject: true }],
          privileges: [privilege],
          store: {},
          isEndUserUI: true,
          hideAlphaUsersMenuItem: true,
        });
        expect(result).toEqual([]);
      });
    });
  });

  describe('buildMenuItemsFromTheme', () => {
    it('should build menu items from theme and all end user menu items', () => {
      const themeMenuItems = [
        { id: 'home' },
        { id: 'managed1', isManagedObject: true },
      ];
      const allEndUserMenuItems = [
        { id: 'home' },
        { id: 'managed1', isManagedObject: true },
        { id: 'extra' },
      ];
      const result = buildMenuItemsFromTheme(themeMenuItems, allEndUserMenuItems);
      expect(result).toEqual([
        { id: 'home' },
        { id: 'managed1', isManagedObject: true },
        { id: 'extra' },
      ]);
    });

    it('should skip disabled menu items', () => {
      const themeMenuItems = [{ id: 'dashboard', disabled: true }];
      const allEndUserMenuItems = [{ id: 'home' }];
      const result = buildMenuItemsFromTheme(themeMenuItems, allEndUserMenuItems);
      expect(result).toEqual([{ id: 'home' }]);
    });

    it('should skip unknown menu items', () => {
      const themeMenuItems = [{ id: 'unknown' }];
      const allEndUserMenuItems = [{ id: 'home' }];
      const result = buildMenuItemsFromTheme(themeMenuItems, allEndUserMenuItems);
      expect(result).toEqual([{ id: 'home' }]);
    });

    it('should not remove custom and divider items from configured menu list', () => {
      const themeMenuItems = [
        { id: 'custom', label: { en: 'Custom' } },
        { id: 'divider', label: { en: 'Divider' } },
        { id: 'unknown', label: { en: 'Unknown' } },
      ];
      const allEndUserMenuItems = [{ id: 'home' }];
      const result = buildMenuItemsFromTheme(themeMenuItems, allEndUserMenuItems);
      expect(result.map((item) => item.id)).toEqual(['custom', 'divider', 'home']);
    });

    it('should not add additional divider menu items as only menu items', () => {
      const themeMenuItems = [{ id: 'dashboard' }];
      const allEndUserMenuItems = [{ id: 'dashboard' }, { id: 'home', disabled: true }, { id: 'divider' }];
      const result = buildMenuItemsFromTheme(themeMenuItems, allEndUserMenuItems);
      expect(result).toEqual([{ id: 'dashboard' }]);
    });
  });
});
