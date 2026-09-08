/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Accounts from './Accounts';

const mockRouterPush = jest.fn();
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

CommonsApi.getIgaAccessRequest = jest.fn().mockResolvedValue({ data: {} });

const createData = (params = {}, totalCount = 100) => {
  const { pageNumber = 0, pageSize = 10 } = params;
  const searchQuery = '';
  const sampleData = [];
  for (let i = pageNumber * pageSize; i < (pageNumber * pageSize) + pageSize; i += 1) {
    sampleData.push(
      {
        id: `id-${i}`,
        application: {
          name: `${searchQuery} application name ${i}`,
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
              displayName: `${searchQuery} name ${i}`,
            },
          },
        },
      },
    );
  }
  return { data: { result: pageSize === 0 ? [] : sampleData, totalCount } };
};

describe('Accounts Unit', () => {
  function mountComponent(props = {}) {
    const wrapper = mount(Accounts, {
      global: {
        stubs: {
          ApplicationSearch: true,
        },
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
      },
      props,
    });
    return wrapper;
  }

  it('Accounts load on search call', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(AccountApi.getAccounts).toHaveBeenCalledTimes(4);

    expect(wrapper.vm.accounts.length).toBe(10);
    expect(wrapper.vm.accounts[0]).toEqual(expect.objectContaining(
      {
        application: { icon: 'test', name: ' application name 0', templateName: 'templateName' },
        id: 'id-0',
        displayName: ' name 0',
        type: 'Default',
        user: {
          id: '123',
          userName: 'jDoe',
          givenName: 'John',
          sn: 'Doe',
          fullName: 'John Doe',
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
              displayName: ' name 0',
            },
          },
        },
      },
    ));

    expect(wrapper.vm.counts).toEqual({
      all: 100,
      correlated: 10,
      uncorrelated: 5,
      machine: 3,
    });
    await flushPromises();
  });

  it('Accounts reload on page size change', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.pageSizeChange(20);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(5, {
      pagedResultsOffset: 0,
      pageSize: 20,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '!(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Accounts reload on tab change and results come back for expected tabs', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.tabActivated(1);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(5, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: 'user.id sw "" and !(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Accounts reload on application change', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.updateApplications(['271fbe6672-780c-4226-af35-01a2546723c1']);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(5, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '(application.id eq \'271fbe6672-780c-4226-af35-01a2546723c1\') and !(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Click on row loads details page', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    wrapper.vm.navigateToEdit = jest.fn();

    await flushPromises();

    const rows = wrapper.findAll('tr');
    const rowToClick = rows[4];
    rowToClick.trigger('click');

    expect(wrapper.vm.navigateToEdit).toHaveBeenCalledWith('id-3');
  });

  it('App-scoped accounts compose the application filter with the tab filter', async () => {
    const wrapper = mountComponent({ applicationIds: ['app-1'], applicationName: 'My App' });
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(1, expect.objectContaining({
      queryFilter: '(application.id eq \'app-1\') and !(glossary.idx./account.accountType eq "agent")',
    }));
  });

  it('App-scoped navigation includes the origin query params', async () => {
    const wrapper = mountComponent({ applicationIds: ['app-1'], applicationName: 'My App' });
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await flushPromises();

    wrapper.vm.navigateToEdit('id-3');

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'AccountsDetails',
      params: { accountId: 'id-3', tab: 'details' },
      query: { originAppId: 'app-1', originAppName: 'My App' },
    });
  });

  it('App-scoped navigation includes the originating side tab when hosted under one', async () => {
    const wrapper = mountComponent({ applicationIds: ['app-1'], applicationName: 'My App', objectTab: 'accounts' });
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await flushPromises();

    wrapper.vm.navigateToEdit('id-3');

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'AccountsDetails',
      params: { accountId: 'id-3', tab: 'details' },
      query: { originAppId: 'app-1', originAppName: 'My App', originObjectTab: 'accounts' },
    });
  });

  it('Standalone navigation does not include origin query params', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await flushPromises();

    wrapper.vm.navigateToEdit('id-3');

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'AccountsDetails',
      params: { accountId: 'id-3', tab: 'details' },
    });
  });

  it('renders table-only scoped to the given account type when accountType is set', async () => {
    const wrapper = mountComponent({ accountType: 'uncorrelated', isEmbedded: true });
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await flushPromises();

    // Internal filter tabs are hidden — the account type is hosted externally
    expect(wrapper.find('.account-tabs').exists()).toBe(false);
    expect(wrapper.vm.selectedTab).toBe(2);
    // Machine tab hides the type/user columns; uncorrelated hides user/accountSubType
    const headers = wrapper.findAll('th').map((th) => th.text());
    expect(headers).not.toContain('governance.accounts.user');
    expect(headers).not.toContain('governance.accounts.accountSubType');
  });

  it('re-filters when the hosted accountType prop changes', async () => {
    const wrapper = mountComponent({ accountType: 'all', applicationIds: ['app-1'] });
    AccountApi.getAccounts = jest.fn().mockResolvedValue(createData());
    await flushPromises();
    expect(wrapper.vm.selectedTab).toBe(0);

    AccountApi.getAccounts.mockClear();
    wrapper.setProps({ accountType: 'machine' });
    await flushPromises();

    expect(wrapper.vm.selectedTab).toBe(3);
    expect(AccountApi.getAccounts).toHaveBeenCalled();
    expect(wrapper.vm.getQueryFilterForAccounts(wrapper.vm.selectedTab)).toContain('accountType eq "machine"');
  });

  it('keeps internal vertical filter tabs when accountType is not set', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)));
    await flushPromises();

    expect(wrapper.find('.card-tabs-vertical').exists()).toBe(true);
    expect(wrapper.vm.selectedTab).toBe(0);
  });
});
