/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import flushPromises from 'flush-promises';
import i18n from '@/i18n';
import DefaultDashboard from './index';
import Workflow from '@/views/DashboardManager/dashboards/widgets/WorkflowControlWidget';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

DefaultDashboard.mounted = jest.fn();

let wrapper;

describe('DefaultDashboard.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(DefaultDashboard, {
      localVue,
      i18n,
      mocks: {
        $t: (key) => (key),
        $router: { push: jest.fn() },
      },
      store: new Vuex.Store({
        state: {
          SharedStore: { workforceEnabled: false },
        },
      }),
    });
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

      wrapper.vm.loadWidgets();
      await flushPromises();

      expect(loadWidgetsSpy).toHaveBeenCalled();
      expect(wrapper.findComponent(Workflow).exists()).toBe(true);
      expect(wrapper.find('.my-applications-tiles').exists()).toBe(false);
      expect(wrapper.vm.widgets).toEqual([{ type: 'Workflow' }]);
    });

    it('error notification when getRequestService is not successful inside of loadWidgets', async () => {
      const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      const error = { response: { data: { message: 'your widgets call failed' } } };

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.reject(error),
      }));

      wrapper.vm.loadWidgets();
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledWith('error', 'your widgets call failed');
    });

    it('executes loadConsumerApplications method', async () => {
      const loadApplicationsSpy = jest.spyOn(wrapper.vm, 'loadConsumerApplications');

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.resolve({
          data: [
            { dashboardDisplayName: 'b' },
            { dashboardDisplayName: 'c' },
            { dashboardDisplayName: 'a' },
          ],
        }),
      }));

      wrapper.vm.loadConsumerApplications();
      await flushPromises();
      expect(loadApplicationsSpy).toHaveBeenCalled();
      expect(wrapper.find('.my-applications-tiles').exists()).toBe(true);

      // sorted by method
      expect(wrapper.vm.myApplications).toStrictEqual([
        { dashboardDisplayName: 'a' },
        { dashboardDisplayName: 'b' },
        { dashboardDisplayName: 'c' },
      ]);
    });

    it('error notification when getRequestService is not successful within loadConsumerApplications', async () => {
      const notificationSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      const error = 'your applications call failed';

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.reject(error),
      }));

      wrapper.vm.loadConsumerApplications();
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledWith('your applications call failed', 'pages.dashboard.errorGetApplications');
    });
  });
});
