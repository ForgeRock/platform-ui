/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  formatColumns,
  getCellData,
  getInitialColumns,
  getAllColumnCategories,
} from './certificationColumns';

describe('getCellData', () => {
  it('returns blankValueIndicator if data is empty', () => {
    const result = getCellData({});
    expect(result).toBe(blankValueIndicator);
  });

  it('returns blankValueIndicator if columnData is null', () => {
    const data = {
      field: { category: 'user', key: 'name' },
      item: { user: { name: null } },
    };
    const result = getCellData(data);
    expect(result).toBe(blankValueIndicator);
  });

  it('returns blankValueIndicator if columnData is undefined', () => {
    const data = {
      field: { category: 'account', key: 'email' },
      item: { account: {} },
    };
    const result = getCellData(data);
    expect(result).toBe(blankValueIndicator);
  });

  it('returns the columnData if present and not nil', () => {
    const data = {
      field: { category: 'account', key: 'email' },
      item: { account: { email: 'foo@bar.com' } },
    };
    const result = getCellData(data);
    expect(result).toBe('foo@bar.com');
  });

  it('handles glossary attribute keys correctly', () => {
    const data = {
      field: { category: 'user', key: 'glossary.someGlossaryKey' },
      item: { glossary: { idx: { '/user': { someGlossaryKey: 'Glossary Value' } } } },
    };
    const result = getCellData(data);
    expect(result).toBe('Glossary Value');
  });
});

describe('formatColumns', () => {
  it('returns empty arrays for all categories if rawColumns is empty', () => {
    expect(formatColumns(null)).toEqual({
      user: [],
      application: [],
      entitlement: [],
      account: [],
      role: [],
    });
    expect(formatColumns(undefined)).toEqual({
      user: [],
      application: [],
      entitlement: [],
      account: [],
      role: [],
    });
    expect(formatColumns({})).toEqual({
      user: [],
      application: [],
      entitlement: [],
      account: [],
      role: [],
    });
  });

  it('parses and returns columns for each category', () => {
    const rawColumns = {
      user: [{ key: 'name', displayName: 'Name' }],
      application: [{ key: 'app', displayName: 'App' }],
      entitlement: [{ key: 'ent', displayName: 'Ent' }],
      account: [{ key: 'acc', displayName: 'Acc' }],
      role: [{ key: 'role', displayName: 'Role' }],
    };
    const result = formatColumns(rawColumns);
    expect(result.user[0]).toMatchObject({
      key: 'name',
      displayName: 'Name',
      category: 'user',
      label: expect.stringContaining('Name'),
      class: 'text-truncate fr-access-cell',
      show: false,
      sortable: false,
    });
    expect(result.application[0].category).toBe('application');
    expect(result.entitlement[0].category).toBe('entitlement');
    expect(result.account[0].category).toBe('account');
    expect(result.role[0].category).toBe('role');
  });

  it('filters out user columns with "Generic" in the label', () => {
    const rawColumns = {
      user: [
        { key: 'generic', displayName: 'Generic User' },
        { key: 'name', displayName: 'Name' },
      ],
      application: [],
      entitlement: [],
      account: [],
      role: [],
    };
    const result = formatColumns(rawColumns);
    expect(result.user.length).toBe(1);
    expect(result.user[0].displayName).toBe('Name');
  });

  it('returns empty arrays for categories with no columns', () => {
    const rawColumns = {
      user: [],
      application: [],
      entitlement: [],
      account: [],
      role: [],
    };
    const result = formatColumns(rawColumns);
    expect(result.user).toEqual([]);
    expect(result.application).toEqual([]);
    expect(result.entitlement).toEqual([]);
    expect(result.account).toEqual([]);
    expect(result.role).toEqual([]);
  });
});

describe('getInitialColumns', () => {
  it('returns custom columns if customColumnConfig is provided and showAccountDrilldown/accountEntitlement are false', () => {
    const customColumns = ['user.name', 'account.email'];
    const customColumnConfig = { accounts: customColumns };
    const columnCategories = [
      {
        name: 'user',
        items: [{ key: 'name', label: 'User Name', category: 'user' }],
      },
      {
        name: 'account',
        items: [{ key: 'email', label: 'Account Email', category: 'account' }],
      },
    ];
    const result = getInitialColumns('accounts', null, false, customColumnConfig, columnCategories);
    expect(result).toEqual([
      {
        key: 'name', label: 'User Name', category: 'user', show: true,
      },
      {
        key: 'email', label: 'Account Email', category: 'account', show: true,
      },
      {
        key: 'actions',
        class: 'w-200px cert-actions border-left fr-access-cell',
        label: '',
        sortable: false,
        show: true,
      },
    ]);
  });

  it('returns OOTB columns for account grantType', () => {
    const result = getInitialColumns('accounts', null, true, null, null);
    expect(result.map((c) => c.key)).toEqual(['user', 'application', 'account', 'flags', 'comments', 'actions']);
  });

  it('returns OOTB columns filtered by grantType "entitlements"', () => {
    const result = getInitialColumns('entitlements', null, false, null, null);
    expect(result.map((c) => c.key)).toEqual(['user', 'application', 'entitlement', 'account', 'flags', 'comments', 'actions']);
  });

  it('returns OOTB columns filtered by grantType "roles"', () => {
    const result = getInitialColumns('roles', null, false, null, null);
    expect(result.map((c) => c.key)).toEqual(['role', 'user', 'flags', 'comments', 'actions']);
  });

  it('returns OOTB columns filtered by "accountEntitlement" if entitlementUserId is provided', () => {
    const result = getInitialColumns('accounts', 'someUserId', false, null, null);
    expect(result.map((c) => c.key)).toEqual(['entitlement', 'flags', 'comments', 'actions']);
  });

  it('removes showFor property from all returned columns', () => {
    const result = getInitialColumns('accounts', null, false, null, null);
    result.forEach((col) => {
      expect(col.showFor).toBeUndefined();
    });
  });

  it('defaults grantType to "accounts" if not provided', () => {
    const result = getInitialColumns(undefined, null, false, null, null);
    expect(result.map((c) => c.key)).toEqual(['user', 'application', 'account', 'flags', 'comments', 'actions']);
  });
});

describe('getAllColumnCategories', () => {
  it('returns only categories relevant to the grantType', () => {
    const categories = getAllColumnCategories('accounts', {});
    const categoryNames = categories.map((cat) => cat.name);
    expect(categoryNames).toEqual(expect.arrayContaining(['review', 'user', 'application', 'account']));
    expect(categoryNames).not.toContain('role');
    expect(categoryNames).not.toContain('entitlement');
  });

  it('removes showFor property from returned categories', () => {
    const categories = getAllColumnCategories('accounts', {});
    categories.forEach((cat) => {
      expect(cat.showFor).toBeUndefined();
    });
  });

  it('appends filterPropertyColumns to matching category items', () => {
    const filterProperties = {
      user: [{ key: 'customUser', displayName: 'Custom User' }],
      account: [{ key: 'customAccount', displayName: 'Custom Account' }],
    };
    const categories = getAllColumnCategories('accounts', filterProperties);
    const userCategory = categories.find((cat) => cat.name === 'user');
    const accountCategory = categories.find((cat) => cat.name === 'account');
    expect(userCategory.items.some((item) => item.key === 'customUser')).toBe(true);
    expect(accountCategory.items.some((item) => item.key === 'customAccount')).toBe(true);
  });

  it('returns empty array if no categories match the grantType', () => {
    // Use a grantType that is not in any showFor
    const categories = getAllColumnCategories('nonexistentType', {});
    expect(categories).toEqual([]);
  });

  it('defaults grantType to "accounts" if not provided', () => {
    const categories = getAllColumnCategories(undefined, {});
    const categoryNames = categories.map((cat) => cat.name);
    expect(categoryNames).toEqual(expect.arrayContaining(['review', 'user', 'application', 'account']));
  });

  it('handles empty filterProperties gracefully', () => {
    const categories = getAllColumnCategories('accounts', undefined);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });
});
