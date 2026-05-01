/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { useRouter } from 'vue-router';
import Agents from './Agents';

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

const sampleData = [
  {
    id: 'system/Target/User/102',
    application: {
      name: 'app name',
      templateName: 'aws.bedrock',
      icon: 'test',
    },
    account: {
      description: 'agent description',
    },
    user: {
      id: '123',
      userName: 'jDoe',
      givenName: 'John',
      sn: 'Doe',
    },
    glossary: {
      idx: {
        '/account': {
          accountType: 'agent',
        },
      },
    },
    descriptor: {
      idx: {
        '/account': {
          displayName: 'agent name',
        },
      },
    },
  },
  {
    id: 'system/Target/User/103',
    application: {
      name: 'app name',
      templateName: 'aws.bedrock',
      icon: 'test',
    },
    account: {
      description: 'agent description',
    },
    user: {
      id: '124',
      userName: 'jDoe2',
      givenName: 'Jane',
      sn: 'Doe',
    },
    glossary: {
      idx: {
        '/account': {
          accountType: 'agent',
        },
      },
    },
    descriptor: {
      idx: {
        '/account': {
          displayName: 'agent name',
        },
      },
    },
  },
];

describe('Agents Unit', () => {
  let mockPush;

  function mountComponent() {
    const wrapper = mount(Agents, {
      global: {
        mocks: {
          $t: (string, obj) => {
            switch (string) {
              case 'common.userFullName':
                return `${obj.givenName} ${obj.sn}`;
              default:
                return string;
            }
          },
        },
        stubs: {
          'router-link': true,
          RouterLink: true,
        },
      },
    });
    return wrapper;
  }

  beforeEach(async () => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    setupTestPinia({ user: { userId: 'testId' } });
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValue({ data: { result: sampleData, totalCount: 2 } });
  });

  it('Agents load on mount', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.agents.length).toBe(2);
    expect(wrapper.vm.agents[0]).toEqual(expect.objectContaining({
      id: sampleData[0].id,
      application: sampleData[0].application,
    }));
  });

  it('Click on row loads details page', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const rows = wrapper.findAll('tr');
    const rowToClick = rows[2];
    await rowToClick.trigger('click');

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ agentId: 'system/Target/User/103' }),
    }));
  });
});
