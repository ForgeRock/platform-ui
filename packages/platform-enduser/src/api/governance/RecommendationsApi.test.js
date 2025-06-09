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
const data = { result: [], totalCount: 0 };
get.mockReturnValue(Promise.resolve(data));

describe('Recommendations API', () => {
  it('should call getUserRecommendations correct URL and payload', async () => {
    const userId = 'user123';
    const params = { _pageSize: 10 };
    const res = await RecommendationsApi.getUserRecommendations(userId, params);

    expect(get).toHaveBeenCalledWith(
      `/governance/user/${userId}/recommendations?_pageSize=10`,
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
