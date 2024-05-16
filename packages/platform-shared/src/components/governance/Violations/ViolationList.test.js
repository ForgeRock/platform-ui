/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import ViolationList from './ViolationList';
import i18n from '@/i18n';

CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('ViolationList', () => {
  const defaultProps = {
    policyRuleOptions: ['ruleOne'],
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    const wrapper = mount(ViolationList, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
    return wrapper;
  }

  it('shows violations in a list with correct columns', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');

    expect(columns.length).toBe(4);
    expect(columns[0].text()).toBe('User (Click to sort ascending)');
    expect(columns[1].text()).toBe('Rule (Click to sort ascending)');
    expect(columns[2].text()).toBe('Created (Click to sort ascending)');
  });

  it('add fixed with of 120px to actions column when is admin', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    expect(columns[3].classes()).toContain('w-120px');
  });

  it('not to add fixed with to actions column when is not admin', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');
    expect(columns[3].classes()).not.toContain('w-120px');
  });

  it('emits handle-search when filter is changed', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const filter = wrapper.findComponent('[role=toolbar]');
    filter.vm.$emit('input', {
      status: 'testStatus',
      rule: 'testRule',
      user: 'testUser',
      startDate: '',
      endDate: '',
      searchValue: 'searchValue',
    });
    await flushPromises();

    expect(wrapper.emitted('handle-search')[2][1].operand).toEqual([
      {
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.violation.status',
          targetValue: 'testStatus',
        },
      },
      {
        operator: 'EQUALS',
        operand: { targetName: 'policyRule.id', targetValue: 'testRule' },
      },
      {
        operator: 'EQUALS',
        operand: { targetName: 'user.userId', targetValue: 'testUser' },
      },
      {
        operator: 'OR',
        operand: [
          {
            operator: 'CONTAINS',
            operand: { targetName: 'user.userName', targetValue: 'searchValue' },
          },
          {
            operator: 'CONTAINS',
            operand: { targetName: 'user.givenName', targetValue: 'searchValue' },
          },
          {
            operator: 'CONTAINS',
            operand: { targetName: 'user.sn', targetValue: 'searchValue' },
          },
          {
            operator: 'CONTAINS',
            operand: { targetName: 'policyRule.name', targetValue: 'searchValue' },
          },
        ],
      },
    ]);
  });

  it('emits handle-search when sort-changed event is triggered', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    table.vm.$emit('sort-changed', { sortDesc: true, sortBy: 'name' });
    expect(wrapper.emitted('handle-search')[1][0]).toEqual({
      fields: 'id,user,policyRule,decision',
      pageSize: 10,
      pagedResultsOffset: 0,
      sortDir: 'desc',
      sortKeys: 'decision.violation.startDate',
    });
  });

  it('should show allow and revoke buttons when is not admin', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-13T23:12:21+00:00',
            },
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
          user: {
            cn: 'Opal Millions',
            givenName: 'Opal',
            id: '4f268edd-fa51-412a-8168-1443b4ad8198',
            mail: 'Opal@IGATestQA.onmicrosoft.com',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const buttons = row.findAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].text()).toBe('checkAllow');
    expect(buttons[1].text()).toBe('blockRevoke');
  });

  it('should show view details item on actions list when is not admin', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-13T23:12:21+00:00',
            },
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
          user: {
            cn: 'Opal Millions',
            givenName: 'Opal',
            id: '4f268edd-fa51-412a-8168-1443b4ad8198',
            mail: 'Opal@IGATestQA.onmicrosoft.com',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const items = row.findAll('[role="menuitem"]');

    expect(items.length).toBe(2);
    expect(items[1].text()).toBe('list_altView Details');
  });

  it('emits viewViolationDetails event when a row is clicked', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-13T23:12:21+00:00',
            },
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
          user: {
            cn: 'Opal Millions',
            givenName: 'Opal',
            id: '4f268edd-fa51-412a-8168-1443b4ad8198',
            mail: 'Opal@IGATestQA.onmicrosoft.com',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    await row.trigger('click');

    expect(wrapper.emitted('viewViolationDetails')[0][0].id).toBe('002bd665-3946-465c-b444-de470fa04254');
  });

  it('emits viewViolationDetails event when view details button is clicked', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
      tableRows: [
        {
          decision: {
            violation: {
              status: 'in-progress',
              startDate: '2024-05-13T23:12:21+00:00',
            },
          },
          policyRule: {
            name: 'NoCustomerSupport',
          },
          user: {
            cn: 'Opal Millions',
            givenName: 'Opal',
            id: '4f268edd-fa51-412a-8168-1443b4ad8198',
            mail: 'Opal@IGATestQA.onmicrosoft.com',
            sn: 'Millions',
            userName: 'Opal@IGATestQA.onmicrosoft.com',
          },
          id: '002bd665-3946-465c-b444-de470fa04254',
        },
      ],
    });
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const rows = table.findAll('[role="row"]');
    const row = rows[1];
    const dropDownItems = row.findAll('.dropdown-item');
    await dropDownItems[1].trigger('click');

    expect(wrapper.emitted('viewViolationDetails')[0][0].id).toBe('002bd665-3946-465c-b444-de470fa04254');
  });
});
