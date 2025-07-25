/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
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
import AccountsDetails from './AccountsDetails';

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

function mountComponent(accountType) {
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
      },
    },
  });
}

describe('AccountsDetails', () => {
  it('should retrieve the account on load', async () => {
    mountComponent();
    await flushPromises();

    const title = wrapper.find('h1');
    const subtitle = wrapper.find('p');

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

  it('should not display entitlement tab for non user account', async () => {
    mountComponent('orphan');
    await flushPromises();

    const tabContainer = wrapper.find('.tabs');
    const tabs = tabContainer.findAll('li');

    expect(tabs.length).toBe(2);
  });
});
