/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getAccountAttribute, getObjectTypeFromAccountId, normalizeOwners } from './entitlements';

describe('getObjectTypeFromAccountId', () => {
  it('returns item.objectType when present, without parsing accountId', () => {
    expect(getObjectTypeFromAccountId({ objectType: 'User' }, { accountId: 'system/Target/Other/102' }, false)).toBe('User');
  });

  it('returns index 2 for a connected app accountId when item.objectType is absent', () => {
    expect(getObjectTypeFromAccountId(undefined, { accountId: 'system/Target/User/102' }, false)).toBe('User');
  });

  it('returns index 2 when isDisconnected is undefined', () => {
    expect(getObjectTypeFromAccountId(null, { accountId: 'system/Target/__ACCOUNT__/abc' }, undefined)).toBe('__ACCOUNT__');
  });

  it('returns index 1 for a disconnected app accountId', () => {
    expect(getObjectTypeFromAccountId(null, { accountId: 'App/__ACCOUNT__/abc' }, true)).toBe('__ACCOUNT__');
  });

  it('returns undefined when keys is undefined', () => {
    expect(getObjectTypeFromAccountId(null, undefined, false)).toBeUndefined();
  });

  it('returns undefined when accountId is missing', () => {
    expect(getObjectTypeFromAccountId(null, {}, false)).toBeUndefined();
  });
});

describe('getAccountAttribute', () => {
  it('should return the accountAttribute from item.item if it exists', () => {
    const input = {
      item: {
        accountAttribute: 'testAccountAttribute',
      },
    };
    const result = getAccountAttribute(input);
    expect(result).toBe('testAccountAttribute');
  });

  it('should return the accountAttribute from application.objectTypes if item.item.accountAttribute does not exist', () => {
    const input = {
      item: {
        objectType: 'testObjectType',
      },
      application: {
        objectTypes: [
          { name: 'testObjectType', accountAttribute: 'testAccountAttributeFromObjectTypes' },
        ],
      },
    };
    const result = getAccountAttribute(input);
    expect(result).toBe('testAccountAttributeFromObjectTypes');
  });

  it('should return undefined if neither item.item.accountAttribute nor application.objectTypes match', () => {
    const input = {
      item: {
        objectType: 'nonMatchingObjectType',
      },
      application: {
        objectTypes: [
          { name: 'testObjectType', accountAttribute: 'testAccountAttributeFromObjectTypes' },
        ],
      },
    };
    const result = getAccountAttribute(input);
    expect(result).toBeUndefined();
  });

  it('should return undefined if item is undefined', () => {
    const result = getAccountAttribute(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined if item.item and application.objectTypes are both undefined', () => {
    const input = {};
    const result = getAccountAttribute(input);
    expect(result).toBeUndefined();
  });
});

describe('normalizeOwners', () => {
  it('returns an array of owners unchanged when given multiple valid owners', () => {
    const owners = [{ userName: 'owner1' }, { userName: 'owner2' }];
    expect(normalizeOwners(owners)).toEqual(owners);
  });

  it('filters out null and empty-object entries from an owner array', () => {
    const owners = [{ userName: 'owner1' }, null, {}, undefined, { userName: 'owner2' }];
    expect(normalizeOwners(owners)).toEqual([{ userName: 'owner1' }, { userName: 'owner2' }]);
  });

  it('wraps a legacy single scalar owner object in an array', () => {
    const owner = { userName: 'legacyOwner' };
    expect(normalizeOwners(owner)).toEqual([owner]);
  });

  it('returns an empty array for an empty-object placeholder owner', () => {
    expect(normalizeOwners({})).toEqual([]);
  });

  it('returns an empty array for null', () => {
    expect(normalizeOwners(null)).toEqual([]);
  });

  it('returns an empty array for undefined', () => {
    expect(normalizeOwners(undefined)).toEqual([]);
  });

  it('returns an empty array for an empty array', () => {
    expect(normalizeOwners([])).toEqual([]);
  });
});
