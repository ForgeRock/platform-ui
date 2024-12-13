/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as VueRouter from 'vue-router';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import MyRequestDetails from './MyRequestDetails';
import i18n from '@/i18n';

jest.mock('vue-router');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('RequestDetails', () => {
  function setup() {
    setupTestPinia({ user: { userId: '1234' } });
    return mount(MyRequestDetails, {
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

  beforeEach(() => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestId: '1234',
      },
    });
    AccessRequestApi.getRequest = jest.fn().mockReturnValue(Promise.resolve({
      data: {
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
          connectorId: 'testapp',
          id: '123fcbd3-84d4-4ca9-a67c-77ff42ad8654',
          name: 'testapp',
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
          actors: {
            active: [],
            inactive: [],
            actorTags: [],
          },
          phases: [],
          context: [],
        },
        workflow: {
          instanceId: '472938',
          id: 'WorkflowId',
        },
      },
    }));
    AccessRequestApi.getRequestType = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        displayName: 'Request Display Name',
      },
    }));
  });

  it('should display request details correctly, not allow forward', async () => {
    const wrapper = setup();
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('testapp');
    const forwardButton = findByText(wrapper, 'button', 'Forward');
    expect(forwardButton).toBeUndefined();
  });

  it('should navigate to list on navigate-to-list event is emitted', async () => {
    const wrapper = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    const accessRequestDetailsComponent = wrapper.findComponent({ name: 'AccessRequestDetails' });
    accessRequestDetailsComponent.vm.$emit('navigate-to-list');
    await flushPromises();

    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'MyRequests' });
  });
});
