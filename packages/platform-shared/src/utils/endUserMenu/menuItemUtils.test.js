import {
  generateMinimalMenuItemForTheme,
  normalizeMenuItems,
  getUniqueMenuItems,
  createMenuRouteObject,
  checkIfAlphaUsersShouldBeHidden,
  getMenuBadgeInfo,
  createPrivilegeMenuId,
  createManagedObjectMenuItem,
  getValidManagedObjectMenuId,
} from './menuItemUtils';

describe('normalizeMenuItems', () => {
  it('enriches menu items with label and labelKey', () => {
    const items = [{ id: 'dashboard', icon: 'icon', label: { en: 'Dashboard' } }];
    const result = normalizeMenuItems(items);
    expect(result[0]).toMatchObject({
      id: 'dashboard',
      icon: 'icon',
      labelKey: 'sideMenu.endUser.dashboard',
      label: { en: 'Dashboard' },
    });
  });

  it('populates subItems', () => {
    const items = [{
      id: 'inbox',
      icon: 'icon',
      subItems: [{ id: 'approvals', label: { en: 'Approvals' } }],
    }];
    const result = normalizeMenuItems(items);
    expect(result[0].subItems[0]).toMatchObject({
      id: 'approvals',
      labelKey: 'sideMenu.endUser.approvals',
      label: { en: 'Approvals' },
    });
  });

  it('should fallback to id as icon if no icon is provided', () => {
    const items = [{ id: 'dashboard', label: { en: 'Dashboard' } }];
    const result = normalizeMenuItems(items);
    expect(result[0].icon).toBe('dashboard');
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
    const result = getUniqueMenuItems(items);
    expect(result).toEqual([
      { id: 'a' },
      { id: 'divider' },
      { id: 'custom' },
      { id: 'custom' },
      { id: 'b' },
    ]);
  });

  it('returns empty array for undefined', () => {
    expect(getUniqueMenuItems(undefined)).toEqual([]);
  });
});

describe('generateMinimalMenuItemForTheme', () => {
  it('returns divider as is', () => {
    const item = { id: 'divider', icon: 'horizontal_rule', isDivider: true };
    expect(generateMinimalMenuItemForTheme(item)).toEqual(item);
  });

  it('extracts properties and computes label', () => {
    const item = {
      id: 'dashboard',
      icon: 'icon',
      labelKey: 'label.key',
      label: { en: 'Dashboard' },
    };
    expect(generateMinimalMenuItemForTheme(item)).toMatchObject({
      id: 'dashboard',
      icon: 'icon',
      labelKey: 'label.key',
      label: { en: 'Dashboard' },
    });
  });

  it('handles subItems and selectedSubItems', () => {
    const item = {
      id: 'inbox',
      icon: 'icon',
      labelKey: 'label.key',
      label: { en: 'Inbox' },
      subItems: [{
        id: 'a',
        icon: 'a',
        labelKey: 'label.key.a',
        label: { en: 'a' },
      },
      {
        id: 'b',
        icon: 'b',
        labelKey: 'label.key.b',
        label: { en: 'b' },
      }],
    };
    const minimalItem = generateMinimalMenuItemForTheme(item);
    expect(minimalItem.selectedSubItems).toEqual(['a', 'b']);
    expect(minimalItem.subItems).toHaveLength(2);
    expect(minimalItem.subItems[0]).toMatchObject({
      id: 'a',
      icon: 'a',
      labelKey: 'label.key.a',
      label: { en: 'a' },
    });
    expect(minimalItem.subItems[1]).toMatchObject({
      id: 'b',
      icon: 'b',
      labelKey: 'label.key.b',
      label: { en: 'b' },
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
    expect(generateMinimalMenuItemForTheme(item)).toMatchObject({
      isManagedObject: true,
      url: '/some-url',
    });

    // ensure url/ isManagedObject are not added if not present
    const itemWithoutUrl = {
      id: 'custom',
      icon: 'icon',
      labelKey: 'label.key',
    };
    expect(generateMinimalMenuItemForTheme(itemWithoutUrl).url).toBeUndefined();

    const nonManagedItem = {
      id: 'abc',
      icon: 'icon',
      labelKey: 'label.key',
    };
    expect(generateMinimalMenuItemForTheme(nonManagedItem).isManagedObject).toBeUndefined();
  });

  it('should contain disabled field if menu item is disabled', () => {
    const item = {
      id: 'disabled-item',
      icon: 'icon',
      labelKey: 'label.key',
      disabled: true,
    };
    const minimalItem = generateMinimalMenuItemForTheme(item);
    expect(minimalItem.disabled).toBe(true);
  });

  it('should not contain disabled field if menu item is not disabled', () => {
    const item = {
      id: 'enabled-item',
      icon: 'icon',
      labelKey: 'label.key',
    };
    const minimalItem = generateMinimalMenuItemForTheme(item);
    expect(minimalItem.disabled).toBeUndefined();
  });
});

describe('createMenuRouteObject', () => {
  it('returns route object for managed object with INTERNAL_ROLE', () => {
    const menuItem = { isManagedObject: true, id: 'internal/role' };
    const result = createMenuRouteObject(menuItem, {});
    expect(result).toEqual({
      routeTo: {
        name: 'ListResource',
        params: { resourceType: 'internal', resourceName: 'role' },
      },
    });
  });

  it('returns route object for managed object with other id', () => {
    const menuItem = { isManagedObject: true, id: 'managed1' };
    const result = createMenuRouteObject(menuItem, {});
    expect(result).toEqual({
      routeTo: {
        name: 'ListResource',
        params: { resourceType: 'managed', resourceName: 'managed1' },
      },
    });
  });

  it('returns routeTo from sourceMenuItem if no subItems', () => {
    const menuItem = { subItems: undefined };
    const sourceMenuItem = { routeTo: { name: 'OtherRoute' } };
    expect(createMenuRouteObject(menuItem, sourceMenuItem)).toEqual({ routeTo: sourceMenuItem.routeTo });
  });

  it('returns empty object if subItems exist', () => {
    const menuItem = { subItems: [{ id: 'sub1' }] };
    expect(createMenuRouteObject(menuItem, {})).toEqual({});
  });
});

describe('checkIfAlphaUsersShouldBeHidden', () => {
  it('returns true for alpha_user id when hideAlphaUsersMenuItem is true', () => {
    expect(checkIfAlphaUsersShouldBeHidden({ id: 'alpha_user' }, true)).toBe(true);
  });

  it('returns true for privilegePath managed/alpha_user when hideAlphaUsersMenuItem is true', () => {
    expect(checkIfAlphaUsersShouldBeHidden({ privilegePath: 'managed/alpha_user' }, true)).toBe(true);
  });

  it('returns false when hideAlphaUsersMenuItem is false', () => {
    expect(checkIfAlphaUsersShouldBeHidden({ id: 'alpha_user' }, false)).toBe(false);
  });

  it('returns false for other ids', () => {
    expect(checkIfAlphaUsersShouldBeHidden({ id: 'other' }, true)).toBe(false);
  });
});

describe('getMenuBadgeInfo', () => {
  it('returns badge info if showBadgeWithContentFromStore is present', () => {
    expect(getMenuBadgeInfo({ showBadgeWithContentFromStore: 'badge' })).toEqual({ showBadgeWithContentFromStore: 'badge' });
  });

  it('returns empty object if showBadgeWithContentFromStore is not present', () => {
    expect(getMenuBadgeInfo({})).toEqual({});
  });
});

describe('createPrivilegeMenuId', () => {
  it('returns INTERNAL_ROLE for privilegePath internal/role', () => {
    expect(createPrivilegeMenuId({ privilegePath: 'internal/role' })).toBe('internal/role');
  });

  it('returns second part of privilegePath for managed object', () => {
    expect(createPrivilegeMenuId({ privilegePath: 'managed/abc' })).toBe('abc');
  });
});

describe('createManagedObjectMenuItem', () => {
  it('returns undefined if checkIfAlphaUsersShouldBeHidden is true', () => {
    const privilege = {
      id: 'alpha_user',
      privilegePath: 'managed/alpha_user',
      title: 'Alpha',
      'mat-icon': 'icon',
    };
    expect(createManagedObjectMenuItem(privilege, true)).toBeUndefined();
  });

  it('returns managed object menu item for managed privilege', () => {
    const privilege = { privilegePath: 'managed/abc', title: 'Title', 'mat-icon': 'icon' };
    const result = createManagedObjectMenuItem(privilege, false);
    expect(result).toMatchObject({
      id: 'abc',
      icon: 'icon',
      label: { en: 'Title' },
      isManagedObject: true,
      routeTo: {
        name: 'ListResource',
        params: { resourceType: 'managed', resourceName: 'abc' },
      },
    });
  });

  it('returns managed object menu item for internal role', () => {
    const privilege = { privilegePath: 'internal/role', title: 'Role', 'mat-icon': 'icon' };
    const result = createManagedObjectMenuItem(privilege, false);
    expect(result).toMatchObject({
      id: 'internal/role',
      icon: 'icon',
      label: { en: 'Role' },
      isManagedObject: true,
      routeTo: {
        name: 'ListResource',
        params: { resourceType: 'internal', resourceName: 'role' },
      },
    });
  });

  it('uses default icon if mat-icon is missing', () => {
    const privilege = { privilegePath: 'managed/abc', title: 'Title' };
    const result = createManagedObjectMenuItem(privilege, false);
    expect(result.icon).toBe('check_box_outline_blank');
  });

  describe('getValidManagedObjectMenuId', () => {
    it('returns prefixed id for not allowed names', () => {
      expect(getValidManagedObjectMenuId('custom')).toBe('managed-custom');
      expect(getValidManagedObjectMenuId('divider')).toBe('managed-divider');
    });

    it('returns original id for allowed names', () => {
      expect(getValidManagedObjectMenuId('allowed')).toBe('allowed');
      expect(getValidManagedObjectMenuId('managed-allowed')).toBe('managed-allowed');
    });

    it('allows custom prefix', () => {
      expect(getValidManagedObjectMenuId('custom', ['custom'], 'test-')).toBe('test-custom');
    });
  });
});
