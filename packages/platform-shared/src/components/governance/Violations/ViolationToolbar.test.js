/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import ViolationToolbar from './ViolationToolbar';
import i18n from '@/i18n';

CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('Violation Toolbar', () => {
  const props = {
    policyRuleOptions: ['ruleOne'],
  };
  function mountComponent() {
    const wrapper = mount(ViolationToolbar, {
      global: {
        plugins: [i18n],
      },
      props,
    });
    return wrapper;
  }

  it('can change the status', async () => {
    const wrapper = mountComponent();

    const statusDropdown = wrapper.findAll('a[role="menuitem"]')[1];
    statusDropdown.trigger('click');
    await flushPromises();

    expect(wrapper.emitted('input')[0][0]).toEqual({
      status: 'complete',
      rule: '',
      user: '',
      startDate: '',
      endDate: '',
    });
  });

  it('can change the policy rule', async () => {
    const wrapper = mountComponent();

    const ruleSelect = wrapper.findComponent('[label="Rule"]');
    ruleSelect.find('[class="multiselect__option--highlight multiselect__option"]').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('input')[0][0]).toEqual({
      status: 'pending',
      rule: 'ruleOne',
      user: '',
      startDate: '',
      endDate: '',
    });
  });

  it('can change the user', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const userSelect = wrapper.findComponent('[label="User"]');
    userSelect.findAll('[class="multiselect__option"]')[0].trigger('click');
    await flushPromises();

    expect(wrapper.emitted('input')[1][0]).toEqual({
      status: 'pending',
      rule: '',
      user: 'managed/user/userId',
      startDate: '',
      endDate: '',
    });
  });
});
