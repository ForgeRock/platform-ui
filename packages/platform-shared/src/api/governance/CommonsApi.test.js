/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as CommonsApi from './CommonsApi';

const get = jest.fn();
const post = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get,
  post,
}));
const data = { result: [], totalCount: 0 };
get.mockReturnValue(Promise.resolve(data));
const userId = 'testid';

describe('Commons API', () => {
  it('should call getResource with correct payload and url with grantType account', async () => {
    const resource = 'user';
    const queryParams = {
      pageNumber: 0, pageSize: 10, queryString: 'test',
    };
    const res = await CommonsApi.getResource(resource, queryParams);
    expect(get).toBeCalledWith('commons/search/alpha_user?pageNumber=0&pageSize=10&queryString=test');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('appends alpha_ to user, role, application, and organization resources', async () => {
    const resources = ['user', 'role', 'application', 'organization'];
    resources.forEach((resource) => {
      CommonsApi.getResource(resource);
      expect(get).toBeCalledWith(`commons/search/alpha_${resource}?queryString=`);
    });
  });

  it('should call getIgaAccessRequest', async () => {
    const res = await CommonsApi.getIgaAccessRequest();
    expect(get).toBeCalledWith('commons/config/iga_access_request');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call My Access Endpoint with correct payload and url with grantType account', async () => {
    const params = {
      pageNumber: 0, pageSize: 10, grantType: 'account',
    };
    const res = await CommonsApi.getUserGrants(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/grants?pageNumber=0&pageSize=10&grantType=account');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call My Access Endpoint with correct payload and url with grantType entitlement', async () => {
    const params = {
      pageNumber: 0, pageSize: 10, grantType: 'entitlement',
    };
    const res = await CommonsApi.getUserGrants(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/grants?pageNumber=0&pageSize=10&grantType=entitlement');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call My Access Endpoint with correct payload and url with grantType role', async () => {
    const params = {
      pageNumber: 0, pageSize: 10, grantType: 'role',
    };
    const res = await CommonsApi.getUserGrants(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/grants?pageNumber=0&pageSize=10&grantType=role');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call getIgaUiConfig', async () => {
    const res = await CommonsApi.getIgaUiConfig();
    expect(get).toBeCalledWith('commons/config/iga_ui_config');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  describe('searchGovernanceResource', () => {
    afterEach(() => {
      post.mockClear();
    });
    it('should make a call with defaults', async () => {
      await CommonsApi.searchGovernanceResource({
        id: '',
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'application.name',
      });

      expect(post).toBeCalledWith(
        '/governance/resource/search',
        {
          id: '',
          pageNumber: 1,
          pageSize: 10,
          sortBy: 'application.name',
        },
      );
    });

    it('should make a call with the search query', async () => {
      await CommonsApi.searchGovernanceResource({
        id: '',
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'application.name',
      });

      expect(post).toBeCalledWith('/governance/resource/search',
        {
          id: '',
          pageNumber: 1,
          pageSize: 10,
          sortBy: 'application.name',
        });
    });
  });
});
