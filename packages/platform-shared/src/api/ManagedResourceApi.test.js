/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as ManagedResourceApi from './ManagedResourceApi';

jest.mock('@/store', () => ({
  __esModule: true,
  default: {
    state: {
      realm: 'alpha',
      realms: [
        { name: 'alpha', parentPath: '/' },
      ],
    },
  },
}));

const mockPatch = jest.fn();
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockGenerate = jest.fn(() => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  patch: mockPatch,
  delete: mockDelete,
}));

BaseApi.generateIdmApi = mockGenerate;

describe('ManagedResourceApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('patchManagedResourceEdge', () => {
    it('calls patch with the correct URL for an assignment edge', async () => {
      const patchData = [{
        operation: 'add',
        field: '_refProperties',
        value: { _accountType: 'default' },
      }];
      mockPatch.mockResolvedValue({ data: {} });

      await ManagedResourceApi.patchManagedResourceEdge(
        'managed_role',
        '007',
        'assignments',
        'assignment-123',
        patchData,
      );

      expect(mockPatch).toHaveBeenCalledWith(
        'managed/managed_role/007/assignments/assignment-123',
        patchData,
      );
    });

    it('calls patch with the correct URL for an applications edge', async () => {
      const patchData = [{
        operation: 'add',
        field: '_refProperties',
        value: { _accountType: 'default' },
      }];
      mockPatch.mockResolvedValue({ data: {} });

      await ManagedResourceApi.patchManagedResourceEdge(
        'managed_role',
        '007',
        'applications',
        'app-456',
        patchData,
      );

      expect(mockPatch).toHaveBeenCalledWith(
        'managed/managed_role/007/applications/app-456',
        patchData,
      );
    });

    it('passes request overrides to generateIdmApi', async () => {
      const patchData = [{ operation: 'replace', field: 'test', value: 'value' }];
      const requestOverrides = { headers: { 'X-Custom': 'value' } };
      mockPatch.mockResolvedValue({ data: {} });

      await ManagedResourceApi.patchManagedResourceEdge(
        'managed_user',
        'user-1',
        'applications',
        'app-1',
        patchData,
        requestOverrides,
      );

      expect(mockGenerate).toHaveBeenCalledWith(requestOverrides);
    });

    it('returns the response data from the patch call', async () => {
      const expectedData = { result: { _id: 'test', _refProperties: { _accountType: 'default' } } };
      mockPatch.mockResolvedValue({ data: expectedData });

      const result = await ManagedResourceApi.patchManagedResourceEdge(
        'managed_role',
        '007',
        'assignments',
        'assignment-123',
        [],
      );

      expect(result.data).toEqual(expectedData);
    });

    it('propagates errors from the API call', async () => {
      const error = new Error('Network error');
      mockPatch.mockRejectedValue(error);

      await expect(
        ManagedResourceApi.patchManagedResourceEdge('managed_role', '007', 'assignments', '123', []),
      ).rejects.toThrow('Network error');
    });

    it('handles user resource with complex IDs', async () => {
      const patchData = [{ operation: 'replace', field: 'test', value: 'value' }];
      mockPatch.mockResolvedValue({ data: {} });

      await ManagedResourceApi.patchManagedResourceEdge(
        'user',
        'abc-123-def-456',
        'applications',
        'app-789',
        patchData,
      );

      expect(mockPatch).toHaveBeenCalledWith(
        'managed/user/abc-123-def-456/applications/app-789',
        patchData,
      );
    });
  });
});
