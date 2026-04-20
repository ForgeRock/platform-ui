/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as AccountsApi from '@/api/governance/AccountApi';
import AgentsDetails from './AgentsDetails';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

mockRouter({ params: { agentId: 'system/Target/User/102' } });

let wrapper;

const testAgent = {
  id: 'system/Target/User/102',
  application: {
    name: 'app name',
    templateName: 'aws.bedrock',
    icon: 'test',
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
};

function mountComponent() {
  const agent = cloneDeep(testAgent);
  AccountsApi.getAccountById = jest.fn().mockReturnValue(Promise.resolve({
    data: agent,
  }));
  AccountsApi.getAccountEntitlements = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [],
    },
  }));
  AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockReturnValue(Promise.resolve({}));
  CommonsApi.getGlossarySchema = jest.fn().mockReturnValue(Promise.resolve({}));

  setupTestPinia();
  wrapper = mount(AgentsDetails, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t) => t,
      },
    },
  });
}

describe('AgentsDetails', () => {
  it('should retrieve the agent on load', async () => {
    mountComponent();
    await flushPromises();

    const title = wrapper.find('h1');
    const subtitle = wrapper.find('p');

    expect(title.text()).toBe(wrapper.vm.agent.descriptor.idx['/account'].displayName);
    expect(subtitle.text()).toBe(wrapper.vm.agent.application.name);
  });

  it('should display all tabs', async () => {
    mountComponent();
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(3);
  });
});
