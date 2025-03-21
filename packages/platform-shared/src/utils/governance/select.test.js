/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getOption, getQueryParams, getDefaultGovOption,
} from '@/utils/governance/select';

describe('Select Utils', () => {
  describe('getOption', () => {
    it('should return an option object with text and value', () => {
      const resource = { name: 'Resource Name', id: 'resource-id' };
      const result = getOption(resource);
      expect(result).toEqual({ text: 'Resource Name', value: 'resource-id' });
    });
  });

  describe('getQueryParams', () => {
    it('should return an empty object if queryString is not provided', () => {
      const result = getQueryParams(null, 'application');
      expect(result).toEqual({ authoritative: false });
    });

    it('should return queryParams with queryString if queryString is provided', () => {
      const result = getQueryParams('query', 'application');
      expect(result).toEqual({ queryString: 'query', authoritative: false });
    });

    it('should not include authoritative for non-application resourceType', () => {
      const result = getQueryParams('query', 'user');
      expect(result).toEqual({ queryString: 'query' });
    });
  });

  describe('getDefaultGovOption', () => {
    it('should return user option with full name for user resourceType', () => {
      const resource = {
        givenName: 'John', sn: 'Doe', id: 'user-id', userName: 'jane.doe',
      };
      const result = getDefaultGovOption(resource, 'user');
      expect(result).toEqual({
        text: 'John Doe (jane.doe)',
        userInfo: resource,
        value: 'user-id',
      });
    });

    it('should return user option with full name for realm-specific user resourceType', () => {
      const resource = {
        givenName: 'Jane', sn: 'Doe', id: 'user-id', userName: 'jane.doe',
      };
      const result = getDefaultGovOption(resource, 'realm/user');
      expect(result).toEqual({
        text: 'Jane Doe (jane.doe)',
        userInfo: resource,
        value: 'user-id',
      });
    });

    it('should return default option for non-user resourceType', () => {
      const resource = { name: 'Resource Name', id: 'resource-id' };
      const result = getDefaultGovOption(resource, 'application');
      expect(result).toEqual({ ...resource, text: 'Resource Name', value: 'resource-id' });
    });
  });
});
