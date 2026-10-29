/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getScopePermissionCategories,
  getScopePermissionKeys,
} from './scopePermissions';

describe('scopePermissions', () => {
  describe('getScopePermissionCategories', () => {
    it('returns an empty array when the object has no targetCondition (not a scope)', () => {
      expect(getScopePermissionCategories(null)).toEqual([]);
      expect(getScopePermissionCategories({})).toEqual([]);
      expect(getScopePermissionCategories({ id: 'entitlement-1', name: 'Some Entitlement' })).toEqual([]);
    });

    it('returns only the categories present in targetCondition, in display order', () => {
      const scope = {
        targetCondition: {
          role: { version: 'v2', filter: {} },
          user: { version: 'v2', filter: {} },
        },
      };
      expect(getScopePermissionCategories(scope)).toEqual(['role', 'user']);
    });

    it('returns all four categories when all are targeted', () => {
      const scope = {
        targetCondition: {
          application: {}, entitlement: {}, role: {}, user: {},
        },
      };
      expect(getScopePermissionCategories(scope)).toEqual(['application', 'entitlement', 'role', 'user']);
    });
  });

  describe('getScopePermissionKeys', () => {
    it('always includes the implied view permission for a targeted category', () => {
      const scope = { targetCondition: { application: {} }, permissions: {} };
      expect(getScopePermissionKeys(scope, 'application')).toEqual(['viewApplications']);
    });

    it('includes granted action permissions alongside the implied view permission', () => {
      const scope = {
        targetCondition: { role: {} },
        permissions: { createRole: true, publishRole: true, modifyRole: false },
      };
      expect(getScopePermissionKeys(scope, 'role')).toEqual(['viewRoles', 'createRole', 'publishRole']);
    });

    it('returns an empty array for an unknown category', () => {
      expect(getScopePermissionKeys({ permissions: {} }, 'unknown')).toEqual([]);
    });
  });
});
