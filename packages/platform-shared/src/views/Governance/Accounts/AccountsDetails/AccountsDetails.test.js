/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as resourceUtil from '@forgerock/platform-shared/src/utils/governance/resource';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrGovResourceTable from '@forgerock/platform-shared/src/components/governance/GovResourceTable';
import * as AccountsApi from '@/api/governance/AccountApi';
import AccountsDetails from './AccountsDetails';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

mockRouter({ params: { accountId: 'system/Target/User/102' } });

let wrapper;

const testAccount = {
  id: 'system/Target/User/102',
  application: {
    name: 'app name',
    templateName: 'templateName',
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
        accountType: 'default',
      },
    },
  },
  descriptor: {
    idx: {
      '/account': {
        displayName: 'account name',
      },
    },
  },
};

function mountComponent(accountType, props = {}) {
  const account = cloneDeep(testAccount);
  if (accountType === 'orphan') {
    delete account.user;
  }
  AccountsApi.getAccountById = jest.fn().mockReturnValue(Promise.resolve({
    data: account,
  }));
  AccountsApi.getAccountEntitlements = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [],
    },
  }));
  AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockReturnValue(Promise.resolve({}));
  CommonsApi.getGlossarySchema = jest.fn().mockReturnValue(Promise.resolve({}));

  setupTestPinia();
  wrapper = mount(AccountsDetails, {
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

describe('AccountsDetails', () => {
  it('should retrieve the account on load', async () => {
    mountComponent();
    await flushPromises();

    const title = wrapper.find('h1.pb-1');
    const subtitle = wrapper.find('h1.h5');

    expect(title.text()).toBe(wrapper.vm.account.descriptor.idx['/account'].displayName);
    expect(subtitle.text()).toBe(wrapper.vm.account.application.name);
  });

  it('should display the tabs', async () => {
    mountComponent();
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(3);
  });

  it('shows the Activity tab for admin users', async () => {
    mountComponent(undefined, { isEndUser: false });
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');
    const tabTitles = tabs.map((tab) => tab.text());
    expect(tabs.length).toBe(4);
    expect(tabTitles).toContain('governance.accounts.details.tabs.activity');
  });

  it('hides the Activity tab for end users', async () => {
    mountComponent();
    await flushPromises();

    const tabs = wrapper.find('.tabs').findAll('li');
    const tabTitles = tabs.map((tab) => tab.text());
    expect(tabTitles).not.toContain('governance.accounts.details.tabs.activity');
  });

  it('should not display entitlement tab for non user account', async () => {
    mountComponent('orphan');
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(2);
  });

  async function activateEntitlementsTab() {
    const tabLink = wrapper.find('.tabs').findAll('li')[2].find('a');
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
        userId: testAccount.user.id,
        accountId: testAccount.keys.accountId,
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
        userId: testAccount.user.id,
        accountId: testAccount.keys.accountId,
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

  it('does not fetch schema when application.id and parseable objectType are absent', async () => {
    mountComponent();
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
  });

  it('fetches schema using keys.accountId when present', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: { properties: { __NAME__: { displayName: 'Username' } } },
    });

    const account = cloneDeep(testAccount);
    account.keys = { accountId: 'system/Target/User/102' };
    account.application.id = 'app1';
    AccountsApi.getAccountById = jest.fn().mockResolvedValue({ data: account });
    AccountsApi.getAccountEntitlements = jest.fn().mockResolvedValue({ data: { result: [] } });
    AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockResolvedValue({});
    CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({});
    setupTestPinia();
    wrapper = mount(AccountsDetails, {
      global: { plugins: [Notifications], mocks: { $t: (t) => t } },
    });
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app1', 'User');
    expect(wrapper.vm.accountSchema).toEqual({ __NAME__: 'Username' });
  });

  it('leaves accountSchema empty on schema fetch failure', async () => {
    ApplicationsApi.getObjectTypeSchema.mockRejectedValue(new Error('fail'));

    const account = cloneDeep(testAccount);
    account.keys = { accountId: 'system/Target/User/102' };
    account.application.id = 'app1';
    AccountsApi.getAccountById = jest.fn().mockResolvedValue({ data: account });
    AccountsApi.getAccountEntitlements = jest.fn().mockResolvedValue({ data: { result: [] } });
    AccountsApi.getAccountGlossaryAttributesData = jest.fn().mockResolvedValue({});
    CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({});
    setupTestPinia();
    wrapper = mount(AccountsDetails, {
      global: { plugins: [Notifications], mocks: { $t: (t) => t } },
    });
    await flushPromises();

    expect(wrapper.vm.accountSchema).toEqual({});
  });
});
