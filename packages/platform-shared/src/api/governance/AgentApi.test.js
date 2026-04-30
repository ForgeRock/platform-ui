/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi, generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getAgentResourcesByIds,
} from './AgentApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('AgentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAgentResourcesByIds', () => {
    it('should fetch agent resources for disconnected app with query parameters', async () => {
      const accountId = '123';
      const queryParams = { _pageSize: 10 };
      const updatedQueryParams = { _pageSize: 10, _queryFilter: 'objectType eq "tools" and (id eq "tool1")' };
      const encodedQueryParams = '?_pageSize=10&_queryFilter=objectType eq "tools" and (id eq "tool1")';
      const mockResponse = [{ id: 'tool1' }];

      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentResourcesByIds(queryParams, { id: accountId, isDisconnected: true }, 'tools', ['tool1']);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(updatedQueryParams);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/application/${accountId}/resources${encodedQueryParams}`);
    });

    it('should fetch agent resources for non-disconnected app with query parameters', async () => {
      const connectorId = 'connector-456';
      const queryParams = { _pageSize: 10 };
      const updatedQueryParams = { _pageSize: 10, _queryFilter: '_id eq "tool1"' };
      const encodedQueryParams = '?_pageSize=10&_queryFilter=_id eq "tool1"';
      const mockResponse = [{ _id: 'tool1' }];

      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIdmApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getAgentResourcesByIds(queryParams, { connectorId, isDisconnected: false }, 'tools', ['tool1']);
      expect(result).toEqual(mockResponse);
      expect(encodeQueryString).toHaveBeenCalledWith(updatedQueryParams);
      expect(generateIdmApi().get).toHaveBeenCalledWith(`/system/${connectorId}/tools${encodedQueryParams}`);
    });
  });
});
