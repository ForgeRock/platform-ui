/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import { getAuditLogs, getAllAuditLogs } from './AuditApi';

const mockGet = jest.fn();
jest.spyOn(BaseApi, 'generateIgaApi').mockReturnValue({ get: mockGet });

describe('AuditApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  describe('getAuditLogs', () => {
    it('calls governance/audit with non-underscore-prefixed query params', async () => {
      mockGet.mockResolvedValue({ data: { result: [], totalCount: 0 } });
      await getAuditLogs({ pageSize: 10, queryFilter: 'actor eq "system"' });
      const url = mockGet.mock.calls[0][0];
      expect(url).toContain('governance/audit');
      expect(url).toContain('pageSize=10');
      expect(url).not.toContain('_pageSize');
      expect(url).toContain('queryFilter=');
      expect(url).not.toContain('_queryFilter');
    });

    it('calls governance/audit with no params when called with empty object', async () => {
      mockGet.mockResolvedValue({ data: { result: [], totalCount: 0 } });
      await getAuditLogs({});
      expect(mockGet).toHaveBeenCalledWith('governance/audit');
    });
  });

  describe('getAllAuditLogs', () => {
    it('returns all results from a single page when totalCount <= pageSize', async () => {
      const records = [{ id: '1' }, { id: '2' }];
      mockGet.mockResolvedValue({
        data: { result: records, totalCount: 2, pagination: { searchAfter: [null] } },
      });
      const result = await getAllAuditLogs({}, 500);
      expect(result).toEqual(records);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('fetches subsequent pages until all results are collected', async () => {
      // Use maxRows > 500 so pageSize caps at 500; each batch of 500 triggers the next page
      const batch1 = Array.from({ length: 500 }, (_, i) => ({ id: String(i + 1) }));
      const batch2 = Array.from({ length: 3 }, (_, i) => ({ id: String(501 + i) }));
      mockGet
        .mockResolvedValueOnce({ data: { result: batch1, totalCount: 503, pagination: {} } })
        .mockResolvedValueOnce({ data: { result: batch2, totalCount: 503, pagination: {} } });

      const result = await getAllAuditLogs({}, 1000);
      expect(result).toHaveLength(503);
      expect(result[0].id).toBe('1');
      expect(result[502].id).toBe('503');
      // Second call should pass page=2
      const secondCallUrl = mockGet.mock.calls[1][0];
      expect(secondCallUrl).toContain('page');
    });

    it('stops fetching once maxRows is reached', async () => {
      const bigBatch = Array.from({ length: 500 }, (_, i) => ({ id: String(i) }));
      mockGet.mockResolvedValue({
        data: {
          result: bigBatch,
          totalCount: 9999,
          pagination: { searchAfter: [9999] },
        },
      });
      const result = await getAllAuditLogs({}, 500);
      expect(result).toHaveLength(500);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
});
