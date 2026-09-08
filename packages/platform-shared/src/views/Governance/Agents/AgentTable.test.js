/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import AgentTable from './AgentTable';

const mockRouterPush = jest.fn();
jest.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

const createData = (params = {}, totalCount = 10) => {
  const { pageNumber = 0, pageSize = 10 } = params;
  const sampleData = [];
  for (let i = pageNumber * pageSize; i < (pageNumber * pageSize) + pageSize; i += 1) {
    sampleData.push(
      {
        id: `agent-${i}`,
        application: {
          name: 'Agent App',
          templateName: 'aws.bedrock',
          icon: 'test-icon',
        },
        account: { description: `description ${i}` },
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
              displayName: `agent name ${i}`,
            },
          },
        },
      },
    );
  }
  return { data: { result: pageSize === 0 ? [] : sampleData, totalCount } };
};

describe('AgentTable', () => {
  function mountComponent(props = {}) {
    return mount(AgentTable, {
      global: {
        mocks: { $t: (k) => k },
      },
      props,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    AccountApi.getAccounts = jest.fn().mockResolvedValue(createData());
  });

  it('queries agents scoped to the embedding application', async () => {
    mountComponent({ isEmbedded: true, applicationIds: ['app-1'], applicationName: 'My App' });
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenCalledWith(expect.objectContaining({
      queryFilter: "(application.id eq 'app-1') and (glossary.idx./account.accountType eq \"agent\")",
    }));
  });

  it('combines the application scope with the user search', async () => {
    const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
    await flushPromises();

    const search = wrapper.find('input[type="search"]');
    await search.setValue('jdoe');
    await search.trigger('keydown.enter');
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenLastCalledWith(expect.objectContaining({
      queryFilter: [
        "(user.userName co 'jdoe' or descriptor.idx./account.displayName co 'jdoe')",
        "(application.id eq 'app-1')",
        '(glossary.idx./account.accountType eq "agent")',
      ].join(' and '),
    }));
  });

  it('escapes single quotes in the search term so the query filter literal stays balanced', async () => {
    const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
    await flushPromises();

    const search = wrapper.find('input[type="search"]');
    await search.setValue("O'Brien");
    await search.trigger('keydown.enter');
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenLastCalledWith(expect.objectContaining({
      queryFilter: [
        "(user.userName co 'O\\'Brien' or descriptor.idx./account.displayName co 'O\\'Brien')",
        "(application.id eq 'app-1')",
        '(glossary.idx./account.accountType eq "agent")',
      ].join(' and '),
    }));
  });

  it('resets to page 1 when sorting changes', async () => {
    AccountApi.getAccounts = jest.fn().mockResolvedValue(createData({ pageSize: 10 }, 30));
    const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
    await flushPromises();

    wrapper.vm.search(3);
    await flushPromises();
    AccountApi.getAccounts.mockClear();

    wrapper.vm.sortingChanged({ sortBy: 'displayName', sortDesc: true });
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenCalledWith(expect.objectContaining({
      pagedResultsOffset: 0,
    }));
  });

  it('renders the flat agent table without charts or type tabs', async () => {
    const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
    await flushPromises();

    expect(wrapper.findAllComponents(FrCircleProgressBar)).toHaveLength(0);
    expect(wrapper.findComponent({ name: 'FrHeader' }).exists()).toBe(false);
    // Only the four flat-table columns — no template/type tab columns or counts
    const headers = wrapper.findAll('th').map((th) => th.text());
    expect(headers[0]).toContain('Application');
    expect(headers[1]).toContain('Display Name');
    expect(headers).toHaveLength(4);
    expect(wrapper.findAll('tbody tr').length).toBe(10);
  });

  it('navigation includes the origin query params when embedded', async () => {
    const wrapper = mountComponent({
      isEmbedded: true, applicationIds: ['app-1'], applicationName: 'My App', objectTab: 'app-agents',
    });
    await flushPromises();

    wrapper.vm.navigateToEdit('agent-3');

    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'AgentsDetails',
      params: {
        agentId: 'agent-3',
        tab: 'details',
      },
      query: {
        originAppId: 'app-1',
        originAppName: 'My App',
        originObjectTab: 'app-agents',
      },
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
