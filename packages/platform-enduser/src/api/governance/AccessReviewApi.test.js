/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as AccessReviewApi from './AccessReviewApi';

const get = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  get,
}));
const data = { result: [], totalCount: 0 };
get.mockReturnValue(Promise.resolve(data));

describe('Access Review API', () => {
  it('should call getCertificationItems Endpoint with correct payload and url', async () => {
    const params = {
      status: 'active',
    };
    const res = await AccessReviewApi.getCertificationItems(params);
    expect(get).toBeCalledWith('/governance/certification/items?status=active');
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
