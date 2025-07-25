/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import MachineAccounts from './MachineAccounts';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

const sampleData = [
  {
    id: 'id-1',
    application: {
      name: 'application name 1',
      templateName: 'templateName',
      icon: 'test',
    },
    glossary: {
      idx: {
        '/account': {
          accountType: 'machine',
        },
      },
    },
    descriptor: {
      idx: {
        '/account': {
          displayName: 'name 1',
        },
      },
    },
  },
  {
    id: 'id-2',
    application: {
      name: 'application name 2',
      templateName: 'templateName',
      icon: 'test',
    },
    glossary: {
      idx: {
        '/account': {
          accountType: 'machine',
        },
      },
    },
    descriptor: {
      idx: {
        '/account': {
          displayName: 'name 2',
        },
      },
    },
  },
];

describe('Machine Accounts Unit', () => {
  function mountComponent() {
    const wrapper = mount(MachineAccounts, {
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
    setupTestPinia({ user: { userId: 'testId' } });
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve({ data: { result: sampleData, totalCount: 2 } }));
  });

  it('Accounts load on mount', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenCalledTimes(1);

    expect(wrapper.vm.accounts.length).toBe(2);
    expect(wrapper.vm.accounts[0]).toEqual(expect.objectContaining(
      sampleData[0],
    ));
  });

  it('Click on row loads details page', async () => {
    const wrapper = mountComponent();
    wrapper.vm.navigateToEdit = jest.fn();

    await flushPromises();

    const rows = wrapper.findAll('tr');
    const rowToClick = rows[2];
    rowToClick.trigger('click');

    expect(wrapper.vm.navigateToEdit).toHaveBeenCalledWith('id-2');
  });

  it('Click on view details button loads details page', async () => {
    const wrapper = mountComponent();
    wrapper.vm.navigateToEdit = jest.fn();

    await flushPromises();

    const rows = wrapper.findAll('tr');
    const secondAccountRow = rows[2];
    secondAccountRow.trigger('click');

    expect(wrapper.vm.navigateToEdit).toHaveBeenCalledWith('id-2');
  });
});
