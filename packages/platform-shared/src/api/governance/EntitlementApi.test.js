/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { getEntitlementList, getEntitlementById, getEntitlementUsers } from './EntitlementApi';
import EntitlementApiMock from './EntitlementApiMock.json';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('EntitlementApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntitlementList', () => {
    it('should return a list of entitlements', async () => {
      const result = await getEntitlementList();
      expect(result.data).toEqual(EntitlementApiMock);
    });
  });

  describe('getEntitlementById', () => {
    it('should return entitlement details for a given ID', async () => {
      const mockResponse = { data: { id: '123', name: 'Test Entitlement' } };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getEntitlementById('123');
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/entitlement/123');
    });
  });

  describe('getEntitlementUsers', () => {
    it('should return users assigned to a specific entitlement', async () => {
      const mockResponse = { data: [{ id: 'user1', name: 'User One' }] };
      const queryParams = { page: 1, size: 10 };
      const encodedQueryParams = '?page=1&size=10';
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getEntitlementUsers('123', queryParams);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(queryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/entitlement/123/assignments/users?page=1&size=10');
    });
  });
});
