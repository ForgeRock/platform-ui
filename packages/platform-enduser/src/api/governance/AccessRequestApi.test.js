/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as AccessRequestApi from './AccessRequestApi';

let post;
const data = { result: [], totalCount: 0 };

describe('Access Review API', () => {
  beforeEach(() => {
    post = jest.fn();
    BaseApi.generateIgaApi = jest.fn(() => ({
      post,
    }));
    post.mockReturnValue(Promise.resolve(data));
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
      '/governance/user/testId/approvals?_pageSize=10&_pagedResultsOffset=0&_action=search',
      { targetFilter: { testFilter: true } },
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
  });
});
