/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import RequestToolbar from './RequestToolbar';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('RequestToolbar', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({
    data: {
      result: [
        {
          givenName: 'testGivenName',
          sn: 'testSn',
          id: 'testId',
        },
      ],
    },
  }));

  function mountComponent(stubs = [], props = {}) {
    const wrapper = mount(RequestToolbar, {
      global: {
        mocks: {
          $t: (text) => text,
        },
        stubs: ['FrRequestFilter', ...stubs],
      },
      props: {
        statusOptions: [
          {
            text: 'testStatus1',
            value: 'stat1',
          },
          {
            text: 'testStatus2',
            value: 'stat2',
          },
        ],
        ...props,
      },
    });
    return wrapper;
  }

  it('clicking the button to show filters will expand the filter section', async () => {
    const wrapper = mountComponent();
    const filterCollapse = wrapper.find('#filter-collapse');
    expect(filterCollapse.attributes('style')).toBe('display: none;');

    const toggleBtn = findByTestId(wrapper, 'filter-toggle');
    expect(toggleBtn.attributes('aria-pressed')).toBe('false');

    toggleBtn.trigger('click');
    await flushPromises();

    expect(filterCollapse.attributes('style')).toBe('');
    expect(toggleBtn.attributes('aria-labelledby')).toBe('filter-toggle-label');
    expect(toggleBtn.attributes('aria-pressed')).toBe('true');
  });

  it('the badge is hidden when no filters are applied', () => {
    const wrapper = mountComponent();
    const filterBadge = findByTestId(wrapper, 'filter-badge');
    expect(filterBadge.exists()).toBeFalsy();
  });

  it('the badge reflects the number of filters applied', async () => {
    const wrapper = mountComponent([], { numFilters: 5 });
    await flushPromises();

    const filterBadge = findByTestId(wrapper, 'filter-badge');
    expect(filterBadge.text()).toBe('5');
  });

  it('changing the status emits the status-change event with the new status', async () => {
    const wrapper = mountComponent(['BCollapse']);
    const dropdownBtn = findByTestId(wrapper, 'status-dropdown-button');
    dropdownBtn.trigger('click');
    await flushPromises();

    findByTestId(wrapper, 'status-dropdown').findAll('li')[1]
      .find('a')
      .trigger('click');
    await flushPromises();

    expect(dropdownBtn.text()).toMatch('testStatus2');
    expect(wrapper.emitted()['status-change'][0]).toEqual(['stat2']);
  });

  it('when the filter changes emit filter-change event with new filter', () => {
    const wrapper = mountComponent();
    const requestFilter = findComponentByTestId(wrapper, 'request-filter');
    requestFilter.vm.$emit('filter-change', { count: 1, filter: 'test value' });

    expect(wrapper.emitted()['filter-change'][0]).toEqual(['test value']);
  });

  it('when the filter changes emit update:num-filters event with new count', () => {
    const wrapper = mountComponent();
    const requestFilter = findComponentByTestId(wrapper, 'request-filter');
    requestFilter.vm.$emit('filter-change', { count: 1, filter: 'test value' });

    expect(wrapper.emitted()['update:num-filters'][0]).toEqual([1]);
  });

  it('emits a new sort value when the handleSortChange method is executed', () => {
    const wrapper = mountComponent();
    const emittedValue = 'sortTypeChangeValue';
    wrapper.vm.handleSortChange(emittedValue);
    expect(wrapper.emitted('sort-change')[0]).toEqual([emittedValue]);
  });

  it('emits a new sort direction value when the handleSortDirectionChange method is executed', () => {
    const wrapper = mountComponent();
    const emittedValue = 'desc';
    wrapper.vm.handleSortDirectionChange(emittedValue);
    expect(wrapper.emitted('sort-direction-change')[0]).toEqual([emittedValue]);
  });
});
