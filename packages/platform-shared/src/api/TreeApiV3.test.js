/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as TreeApiV3 from './TreeApiV3';

jest.mock('@/store', () => ({
  __esModule: true,
  default: {
    state: {
      realm: 'alpha',
      realms: [
        { name: 'alpha', parentPath: '/' },
        { name: 'bravo', parentPath: '/' },
      ],
    },
  },
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockGenerate = jest.fn(() => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
}));

BaseApi.generateAmApi = mockGenerate;

describe('Tree API V3', () => {
  it('calls endpoints with resource version 3', async () => {
    const expected = {
      path: 'realms/root/realms/alpha/realm-config/authentication/authenticationtrees',
      apiVersion: 'protocol=2.1,resource=3.0',
    };

    TreeApiV3.actionNodeListLatestTypes();
    expect(mockGenerate).toHaveBeenLastCalledWith(expected);
  });
});
