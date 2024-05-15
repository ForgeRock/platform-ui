/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as ViolationsApi from './ViolationsApi';

const post = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  post,
}));

const data = { result: [], totalCount: 0 };
post.mockReturnValue(Promise.resolve(data));

describe('Violations API', () => {
  it('should call get violations Endpoint with correct payload and url', async () => {
    const params = { fields: 'id' };
    const targetFilter = {
      operator: 'AND',
      operand: {
        targetName: 'decision.status',
        targetValue: 'in-progress',
      },
    };
    const res = await ViolationsApi.getViolations(targetFilter, params);
    expect(post).toBeCalledWith('/governance/user/violation/search?_fields=id', { targetFilter });
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
