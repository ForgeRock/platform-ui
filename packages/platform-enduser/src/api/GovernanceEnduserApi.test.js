/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as GovernanceEnduserApi from './GovernanceEnduserApi';

const get = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get,
}));
const data = { result: [], totalCount: 0 };
get.mockReturnValue(Promise.resolve(data));
const userId = 'testid';

describe('Governance Enduser API', () => {
  it('should call getCertificationItems Endpoint with correct payload and url', async () => {
    const params = {
      status: 'active',
    };
    const res = await GovernanceEnduserApi.getCertificationItems(params);
    expect(get).toBeCalledWith('/governance/certification/items?status=active');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call getTaskProxies Endpoint with correct payload and url', async () => {
    const params = {
      pageNumber: 1, pageSize: 10, sortBy: 'username', sortDir: 'asc',
    };
    const res = await GovernanceEnduserApi.getTaskProxies(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/get-proxies?pageNumber=1&pageSize=10&sortBy=username&sortDir=asc');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call Direct Reports Endpoint with correct payload and url', async () => {
    const params = {
      pageNumber: 1, pageSize: 10, sortBy: 'username', sortDir: 'asc',
    };
    const res = await GovernanceEnduserApi.getDirectReports(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/get-direct-reports?pageNumber=1&pageSize=10&sortBy=username&sortDir=asc');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call My Access Endpoint with correct payload and url with grantType account', async () => {
    const params = {
      pageNumber: 0, pageSize: 10, grantType: 'account',
    };
    const res = await GovernanceEnduserApi.getMyAccess(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/grants?pageNumber=0&pageSize=10&grantType=account');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call My Access Endpoint with correct payload and url with grantType entitlement', async () => {
    const params = {
      pageNumber: 0, pageSize: 10, grantType: 'entitlement',
    };
    const res = await GovernanceEnduserApi.getMyAccess(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/grants?pageNumber=0&pageSize=10&grantType=entitlement');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call My Access Endpoint with correct payload and url with grantType role', async () => {
    const params = {
      pageNumber: 0, pageSize: 10, grantType: 'role',
    };
    const res = await GovernanceEnduserApi.getMyAccess(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/grants?pageNumber=0&pageSize=10&grantType=role');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
