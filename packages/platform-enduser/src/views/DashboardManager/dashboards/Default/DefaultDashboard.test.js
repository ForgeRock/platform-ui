/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createStore } from 'vuex';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import DefaultDashboard from './index';
import Welcome from '@/views/DashboardManager/dashboards/widgets/WelcomeWidget';

DefaultDashboard.mounted = jest.fn();

let wrapper;

describe('DefaultDashboard.vue', () => {
  const store = createStore({
    state: {
      SharedStore: { workforceEnabled: false, governanceEnabled: false },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    setupTestPinia();
    wrapper = mount(DefaultDashboard, {
      global: {
        plugins: [Notifications, store],
        mocks: {
          $t: (key) => (key),
          $router: { push: jest.fn() },
        },
      },
    });
  });

  describe('loading dashboard data', () => {
    it('executes loadWidgets method', async () => {
      const loadWidgetsSpy = jest.spyOn(wrapper.vm, 'loadWidgets');
      const widgetResponse = [{ type: 'Welcome' }];

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
      expect(wrapper.findComponent(Welcome).exists()).toBe(true);
      expect(wrapper.find('.my-applications-tiles').exists()).toBe(false);
      expect(wrapper.vm.widgets).toEqual([{ type: 'Welcome' }]);
    });

    it('error notification when getRequestService is not successful inside of loadWidgets', async () => {
      const notificationSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      const error = { response: { data: { message: 'your widgets call failed' } } };

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.reject(error),
      }));

      wrapper.vm.loadWidgets();
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledWith(error, 'pages.dashboard.errorGetApplications');
    });

    it('executes loadConsumerApplications method', async () => {
      const loadApplicationsSpy = jest.spyOn(wrapper.vm, 'loadConsumerApplications');

      jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => ({
        get: () => Promise.resolve({
          data: [
            { dashboardDisplayName: 'b', dashboardLogin: ['test'], dashboardIcon: ['test'] },
            { dashboardDisplayName: 'c', dashboardLogin: ['test'], dashboardIcon: ['test'] },
            { dashboardDisplayName: 'a', dashboardLogin: ['test'], dashboardIcon: ['test'] },
          ],
        }),
      }));

      wrapper.vm.loadConsumerApplications();
      await flushPromises();
      expect(loadApplicationsSpy).toHaveBeenCalled();
      expect(wrapper.find('.list-group').exists()).toBe(true);

      // sorted by method
      expect(wrapper.vm.myApplications).toStrictEqual([
        { dashboardDisplayName: 'a', dashboardLogin: ['test'], dashboardIcon: ['test'] },
        { dashboardDisplayName: 'b', dashboardLogin: ['test'], dashboardIcon: ['test'] },
        { dashboardDisplayName: 'c', dashboardLogin: ['test'], dashboardIcon: ['test'] },
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

describe('cloud', () => {
  const store = createStore({
    state: {
      workflow: true,
      isFraas: true,
    },
  });

  it('hides the workflow widget when isFraas is true', async () => {
    wrapper = mount(DefaultDashboard, {
      global: {
        plugins: [Notifications, store],
        mocks: {
          $t: (key) => (key),
        },
      },
    });

    const widgetResponse = [{ type: 'Welcome' }];

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
    expect(wrapper.vm.widgets).toEqual([{ type: 'Welcome' }]);
  });
});
