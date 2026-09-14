/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getAccountAttribute,
  getAccountObjectTypeNameFromApp,
  getModifyEntitlementObjectType,
  getObjectTypeFromAccountId,
  normalizeOwners,
} from './entitlements';

describe('getAccountObjectTypeNameFromApp', () => {
  it('returns the object type canonicalized against app.objectTypes casing', () => {
    const app = {
      connectorId: 'Ldap',
      objectTypes: [{ name: '__ACCOUNT__' }],
      mappingNames: ['systemLdap__account___managedAlpha_user'],
    };
    expect(getAccountObjectTypeNameFromApp(app)).toBe('__ACCOUNT__');
  });

  it('returns the parsed mapping name when the app declares no objectTypes', () => {
    const app = {
      connectorId: 'testConnector',
      mappingNames: ['systemTestconnectorAccount_managedAlpha_user'],
    };
    expect(getAccountObjectTypeNameFromApp(app)).toBe('Account');
  });

  it('ignores non-inbound-user mappings and object types that match nothing', () => {
    const app = {
      connectorId: 'Ldap',
      objectTypes: [{ name: '__GROUP__' }, { name: '__ACCOUNT__' }],
      mappingNames: [
        'systemLdap__GROUP___managedLdap_group',
        'manageduser_systemLdap__ACCOUNT__',
        'systemOther__ACCOUNT___managedAlpha_user',
        'systemLdap__ACCOUNT___managedAlpha_user',
      ],
    };
    expect(getAccountObjectTypeNameFromApp(app)).toBe('__ACCOUNT__');
  });

  it('returns undefined when no inbound user mapping exists', () => {
    const app = {
      connectorId: 'Ldap',
      objectTypes: [{ name: '__GROUP__' }],
      mappingNames: ['systemLdap__GROUP__managedLdap_group'],
    };
    expect(getAccountObjectTypeNameFromApp(app)).toBeUndefined();
  });

  it('returns undefined when mappingNames is missing', () => {
    expect(getAccountObjectTypeNameFromApp({ connectorId: 'Ldap' })).toBeUndefined();
  });
});

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

describe('getModifyEntitlementObjectType', () => {
  it('parses the object type from the middle segment of the entitlement id for a disconnected application', () => {
    const request = {
      application: { isDisconnected: true, objectTypes: [{ name: 'User', type: 'account' }, { name: 'Roles', type: 'resource', accountAttribute: 'entitlement_grants' }] },
      request: { entitlement: { entitlementId: '02a76934-b13d-4806-9e38-562fdef7b150/Roles/ProblemSolving' } },
    };
    expect(getModifyEntitlementObjectType(request)).toBe('Roles');
  });

  it('matches the assignment attribute name against the object types for a connected application', () => {
    const request = {
      application: {
        isDisconnected: false,
        objectTypes: [
          { name: 'agentTool', accountAttribute: 'toolIds' },
          { name: 'agentKnowledgeBase', accountAttribute: 'knowledgeBaseIds' },
        ],
      },
      assignment: { attributes: [{ name: 'toolIds', value: ['code_interpreter:a5d29744ea70'] }] },
    };
    expect(getModifyEntitlementObjectType(request)).toBe('agentTool');
  });

  it('returns an empty string for a disconnected application when the entitlement id is missing', () => {
    const request = {
      application: { isDisconnected: true },
      request: { entitlement: {} },
    };
    expect(getModifyEntitlementObjectType(request)).toBe('');
  });

  it('returns an empty string for a disconnected application when the entitlement id has an unexpected format', () => {
    const request = {
      application: { isDisconnected: true },
      request: { entitlement: { entitlementId: 'no-segments-here' } },
    };
    expect(getModifyEntitlementObjectType(request)).toBe('');
  });

  it('returns an empty string for a connected application when no object type matches the assignment attribute', () => {
    const request = {
      application: { isDisconnected: false, objectTypes: [{ name: 'agentTool', accountAttribute: 'toolIds' }] },
      assignment: { attributes: [{ name: 'unknownAttribute', value: [] }] },
    };
    expect(getModifyEntitlementObjectType(request)).toBe('');
  });

  it('returns an empty string for a connected application when the assignment has no attributes', () => {
    const request = {
      application: { isDisconnected: false, objectTypes: [{ name: 'User', type: 'account' }, { name: 'Roles', accountAttribute: 'entitlement_grants' }] },
      assignment: {},
    };
    expect(getModifyEntitlementObjectType(request)).toBe('');
  });

  it('returns an empty string when the request is undefined', () => {
    expect(getModifyEntitlementObjectType(undefined)).toBe('');
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
