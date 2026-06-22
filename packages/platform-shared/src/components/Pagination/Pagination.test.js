/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
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

  describe('@a11y', () => {
    it('should not have any accessibility violations', async () => {
      const wrapper = mountPagination({
        propsData: {
          totalRows: 20,
        },
      });
      await runA11yTest(wrapper);
    });
  });

  it('Pagination dropdown has aria-label for items per page', () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 25,
      },
    });
    const dropdownToggle = wrapper.find('#dropdown').find('.dropdown-toggle');
    expect(dropdownToggle.exists()).toBe(true);
    expect(dropdownToggle.attributes('aria-label')).toBe('pagination.dropdown.ariaLabel');
  });

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

  it('buttons disabled when totalRows equals 0', () => {
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

  it('Disabled prev and enabled next are both tabbable on the 1st page', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
        value: 1,
      },
    });

    await flushPromises();

    // prev is disabled on page 1 — renders as <span> with aria-disabled="true"
    // Per ARIA APG, disabled menuitems must remain focusable so keyboard users can discover them
    const prevButton = wrapper.find('.fr-pagination-prev .page-link');
    expect(prevButton.exists()).toBe(true);
    expect(prevButton.element.tagName).toBe('SPAN');
    expect(prevButton.attributes('tabindex')).toBe('0');

    const nextButton = wrapper.find('.fr-pagination-next .page-link');
    expect(nextButton.exists()).toBe(true);
    expect(nextButton.element.tagName).toBe('BUTTON');
    expect(nextButton.attributes('tabindex')).toBe('0');
  });

  it('Previous and next buttons are tabbable when enabled', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    });

    await flushPromises();

    const prevButton = wrapper.find('.fr-pagination-prev .page-link');
    const nextButton = wrapper.find('.fr-pagination-next .page-link');

    expect(prevButton.exists()).toBe(true);
    expect(nextButton.exists()).toBe(true);
    expect(prevButton.attributes('tabindex')).toBe('0');
    expect(nextButton.attributes('tabindex')).toBe('0');
  });

  it('Enabled prev and disabled next are both tabbable on the last page', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 14,
        value: 2,
      },
    });

    await flushPromises();

    const prevButton = wrapper.find('.fr-pagination-prev .page-link');
    expect(prevButton.exists()).toBe(true);
    expect(prevButton.element.tagName).toBe('BUTTON');
    expect(prevButton.attributes('tabindex')).toBe('0');

    // next is disabled on last page — renders as <span> with aria-disabled="true"
    // Per ARIA APG, disabled menuitems must remain focusable so keyboard users can discover them
    const nextButton = wrapper.find('.fr-pagination-next .page-link');
    expect(nextButton.exists()).toBe(true);
    expect(nextButton.element.tagName).toBe('SPAN');
    expect(nextButton.attributes('tabindex')).toBe('0');
  });

  it('Disabled nav spans are tabbable and announced by screen readers when all buttons disabled', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 0,
      },
    });

    await flushPromises();

    const prevButton = wrapper.find('.fr-pagination-prev .page-link');
    const nextButton = wrapper.find('.fr-pagination-next .page-link');

    expect(prevButton.exists()).toBe(true);
    expect(nextButton.exists()).toBe(true);
    // Both render as <span> with aria-disabled="true" when all controls are disabled
    expect(prevButton.element.tagName).toBe('SPAN');
    expect(nextButton.element.tagName).toBe('SPAN');
    // aria-hidden removed from parent <li> so screen readers announce the menuitem
    expect(wrapper.find('.fr-pagination-prev').attributes('aria-hidden')).toBeUndefined();
    expect(wrapper.find('.fr-pagination-next').attributes('aria-hidden')).toBeUndefined();
    // tabindex="0" keeps disabled menuitems in Tab sequence per ARIA APG
    expect(prevButton.attributes('tabindex')).toBe('0');
    expect(nextButton.attributes('tabindex')).toBe('0');
  });

  it('Disabled nav button li wrappers have aria-hidden removed so inner menuitem is announced', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
        value: 1,
      },
    });

    await flushPromises();

    const prevLi = wrapper.find('.fr-pagination-prev');
    expect(prevLi.attributes('aria-hidden')).toBeUndefined();
    // role="presentation" on the <li> is intentional — only aria-hidden is removed
    expect(prevLi.attributes('role')).toBe('presentation');
    // accessible semantics stay on the inner span, not promoted to <li>
    expect(prevLi.find('.page-link').attributes('aria-disabled')).toBe('true');
    expect(prevLi.find('.page-link').attributes('aria-label')).toBeTruthy();
  });

  it('Disabled nav button li wrappers have aria-hidden removed after page change', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    });

    await flushPromises();

    await wrapper.setProps({ value: 1 });
    await flushPromises();

    const prevLi = wrapper.find('.fr-pagination-prev');
    expect(prevLi.attributes('aria-hidden')).toBeUndefined();
    expect(prevLi.attributes('role')).toBe('presentation');

    const nextLink = wrapper.find('.fr-pagination-next .page-link');
    expect(nextLink.attributes('tabindex')).toBe('0');
  });

  it('Attributes are re-applied when disabled prop changes', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
        value: 1,
      },
    });

    await flushPromises();

    // Initially: next is enabled, prev is disabled
    expect(wrapper.find('.fr-pagination-next .page-link').attributes('tabindex')).toBe('0');
    expect(wrapper.find('.fr-pagination-prev').attributes('aria-hidden')).toBeUndefined();

    // Toggle disabled — BPagination re-renders, fix must re-run
    await wrapper.setProps({ disabled: true });
    await flushPromises();

    // All nav <li> wrappers must still have aria-hidden removed after re-render
    expect(wrapper.find('.fr-pagination-prev').attributes('aria-hidden')).toBeUndefined();
    expect(wrapper.find('.fr-pagination-next').attributes('aria-hidden')).toBeUndefined();
  });

  it('Intentionally hidden nav buttons (d-none) are left unchanged', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
        value: 1,
      },
    });

    await flushPromises();

    const firstLi = wrapper.find('.fr-pagination-first');
    expect(firstLi.exists()).toBe(true);
    expect(firstLi.classes()).toContain('d-none');
    expect(firstLi.attributes('aria-hidden')).toBe('true');
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

    it('Pagination does not display first page button when hideGoToFirstPageButton is true', () => {
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

    it('Pagination does not display last page button when hideGoToLastPageButton is true', () => {
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

  describe('currentPageRows safeguard', () => {
    function mountPaginationCustom(setup = {}) {
      return mountPagination(setup, DatasetSize.CUSTOM);
    }

    describe('effectiveTotalRows computed', () => {
      it('returns totalRows unchanged when currentPageRows is not provided', () => {
        const wrapper = mountPaginationCustom({
          propsData: { totalRows: 100, perPage: 10, value: 1 },
        });
        expect(wrapper.vm.effectiveTotalRows).toBe(100);
      });

      it('returns totalRows unchanged when currentPageRows equals perPage (full page)', () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 100, perPage: 10, value: 1, currentPageRows: 10,
          },
        });
        expect(wrapper.vm.effectiveTotalRows).toBe(100);
      });

      it('caps to actualRows on page 1 when currentPageRows is less than perPage', () => {
        // page 1, 3 rows returned, perPage 10 → cappedTotal = (0*10)+3 = 3; min(3, 100) = 3
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 100, perPage: 10, value: 1, currentPageRows: 3,
          },
        });
        expect(wrapper.vm.effectiveTotalRows).toBe(3);
      });

      it('does not inflate beyond totalRows on a later page', () => {
        // page 2, 3 rows returned, perPage 10 → cappedTotal = (1*10)+3 = 13; min(13, 11) = 11
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 11, perPage: 10, value: 2, currentPageRows: 3,
          },
        });
        expect(wrapper.vm.effectiveTotalRows).toBe(11);
      });

      it('no capping when totalRows is 0 (on-demand pagination)', () => {
        // unknown total, page 2, 3 rows → cappedTotal = (1*10)+3 = 13;
        // totalRows=0 is on-demand pagination, so no capping to be done.
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 0, perPage: 10, value: 2, currentPageRows: 3,
          },
        });
        expect(wrapper.vm.effectiveTotalRows).toBe(0);
      });
    });

    describe('next button disabled when currentPageRows caps pagination', () => {
      it('disables next button when currentPageRows indicates last page on page 1', async () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 100, perPage: 10, value: 1, currentPageRows: 3,
          },
        });
        await flushPromises();
        const pagination = wrapper.find('#pagination');
        const buttons = pagination.findAll('.page-item');
        // effectiveTotalRows=3, only 1 page → next button disabled
        const nextButton = buttons.find((b) => b.classes('fr-pagination-next'));
        expect(nextButton.classes('disabled')).toBe(true);
      });

      it('disables next button on page 2 when currentPageRows signals last page', async () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 11, perPage: 10, value: 2, currentPageRows: 1,
          },
        });
        await flushPromises();
        const pagination = wrapper.find('#pagination');
        const buttons = pagination.findAll('.page-item');
        const nextButton = buttons.find((b) => b.classes('fr-pagination-next'));
        expect(nextButton.classes('disabled')).toBe(true);
      });

      it('does not falsely cap when cappedTotal equals totalRows exactly', async () => {
        // exact-fit final-page case on a correct backend
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 25, perPage: 10, value: 3, currentPageRows: 5,
          },
        });

        await flushPromises();

        const pagination = wrapper.find('#pagination');
        const buttons = pagination.findAll('.page-item');
        const nextButton = buttons.find((b) => b.classes('fr-pagination-next'));
        expect(nextButton.classes('disabled')).toBe(true);
        expect(wrapper.vm.effectiveTotalRows).toBe(25);
      });

      it('does not disable next button when currentPageRows equals perPage (more pages ahead)', async () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 100, perPage: 10, value: 1, currentPageRows: 10,
          },
        });
        await flushPromises();
        const pagination = wrapper.find('#pagination');
        const buttons = pagination.findAll('.page-item');
        const nextButton = buttons.find((b) => b.classes('fr-pagination-next'));
        expect(nextButton.classes('disabled')).toBe(false);
      });

      it('does not cap when currentPageRows is 0 (empty page)', async () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 100, perPage: 10, value: 3, currentPageRows: 0,
          },
        });
        await flushPromises();
        expect(wrapper.vm.effectiveTotalRows).toBe(100); // fallbacks to totalRows
      });
    });

    describe('dropdown text reflects effectiveTotalRows', () => {
      it('shows capped total in dropdown text on page 1', () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 100, perPage: 10, value: 1, currentPageRows: 3,
          },
        });
        expect(wrapper.vm.pageMax).toBe(3);
        expect(wrapper.vm.effectiveTotalRows).toBe(3);
      });

      it('shows correct pageMax when backend total is higher than actual data on page 2', () => {
        const wrapper = mountPaginationCustom({
          propsData: {
            totalRows: 11, perPage: 10, value: 2, currentPageRows: 3,
          },
        });
        // pageMax = min(value*perPage, effectiveTotalRows) = min(20, 11) = 11
        expect(wrapper.vm.pageMax).toBe(11);
        expect(wrapper.vm.effectiveTotalRows).toBe(11);
      });
    });
    it('does not disable next button in on-demand mode when currentPageRows < perPage but lastPage is false', async () => {
      const wrapper = mountPaginationCustom({
        propsData: {
          totalRows: 0, // on-demand pagination
          perPage: 10,
          value: 1,
          currentPageRows: 7,
          lastPage: false, // still more pages to load
        },
      });
      await flushPromises();
      const nextButton = wrapper.find('.fr-pagination-next');
      expect(nextButton.classes('disabled')).toBe(false);
    });
  });
});
