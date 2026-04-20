/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getActivityLogs,
  getActivityLogsForObject,
} from './ActivityApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('ActivityApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivityLogs', () => {
    it('should fetch activity logs with query parameters', async () => {
      const queryParams = { _pageSize: 10 };
      const encodedQueryParams = '?_pageSize=10';
      const mockResponse = [{ object_id: '123', object_type: 'agent', actor_global_id: 'abc123' }];
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityLogs(queryParams);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/activity${encodedQueryParams}`);
    });
  });

  describe('getActivityLogsForObject', () => {
    it('should fetch activity logs for a specific object', async () => {
      const objectId = '123';
      const objectType = 'agent';
      const queryParams = { _pageSize: 10 };
      const encodedQueryParams = '?_pageSize=10&object_id=123&object_type=agent';
      const mockResponse = [{ object_id: '123', object_type: 'agent', actor_global_id: 'abc123' }];
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityLogsForObject(objectId, objectType, queryParams);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/activity${encodedQueryParams}`);
    });
  });
});
