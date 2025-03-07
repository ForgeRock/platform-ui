/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { searchCatalogEntitlements } from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import {
  getResourceFunction,
  getResourcePath,
  getResourceType,
  getValuePath,
  optionFunction,
  queryParamFunction,
} from './govObjectSelect';

describe('objectSelect utils', () => {
  describe('getResourceFunction', () => {
    it('returns getManagedResourceList for user', () => {
      expect(getResourceFunction('user')).toBe(getManagedResourceList);
    });

    it('returns getManagedResourceList for role', () => {
      expect(getResourceFunction('role')).toBe(getManagedResourceList);
    });

    it('returns searchCatalogEntitlements for entitlement', () => {
      expect(getResourceFunction('entitlement')).toBe(searchCatalogEntitlements);
    });

    it('returns getResource for other types', () => {
      expect(getResourceFunction('application')).toBe(getResource);
    });
  });

  describe('getResourcePath', () => {
    it('returns alpha_user for user', () => {
      expect(getResourcePath('user')).toBe('alpha_user');
    });

    it('returns alpha_role for role', () => {
      expect(getResourcePath('role')).toBe('alpha_role');
    });

    it('returns propertyType for other types', () => {
      expect(getResourcePath('application')).toBe('application');
    });
  });

  describe('optionFunction', () => {
    it('returns formatted user option', () => {
      const resource = { givenName: 'John', sn: 'Doe', _id: 'userId1' };
      expect(optionFunction(resource, 'alpha_user')).toEqual({ userInfo: resource, text: 'John Doe', value: 'userId1' });
    });

    it('returns formatted role option', () => {
      const resource = { name: 'Admin', _id: 'roleId1' };
      expect(optionFunction(resource, 'alpha_role')).toEqual({ text: 'Admin', value: 'roleId1' });
    });

    it('returns formatted entitlement option', () => {
      const resource = { descriptor: { idx: { '/entitlement': { displayName: 'Entitlement1' } } }, assignment: { id: 'entitlementId1' } };
      expect(optionFunction(resource, 'entitlement')).toEqual({ text: 'Entitlement1', value: 'entitlementId1' });
    });

    it('returns formatted default option', () => {
      const resource = { name: 'App1', id: 'appId1' };
      expect(optionFunction(resource, 'application')).toEqual({ text: 'App1', value: 'appId1' });
    });
  });

  describe('queryParamFunction', () => {
    it('returns query params for user', () => {
      const queryString = 'John';
      const expectedParams = {
        pageSize: 10,
        fields: 'givenName,sn,userName',
        queryFilter: '/givenName sw "John" or /sn sw "John" or /userName sw "John"',
      };
      expect(queryParamFunction(queryString, 'alpha_user')).toEqual(expectedParams);
    });

    it('returns query params for role', () => {
      const queryString = 'Admin';
      const expectedParams = {
        pageSize: 10,
        fields: 'name',
        queryFilter: '/name sw "Admin"',
      };
      expect(queryParamFunction(queryString, 'alpha_role')).toEqual(expectedParams);
    });

    it('returns query params for single user resource', () => {
      const queryString = 'userId1';
      const expectedParams = {
        pageSize: 10,
        fields: 'givenName,sn,userName',
        queryFilter: '_id eq "userId1"',
      };
      expect(queryParamFunction(queryString, 'alpha_user', true)).toEqual(expectedParams);
    });

    it('returns query params for application', () => {
      const queryString = 'App1';
      const expectedParams = {
        queryString: 'App1',
        authoritative: false,
      };
      expect(queryParamFunction(queryString, 'application')).toEqual(expectedParams);
    });

    it('returns query params for other types', () => {
      const queryString = 'Org1';
      const expectedParams = {
        queryString: 'Org1',
      };
      expect(queryParamFunction(queryString, 'organization')).toEqual(expectedParams);
    });

    it('returns query params with custom query filter', () => {
      const queryString = 'John';
      const customQueryFilter = '/mail co "test"';
      const expectedParams = {
        pageSize: 10,
        fields: 'givenName,sn,userName',
        queryFilter: '(/givenName sw "John" or /sn sw "John" or /userName sw "John") and (/mail co "test")',
      };
      expect(queryParamFunction(queryString, 'alpha_user', false, customQueryFilter)).toEqual(expectedParams);
    });

    describe('getValuePath', () => {
      it('returns managed path for user', () => {
        expect(getValuePath('user', 'userId1')).toBe('managed/user/userId1');
      });

      it('returns managed path for role', () => {
        expect(getValuePath('role', 'roleId1')).toBe('managed/role/roleId1');
      });

      it('returns managed path for organization', () => {
        expect(getValuePath('organization', 'orgId1')).toBe('managed/organization/orgId1');
      });

      it('returns managed path for application', () => {
        expect(getValuePath('application', 'appId1')).toBe('managed/application/appId1');
      });

      it('returns entitlement path for entitlement', () => {
        expect(getValuePath('entitlement', 'entitlementId1')).toBe('entitlement/entitlementId1');
      });

      it('returns default path for other types', () => {
        expect(getValuePath('customType', 'customId1')).toBe('customType/customId1');
      });
    });

    describe('getResourceType', () => {
      it('returns user for managed/alpha_user', () => {
        expect(getResourceType('managed/alpha_user')).toBe('user');
      });

      it('returns user for user', () => {
        expect(getResourceType('user')).toBe('user');
      });

      it('returns application for managed/application', () => {
        expect(getResourceType('managed/application')).toBe('application');
      });
    });
  });
});
