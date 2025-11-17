/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as RecommendationsApi from './RecommendationsApi';

const get = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get,
}));

describe('Recommendations API', () => {
  beforeEach(() => {
    get.mockClear();
  });

  it('should call getUserRecommendations correct URL and payload', async () => {
    const userId = 'user123';
    const params = { _pageSize: 10, _queryFilter: true };

    const data = { result: [], totalCount: 0 };
    get.mockResolvedValueOnce(Promise.resolve(data));

    const res = await RecommendationsApi.getUserRecommendations(userId, params);
    expect(get).toHaveBeenCalledWith(
      `/governance/user/${userId}/recommendations?_pageSize=10&_queryFilter=true`,
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });

  it('should call getUserRecommendations correct URL and payload with a targetFilter', async () => {
    const userId = 'user123';
    const params = { _pageSize: 10 };
    const targetFilter = {
      operator: 'EQUALS',
      operand: { targetName: 'application.name', targetValue: 'jdoe' },
    };

    const data = { result: [], totalCount: 0 };
    get.mockResolvedValueOnce(Promise.resolve(data));

    const res = await RecommendationsApi.getUserRecommendations(userId, params, targetFilter);

    expect(get).toHaveBeenCalledWith(
      `/governance/user/${userId}/recommendations?_pageSize=10&_queryFilter=application.name%20eq%20'jdoe'`,
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
