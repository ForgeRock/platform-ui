/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as AgentApi from '@forgerock/platform-shared/src/api/governance/AgentApi';
import CustodiansTab from './CustodiansTab';

const testCustodians = {
  result: [
    {
      id: 'user-1',
      userName: 'jdoe',
      givenName: 'John',
      sn: 'Doe',
    },
    {
      id: 'user-2',
      userName: 'asmith',
      givenName: 'Alice',
      sn: 'Smith',
    },
  ],
  totalCount: 2,
};

async function mountCustodiansTab(readOnly = false) {
  jest.spyOn(AgentApi, 'getAgentCustodians').mockResolvedValue({ data: testCustodians });

  const wrapper = mount(CustodiansTab, {
    props: {
      agentId: 'system/Target/User/102',
      accountId: 'account-456',
      readOnly,
    },
    global: {
      mocks: {
        $t: (text) => text,
      },
    },
  });

  await flushPromises();
  return wrapper;
}

describe('CustodiansTab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the agent custodians on mount', async () => {
    const wrapper = await mountCustodiansTab();

    expect(AgentApi.getAgentCustodians).toHaveBeenCalledWith('system/Target/User/102', { pageSize: 10, pageNumber: 0 });
    expect(wrapper.text()).toContain('jdoe');
    expect(wrapper.text()).toContain('asmith');
  });

  describe('edit mode', () => {
    it('shows the add custodians toolbar', async () => {
      const wrapper = await mountCustodiansTab(false);

      expect(wrapper.find('[data-testid="add-custodians-btn"]').exists()).toBe(true);
    });

    it('shows a checkbox column with one checkbox per row plus the select-all header', async () => {
      const wrapper = await mountCustodiansTab(false);

      expect(wrapper.find('#custodian-checkbox-0').exists()).toBe(true);
      expect(wrapper.find('#custodian-checkbox-1').exists()).toBe(true);
      expect(wrapper.findAll('.checkbox-column').length).toBeGreaterThan(0);
    });
  });

  describe('read-only mode', () => {
    it('shows the custodians title instead of the add/remove toolbar', async () => {
      const wrapper = await mountCustodiansTab(true);

      expect(wrapper.find('[data-testid="add-custodians-btn"]').exists()).toBe(false);
      expect(wrapper.find('.card-header h5').text()).toBe('governance.agents.custodians');
    });

    it('shows the custodians table without checkboxes', async () => {
      const wrapper = await mountCustodiansTab(true);

      const table = wrapper.find('table');
      expect(table.exists()).toBe(true);
      expect(wrapper.find('#custodian-checkbox-0').exists()).toBe(false);
      expect(wrapper.find('[type="checkbox"]').exists()).toBe(false);
    });

    it('still renders the custodian rows and columns', async () => {
      const wrapper = await mountCustodiansTab(true);

      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBe(2);
      expect(rows[0].text()).toContain('jdoe');
      expect(rows[1].text()).toContain('asmith');
    });
  });
});
