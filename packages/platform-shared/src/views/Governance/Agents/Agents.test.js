/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import Agents from './Agents';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

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
              accountType: 'agent',
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

describe('Agents Unit', () => {
  function mountComponent() {
    const wrapper = mount(Agents, {
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
    });
    return wrapper;
  }

  it('Accounts load on search call', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(AccountApi.getAccounts).toHaveBeenCalledTimes(8);

    expect(wrapper.vm.agents.length).toBe(10);
    expect(wrapper.vm.agents[0]).toEqual(expect.objectContaining(
      {
        application: { icon: 'test', name: ' application name 0', templateName: 'templateName' },
        id: 'id-0',
        displayName: ' name 0',
        type: 'Agent',
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
              accountType: 'agent',
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
      awsBedrock: 10,
      azureAiFoundry: 5,
      googleVertexAi: 3,
      pingAiAgents: 1,
      custom: 0,
      noCustodians: 9,
      unreviewed: 25,
    });
    await flushPromises();
  });

  it('Accounts reload on page size change', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.pageSizeChange(20);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(9, {
      pagedResultsOffset: 0,
      pageSize: 20,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '(glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Accounts reload on tab change and results come back for expected tabs', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.tabActivated(1);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(9, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: 'application.templateName sw "aws.bedrock" and (glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Accounts reload on application change', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.updateApplications(['271fbe6672-780c-4226-af35-01a2546723c1']);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(9, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '(application.id eq \'271fbe6672-780c-4226-af35-01a2546723c1\') and (glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  it('Click on row loads details page', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));
    wrapper.vm.navigateToEdit = jest.fn();

    await flushPromises();

    const rows = wrapper.findAll('tr');
    const rowToClick = rows[4];
    rowToClick.trigger('click');

    expect(wrapper.vm.navigateToEdit).toHaveBeenCalledWith('id-3');
  });
});
