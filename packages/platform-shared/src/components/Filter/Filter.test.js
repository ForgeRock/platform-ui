/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import FilterModal from './index';

describe('Filter.test.js', () => {
  let wrapper;

  const filtersStringArray = [
    'filter1',
    'filter2',
    'filter3',
    'filter4',
    'filter5',
  ];

  const filtersObjectArray = [
    {
      text: 'Filter 1',
      value: 'objFilter1',
    },
    {
      text: 'Filter 2',
      value: 'objFilter2',
    },
    {
      text: 'Filter 3',
      value: 'objFilter3',
    },
    {
      text: 'Filter 4',
      value: 'objFilter4',
    },
    {
      text: 'Filter 5',
      value: 'objFilter5',
    },
  ];

  const filtersCategoriesArray = [
    {
      categories: ['Cat1', 'Cat3'],
      text: 'Filter 1',
      value: 'objFilter1',
    },
    {
      categories: ['Cat2', 'Cat4', 'Cat5'],
      text: 'Filter 2',
      value: 'objFilter2',
    },
    {
      categories: ['Cat1'],
      text: 'Filter 3',
      value: 'objFilter3',
    },
    {
      categories: ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5'],
      text: 'Filter 4',
      value: 'objFilter4',
    },
    {
      categories: ['Cat2'],
      text: 'Filter 5',
      value: 'objFilter5',
    },
  ];

  const categories = ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5'];

  const factory = (props) => {
    const component = mount(FilterModal, {
      attachTo: document.body,
      global: {
        mocks: {
          $t: () => {},
          $tc: () => {},
        },
      },
      props,
    });
    component.vm.$root.$emit('bv::show::modal', 'FilterModal');
    return component;
  };

  it('Loads the filter with string array filters', async () => {
    wrapper = factory({ filters: filtersStringArray });
    wrapper.vm.show = true;

    // No categories, so don't render button nav
    const buttonContainer = wrapper.find('.filter-type-radio');
    expect(buttonContainer.exists()).toBeFalsy();

    const renderedOptions = [];
    wrapper.findAll('#filter-list .multiselect__element').filter((filterItem) => renderedOptions.push(filterItem.text()));
    expect(renderedOptions).toEqual(expect.arrayContaining(filtersStringArray));
  });

  it('Loads the filter with object array filters', async () => {
    wrapper = factory({ filters: filtersObjectArray });
    wrapper.vm.show = true;

    // No categories, so don't render button nav
    const buttonContainer = wrapper.find('.filter-type-radio');
    expect(buttonContainer.exists()).toBeFalsy();

    const renderedOptions = [];
    wrapper.findAll('#filter-list .multiselect__element').filter((filterItem) => renderedOptions.push(filterItem.text()));
    const filterTextLabels = filtersObjectArray.map((filter) => filter.text);
    expect(renderedOptions).toEqual(expect.arrayContaining(filterTextLabels));
  });

  it('Loads the filter with categories array filters', async () => {
    wrapper = factory({ filters: filtersCategoriesArray, categories });
    wrapper.vm.show = true;
    wrapper.vm.filterTypeSelected = 'categories';
    await flushPromises();

    // We have categories
    const buttonContainer = wrapper.find('.filter-type-radio');
    expect(buttonContainer.exists()).toBeTruthy();

    const renderedOptions = [];
    wrapper.findAll('#categories-list .multiselect__element').filter((filterItem) => renderedOptions.push(filterItem.text()));
    expect(renderedOptions).toEqual(expect.arrayContaining(categories));
  });

  it('Loads the filter with multiple category array filters', async () => {
    const activeCategories = ['Cat1', 'Cat5'];
    const activeFilters = ['objFilter1', 'objFilter2', 'objFilter3', 'objFilter4'];
    wrapper = factory({
      filters: filtersCategoriesArray, categories, activeCategories, activeFilters,
    });
    wrapper.vm.show = true;
    wrapper.vm.filterTypeSelected = 'categories';
    await flushPromises();

    // Check active categories
    const selectedRenderedCategories = [];
    wrapper.findAll('#categories-list .multiselect__tag').filter((filterItem) => selectedRenderedCategories.push(filterItem.text().trim()));
    expect(selectedRenderedCategories).toEqual(activeCategories);

    wrapper.vm.filterTypeSelected = 'filters';
    await flushPromises();

    // Check active filters
    const selectedRenderedFilters = [];
    wrapper.findAll('#filter-list .multiselect__tag').filter((filterItem) => selectedRenderedFilters.push(filterItem.text().trim()));
    expect(selectedRenderedCategories).toEqual(activeCategories);
  });

  it('Loads with active string array filters', async () => {
    const activeFilters = ['filter3', 'filter5'];

    wrapper = factory({ filters: filtersStringArray, activeFilters });
    wrapper.vm.show = true;
    await flushPromises();

    const selectedRenderedOptions = [];
    wrapper.findAll('#filter-list .multiselect__tag').filter((filterItem) => selectedRenderedOptions.push(filterItem.text().trim()));
    expect(selectedRenderedOptions).toEqual(activeFilters);
  });

  it('Loads with active object array filters', async () => {
    const activeFilters = [
      {
        text: 'Filter 3',
        value: 'objFilter3',
      },
      {
        text: 'Filter 5',
        value: 'objFilter5',
      },
    ];

    wrapper = factory({ filters: filtersObjectArray, activeFilters });
    wrapper.vm.show = true;
  });

  it('Emits pending values when options are selected', async () => {
    wrapper = factory({ filters: filtersStringArray });
    wrapper.vm.show = true;
    await flushPromises();

    // Check emitted value
    wrapper.findAll('#filter-list .multiselect__element .multiselect__option')[1].trigger('click');
    wrapper.findAll('#filter-list .multiselect__element .multiselect__option')[3].trigger('click');
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty('update');
    expect(wrapper.emitted().update).toHaveLength(2);
    expect(wrapper.emitted().update[1][0]).toEqual(wrapper.vm.pendingFilters);
    expect(wrapper.emitted().update[1][1]).toEqual(wrapper.vm.pendingCategories);
  });

  it('Emits pending values when category options are selected', async () => {
    wrapper = factory({ filters: filtersCategoriesArray, categories });
    wrapper.vm.show = true;
    wrapper.vm.filterTypeSelected = 'categories';
    await flushPromises();

    // Check emitted value
    wrapper.findAll('#categories-list .multiselect__element .multiselect__option')[0].trigger('click');
    wrapper.findAll('#categories-list .multiselect__element .multiselect__option')[2].trigger('click');
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty('update');
    expect(wrapper.emitted().update).toHaveLength(2);
    expect(wrapper.emitted().update[1][0]).toEqual(wrapper.vm.pendingFilters);
    expect(wrapper.emitted().update[1][1]).toEqual(wrapper.vm.pendingCategories);
  });

  it('Clears the filters', () => {
    const activeFilters = ['filter3', 'filter5'];
    wrapper = factory({ filters: filtersStringArray, activeFilters });
    wrapper.vm.show = true;

    // Clear the filters
    wrapper.vm.clearFilters();

    const selectedRenderedOptions = [];
    wrapper.findAll('#filter-list .multiselect__tag').filter((filterItem) => selectedRenderedOptions.push(filterItem.text().trim()));

    expect(selectedRenderedOptions).toEqual([]);
    expect(wrapper.vm.pendingFilters).toEqual([]);
  });

  it('Clears the categories', async () => {
    const activeCategories = ['Cat1', 'Cat5'];
    const activeFilters = ['objFilter1', 'objFilter2', 'objFilter3', 'objFilter4'];
    wrapper = factory({
      filters: filtersCategoriesArray, categories, activeCategories, activeFilters,
    });
    wrapper.vm.show = true;

    // Clear the categories & filters
    wrapper.vm.clearCategories();

    // Categories
    const selectedRenderedCategories = [];
    wrapper.findAll('#filter-list .multiselect__tag').filter((filterItem) => selectedRenderedCategories.push(filterItem.text().trim()));

    wrapper.vm.filterTypeSelected = 'filters';
    await wrapper.vm.$nextTick;

    // Filters
    const selectedRenderedFilters = [];
    wrapper.findAll('#filter-list .multiselect__tag').filter((filterItem) => selectedRenderedFilters.push(filterItem.text().trim()));

    expect(selectedRenderedFilters).toEqual([]);
    expect(selectedRenderedCategories).toEqual([]);
    expect(wrapper.vm.pendingCategories).toEqual([]);
    expect(wrapper.vm.pendingFilters).toEqual([]);
  });
});
