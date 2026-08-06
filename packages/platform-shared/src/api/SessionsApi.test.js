/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as SessionsApi from './SessionsApi';

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

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockGenerate = jest.fn(() => ({
  get: mockGet,
  post: mockPost,
}));
const withCreds = { withCredentials: true };

BaseApi.generateAmApi = mockGenerate;

describe('Sessions API', () => {
  it('getSessionInfo should call api with correct parameters', () => {
    SessionsApi.getSessionInfo('testUser');
    expect(mockGet).toHaveBeenLastCalledWith('', expect.objectContaining({
      withCredentials: true,
      params: expect.objectContaining({ _queryFilter: expect.stringContaining('testUser') }),
    }));
  });

  it('getSessionTimeoutInfo should call api with correct parameters in the correct order', () => {
    SessionsApi.getSessionTimeoutInfo();
    expect(mockPost).toHaveBeenLastCalledWith('', {}, withCreds);
  });
});
