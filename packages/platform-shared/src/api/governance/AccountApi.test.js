/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getAccounts,
  getAccountById,
  getAccountEntitlements,
  getAccountGlossaryAttributesData,
  saveAccountGlossaryAttributesData,
} from './AccountApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('AccountApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccounts', () => {
    it('should fetch accounts with query parameters', async () => {
      const queryParams = { _pageSize: 10 };
      const encodedQueryParams = '?_pageSize=10';
      const mockResponse = [{ id: '123', account: { __NAME__: 'Account 123' } }];
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAccounts(queryParams);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/account${encodedQueryParams}`);
    });
  });

  describe('getAccountById', () => {
    it('should fetch account details by ID', async () => {
      const accountId = '123';
      const mockResponse = { id: accountId, account: { __NAME__: 'Account 123' } };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAccountById(accountId);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/account/${accountId}`);
    });
  });

  describe('getAccountGlossaryAttributesData', () => {
    it('should fetch glossary attributes data for an account', async () => {
      const accountId = '123';
      const mockResponse = { actors: ['managed/user/abc'], customAttribute1: 'test', accountType: 'default' };
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAccountGlossaryAttributesData(accountId);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/account/${accountId}/glossary`);
    });
  });

  describe('saveAccountGlossaryAttributesData', () => {
    it('should save glossary attributes data for an account', async () => {
      const accountId = '123';
      const payload = { actors: ['managed/user/abc'], customAttribute1: 'test', accountType: 'default' };
      const mockResponse = { actors: ['managed/user/abc'], customAttribute1: 'test', accountType: 'default' };
      generateIgaApi.mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await saveAccountGlossaryAttributesData(accountId, payload);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().put).toHaveBeenCalledWith(`governance/account/${accountId}/glossary`, payload);
    });
  });

  describe('getAccountEntitlements', () => {
    it('should fetch account entitlements with query parameters', async () => {
      const accountId = '123';
      const queryParams = { _pageSize: 10 };
      const encodedQueryParams = '?_pageSize=10';
      const mockResponse = [{ id: 'entitlement1' }];

      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAccountEntitlements(accountId, queryParams);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(queryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/account/${accountId}/entitlements${encodedQueryParams}`);
    });
  });
});
