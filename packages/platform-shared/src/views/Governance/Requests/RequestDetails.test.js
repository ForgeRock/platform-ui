/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import RequestDetails from './RequestDetails';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

describe('RequestDetails', () => {
  function setup() {
    setupTestPinia({ user: { userId: '1234' } });
    return mount(RequestDetails, {
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
    mockRouter({ params: { requestId: '1234' } });
    CommonsApi.getIgaAutoIdConfig = jest.fn().mockImplementation(() => Promise.resolve({
      data: {
        enableAutoId: true,
        highScorePercentThreshold: 81.3,
        lowScorePercentThreshold: 24,
      },
    }));
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
        requestType: 'entitlementGrant',
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
        prediction: {
          user_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
          ent_id: '06_ENT_ID_system_ShowcaseSAP___GROUP___WEB_user_Sub-Division Consumption and analysis_II_7HQ',
          CONF: 1,
          RULE: [
            '11_FRINDEXEDSTRING10_InfoSYS Power Gen',
            '11_FRINDEXEDSTRING12_SOL_YY1',
            '11_FRINDEXEDSTRING13_Service Representitive II',
          ],
          freq: 5,
          freqUnion: 5,
          is_assigned: '',
          last_usage: '',
          created: '2025-06-12T23:25:09.04036513Z',
        },
        descriptor: {
          idx: {
            '/entitlement': {
              displayName: 'Test Entitlement',
            },
          },
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

  it('should display request details correctly', async () => {
    const wrapper = setup();
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('Test Entitlement');
  });

  it('should navigate to list on navigate-to-list event is emitted', async () => {
    const wrapper = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    const accessRequestDetailsComponent = wrapper.findComponent({ name: 'AccessRequestDetails' });
    accessRequestDetailsComponent.vm.$emit('navigate-to-list');
    await flushPromises();

    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'UserAdminRequests' });
  });

  it('should display recommendation banner correctly', async () => {
    const wrapper = setup();
    await flushPromises();
    expect(wrapper.find('strong').text()).toBe('Access recommended');
  });
});
