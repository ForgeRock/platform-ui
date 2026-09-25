/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
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

  describe('search results announcement', () => {
    beforeEach(() => {
      // The shared beforeEach uses mockResolvedValueOnce for the mount load;
      // these tests need every search() call to return data as well
      AccountApi.getAccounts = jest.fn()
        .mockResolvedValue({ data: { result: sampleData, totalCount: 2 } });
    });

    it('passes no count to the announcer when there is no active search', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.searchQuery = '';
      await wrapper.vm.search();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBeNull();
    });

    it('announces the number of results found after a search', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.searchQuery = 'name';
      await wrapper.vm.search();
      await flushPromises();

      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(2);
    });

    it('re-announces when a modified search text returns the same result count', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.searchQuery = 'name';
      await wrapper.vm.search();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(2);

      // Same count (2), different search text — the count must pass through null at the start of the new search so the live region's text changes
      // and the screen reader re-announces. Called without awaiting so the null state (set before the request resolves) can be observed.
      wrapper.vm.searchQuery = 'name2';
      wrapper.vm.search();
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBeNull();

      await flushPromises();
      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(2);
    });

    it('announces no results found after a search with no matches', async () => {
      AccountApi.getAccounts = jest.fn()
        .mockResolvedValue({ data: { result: [], totalCount: 0 } });
      const wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.searchQuery = 'nobody';
      await wrapper.vm.search();
      await flushPromises();

      expect(wrapper.findComponent({ name: 'SearchResultsAnnouncer' }).props('count')).toBe(0);
    });
  });
});
