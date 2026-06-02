/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { getApplications, getObjectTypeSchema } from './ApplicationsApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('ApplicationsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApplications', () => {
    it('should return a list of applications with query parameters', async () => {
      const mockResponse = { data: [{ id: 'app1', name: 'Application One' }] };
      const queryParams = { page: 1, size: 10 };
      const encodedQueryParams = '?page=1&size=10';
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getApplications(null, queryParams);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(queryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/application?page=1&size=10');
    });

    it('should return a list of applications without query parameters', async () => {
      const mockResponse = { data: [{ id: 'app1', name: 'Application One' }] };
      encodeQueryString.mockReturnValue('');
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getApplications();
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith({});
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/application');
    });
  });

  describe('getObjectTypeSchema', () => {
    it('should call the correct endpoint with applicationId and objectType', async () => {
      const mockResponse = { data: { properties: {} } };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getObjectTypeSchema('app1', '__ACCOUNT__');
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/application/app1/__ACCOUNT__/schema');
    });
  });
});
