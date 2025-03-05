/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getApplicationList,
  getEntitlementList,
  getEntitlementById,
  getEntitlementUsers,
  getEntitlementSchema,
} from './EntitlementApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('EntitlementApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntitlementList', () => {
    it('should return a list of entitlements with query parameters', async () => {
      const mockResponse = { data: [{ id: 'ent1', name: 'Entitlement One' }] };
      const queryParams = { page: 1, size: 10 };
      const encodedQueryParams = '?page=1&size=10';
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getEntitlementList('resource', queryParams);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(queryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/entitlement?page=1&size=10');
    });

    it('should return a list of entitlements without query parameters', async () => {
      const mockResponse = { data: [{ id: 'ent1', name: 'Entitlement One' }] };
      encodeQueryString.mockReturnValue('');
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getEntitlementList('resource');
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith({});
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/entitlement');
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
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/entitlement/123/grants?page=1&size=10');
    });

    describe('getEntitlementSchema', () => {
      it('should return the entitlement schema for a given application and object type', async () => {
        const mockResponse = { data: { schema: 'Test Schema' } };
        generateIgaApi.mockReturnValue({
          get: jest.fn().mockResolvedValue(mockResponse),
        });

        const application = 'testApp';
        const objectType = 'testObject';
        const result = await getEntitlementSchema(application, objectType);
        expect(result).toEqual(mockResponse);
        expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/application/${application}/${objectType}/schema`);
      });

      describe('getApplicationList', () => {
        it('should return a list of applications with query parameters', async () => {
          const mockResponse = { data: [{ id: 'app1', name: 'Application One' }] };
          const queryParams = { page: 1, size: 10 };
          const encodedQueryParams = '?page=1&size=10';
          encodeQueryString.mockReturnValue(encodedQueryParams);
          generateIgaApi.mockReturnValue({
            get: jest.fn().mockResolvedValue(mockResponse),
          });

          const result = await getApplicationList('resource', queryParams);
          expect(result).toEqual(mockResponse);
          expect(encodeQueryString).toHaveBeenCalledWith(queryParams);
          expect(generateIgaApi().get).toHaveBeenCalledWith('governance/application?page=1&size=10&scopePermission=createEntitlement');
        });

        it('should return a list of applications without query parameters', async () => {
          const mockResponse = { data: [{ id: 'app1', name: 'Application One' }] };
          encodeQueryString.mockReturnValue('');
          generateIgaApi.mockReturnValue({
            get: jest.fn().mockResolvedValue(mockResponse),
          });

          const result = await getApplicationList('resource');
          expect(result).toEqual(mockResponse);
          expect(encodeQueryString).toHaveBeenCalledWith({});
          expect(generateIgaApi().get).toHaveBeenCalledWith('governance/application&scopePermission=createEntitlement');
        });
      });
    });
  });
});
