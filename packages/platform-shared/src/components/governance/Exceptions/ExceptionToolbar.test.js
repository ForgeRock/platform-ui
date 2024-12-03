/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import ExceptionToolbar from './ExceptionToolbar';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

CommonsApi.getResource.mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('ExceptionToolbar', () => {
  const defaultProps = {
    policyRuleOptions: ['ruleOne'],
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    const wrapper = mount(ExceptionToolbar, {
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('can change the policy rule', async () => {
    const wrapper = mountComponent();

    const ruleSelect = wrapper.findComponent('[label="Rule"]');
    ruleSelect.find('[class="multiselect__option--highlight multiselect__option"]').trigger('click');
    await flushPromises();

    expect(wrapper.emitted('input')[0][0]).toEqual({
      rule: 'ruleOne',
      user: '',
      searchValue: '',
    });
  });

  it('can change the user', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const userSelect = wrapper.findComponent('[label="User"]');
    userSelect.findAll('[class="multiselect__option"]')[0].trigger('click');
    await flushPromises();

    expect(wrapper.emitted('input')[1][0]).toEqual({
      rule: '',
      user: 'managed/user/userId',
      searchValue: '',
    });
  });

  it('if is end user should show the search input and hide the user and rule filters', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    expect(wrapper.findComponent('[label="User"]').exists()).toBeFalsy();
    expect(wrapper.findComponent('[label="Rule"]').exists()).toBeFalsy();
    const searchInput = wrapper.findComponent({ name: 'SearchInput' });
    expect(searchInput.exists()).toBeTruthy();
    expect(searchInput.props('placeholder')).toBe('Search');
  });

  it('can change the search value', async () => {
    jest.useFakeTimers();
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    const searchInput = wrapper.findComponent({ name: 'SearchInput' });
    wrapper.vm.searchValue = 'searchValue';
    searchInput.vm.$emit('input', 'searchValue');
    await flushPromises();
    jest.runAllTimers();

    expect(wrapper.emitted('input')[0][0]).toEqual({
      rule: '',
      user: '',
      searchValue: 'searchValue',
    });
  });

  it('add fr-search-focus class when search input is focused', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    const searchInput = wrapper.findComponent({ name: 'SearchInput' });

    expect(searchInput.classes()).not.toContain('fr-search-focus');

    searchInput.vm.$emit('search-input-focus');
    await flushPromises();

    expect(searchInput.classes()).toContain('fr-search-focus');
  });
});
