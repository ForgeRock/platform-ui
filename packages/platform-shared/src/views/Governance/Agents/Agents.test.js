/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AccountApi from '@forgerock/platform-shared/src/api/governance/AccountApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
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
    CommonsApi.getIgaUiConfig = jest.fn().mockImplementation(() => Promise.resolve({ data: { agents: { userProperty: 'custom_iga_identity_type' } } }));
    CommonsApi.getUsers = jest.fn().mockImplementation(() => Promise.resolve({ data: { result: [], totalCount: 0 } }));
    CommonsApi.getGrants = jest.fn().mockImplementation(() => Promise.resolve({ data: { result: [], totalCount: 0 } }));

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
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 7)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 6)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 8)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(AccountApi.getAccounts).toHaveBeenCalledTimes(12);

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
      'aws.bedrock': 10,
      'aws-bedrock-agentcore': 5,
      'google.vertexai': 3,
      'm365.copilot': 1,
      'azure.aifoundry': 7,
      'sf.agentforce': 6,
      'ping.aiagent': 8,
      custom: 0,
      noCustodians: 9,
      unreviewed: 25,
      recentlyDiscovered: 1,
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
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 7)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 6)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.pageSizeChange(20);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(13, {
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
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 7)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 6)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 8)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.tabActivated(1);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(13, {
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
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 7)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 6)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 8)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 0)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 9)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 25)));

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.vm.updateApplications(['271fbe6672-780c-4226-af35-01a2546723c1']);
    await flushPromises();

    expect(AccountApi.getAccounts).toHaveBeenNthCalledWith(13, {
      pagedResultsOffset: 0,
      pageSize: 10,
      sortKeys: 'descriptor.idx./account.displayName',
      sortDir: 'asc',
      queryFilter: '(application.id eq \'271fbe6672-780c-4226-af35-01a2546723c1\') and (glossary.idx./account.accountType eq "agent")',
    });
    expect(wrapper.vm.tableLoading).toBe(false);
  });

  async function mountWithCounts(recentlyDiscovered = 1, noCustodians = 9, unreviewed = 25, total = 100) {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(createData({}, total))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 10))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 5))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 3))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 1))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 7))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 6))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 8))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, 0))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, recentlyDiscovered))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, noCustodians))
      .mockResolvedValueOnce(createData({ pageSize: 0 }, unreviewed));
    await flushPromises();
    return wrapper;
  }

  describe('chart cards', () => {
    it('renders exactly two circle progress bars', async () => {
      const wrapper = await mountWithCounts();
      expect(wrapper.findAllComponents(FrCircleProgressBar)).toHaveLength(2);
    });

    it('all four summary card headings are present', async () => {
      const wrapper = await mountWithCounts();
      const text = wrapper.text();
      expect(text).toContain('governance.agents.recentlyDiscovered');
      expect(text).toContain('governance.agents.reviewPending');
      expect(text).toContain('governance.agents.actionRequired');
      expect(text).toContain('governance.agents.provisioned');
    });

    it('provisioned card has no circle chart and does not show review pending content', async () => {
      // Regression: IAM-9953 accidentally replaced the provisioned card with a copy of
      // the unreviewed circle chart, leaving provisioned text dangling inside it.
      const wrapper = await mountWithCounts();
      const cards = wrapper.findAll('.card');
      const provisionedCard = cards.find((c) => c.text().includes('governance.agents.provisioned'));
      expect(provisionedCard.exists()).toBe(true);
      expect(provisionedCard.text()).not.toContain('governance.agents.reviewPending');
      expect(provisionedCard.findAllComponents(FrCircleProgressBar)).toHaveLength(0);
    });

    it('unreviewed circle chart uses yellow color and reflects unreviewed percentage', async () => {
      const wrapper = await mountWithCounts(1, 9, 25, 100);
      const charts = wrapper.findAllComponents(FrCircleProgressBar);
      expect(charts[0].props('color')).toBe('#ffb946');
      expect(charts[0].props('progress')).toBe(25);
    });

    it('no-custodians circle chart uses red color and reflects no-custodians percentage', async () => {
      const wrapper = await mountWithCounts(1, 40, 25, 100);
      const charts = wrapper.findAllComponents(FrCircleProgressBar);
      expect(charts[1].props('color')).toBe('#da3a2b');
      expect(charts[1].props('progress')).toBe(40);
    });

    it('unreviewedPercentage returns 0 when total agents is 0', async () => {
      const wrapper = await mountWithCounts(0, 0, 0, 0);
      expect(wrapper.vm.unreviewedPercentage).toBe(0);
    });

    it('unreviewedPercentage calculates correctly as a rounded percentage of total', async () => {
      const wrapper = await mountWithCounts(1, 9, 33, 100);
      expect(wrapper.vm.unreviewedPercentage).toBe(33);
    });

    it('noCustodiansPercentage calculates correctly as a rounded percentage of total', async () => {
      const wrapper = await mountWithCounts(1, 33, 25, 100);
      expect(wrapper.vm.noCustodiansPercentage).toBe(33);
    });
  });

  it('Click on row loads details page', async () => {
    const wrapper = mountComponent();
    AccountApi.getAccounts = jest.fn()
      .mockResolvedValueOnce(Promise.resolve(createData()))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 10)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 5)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 3)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 1)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 7)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 6)))
      .mockResolvedValueOnce(Promise.resolve(createData({ pageSize: 0 }, 8)))
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
