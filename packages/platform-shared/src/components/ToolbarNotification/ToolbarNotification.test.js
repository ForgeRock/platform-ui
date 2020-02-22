/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import ToolbarNotification from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

const store = new Vuex.Store({});

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
    wrapper = shallowMount(ToolbarNotification, {
      localVue,
      store,
      mocks: {
        $t: () => {},
      },
      methods: { loadData: jest.fn() },
    });

    wrapper.setData({
      notifications,
    });
  });

  it('Toolbar Notification component loaded', () => {
    expect(wrapper.name()).toEqual('ToolbarNotification');
    expect(wrapper).toMatchSnapshot();
  });

  it('Toolbar Notifications sort by time', () => {
    expect(notifications[0].message).toEqual('Your profile has been updated');
    expect(notifications[1].message).toEqual('Your profile has been updated again');

    notifications = wrapper.vm.sortByDate(notifications);

    expect(notifications[1].message).toEqual('Your profile has been updated');
    expect(notifications[0].message).toEqual('Your profile has been updated again');
  });
});
