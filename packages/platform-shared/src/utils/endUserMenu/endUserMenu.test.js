/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  generateEndUserMenuItems,
  buildMenuItemsFromTheme,
} from './endUserMenu';

jest.mock('./menuItemTranslations', () => ({
  ...jest.requireActual('./menuItemTranslations'),
  getLocaleBasedMenuItemLabel: (label) => label?.en || '',
  updateMenuItemsWithTranslations: jest.fn(),
}));

jest.mock('./menuFeatureFlags', () => ({
  generateFeatureFlags: jest.fn().mockReturnValue({}),
}));

jest.mock('./managedObjectsAsMenu', () => ({
  fetchManagedObjectsAsMenuItems: jest.fn().mockResolvedValue([]),
}));

jest.mock('./menuFilter', () => ({
  filterAvailableEndUserMenuItems: jest.fn().mockResolvedValue([]),
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const profileItem = {
  id: 'profile',
  icon: 'person',
  label: { en: 'Profile' },
  labelKey: 'sideMenu.endUser.profile',
  routeTo: { name: 'Profile' },
};

const managedItem = {
  id: 'alpha_user',
  icon: 'people',
  label: { en: 'Alpha Users' },
  labelKey: 'sideMenu.endUser.alpha_user',
  isManagedObject: true,
  routeTo: { name: 'ListResource', params: { resourceType: 'managed', resourceName: 'alpha_user' } },
};

const alphaUserPrivilege = {
  privilegePath: 'managed/alpha_user',
  title: 'Alpha Users',
  'mat-icon': 'people',
};

const groupItem = {
  id: 'group',
  icon: 'folder',
  label: { en: 'Identities' },
  labelKey: 'sideMenu.endUser.group',
  subItems: [{ ...managedItem }],
};

// ---------------------------------------------------------------------------
// generateEndUserMenuItems
// ---------------------------------------------------------------------------

describe('generateEndUserMenuItems', () => {
  describe('exactList', () => {
    it('returns only configured items when exactList is true — does not append privilege-based items', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...profileItem }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
      });
      expect(result.map((item) => item.id)).toEqual(['profile']);
    });

    it('appends privilege-based managed objects when exactList is false', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...profileItem }],
        exactList: false,
        privileges: [alphaUserPrivilege],
        isEndUserUI: false,
      });
      expect(result.map((item) => item.id)).toContain('alpha_user');
    });

    it('does not duplicate managed objects already present in configuredMenuItems', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...managedItem }],
        exactList: false,
        privileges: [alphaUserPrivilege],
        isEndUserUI: false,
      });
      expect(result.filter((item) => item.id === 'alpha_user')).toHaveLength(1);
    });

    it('does not append managed objects that are already inside a GROUP sub-items list', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem }],
        exactList: false,
        privileges: [alphaUserPrivilege],
        isEndUserUI: false,
      });
      // alpha_user lives inside the group; it must not also appear at top level
      expect(result.filter((item) => item.id === 'alpha_user')).toHaveLength(0);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('group');
    });
  });

  describe('divider and custom items', () => {
    it('passes divider items through as DIVIDER_MENU_ITEM', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ id: 'divider' }],
        exactList: true,
        isEndUserUI: true,
      });
      expect(result[0].isDivider).toBe(true);
    });

    it('renders custom items with isNav and url in end-user UI', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{
          id: 'custom', label: { en: 'My Link' }, icon: 'link', url: 'https://example.com',
        }],
        exactList: true,
        isEndUserUI: true,
      });
      expect(result[0].id).toBe('custom');
      expect(result[0].isNav).toBe(true);
      expect(result[0].url).toBe('https://example.com');
    });

    it('strips url from custom items in admin UI', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{
          id: 'custom', label: { en: 'My Link' }, icon: 'link', url: 'https://example.com',
        }],
        exactList: true,
        isEndUserUI: false,
      });
      expect(result[0].url).toBe('');
    });
  });

  describe('GROUP rendering', () => {
    it('renders a GROUP item with isGroup and isNav flags', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('group');
      expect(result[0].isGroup).toBe(true);
      expect(result[0].isNav).toBe(true);
    });

    it('includes managed-object sub-items for which the user has a privilege', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
      });
      expect(result[0].subItems).toHaveLength(1);
      expect(result[0].subItems[0].id).toBe('alpha_user');
    });

    it('omits the GROUP entirely when no sub-items survive privilege filtering in the end-user UI', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem }],
        exactList: true,
        privileges: [],
        isEndUserUI: true,
      });
      expect(result.find((item) => item.id === 'group')).toBeUndefined();
    });

    it('passes divider sub-items through inside a group', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{
          ...groupItem,
          subItems: [{ id: 'divider', isDivider: true }, { ...managedItem }],
        }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
      });
      const subIds = result[0].subItems.map((sub) => sub.id);
      expect(subIds).toContain('divider');
      expect(subIds).toContain('alpha_user');
    });

    it('passes custom sub-items through with url in end-user UI', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{
          ...groupItem,
          subItems: [{
            id: 'custom', label: { en: 'Link' }, icon: 'link', url: 'https://example.com',
          }],
        }],
        exactList: true,
        privileges: [],
        isEndUserUI: true,
      });
      expect(result[0].subItems[0].url).toBe('https://example.com');
    });

    it('includes non-managed sub-items that have a stored routeTo', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem, subItems: [{ ...profileItem }] }],
        exactList: true,
        privileges: [],
        isEndUserUI: true,
      });
      expect(result[0].subItems[0].id).toBe('profile');
      expect(result[0].subItems[0].routeTo).toEqual(profileItem.routeTo);
    });

    it('omits non-managed sub-items that have no routeTo', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem, subItems: [{ id: 'orphan', label: { en: 'Orphan' }, icon: 'help' }] }],
        exactList: true,
        privileges: [],
        isEndUserUI: true,
      });
      expect(result).toHaveLength(0);
    });

    it('renders all sub-items in the admin UI without privilege filtering', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem }],
        exactList: true,
        privileges: [],
        isEndUserUI: false,
      });
      expect(result[0].subItems).toHaveLength(1);
      expect(result[0].subItems[0].id).toBe('alpha_user');
    });

    it('hides alpha_user sub-items inside a group when hideAlphaUsersMenuItem is true', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...groupItem }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
        hideAlphaUsersMenuItem: true,
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('privilege filtering', () => {
    it('excludes managed-object top-level items when the user has no matching privilege', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...managedItem }],
        exactList: true,
        privileges: [],
        isEndUserUI: true,
      });
      expect(result.find((item) => item.id === 'alpha_user')).toBeUndefined();
    });

    it('includes managed-object top-level items when the user has a matching privilege', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...managedItem }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
      });
      expect(result.find((item) => item.id === 'alpha_user')).toBeTruthy();
    });

    it('hides alpha_user top-level items when hideAlphaUsersMenuItem is true', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...managedItem }],
        exactList: true,
        privileges: [alphaUserPrivilege],
        isEndUserUI: true,
        hideAlphaUsersMenuItem: true,
      });
      expect(result.find((item) => item.id === 'alpha_user')).toBeUndefined();
    });

    it('omits disabled menu items', () => {
      const result = generateEndUserMenuItems({
        configuredMenuItems: [{ ...profileItem, disabled: true }],
        exactList: true,
        privileges: [],
        isEndUserUI: true,
      });
      expect(result.find((item) => item.id === 'profile')).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// buildMenuItemsFromTheme
// ---------------------------------------------------------------------------

describe('buildMenuItemsFromTheme', () => {
  const knownItem = { id: 'dashboard', label: { en: 'Dashboard' }, icon: 'dashboard' };
  const unknownItem = { id: 'not-a-real-menu-item', label: { en: 'Ghost' }, icon: 'help' };

  it('returns theme items that are known to allEndUserMenuItems', () => {
    const result = buildMenuItemsFromTheme([knownItem], [knownItem]);
    expect(result.map((item) => item.id)).toContain('dashboard');
  });

  it('filters out unknown (non-managed, non-custom, non-divider, non-group) items', () => {
    const result = buildMenuItemsFromTheme([unknownItem], [knownItem]);
    expect(result.find((item) => item.id === 'not-a-real-menu-item')).toBeUndefined();
  });

  it('keeps managed-object items even if absent from allEndUserMenuItems', () => {
    const result = buildMenuItemsFromTheme([{ ...managedItem }], [knownItem]);
    expect(result.find((item) => item.id === 'alpha_user')).toBeTruthy();
  });

  it('keeps custom items even if absent from allEndUserMenuItems', () => {
    const customItem = { id: 'custom', label: { en: 'Link' }, url: 'https://example.com' };
    const result = buildMenuItemsFromTheme([customItem], [knownItem]);
    expect(result.find((item) => item.id === 'custom')).toBeTruthy();
  });

  it('keeps divider items even if absent from allEndUserMenuItems', () => {
    const divider = { id: 'divider', isDivider: true };
    const result = buildMenuItemsFromTheme([divider], [knownItem]);
    expect(result.find((item) => item.id === 'divider')).toBeTruthy();
  });

  it('keeps group items even if absent from allEndUserMenuItems', () => {
    const result = buildMenuItemsFromTheme([{ ...groupItem }], [knownItem]);
    expect(result.find((item) => item.id === 'group')).toBeTruthy();
  });

  it('backfills label from allEndUserMenuItems when theme item has no label', () => {
    const themeItem = { id: 'dashboard', icon: 'dashboard' };
    const result = buildMenuItemsFromTheme([themeItem], [knownItem]);
    expect(result[0].label).toEqual(knownItem.label);
  });

  it('does not overwrite a label that is already present on the theme item', () => {
    const themeItem = { id: 'dashboard', icon: 'dashboard', label: { en: 'My Dashboard' } };
    const result = buildMenuItemsFromTheme([themeItem], [knownItem]);
    expect(result[0].label).toEqual({ en: 'My Dashboard' });
  });

  describe('exactList=false (additive / default)', () => {
    it('appends allEndUserMenuItems not already present in the theme list', () => {
      const extraItem = { id: 'profile', label: { en: 'Profile' } };
      const result = buildMenuItemsFromTheme([knownItem], [knownItem, extraItem], false);
      expect(result.map((item) => item.id)).toContain('profile');
    });

    it('does not append disabled items from allEndUserMenuItems', () => {
      const disabledItem = { id: 'profile', label: { en: 'Profile' }, disabled: true };
      const result = buildMenuItemsFromTheme([knownItem], [knownItem, disabledItem], false);
      expect(result.find((item) => item.id === 'profile')).toBeUndefined();
    });

    it('does not append trailing dividers when all new items are dividers', () => {
      const divider = { id: 'divider', isDivider: true };
      const result = buildMenuItemsFromTheme([knownItem], [knownItem, divider], false);
      expect(result.filter((item) => item.id === 'divider')).toHaveLength(0);
    });
  });

  describe('exactList=true', () => {
    it('returns only the built theme items — does not append anything from allEndUserMenuItems', () => {
      const extraItem = { id: 'profile', label: { en: 'Profile' } };
      const result = buildMenuItemsFromTheme([knownItem], [knownItem, extraItem], true);
      expect(result.map((item) => item.id)).toEqual(['dashboard']);
    });

    it('still filters out unknown items even with exactList=true', () => {
      const result = buildMenuItemsFromTheme([unknownItem], [knownItem], true);
      expect(result).toHaveLength(0);
    });
  });
});
