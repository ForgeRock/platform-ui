/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as AccessRequestApi from './AccessRequestApi';

let get;
let post;
const data = { result: [], totalCount: 0 };

describe('Access Review API', () => {
  beforeEach(() => {
    post = jest.fn();
    get = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      get,
      post,
    }));
    post.mockReturnValue(Promise.resolve(data));
    get.mockReturnValue(Promise.resolve(data));
  });

  it('should call requestAction endpoint with correct payload and url', async () => {
    const requestId = 'phaseName';
    const action = 'reject';
    const phaseName = 'phaseName';
    const requestPayload = {
      justification: 'test',
    };

    await AccessRequestApi.requestAction(requestId, action, phaseName, requestPayload);
    expect(post).toBeCalledWith(
      `/governance/requests/${requestId}?_action=${action}&phaseName=${phaseName}`,
      requestPayload,
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call getUserRequests endpoint with correct payload and url', async () => {
    const params = {
      pageSize: 10,
      pagedResultsOffset: 0,
    };

    await AccessRequestApi.getUserRequests('testId', params, { testFilter: true });
    expect(post).toBeCalledWith(
      '/governance/user/testId/requests?_pageSize=10&_pagedResultsOffset=0&_action=search',
      { targetFilter: { testFilter: true } },
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call getUserApprovals endpoint with correct payload and url', async () => {
    const params = {
      _pageSize: 10,
      _pagedResultsOffset: 0,
    };

    await AccessRequestApi.getUserApprovals('testId', params, { testFilter: true });
    expect(post).toBeCalledWith(
      '/governance/user/testId/tasks?_pageSize=10&_pagedResultsOffset=0&_action=search&type=request',
      { targetFilter: { testFilter: true } },
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should call getRequestType endpoint with correct URL', async () => {
    const requestTypeId = '12345';
    await AccessRequestApi.getRequestType(requestTypeId);
    expect(get).toBeCalledWith(`/governance/requestTypes/${requestTypeId}`);
    expect(BaseApi.generateIgaApi).toBeCalled();
  });

  it('should fetch all request types correctly', async () => {
    const params = {
      pageSize: 10,
      pagedResultsOffset: 0,
    };

    await AccessRequestApi.getRequestTypes(params);

    expect(get).toBeCalledWith('/governance/requestTypes?_pageSize=10&_pagedResultsOffset=0');
  });

  it('should fetch all request types whit a query filter correctly', async () => {
    const params = {
      pageSize: 10,
      pagedResultsOffset: 0,
    };

    await AccessRequestApi.getRequestTypes(params, 'test request');

    expect(get).toBeCalledWith('/governance/requestTypes?_pageSize=10&_pagedResultsOffset=0&_queryFilter=id%20co%20%22test%20request%22%20or%20displayName%20co%20%22test%20request%22');
  });

  it('should call submitCustomRequest endpoint with correct payload and url', async () => {
    const requestPayload = {
      test: 'test',
    };

    await AccessRequestApi.submitCustomRequest('testId', requestPayload);
    expect(post).toBeCalledWith(
      '/governance/requests/testId?_action=publish',
      requestPayload,
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
  });
});
