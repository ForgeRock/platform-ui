/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as AccessModelingApi from './AccessModelingApi';

let get;
let post;
let put;
const data = { result: [], totalCount: 0 };

describe('Access Modeling API', () => {
  beforeEach(() => {
    post = jest.fn();
    get = jest.fn();
    put = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      get,
      post,
      put,
    }));
    post.mockReturnValue(Promise.resolve(data));
    get.mockReturnValue(Promise.resolve(data));
    put.mockReturnValue(Promise.resolve(data));
  });

  it('should call role metrics endpoint with the correct url', async () => {
    await AccessModelingApi.getRoleMetrics();
    expect(get).toBeCalledWith('/governance/role/metrics');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call the endpoint to launch the role mining job with the correct url', async () => {
    await AccessModelingApi.launchRoleMiningJob();
    expect(post).toBeCalledWith('/governance/jobs/roleMining?_action=trigger');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call the get role mining config endpoint with the correct url', async () => {
    await AccessModelingApi.getRoleMiningConfig();
    expect(get).toBeCalledWith('/governance/role/miningConfig');
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call the put role mining config endpoint with the correct url and payload', async () => {
    const payload = {
      roleMiningConfidenceThreshold: 0.85,
      roleMiningMembershipThreshold: 5,
      roleMiningEntitlementThreshold: 3,
    };
    await AccessModelingApi.putRoleMiningConfig(payload);
    expect(put).toBeCalledWith('/governance/role/miningConfig', payload);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });
});
