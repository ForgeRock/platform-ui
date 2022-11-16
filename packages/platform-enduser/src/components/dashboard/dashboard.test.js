/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import Dashboard from '@/components/dashboard';
import Workflow from '@/components/dashboard/widgets/WorkflowControlWidget';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

Dashboard.mounted = jest.fn();

let wrapper;

describe('Dashboard.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Dashboard, {
      localVue,
      i18n,
      mocks: {
        $t: (key) => (key),
        $router: { push: jest.fn() },
      },
      store: new Vuex.Store({
        state: {
          SharedStore: { workforceEnabled: false },
          UserStore: {
            userId: null,
            managedResource: null,
            roles: null,
            internalUser: false,
            adminUser: false,
            profile: {},
            schema: {},
            access: [],
            givenName: '',
            sn: '',
            email: '',
            userName: '',
          },
        },
      }),
    });
  });

  it('Dashboard page loaded', () => {
    expect(wrapper.name()).toBe('Dashboard');
  });

  describe('loading dashboard data', () => {
    it('executes loadWidgets method', async () => {
      const loadWidgetsSpy = jest.spyOn(wrapper.vm, 'loadWidgets');
      const widgetResponse = [{ type: 'Workflow' }];

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.resolve({
          data: {
            dashboard: {
              widgets: widgetResponse,
            },
          },
        }),
      }));

      await wrapper.vm.loadWidgets();

      expect(loadWidgetsSpy).toHaveBeenCalled();
      expect(wrapper.find(Workflow).exists()).toBe(true);
      expect(wrapper.find('.my-applications-tiles').exists()).toBe(false);
      expect(wrapper.vm.widgets).toEqual([{ type: 'Workflow' }]);
    });

    it('error notification when getRequestService is not successful inside of loadWidgets', async () => {
      const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      const error = { response: { data: { message: 'your widgets call failed' } } };

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.reject(error),
      }));

      await wrapper.vm.loadWidgets();
      await wrapper.vm.$nextTick();
      expect(notificationSpy).toHaveBeenCalledWith('error', 'your widgets call failed');
    });

    it('executes loadMyApplications method', async () => {
      const loadApplicationsSpy = jest.spyOn(wrapper.vm, 'loadMyApplications');

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.resolve({
          data: [
            { dashboardDisplayName: 'b' },
            { dashboardDisplayName: 'c' },
            { dashboardDisplayName: 'a' },
          ],
        }),
      }));

      await wrapper.vm.loadMyApplications();
      expect(loadApplicationsSpy).toHaveBeenCalled();
      expect(wrapper.find('.my-applications-tiles').exists()).toBe(true);

      // sorted by method
      expect(wrapper.vm.myApplications).toStrictEqual([
        { dashboardDisplayName: 'a' },
        { dashboardDisplayName: 'b' },
        { dashboardDisplayName: 'c' },
      ]);
    });

    it('error notification when getRequestService is not successful iwthin loadMyApplications', async () => {
      const notificationSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      const error = 'your applications call failed';

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.reject(error),
      }));

      await wrapper.vm.loadMyApplications();
      await wrapper.vm.$nextTick();
      expect(notificationSpy).toHaveBeenCalledWith('your applications call failed', 'pages.dashboard.errorGetApplications');
    });
  });
});
