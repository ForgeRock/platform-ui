/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import Users from './Users';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');

describe('Users', () => {
  let wrapper;

  EntitlementApi.getEntitlementUsers.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          descriptor: {
            idx: {
              '/account': {
                displayName: 'accountName',
              },
            },
          },
          user: {
            id: 'testUserId',
            givenName: 'givenName',
            sn: 'sn',
            userName: 'userName',
          },
        },
        {
          descriptor: {
            idx: {
              '/account': {
                displayName: 'accountName2',
              },
            },
          },
          user: {
            id: 'testUserId2',
            givenName: 'givenName2',
            sn: 'sn2',
            userName: 'userName2',
          },
        },
      ],
      totalCount: 11,
    },
  }));

  function mountComponent() {
    return mount(Users, {
      global: {
        plugins: [i18n],
      },
      props: {
        entitlementId: 'testEntitlement',
      },
    });
  }

  it('calls to get entitlement users on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(EntitlementApi.getEntitlementUsers).toHaveBeenCalledWith(
      'testEntitlement',
      { pageSize: 10, pagedResultsOffset: 0, queryFilter: true },
    );
  });

  it('has name and account columns', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const columns = wrapper.findAll('[role="columnheader"]');
    expect(columns.length).toBe(2);
    expect(columns[0].text()).toBe('Name');
    expect(columns[1].text()).toBe('Account');
  });

  it('shows users in the table', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const rows = wrapper.findAll('[role="row"]');
    expect(rows.length).toBe(3);
    expect(rows[1].text()).toMatch('givenName');
    expect(rows[1].text()).toMatch('sn');
    expect(rows[1].text()).toMatch('accountName');
    expect(rows[1].text()).toMatch('userName');

    expect(rows[2].text()).toMatch('givenName2');
    expect(rows[2].text()).toMatch('sn2');
    expect(rows[2].text()).toMatch('accountName2');
    expect(rows[2].text()).toMatch('userName2');
  });

  it('searches users', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const searchInput = wrapper.findComponent('.fr-search-input-holder');
    searchInput.vm.$emit('input', 'searchQuery');
    searchInput.vm.$emit('search');
    await flushPromises();

    expect(EntitlementApi.getEntitlementUsers).toHaveBeenCalledWith(
      'testEntitlement',
      {
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: 'user.givenName co "searchQuery" or user.sn co "searchQuery" or user.userName co "searchQuery" or descriptor.idx./account.displayName co "searchQuery"',
      },
    );
  });
});
