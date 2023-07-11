/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import RequestToolbar from './index';

describe('RequestToolbar', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(RequestToolbar, {
      mocks: {
        $t: (text) => text,
      },
      propsData: {
        statusOptions: [
          'testStatus1',
          'testStatus2',
        ],
      },
      stubs: ['FrRequestFilter'],
    });
  });

  it('clicking the button to show filters will expand the filter section', () => {
    const filterCollapse = findByTestId(wrapper, 'filter-collapse');
    expect(filterCollapse.attributes('style')).toBe('display: none;');

    const toggleBtn = findByTestId(wrapper, 'filter-toggle');
    toggleBtn.trigger('click');

    expect(filterCollapse.attributes('style')).toBe('');
  });

  it('the badge is hidden when no filters are applied', () => {
    const filterBadge = findByTestId(wrapper, 'filter-badge');
    expect(filterBadge.exists()).toBeFalsy();
  });

  it('the badge reflects the number of filters applied', () => {
    const requestFilter = findByTestId(wrapper, 'request-filter');
    requestFilter.vm.$emit('filter-change', {
      filter: {},
      count: 1,
    });

    const filterBadge = findByTestId(wrapper, 'filter-badge');
    expect(filterBadge.text()).toBe('1');
  });

  it('changing the status emits the status-change event with the new status', () => {
    const dropdownBtn = findByTestId(wrapper, 'status-dropdown-button');
    dropdownBtn.trigger('click');

    findByTestId(wrapper, 'status-dropdown').findAll('li')
      .at(1)
      .find('a')
      .trigger('click');

    expect(dropdownBtn.text()).toMatch('testStatus2');
    expect(wrapper.emitted()['status-change'][0]).toEqual(['testStatus2']);
  });

  it('when the filter changes emit filter-change event with new filter', () => {
    const requestFilter = findByTestId(wrapper, 'request-filter');
    requestFilter.vm.$emit('filter-change', {
      filter: { prop1: 'test value' },
      count: 1,
    });

    expect(wrapper.emitted()['filter-change'][0]).toEqual([{ prop1: 'test value' }]);
  });

  it('emits a new sort value when the handleSortChange method is executed', () => {
    const emittedValue = 'sortTypeChangeValue';
    wrapper.vm.handleSortChange(emittedValue);
    expect(wrapper.emitted('sort-change')[0]).toEqual([emittedValue]);
  });

  it('emits a new sort direction value when the handleSortDirectionChange method is executed', () => {
    const emittedValue = 'desc';
    wrapper.vm.handleSortDirectionChange(emittedValue);
    expect(wrapper.emitted('sort-direction-change')[0]).toEqual([emittedValue]);
  });
});
