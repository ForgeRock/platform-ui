/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { getCatalogObjectById } from './CatalogApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');

describe('CatalogApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCatalogObjectById', () => {
    it('fetches an entitlement catalog item with the default expandPaths', async () => {
      const mockResponse = { data: { id: 'abc', _displayData: {} } };
      generateIgaApi.mockReturnValue({ get: jest.fn().mockResolvedValue(mockResponse) });

      const result = await getCatalogObjectById('entitlementGrant', 'abc');

      expect(generateIgaApi().get).toHaveBeenCalledWith('/governance/catalog/entitlementGrant/abc?expandPaths=glossary.idx');
      expect(result).toEqual(mockResponse);
    });

    it('fetches a role catalog item', async () => {
      const mockResponse = { data: { id: 'role-1', _displayData: {} } };
      generateIgaApi.mockReturnValue({ get: jest.fn().mockResolvedValue(mockResponse) });

      await getCatalogObjectById('roleMembership', 'role-1');

      expect(generateIgaApi().get).toHaveBeenCalledWith('/governance/catalog/roleMembership/role-1?expandPaths=glossary.idx');
    });

    it('fetches an application catalog item', async () => {
      const mockResponse = { data: { id: 'app-1', _displayData: {} } };
      generateIgaApi.mockReturnValue({ get: jest.fn().mockResolvedValue(mockResponse) });

      await getCatalogObjectById('accountGrant', 'app-1');

      expect(generateIgaApi().get).toHaveBeenCalledWith('/governance/catalog/accountGrant/app-1?expandPaths=glossary.idx');
    });

    it('omits expandPaths when passed an empty array', async () => {
      generateIgaApi.mockReturnValue({ get: jest.fn().mockResolvedValue({}) });

      await getCatalogObjectById('entitlementGrant', 'abc', []);

      expect(generateIgaApi().get).toHaveBeenCalledWith('/governance/catalog/entitlementGrant/abc');
    });

    it('supports multiple expandPaths', async () => {
      generateIgaApi.mockReturnValue({ get: jest.fn().mockResolvedValue({}) });

      await getCatalogObjectById('entitlementGrant', 'abc', ['glossary.idx', 'request']);

      expect(generateIgaApi().get).toHaveBeenCalledWith('/governance/catalog/entitlementGrant/abc?expandPaths=glossary.idx,request');
    });
  });
});
