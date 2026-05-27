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
import * as resourceUtil from '@forgerock/platform-shared/src/utils/governance/resource';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
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
  keys: {
    accountId: 'account-456',
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

function mountComponent(props = {}) {
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
        $bvModal: { show: jest.fn(), hide: jest.fn() },
      },
    },
    props,
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
    mountComponent({ isEndUser: false });
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(3);
  });

  it('should not display the activity tab for end users', async () => {
    mountComponent({ isEndUser: true });
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(2);
  });

  async function activateEntitlementsTab() {
    const tabLink = wrapper.find('.tabs').findAll('li')[1].find('a');
    await tabLink.trigger('click');
    await flushPromises();
    return wrapper.findComponent(FrGovResourceTable);
  }

  it('calls submitCustomRequest with entitlementRemove on revoke-items emit', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue({ status: 'success' });
    mountComponent();
    await flushPromises();

    const itemsToRevoke = [{ assignmentId: 'assignment-1' }];
    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('revoke-items', { itemsToRevoke });
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementRemove', {
      common: expect.objectContaining({
        entitlementId: 'assignment-1',
        userId: testAgent.user.id,
        accountId: testAgent.keys.accountId,
      }),
    });
  });

  it('calls submitCustomRequest with entitlementGrant on assign-resources emit', async () => {
    const submitCustomRequestSpy = jest.spyOn(AccessRequestApi, 'submitCustomRequest').mockResolvedValue('success');
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('assign-resources', ['a/b/entitlement-1', 'a/b/entitlement-2']);
    await flushPromises();

    expect(submitCustomRequestSpy).toHaveBeenCalledWith('entitlementGrant', {
      common: expect.objectContaining({
        entitlementId: 'entitlement-1',
        userId: testAgent.user.id,
        accountId: testAgent.keys.accountId,
      }),
    });
  });

  it('calls getEntitlements on get-entitlements emit', async () => {
    const getEntitlementsSpy = jest.spyOn(resourceUtil, 'getEntitlements').mockResolvedValue([]);
    mountComponent();
    await flushPromises();

    const govResourceTable = await activateEntitlementsTab();
    govResourceTable.vm.$emit('get-entitlements', { searchValue: 'test', selectedApplicationId: 'app-1' });
    await flushPromises();

    expect(getEntitlementsSpy).toHaveBeenCalledWith(false, 'test', 'app-1', expect.stringContaining('_assignment'), true);
  });
});
