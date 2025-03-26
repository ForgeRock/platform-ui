/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import {
  getAccessToken, getProfile, login, logout,
} from './AuthenticationApi';

const getMock = jest.fn();
const postMock = jest.fn();
BaseApi.generateIdmApi = jest.fn(() => ({
  get: getMock,
  post: postMock,
}));

describe('AuthenticationApi', () => {
  it('restore session API called correctly', async () => {
    await getAccessToken();

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-cache',
        'x-requested-with': 'XMLHttpRequest',
      },
      timeout: 5000,
    });
    expect(postMock).toBeCalledWith('/authentication?_action=login');
  });

  it('login API called correctly', async () => {
    const username = 'test';
    const password = 'test';
    await login(username, password);

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'X-OpenIDM-NoSession': false,
        'X-OpenIDM-Username': username,
        'X-OpenIDM-Password': password,
      },
    });
    expect(postMock).toBeCalledWith('/authentication?_action=login');
  });

  it('logout API called correctly', async () => {
    await logout();

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Username': 'anonymous',
        'X-OpenIDM-Password': 'anonymous',
        'cache-control': 'no-cache',
      },
    });
    expect(postMock).toBeCalledWith('/authentication?_action=logout');
  });

  it('get profile API called correctly', async () => {
    const resourcePath = 'test';
    const id = 'test';
    await getProfile(resourcePath, id);

    expect(BaseApi.generateIdmApi).toBeCalledWith();
    expect(getMock).toBeCalledWith(`/${resourcePath}/${id}`);
  });
});
