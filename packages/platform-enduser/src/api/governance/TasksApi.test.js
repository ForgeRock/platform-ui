/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as TasksApi from './TasksApi';

const post = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({
  post,
}));
const data = { result: [], totalCount: 0 };
post.mockReturnValue(Promise.resolve(data));

describe('Tasks API', () => {
  it('should call getUserFulfillmentTasks correct URL and payload', async () => {
    const userId = 'user123';
    const params = { actorStatus: 'active' };
    const filter = { someFilter: 'filterValue' };
    await TasksApi.getUserFulfillmentTasks(userId, params, filter);

    expect(post).toHaveBeenCalledWith(
      `/governance/user/${userId}/tasks?actorStatus=active&_action=search&type=fulfillment`,
      { targetFilter: filter },
    );
    expect(BaseApi.generateIgaApi).toBeCalled();
  });
});
