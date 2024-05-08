/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import ExceptionList from './ExceptionList';
import i18n from '@/i18n';

CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('ExceptionList', () => {
  const props = {
    policyRuleOptions: ['ruleOne'],
  };
  function mountComponent() {
    const wrapper = mount(ExceptionList, {
      global: {
        plugins: [i18n],
      },
      props,
    });
    return wrapper;
  }

  it('shows exceptions in a list with correct columns', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    const columns = table.findAll('[role=columnheader]');

    expect(columns.length).toBe(5);
    expect(columns[0].text()).toBe('User (Click to sort ascending)');
    expect(columns[1].text()).toBe('Rule (Click to sort ascending)');
    expect(columns[2].text()).toBe('Initial Violation');
    expect(columns[3].text()).toBe('Latest Violation');
    expect(columns[4].text()).toBe('Expiration');
  });

  it('emits handle-search when filter is changed', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const filter = wrapper.findComponent('[role=toolbar]');
    filter.vm.$emit('input', {
      rule: 'testRule',
      user: 'testUser',
    });
    await flushPromises();

    expect(wrapper.emitted('handle-search')[2][1].operand).toEqual([
      {
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.violation.status',
          targetValue: 'exception',
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
    ]);
  });

  it('emits handle-search when sort-changed event is triggered', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const table = wrapper.findComponent('.table-responsive');
    table.vm.$emit('sort-changed', { sortDesc: true, sortBy: 'name' });
    expect(wrapper.emitted('handle-search')[1][0]).toEqual({
      fields: 'id,user,policyRule,decision,stats',
      pageSize: 10,
      pagedResultsOffset: 0,
      sortDir: 'desc',
      sortKeys: 'decision.violation.startDate',
    });
  });
});
