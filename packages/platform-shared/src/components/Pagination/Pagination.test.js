/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import Pagination from './index';
import { DatasetSize } from './types';

describe('Pagination Component', () => {
  function mountPagination(setup = {}, datasetSize) {
    return mount(Pagination, {
      global: {
        mocks: {
          $t: (key) => key,
        },
      },
      ...setup,
      props: {
        ...setup.propsData,
        datasetSize,
      },
    });
  }

  it('Pagination correct aria labels', () => {
    const wrapper = mountPagination();
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    expect(pagination.attributes('aria-label')).toBe('Pagination');
    const buttons = pagination.findAll('.page-item');
    const goToFirstButton = buttons[0].find('.page-link');
    expect(goToFirstButton.attributes('aria-label')).toBe('Go to first page');
    const prevButton = buttons[1].find('.page-link');
    expect(prevButton.attributes('aria-label')).toBe('Go to previous page');
    const gotoPageButton = buttons[2].find('.page-link');
    expect(gotoPageButton.attributes('aria-label')).toBe('Go to page 1');
    const nextButton = buttons[3].find('.page-link');
    expect(nextButton.attributes('aria-label')).toBe('Go to next page');
    const goToLastButton = buttons[4].find('.page-link');
    expect(goToLastButton.attributes('aria-label')).toBe('Go to last page');
  });

  it('Pagination does not display last page button by default', () => {
    const wrapper = mountPagination();
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    expect(buttons[4].classes('d-none')).toBe(true);
  });

  it('buttons disabled when totaRows equals 0', () => {
    const wrapper = mountPagination();
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    expect(buttons[0].classes('disabled')).toBe(true);
    expect(buttons[1].classes('disabled')).toBe(true);
    expect(buttons[3].classes('disabled')).toBe(true);
    expect(buttons[4].classes('disabled')).toBe(true);
  });

  it('First and prev button disabled and last and next button enabled when totalRows greater than page size', () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    expect(buttons[0].classes('disabled')).toBe(true);
    expect(buttons[1].classes('disabled')).toBe(true);
    expect(buttons[4].classes('disabled')).toBe(false);
    expect(buttons[5].classes('disabled')).toBe(false);
  });

  it('First, prev, next and last buttons enabled when totalRows greater than page size and current page greater than 1', () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    expect(buttons[0].classes('disabled')).toBe(false);
    expect(buttons[1].classes('disabled')).toBe(false);
    expect(buttons[5].classes('disabled')).toBe(false);
    expect(buttons[2].classes('disabled')).toBe(false);
  });

  it('Should have right alignment by default', () => {
    const wrapper = mountPagination();
    const paginationWrapperDiv = wrapper.find('div');
    expect(paginationWrapperDiv.exists()).toBe(true);
    expect(paginationWrapperDiv.classes('justify-content-end')).toBe(true);
  });

  it('Should emit input event when next button clicked', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    const nextButton = buttons[4].find('.page-link');
    nextButton.trigger('click');
    await flushPromises();
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input').length).toBe(1);
    expect(wrapper.emitted('input')[0]).toEqual([2]);
  });

  it('Should emit input event when previous button clicked', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    const prevButton = buttons[1].find('.page-link');
    prevButton.trigger('click');
    await flushPromises();
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input').length).toBe(1);
    expect(wrapper.emitted('input')[0]).toEqual([1]);
  });

  it('Should emit input event when last button clicked', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    const nextButton = buttons[5].find('.page-link');
    nextButton.trigger('click');
    await flushPromises();
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input').length).toBe(1);
    expect(wrapper.emitted('input')[0]).toEqual([2]);
  });

  it('Should emit input event when first button clicked', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    const prevButton = buttons[0].find('.page-link');
    prevButton.trigger('click');
    await flushPromises();
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input').length).toBe(1);
    expect(wrapper.emitted('input')[0]).toEqual([1]);
  });

  it('Should emit input event when page button clicked', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
      },
    });
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    const buttons = pagination.findAll('.page-item');
    const prevButton = buttons[3].find('.page-link');
    prevButton.trigger('click');
    await flushPromises();
    expect(wrapper.emitted('input')).toBeTruthy();
    expect(wrapper.emitted('input').length).toBe(1);
    expect(wrapper.emitted('input')[0]).toEqual([2]);
  });

  describe('pagination SMALL type verification', () => {
    function mountPaginationSmall(setup = {}) {
      return mountPagination(setup, DatasetSize.SMALL);
    }

    it('Pagination displays page links', () => {
      const wrapper = mountPaginationSmall();
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[2].classes('d-none')).toBe(false);
    });

    it('Pagination does not display first page button', () => {
      const wrapper = mountPaginationSmall();
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[0].classes('d-none')).toBe(true);
    });

    it('Pagination does not display last page button when total rows greater than 0', () => {
      const wrapper = mountPaginationSmall({
        propsData: {
          totalRows: 10,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[4].classes('d-none')).toBe(true);
    });

    it('Pagination does not display page sizes dropdown', () => {
      const wrapper = mountPaginationSmall();
      const dropdown = wrapper.find('#dropdown');
      expect(dropdown.exists()).toBe(false);
    });
  });

  describe('pagination LARGE type verification', () => {
    it('Pagination does not display page links', () => {
      const wrapper = mountPagination();
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[2].classes('d-none')).toBe(true);
    });

    it('Pagination does not display first page button', () => {
      const wrapper = mountPagination();
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[0].classes('d-none')).toBe(true);
    });

    it('Pagination does not display last page button when total rows greater than 0', () => {
      const wrapper = mountPagination({
        propsData: {
          totalRows: 10,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[4].classes('d-none')).toBe(true);
    });

    it('Pagination displays page sizes dropdown', () => {
      const wrapper = mountPagination();
      const dropdown = wrapper.find('#dropdown');
      expect(dropdown.exists()).toBe(true);
    });

    it('Should have right alignment', () => {
      const wrapper = mountPagination();
      const paginationWrapperDiv = wrapper.find('div');
      expect(paginationWrapperDiv.exists()).toBe(true);
      expect(paginationWrapperDiv.classes('justify-content-end')).toBe(true);
    });
  });

  describe('pagination CUSTOM type verification', () => {
    function mountPaginationCustom(setup = {}) {
      return mountPagination(setup, DatasetSize.CUSTOM);
    }

    it('Pagination displays page links', () => {
      const wrapper = mountPaginationCustom();
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[2].classes('d-none')).toBe(false);
    });

    it('Pagination does not display page links when hidePageNumbers property is true', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          hidePageNumbers: true,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[2].classes('d-none')).toBe(true);
    });

    it('Pagination displays first page button', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          hideGoToFirstPageButton: false,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[0].classes('d-none')).toBe(false);
    });

    it('Pagination does not display first page buton when hideGoToFirstPageButton is true', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          hideGoToFirstPageButton: true,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[0].classes('d-none')).toBe(true);
    });

    it('Pagination displays last page button when total rows greater than 0', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          hideGoToLastPageButton: false,
          totalRows: 10,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[4].classes('d-none')).toBe(false);
    });

    it('Pagination does not display last page buton when hideGoToLastPageButton is true', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          hideGoToLastPageButton: true,
        },
      });
      const pagination = wrapper.find('#pagination');
      expect(pagination.exists()).toBe(true);
      const buttons = pagination.findAll('.page-item');
      expect(buttons[4].classes('d-none')).toBe(true);
    });

    it('Pagination displays page sizes dropdown', () => {
      const wrapper = mountPaginationCustom();
      const dropdown = wrapper.find('#dropdown');
      expect(dropdown.exists()).toBe(true);
    });

    it('Pagination does not display page sizes dropdown when hidePageSizeSelector is true', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          hidePageSizeSelector: true,
        },
      });
      const dropdown = wrapper.find('#dropdown');
      expect(dropdown.exists()).toBe(false);
    });

    it('Should have center alignment when align is center', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          align: 'center',
        },
      });
      const paginationWrapperDiv = wrapper.find('div');
      expect(paginationWrapperDiv.exists()).toBe(true);
      expect(paginationWrapperDiv.classes('justify-content-center')).toBe(true);
    });

    it('Should have left alignment when align is left', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          align: 'left',
        },
      });
      const paginationWrapperDiv = wrapper.find('div');
      expect(paginationWrapperDiv.exists()).toBe(true);
      expect(paginationWrapperDiv.classes('justify-content-start')).toBe(true);
    });

    it('Dropdown toggle button text with correct indexes on page change', async () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          totalRows: 25,
        },
      });
      const dropdownToggle = wrapper.find('#dropdown').find('.dropdown-toggle');
      expect(dropdownToggle.exists()).toBe(true);
      expect(dropdownToggle.text()).toBe('pagination.dropdown.text');
      expect(wrapper.vm.pageMin).toBe(1);
      expect(wrapper.vm.pageMax).toBe(10);

      await wrapper.setProps({
        value: 2,
      });

      expect(wrapper.vm.pageMin).toBe(11);
      expect(wrapper.vm.pageMax).toBe(20);

      await wrapper.setProps({
        value: 3,
      });

      expect(wrapper.vm.pageMin).toBe(21);
      expect(wrapper.vm.pageMax).toBe(25);
    });

    it('Correct dropdown menu item', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          totalRows: 100,
          pageSizes: [10, 20, 50, 100, 200],
        },
      });
      const dropdownMenu = wrapper.find('#dropdown').find('.dropdown-menu');
      expect(dropdownMenu.exists()).toBe(true);
      const items = dropdownMenu.findAll('li');
      expect(items.length).toBe(5);
      items.forEach((itemWrapper) => {
        const dropdownItem = itemWrapper.find('.dropdown-item');
        expect(dropdownItem.text()).toBe('pagination.dropdown.pageSize');
      });
    });

    it('Should emit on-page-size-change event on dropdown menu item clicked', () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          totalRows: 100,
        },
      });
      const dropdownMenu = wrapper.find('#dropdown').find('.dropdown-menu');
      expect(dropdownMenu.exists()).toBe(true);
      const items = dropdownMenu.findAll('li');
      const secondItem = items[1].find('.dropdown-item');
      secondItem.trigger('click');
      expect(wrapper.emitted('on-page-size-change')).toBeTruthy();
      expect(wrapper.emitted('on-page-size-change').length).toBe(1);
      expect(wrapper.emitted('on-page-size-change')[0]).toEqual([20]);
    });
  });
});
