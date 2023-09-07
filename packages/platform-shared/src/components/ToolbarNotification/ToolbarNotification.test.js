/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import ToolbarNotification from './index';

describe('ToolbarNotification', () => {
  let wrapper;
  let notifications = [{
    createDate: '2018-06-04T16:20:04.795',
    message: 'Your profile has been updated',
    notificationSubtype: '',
    notificationType: '',
    receiverId: 'a7c9f2ab-52c4-47bb-9ec9-bfeb78f56898',
    _id: 'a4b8900c-d934-4a5f-962f-ee734728882c',
  }, {
    createDate: '2018-06-04T16:21:04.795',
    message: 'Your profile has been updated again',
    notificationSubtype: '',
    notificationType: '',
    receiverId: 'a7c9f2ab-52c4-47bb-9ec9-bfeb78f56898',
    _id: 'a4b8900c-d934-4a5f-962f-ee734728882cd',
  }];

  beforeEach(() => {
    setupTestPinia();
    wrapper = shallowMount(ToolbarNotification, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });

    wrapper.setData({
      notifications,
    });
  });

  it('Toolbar Notifications sort by time', () => {
    expect(notifications[0].message).toEqual('Your profile has been updated');
    expect(notifications[1].message).toEqual('Your profile has been updated again');

    notifications = wrapper.vm.sortByDate(notifications);

    expect(notifications[1].message).toEqual('Your profile has been updated');
    expect(notifications[0].message).toEqual('Your profile has been updated again');
  });
});
