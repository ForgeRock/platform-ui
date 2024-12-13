/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as VueRouter from 'vue-router';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import MyRequests from './MyRequests';
import i18n from '@/i18n';

jest.mock('vue-router');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('MyRequests', () => {
  function setup(user = { userId: '1234' }) {
    setupTestPinia({ user });
    return mount(MyRequests, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: {
            push: jest.fn(),
          },
        },
      },
    });
  }

  function mockAccessRequests(status = 'in-progress') {
    return [
      {
        application: {
          description: 'My Azure App',
          icon: '',
          id: '2',
          name: 'My Azure App',
          templateName: 'azure.ad',
          templateVersion: '2.0',
        },
        decision: {
          comments: [],
          completionDate: null,
          deadline: null,
          outcome: null,
          phases: [],
          startDate: '2023-06-22T19:23:26+00:00',
          status: 'in-progress',
        },
        entitlement: {
          description: 'Administers different groups',
          displayName: 'Groups Administrator',
          id: '2',
        },
        id: 1,
        request: {
          common: {
            endDate: '2023-07-15T19:23:26+00:00',
            priority: 'medium',
          },
        },
        requestType: 'entitlementRevoke',
        requester: {
          givenName: 'Andrew',
          id: '1234-456-2',
          mail: 'andrew.hertel@test.com',
          sn: 'Hertel',
          userName: 'andrew.hertel@test.com',
        },
        user: {
          givenName: 'Manuel',
          id: '1234-456-3',
          mail: 'manuel.escobar@test.com',
          sn: 'Escobar',
          userName: 'manuel.escobar@test.com',
        },
      },
      {
        id: '387b7fa9-c57a-495c-a276-74d025020cdc',
        requester: {
          givenName: 'Test',
          id: 'managed/user/5eaaa408-9ddf-48f4-bcb6-0f4e3c344245',
          mail: 'testuser@jstilton1973unfinishedlife.onmicrosoft.com',
          sn: 'User',
          userName: 'tuser',
          isAdmin: false,
        },
        requestType: 'applicationGrant',
        request: {
          common: {
            priority: 'low',
            applicationId: '123fcbd3-84d4-4ca9-a67c-77ff42ad8654',
            userId: '5eaaa408-9ddf-48f4-bcb6-0f4e3c344245',
            blob: {
              form: {
                test2: 'test',
                test3: false,
                test1: '2024-09-19',
              },
            },
            isDraft: false,
            context: {
              type: 'request',
            },
          },
        },
        user: {
          accountStatus: 'active',
          cn: 'Test User',
          givenName: 'Test',
          id: '5eaaa408-9ddf-48f4-bcb6-0f4e3c344245',
          mail: 'testuser@jstilton1973unfinishedlife.onmicrosoft.com',
          sn: 'User',
          userName: 'tuser',
        },
        application: {
          icon: '',
          id: '123fcbd3-84d4-4ca9-a67c-77ff42ad8654',
          name: 'Test Application',
          templateName: 'successfactorsaccount',
          templateVersion: '2.1',
        },
        decision: {
          status: 'in-progress',
          decision: null,
          type: 'request',
          outcome: null,
          startDate: '2024-09-20T04:35:35+00:00',
          completionDate: null,
          deadline: null,
          comments: [],
          phases: [],
          context: [],
        },
        workflow: {
          instanceId: '472938',
          id: 'BasicApplicationGrant',
        },
      },
      {
        id: '387b7fa9-c57a-495c-a276-74d025020cdc',
        requester: {
          givenName: 'Test',
          id: 'managed/user/5eaaa408-9ddf-48f4-bcb6-0f4e3c344245',
          mail: 'testuser@jstilton1973unfinishedlife.onmicrosoft.com',
          sn: 'User',
          userName: 'tuser',
          isAdmin: false,
        },
        requestType: 'applicationGrant',
        request: {
          common: {
            priority: 'low',
            applicationId: '123fcbd3-84d4-4ca9-a67c-77ff42ad8654',
            userId: '5eaaa408-9ddf-48f4-bcb6-0f4e3c344245',
            blob: {
              form: {
                test2: 'test',
                test3: false,
                test1: '2024-09-19',
              },
            },
            isDraft: false,
            context: {
              type: 'request',
            },
          },
        },
        user: {
          accountStatus: 'active',
          cn: 'Test User',
          givenName: 'Test',
          id: '5eaaa408-9ddf-48f4-bcb6-0f4e3c344245',
          mail: 'testuser@jstilton1973unfinishedlife.onmicrosoft.com',
          sn: 'User',
          userName: 'tUser',
        },
        application: {
          icon: '',
          id: '123fcbd3-84d4-4ca9-a67c-77ff42ad8654',
          name: 'Test Application',
          templateName: 'successfactorsaccount',
          templateVersion: '2.1',
        },
        decision: {
          status: 'complete',
          decision: null,
          type: 'request',
          outcome: null,
          startDate: '2024-09-20T04:35:35+00:00',
          completionDate: null,
          deadline: null,
          comments: [],
          phases: [],
          context: [],
        },
        workflow: {
          instanceId: '472938',
          id: 'BasicApplicationGrant',
        },
      },
    ].filter((request) => request.decision.status === status);
  }

  beforeEach(() => {
    AccessRequestApi.getUserRequests = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: mockAccessRequests(),
      },
    }));
    AccessRequestApi.getRequestType = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        displayName: 'Request Display Name',
      },
    }));
    CommonsApi.getResource.mockReturnValue(Promise.resolve({
      data: {
        result: [],
      },
    }));
  });

  it('should load header texts correctly', () => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestsTab: '',
      },
    });
    const wrapper = setup();

    expect(wrapper.find('h1').text()).toBe('My Requests');
    expect(wrapper.find('p').text()).toBe('View your pending access requests or submit a new request.');
  });

  it('should list requests correctly', async () => {
    const wrapper = setup();
    await flushPromises();

    const requestRows = wrapper.findAll('table tbody [role="row"]');
    expect(requestRows).toHaveLength(2);
    const cellsFirstRow = requestRows[0].findAll('td');
    expect(cellsFirstRow[0].text()).toContain('entitlementRevoke');
    expect(cellsFirstRow[0].text()).toContain('ID: 1');
    expect(cellsFirstRow[1].text()).toContain('Jun 22, 2023');
    expect(cellsFirstRow[2].findAll('ul li')[2].text()).toContain('Cancel Request');
    const cellsSecondRow = requestRows[1].findAll('td');
    expect(cellsSecondRow[0].text()).toContain('Grant Application');
    expect(cellsSecondRow[0].text()).toContain('Test Application');
    expect(cellsSecondRow[0].text()).toContain('Test User');
    expect(cellsSecondRow[0].text()).toContain('ID: 387b7fa9-c57a-495c-a276-74d025020cdc');
    expect(cellsSecondRow[2].findAll('ul li')[2].text()).toContain('Cancel Request');
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should filter by status correctly', async () => {
    const wrapper = setup();
    await flushPromises();

    AccessRequestApi.getUserRequests = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: mockAccessRequests('complete'),
      },
    }));

    const statusDropdown = findByTestId(wrapper, 'status-dropdown');
    const completedOption = statusDropdown.findAll('ul li a')[1];
    await completedOption.trigger('click');
    await flushPromises();

    const requestRows = wrapper.findAll('table tbody [role="row"]');
    expect(requestRows).toHaveLength(1);
    const cellsFirstRow = requestRows[0].findAll('td');
    expect(cellsFirstRow[0].text()).toContain('Grant Application');
    expect(cellsFirstRow[0].text()).toContain('Test Application');
    expect(cellsFirstRow[0].text()).toContain('Test User');
    expect(cellsFirstRow[0].text()).toContain('ID: 387b7fa9-c57a-495c-a276-74d025020cdc');
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should show error if requests cannot be fetched', async () => {
    const error = new Error('Error fetching requests');
    AccessRequestApi.getUserRequests = jest.fn().mockRejectedValue(error);
    Notification.showErrorMessage = jest.fn();
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage');

    const wrapper = setup();
    await flushPromises();

    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving your requests');
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.accessRequests).toHaveLength(0);
  });

  it('should show request type ids if request types cannot be fetched', async () => {
    const error = new Error('Error fetching requests');
    AccessRequestApi.getRequestType = jest.fn().mockRejectedValue(error);
    Notification.showErrorMessage = jest.fn();
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage');

    const wrapper = setup();
    await flushPromises();

    expect(showErrorMessageSpy).not.toHaveBeenCalled();
    const requestRows = wrapper.findAll('table tbody [role="row"]');
    expect(requestRows).toHaveLength(2);
    const cellsFirstRow = requestRows[0].findAll('td');
    expect(cellsFirstRow[0].text()).toContain('entitlementRevoke');
    const cellsSecondRow = requestRows[1].findAll('td');
    expect(cellsSecondRow[0].text()).toContain('Grant Application');
  });

  it('Navigates to request details page after clicking on "View Details"', async () => {
    const wrapper = setup();
    await flushPromises();

    const routerSpy = jest.spyOn(wrapper.vm.$router, 'push');
    const viewDetailsButton = findByTestId(wrapper, 'view-details-button');
    expect(viewDetailsButton.exists()).toBe(true);
    await viewDetailsButton.trigger('click');
    expect(routerSpy).toHaveBeenCalledWith({
      name: 'MyRequestDetails',
      params: {
        requestId: 1,
      },
    });
  });
});
