/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import ViolationToolbar from './ViolationToolbar';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

CommonsApi.getResource.mockReturnValue(Promise.resolve({
  data: {
    result: [{ givenName: 'firstName', sn: 'lastName', id: 'userId' }],
  },
}));

describe('Violation Toolbar', () => {
  const defaultProps = {
    policyRuleOptions: ['ruleOne'],
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    const wrapper = mount(ViolationToolbar, {
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

  it('filter toggle button has an accessible name and expanded state', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const filterToggle = findByTestId(wrapper, 'filter-toggle');
    expect(filterToggle.attributes('aria-expanded')).toBe('false');
    expect(filterToggle.attributes('aria-controls')).toBe('violations-filter-collapse');
    expect(filterToggle.attributes('aria-labelledby')).toBe('violation-filter-toggle-label');

    await filterToggle.trigger('click');
    expect(filterToggle.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('#violation-filter-toggle-label').text()).toBe('Hide Filters');

    await filterToggle.trigger('click');
    expect(filterToggle.attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('#violation-filter-toggle-label').text()).toBe('Show Filters');
  });

  it('column picker button has an accessible name', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const columnsToggle = findByTestId(wrapper, 'column-picker-toggle');
    expect(columnsToggle.exists()).toBe(true);
    expect(columnsToggle.attributes('aria-label')).toBe('Customize Columns');
  });

  it('column picker button emits open-columns-modal on click', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await findByTestId(wrapper, 'column-picker-toggle').trigger('click');

    expect(wrapper.emitted('open-columns-modal')).toHaveLength(1);
  });

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
      searchValue: '',
    });
  });

  it('can change the policy rule', async () => {
    const wrapper = mountComponent();

    const ruleSelect = wrapper.findComponent('[label="Rule"]');
    ruleSelect.findAll('[class="multiselect__option"]')[0].trigger('click');
    await flushPromises();

    expect(wrapper.emitted('input')[0][0]).toEqual({
      status: 'pending',
      rule: 'ruleOne',
      user: '',
      startDate: '',
      endDate: '',
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
      status: 'pending',
      rule: '',
      user: 'managed/user/userId',
      startDate: '',
      endDate: '',
      searchValue: '',
    });
  });

  it('if is not admin should show the search input and hide the user and rule selectors', async () => {
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
      status: 'pending',
      rule: '',
      user: '',
      startDate: '',
      endDate: '',
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

  it('icon-only toolbar buttons expose accessible names', () => {
    const wrapper = mountComponent();

    const filterButton = wrapper.find('button[aria-label="Filters"]');
    expect(filterButton.exists()).toBe(true);

    const columnsButton = wrapper.find('button[aria-label="Customize Columns"]');
    expect(columnsButton.exists()).toBe(true);
  });

  it('filter button reflects the expanded state of the filters panel', async () => {
    const wrapper = mountComponent();
    const filterButton = wrapper.find('button[aria-label="Filters"]');

    expect(filterButton.attributes('aria-expanded')).toBe('false');
    expect(filterButton.attributes('aria-controls')).toBe('violations-filter-collapse');

    await filterButton.trigger('click');

    expect(filterButton.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('#violations-filter-collapse').exists()).toBe(true);
  });

  it('moves focus to the search input when the filter section is revealed', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    document.body.appendChild(wrapper.element);

    wrapper.find('[aria-controls="violations-filter-collapse"]').trigger('click');
    await flushPromises();

    expect(document.activeElement).toBe(wrapper.find('input[type="search"]').element);
    wrapper.element.remove();
  });
});
