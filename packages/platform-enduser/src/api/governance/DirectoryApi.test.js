/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as DirectoryApi from './DirectoryApi';

const get = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get,
}));
const data = { result: [], totalCount: 0 };
get.mockReturnValue(Promise.resolve(data));
const userId = 'testid';

describe('Directory API', () => {
  it('should call getTaskProxies Endpoint with correct payload and url', async () => {
    const params = {
      pageNumber: 1, pageSize: 10, sortBy: 'username', sortDir: 'asc',
    };
    const res = await DirectoryApi.getTaskProxies(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/get-proxies?pageNumber=1&pageSize=10&sortBy=username&sortDir=asc');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call Direct Reports Endpoint with correct payload and url', async () => {
    const params = {
      pageNumber: 1, pageSize: 10, sortBy: 'username', sortDir: 'asc',
    };
    const res = await DirectoryApi.getDirectReports(userId, params);
    expect(get).toBeCalledWith('/governance/user/testid/get-direct-reports?pageNumber=1&pageSize=10&sortBy=username&sortDir=asc');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call getDirectReportUserInfo Endpoint with correct payload and url', async () => {
    const reporteeId = 'reporteeId';
    const res = await DirectoryApi.getDirectReportUserInfo(userId, reporteeId);
    expect(get).toBeCalledWith('/governance/user/testid/get-direct-reports/reporteeId');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
