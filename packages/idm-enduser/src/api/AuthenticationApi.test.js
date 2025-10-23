/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import {
  getAccessToken,
  getAuthenticationConfig,
  getAuthRedirect,
  getProfile,
  handlePostAuth,
  login,
  loginWithDataStoreToken,
  logout,
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

  it('loginWithDataStoreToken API called correctly', async () => {
    const dataStoreToken = 'dummy-token';
    await loginWithDataStoreToken(dataStoreToken);

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'X-OpenIDM-NoSession': false,
        'X-OpenIDM-OAuth-Login': 'true',
        'X-OpenIDM-DataStoreToken': dataStoreToken,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    expect(postMock).toBeCalledWith('/authentication?_action=login');
  });

  it('handlePostAuth API called correctly', async () => {
    const dataStoreToken = 'test-datastore-token';
    const payload = { foo: 'bar' };
    await handlePostAuth(dataStoreToken, payload);

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Username': 'anonymous',
        'X-OpenIDM-Password': 'anonymous',
        'X-OpenIDM-DataStoreToken': dataStoreToken,
      },
    });
    expect(postMock).toBeCalledWith('/identityProviders?_action=handlePostAuth', payload);
  });

  it('getAuthRedirect API called correctly', async () => {
    const payload = { redirectUri: 'https://example.com/callback' };
    await getAuthRedirect(payload);

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Username': 'anonymous',
        'X-OpenIDM-Password': 'anonymous',
      },
    });
    expect(postMock).toBeCalledWith('/identityProviders?_action=getAuthRedirect', payload);
  });

  it('getAuthenticationConfig API called correctly', async () => {
    await getAuthenticationConfig();

    expect(BaseApi.generateIdmApi).toBeCalledWith({
      headers: {
        'X-OpenIDM-NoSession': true,
        'X-OpenIDM-Username': 'anonymous',
        'X-OpenIDM-Password': 'anonymous',
      },
    });
    expect(getMock).toBeCalledWith('/authentication');
  });
});
