/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { getNotificationTasks } from './NotificationTaskApi';

jest.mock('@forgerock/platform-shared/src/api/BaseApi');
jest.mock('@forgerock/platform-shared/src/utils/encodeQueryString');

describe('NotificationTaskApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationTasks', () => {
    it('should fetch notification tasks with query parameters', async () => {
      const queryParams = { pageSize: 10 };
      const encodedQueryParams = '?pageSize=10';
      const mockResponse = { data: { result: [], totalCount: 0 } };
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getNotificationTasks(queryParams);
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith(`governance/notification/task${encodedQueryParams}`);
    });

    it('should fetch notification tasks with no query parameters', async () => {
      const encodedQueryParams = '';
      const mockResponse = { data: { result: [], totalCount: 0 } };
      encodeQueryString.mockReturnValue(encodedQueryParams);
      generateIgaApi.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getNotificationTasks();
      expect(result).toEqual(mockResponse);
      expect(generateIgaApi().get).toHaveBeenCalledWith('governance/notification/task');
    });
  });
});
