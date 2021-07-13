/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Pagination from './index';

describe('Pagination Component', () => {
  it('Component successfully loaded', () => {
    const paginationData = {
      pageSize: 10,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
    });
    expect(wrapper.name()).toEqual('Pagination');
  });

  it('Does exist if data represents cookie pagination', () => {
    const paginationData = {
      pagedResultsCookie: 'abc123',
      pageSize: 10,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    expect(wrapper.find('.pagination').exists());
  });

  it('Does exist if data represents remaining results pagination', () => {
    const paginationData = {
      pageSize: 10,
      remainingPagedResults: 20,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    expect(wrapper.find('.pagination').exists());
  });

  it('Does exist if data represents total results pagination', () => {
    const paginationData = {
      pageSize: 10,
      resultCount: 10,
      totalPagedResults: 20,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    expect(wrapper.find('.pagination').exists());
  });

  it('Does not exist if data doesn\'t represent pagination', () => {
    const paginationData = {
      pageSize: 10,
    };

    paginationData.pagedResultsCookie = null;
    paginationData.remainingPagedResults = -1;

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    expect(wrapper.find('.pagination').exists()).toBeFalsy();
  });

  it('First page icon is disabled if on page 0', () => {
    const paginationData = {
      pageSize: 10,
      remainingPagedResults: 20,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    // Check current page value is 0
    expect(wrapper.vm.$data.currentPage).toBe(0);

    // Check to make sure the first page button is disabled
    const firstPageButton = wrapper.find('.first-page').element;
    expect(firstPageButton).toHaveClass('disabled');
  });

  it('Previous page icon is disabled if on page 0', () => {
    const paginationData = {
      pageSize: 10,
      remainingPagedResults: 20,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    // Check current page value is 0
    expect(wrapper.vm.$data.currentPage).toBe(0);

    // Check to make sure the first page button is disabled
    const firstPageButton = wrapper.find('.prev-page').element;
    expect(firstPageButton).toHaveClass('disabled');
  });

  it('Next page icon is enabled if on page 0', () => {
    const paginationData = {
      pageSize: 10,
      remainingPagedResults: 20,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });
    // Check current page value is 0
    expect(wrapper.vm.$data.currentPage).toBe(0);

    // Check to make sure the next page button is disabled
    const nextPageButton = wrapper.find('.next-page').element;
    expect(nextPageButton).not.toHaveClass('disabled');
  });

  it('First & Previous page icon are enabled if on page 1', () => {
    const paginationData = {
      pageSize: 10,
      remainingPagedResults: 20,
    };

    const wrapper = shallowMount(Pagination, {
      propsData: paginationData,
      mocks: {
        $t: (path) => path,
      },
    });

    wrapper.vm.nextPage();
    // Check current page value is 1
    expect(wrapper.vm.$data.currentPage).toBe(1);

    // Check to make sure the previous page button is enabled
    const firstPageButton = wrapper.find('.next-page').element;
    expect(firstPageButton).not.toHaveClass('disabled');

    // Check to make sure the next page button is enabled
    const nextPageButton = wrapper.find('.next-page').element;
    expect(nextPageButton).not.toHaveClass('disabled');
  });
});
