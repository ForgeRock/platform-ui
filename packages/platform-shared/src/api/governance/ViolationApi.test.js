/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as VioaltionApi from './ViolationApi';

const post = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  post,
}));
const data = { result: [], totalCount: 0 };
post.mockReturnValue(Promise.resolve(data));

describe('ViolationsApi API', () => {
  it('should call getViolationList with correct payload and url', async () => {
    const queryParams = {
      pageNumber: 0, pageSize: 10, queryFilter: 'nome co test',
    };
    const targetFilter = {
      operator: 'AND',
      operand: [{
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.violation.status',
          targetValue: 'pending',
        },
      }],
    };
    const res = await VioaltionApi.getViolationList(queryParams, targetFilter);
    expect(post).toBeCalledWith('/governance/violation/search?_pageNumber=0&_pageSize=10&_queryFilter=nome%20co%20test', { targetFilter });
    expect(BaseApi.generateIgaApi).toBeCalled();
    expect(res).toEqual(data);
  });
});
