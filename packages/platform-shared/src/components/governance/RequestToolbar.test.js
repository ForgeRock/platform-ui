/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import RequestToolbar from './RequestToolbar';

describe('RequestToolbar', () => {
  function mountComponent(stubs = []) {
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
      },
    });
    return wrapper;
  }

  it('clicking the button to show filters will expand the filter section', async () => {
    const wrapper = mountComponent();
    const filterCollapse = wrapper.find('#filter-collapse');
    expect(filterCollapse.attributes('style')).toBe('display: none;');

    const toggleBtn = findByTestId(wrapper, 'filter-toggle');
    toggleBtn.trigger('click');
    await flushPromises();

    expect(filterCollapse.attributes('style')).toBe('');
  });

  it('the badge is hidden when no filters are applied', () => {
    const wrapper = mountComponent();
    const filterBadge = findByTestId(wrapper, 'filter-badge');
    expect(filterBadge.exists()).toBeFalsy();
  });

  it('the badge reflects the number of filters applied', async () => {
    const wrapper = mountComponent();
    const requestFilter = findComponentByTestId(wrapper, 'request-filter');
    requestFilter.vm.$emit('filter-change', {
      filter: {},
      count: 1,
    });
    await flushPromises();

    const filterBadge = findByTestId(wrapper, 'filter-badge');
    expect(filterBadge.text()).toBe('1');
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
    requestFilter.vm.$emit('filter-change', {
      filter: { prop1: 'test value' },
      count: 1,
    });

    expect(wrapper.emitted()['filter-change'][0]).toEqual([{ prop1: 'test value' }]);
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
