/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import accountConstants from '../utils/accountConstants';
import DetailsTab from './DetailsTab';

mockRouter({ params: { accountId: 'system/Target/User/102' } });

const testSchema = [
  {
    id: 'c9647722-5927-4826-9398-5349b56f793a',
    displayName: 'Custom Attribute 9',
    name: 'customAttribute9',
    description: 'custom attribute 9',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: '25124190-a499-47f6-9737-6c8529bd9acd',
    displayName: 'Account Type',
    name: 'accountType',
    description: 'The type of account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: '25124190-a499-47f6-9737-6c8529bd9eee',
    displayName: 'Account Subtype',
    name: 'accountSubType',
    description: 'The subtype of account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: '09c470af-abc5-4733-beaf-3d169b62a234',
    displayName: 'Actors',
    name: 'actors',
    description: 'Actors for the account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: true,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: 'bab632ff-9e7a-4a9d-a91b-c081ce091df7',
    displayName: 'Last Successful Login',
    name: 'lastSuccessfulLogin',
    description: 'Show last successful Login',
    objectType: '/iga/governance/account',
    type: 'date',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
];

const testValues = {
  actors: ['managed/user/abc'],
  accountType: 'default',
  customAttribute9: 'test',
  lastSuccessfulLogin: '2025-09-22T01:44:30',
};

const machineValues = {
  actors: ['managed/user/abc'],
  accountType: 'machine',
  customAttribute9: 'test',
  lastSuccessfulLogin: '2025-09-22T01:44:30',
};

function getAccount(accountType) {
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
  if (accountType === 'orphan' || accountType === accountConstants.ACCOUNT_TYPES.MACHINE) {
    delete testAccount.user;
    testAccount.glossary.idx['/account'].accountType = accountType;
    testAccount.glossary.idx['/account'].actors = ['managed/user/123', 'managed/user/456', 'managed/user/789'];
  }

  return testAccount;
}

describe('DetailsTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  async function mountComponent(accountType, readOnly) {
    jest.spyOn(AccountApi, 'getAccountGlossaryAttributesData')
      .mockResolvedValue({ data: accountType === 'machine' ? machineValues : testValues });

    jest.spyOn(CommonsApi, 'getGlossarySchema')
      .mockResolvedValue({ data: { '/iga/governance/account': testSchema } });

    const wrapper = mount(DetailsTab, {
      props: {
        account: getAccount(accountType),
        readOnly,
        isTesting: true,
      },
      global: {
        mocks: {
          $t: (text) => text,
          $store: {
            state: {
              isFraas: true,
            },
          },
        },
      },
    });
    wrapper.vm.bvModal = { show: jest.fn(), hide: jest.fn() };

    await flushPromises();
    return wrapper;
  }

  describe('account details display', () => {
    it('should display a normal user account correctly', async () => {
      const wrapper = await mountComponent('default', false);
      await flushPromises();

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(3);

      const ownerTitle = cards[1].find('.h5');
      expect(ownerTitle.text()).toBe('Owner');

      const ownerText = cards[1].find('h3');
      expect(ownerText.text()).toBe('common.userFullName');

      const button = cards[0].find('.btn-link');
      expect(button.exists()).toBe(false);
    });

    it('should display an orphan account correctly', async () => {
      const wrapper = await mountComponent('orphan', false);
      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(2);

      const button = cards[0].find('.btn-link');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Change to Machine Account');
    });

    it('should display a machine account correctly', async () => {
      const wrapper = await mountComponent('machine', false);
      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(3);

      const ownerTitle = cards[1].find('.h5');
      expect(ownerTitle.text()).toBe('Custodians');

      const ownerText = cards[1].find('h3');
      expect(ownerText.text()).toBe('common.userFullName');

      const button = cards[0].find('.btn-link');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Edit Machine Account');
    });

    it('should not display actions on read only mode', async () => {
      const wrapper = await mountComponent('machine', true);
      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(3);

      const button = cards[0].find('.btn-link');
      expect(button.exists()).toBe(false);
    });

    it('save account configuration correctly', async () => {
      const wrapper = await mountComponent('orphan', false);
      const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');

      AccountApi.saveAccountGlossaryAttributesData = jest.fn().mockImplementation(() => Promise.resolve({}));

      const cards = wrapper.findAll('.card');
      expect(cards.length).toBe(2);

      const button = cards[0].find('.btn-link');
      button.trigger('click');
      await wrapper.vm.$nextTick();
      expect(showSpy).toHaveBeenCalledWith('UpdateAccountModal');

      const saveButton = wrapper.find('.btn-primary');
      saveButton.trigger('click');
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(AccountApi.saveAccountGlossaryAttributesData).toHaveBeenCalledWith('system/Target/User/102', testValues);
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(wrapper.vm.saving).toBe(false);
    });
  });
});
