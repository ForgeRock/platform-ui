/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { BPagination } from 'bootstrap-vue';
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

    // Ellipsis items render with role="separator" from BootstrapVue. Once fixNavButtonAttributes
    // strips the menubar role from the <ul>, an li whose role is not listitem is no longer valid
    // inside a plain list (axe "list" rule; W3C validator flags the same). The default a11y test
    // above uses LARGE dataset size, which hides the ellipsis — this case renders it (CUSTOM).
    it('should not have any accessibility violations when ellipsis is rendered', async () => {
      const wrapper = mountPagination({
        propsData: {
          totalRows: 100,
          value: 5,
          hidePageSizeSelector: true,
        },
      }, DatasetSize.CUSTOM);
      await flushPromises();
      await runA11yTest(wrapper);
    });

    it('ellipsis is an inert indicator: no role, not a Tab stop, stays inert across re-renders', async () => {
      const wrapper = mountPagination({
        propsData: {
          totalRows: 100,
          value: 5,
          hidePageSizeSelector: true,
        },
      }, DatasetSize.CUSTOM);
      await flushPromises();

      const assertEllipsisInert = () => {
        const ellipsisItems = wrapper.findAll('.page-item.bv-d-xs-down-none');
        expect(ellipsisItems.length).toBeGreaterThan(0);
        Array.from(ellipsisItems).forEach((item) => {
          expect(item.attributes('role')).toBeUndefined();
          const link = item.find('.page-link');
          expect(link.element.tagName).toBe('SPAN');
          expect(link.attributes('role')).toBeUndefined();
          expect(link.attributes('tabindex')).toBeUndefined();
        });
      };
      assertEllipsisInert();

      // Re-render (BV clobbers attributes) and re-run the fix via a prop change: the first
      // fix run already stripped the separator role it detects by, so this must stay inert
      // via the data-fr-ellipsis marker — the fix must be idempotent across runs.
      await wrapper.setProps({ value: 6 });
      await flushPromises();
      assertEllipsisInert();
    });
  });

  // Canary for fixNavButtonAttributes(): every "menu semantics removed" assertion in this
  // suite is an absence check and would pass vacuously if BootstrapVue stopped generating
  // the roles/attrs we strip. This test pins the library output those assertions depend on.
  // If this fails after a bootstrap-vue upgrade, re-evaluate fixNavButtonAttributes()
  // (including its triple-nested $nextTick, which must keep landing after BV's re-render).
  it('canary: raw BPagination still generates the menu semantics we strip', async () => {
    const wrapper = mount(BPagination, {
      propsData: {
        totalRows: 30,
        value: 2,
        limit: 4,
      },
      global: {
        mocks: {
          $t: (key) => key,
        },
      },
    });
    await flushPromises();

    expect(wrapper.find('ul.pagination').attributes('role')).toBe('menubar');
    expect(wrapper.findAll('[role="menuitem"], [role="menuitemradio"]').length).toBeGreaterThan(0);
    const activeLink = wrapper.find('.page-item.active .page-link');
    expect(activeLink.attributes('aria-checked')).toBe('true');
    expect(activeLink.attributes('aria-posinset')).toBeDefined();
    expect(activeLink.attributes('aria-setsize')).toBeDefined();
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

  it('Pagination removes menu semantics from generated controls', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    }, DatasetSize.CUSTOM);
    await flushPromises();

    const pagination = wrapper.find('#pagination');
    const navigation = wrapper.find('nav.pagination-navigation');
    expect(navigation.exists()).toBe(true);
    expect(navigation.attributes('aria-label')).toBe('Pagination');
    expect(pagination.attributes('role')).toBeUndefined();
    const visibleItems = pagination.findAll('.page-item').filter((item) => !item.classes().includes('d-none'));
    expect(visibleItems.filter((item) => item.find('[role="menuitem"]').exists())).toHaveLength(0);
    expect(visibleItems.filter((item) => item.find('[role="menuitemradio"]').exists())).toHaveLength(0);
    expect(visibleItems.filter((item) => item.find('[aria-checked]').exists())).toHaveLength(0);
    expect(visibleItems.filter((item) => item.attributes('role') === 'presentation')).toHaveLength(0);
    const numberedPages = visibleItems.filter((item) => item.find('[aria-label^="Go to page"]').exists());
    numberedPages.forEach((item) => expect(item.find('.page-link').attributes('tabindex')).toBe('0'));

    const activePage = pagination.find('.page-item.active .page-link');
    expect(activePage.attributes('aria-current')).toBe('page');
    expect(activePage.attributes('aria-posinset')).toBeUndefined();
    expect(activePage.attributes('aria-setsize')).toBeUndefined();
  });

  it('keeps the synthetic on-demand page out of the Tab sequence', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 0,
        lastPage: false,
        value: 5,
        perPage: 10,
      },
    }, DatasetSize.CUSTOM);

    await flushPromises();

    const placeholder = wrapper.find('.last-page-on-demand:nth-last-of-type(3)');
    expect(placeholder.exists()).toBe(true);
    expect(placeholder.find('.page-link').attributes('tabindex')).toBe('-1');
    expect(placeholder.find('.page-link').attributes('aria-label')).toBe('Go to page 6');

    const realPages = wrapper.findAll('.page-item.last-page-on-demand').filter((item) => !item.element.matches('.last-page-on-demand:nth-last-of-type(3)'));
    realPages.forEach((item) => expect(item.find('.page-link').attributes('tabindex')).toBe('0'));
  });

  it('reapplies semantic normalization after pagination events and prop changes', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 2,
      },
    }, DatasetSize.CUSTOM);

    await flushPromises();
    await wrapper.find('.fr-pagination-next .page-link').trigger('click');
    await flushPromises();

    expect(wrapper.find('#pagination').attributes('role')).toBeUndefined();
    expect(wrapper.findAll('#pagination .page-item:not(.d-none) [role="menuitem"], #pagination .page-item:not(.d-none) [role="menuitemradio"]')).toHaveLength(0);

    await wrapper.setProps({
      value: 1,
      limit: 3,
      hideEllipsis: true,
      hidePageNumbers: false,
      datasetSize: DatasetSize.CUSTOM,
    });
    await flushPromises();

    expect(wrapper.find('#pagination').attributes('role')).toBeUndefined();
    expect(wrapper.findAll('#pagination .page-item:not(.d-none) [role="menuitem"], #pagination .page-item:not(.d-none) [role="menuitemradio"]')).toHaveLength(0);
    expect(wrapper.find('#pagination .page-item.active .page-link').attributes('aria-current')).toBe('page');
  });

  it('keeps the page-size dropdown menu semantics separate', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
      },
    });
    await flushPromises();

    expect(wrapper.find('#dropdown .dropdown-menu').attributes('role')).toBe('menu');
    expect(wrapper.findAll('#dropdown .dropdown-item[role="menuitem"]')).not.toHaveLength(0);
  });

  it('Pagination correct aria labels', () => {
    const wrapper = mountPagination();
    const pagination = wrapper.find('#pagination');
    expect(pagination.exists()).toBe(true);
    expect(wrapper.find('nav.pagination-navigation').attributes('aria-label')).toBe('Pagination');
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

  it('preserves focus on the clicked pagination control', async () => {
    const wrapper = mountPagination({
      attachTo: document.body,
      propsData: {
        totalRows: 30,
        value: 1,
      },
    }, DatasetSize.CUSTOM);
    await flushPromises();

    const pageTwo = wrapper.findAll('.page-item').find((item) => item.text().trim() === '2').find('.page-link');
    pageTwo.element.focus();
    await pageTwo.trigger('click');
    await flushPromises();

    expect(wrapper.find('.page-item.active .page-link').text()).toBe('2');
    expect(wrapper.find('.page-item.active .page-link').attributes('aria-current')).toBe('page');
    expect(wrapper.find('.page-item.active .page-link').attributes('data-page')).toBeUndefined();
    // BootstrapVue retains or restores focus without an active-page focus override.
    expect(document.activeElement).not.toBe(document.body);
    wrapper.unmount();
  });

  it('does not steal focus during a controlled value update', async () => {
    const wrapper = mountPagination({
      attachTo: document.body,
      propsData: {
        totalRows: 30,
        value: 1,
      },
    }, DatasetSize.CUSTOM);
    await flushPromises();

    const next = wrapper.find('.fr-pagination-next .page-link');
    next.element.focus();
    await wrapper.setProps({ value: 2 });
    await flushPromises();

    expect(document.activeElement).toBe(next.element);
    wrapper.unmount();
  });

  it('Disabled prev remains tabbable and enabled next is tabbable on the 1st page', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
        value: 1,
      },
    });

    await flushPromises();

    // prev is disabled on page 1 — renders as <span> with aria-disabled="true"
    // Visible disabled custom controls stay tabbable per the Level Access remediation (IAM-11261)
    const prevButton = wrapper.find('.fr-pagination-prev .page-link');
    expect(prevButton.exists()).toBe(true);
    expect(prevButton.element.tagName).toBe('SPAN');
    expect(prevButton.attributes('role')).toBe('button');
    expect(prevButton.attributes('aria-disabled')).toBe('true');
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

  it('Enabled prev is tabbable and disabled next remains tabbable on the last page', async () => {
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
    // Visible disabled custom controls stay tabbable per the Level Access remediation (IAM-11261)
    const nextButton = wrapper.find('.fr-pagination-next .page-link');
    expect(nextButton.exists()).toBe(true);
    expect(nextButton.element.tagName).toBe('SPAN');
    expect(nextButton.attributes('role')).toBe('button');
    expect(nextButton.attributes('aria-disabled')).toBe('true');
    expect(nextButton.attributes('tabindex')).toBe('0');
  });

  it('Disabled nav spans are announced by screen readers and remain tabbable when all buttons are disabled', async () => {
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
    // aria-hidden removed from visible parent items so screen readers announce the controls
    expect(wrapper.find('.fr-pagination-prev').attributes('aria-hidden')).toBeUndefined();
    expect(wrapper.find('.fr-pagination-next').attributes('aria-hidden')).toBeUndefined();
    expect(prevButton.attributes('role')).toBe('button');
    expect(nextButton.attributes('role')).toBe('button');
    // Disabled custom controls remain tabbable per the Level Access remediation (IAM-11261).
    expect(prevButton.attributes('tabindex')).toBe('0');
    expect(nextButton.attributes('tabindex')).toBe('0');
  });

  it('Normalizes hidden pagination items without exposing them', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 30,
        value: 1,
      },
    });

    await flushPromises();

    const hiddenFirst = wrapper.find('.fr-pagination-first');
    expect(hiddenFirst.classes()).toContain('d-none');
    expect(hiddenFirst.attributes('aria-hidden')).toBe('true');
    expect(hiddenFirst.attributes('role')).toBeUndefined();
    expect(hiddenFirst.find('.page-link').attributes('role')).toBe('button');
    expect(hiddenFirst.find('.page-link').attributes('tabindex')).not.toBe('0');
  });

  it('Disabled nav button li wrappers have aria-hidden removed so inner button is announced', async () => {
    const wrapper = mountPagination({
      propsData: {
        totalRows: 20,
        value: 1,
      },
    });

    await flushPromises();

    const prevLi = wrapper.find('.fr-pagination-prev');
    expect(prevLi.attributes('aria-hidden')).toBeUndefined();
    expect(prevLi.attributes('role')).toBeUndefined();
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
    expect(prevLi.attributes('role')).toBeUndefined();

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

  describe('page size dropdown focus management', () => {
    it('focusFirstDropdownItem focuses the active item when perPage is not the first entry', async () => {
      const wrapper = mountPagination({ propsData: { totalRows: 100, perPage: 50 } });
      await flushPromises();

      const activeItem = wrapper.find('.dropdown-item.active');
      expect(activeItem.exists()).toBe(true);
      const focusSpy = jest.spyOn(activeItem.element, 'focus');

      wrapper.vm.focusFirstDropdownItem();
      await flushPromises();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('focusFirstDropdownItem falls back to the first item when no item matches perPage', async () => {
      // pageSizes=[20,50,100] does not include perPage=10, so no item is .active
      const wrapper = mountPagination({ propsData: { totalRows: 100, perPage: 10, pageSizes: [20, 50, 100] } });
      await flushPromises();

      const firstItem = wrapper.find('.dropdown-item');
      expect(firstItem.classes()).not.toContain('active');
      const focusSpy = jest.spyOn(firstItem.element, 'focus');

      wrapper.vm.focusFirstDropdownItem();
      await flushPromises();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('@shown wiring calls focusFirstDropdownItem and focuses the active item', async () => {
      const wrapper = mountPagination({ propsData: { totalRows: 100, perPage: 10 } });
      await flushPromises();

      const activeItem = wrapper.find('.dropdown-item.active');
      const focusSpy = jest.spyOn(activeItem.element, 'focus');

      // Trigger the @shown event on the BDropdown to exercise the template binding
      wrapper.vm.$refs.pageSizeDropdown.$emit('shown');
      await flushPromises();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('selected item has aria-current="true" and no disabled class', () => {
      const wrapper = mountPagination({ propsData: { totalRows: 100, perPage: 10 } });
      const items = wrapper.findAll('.dropdown-item');
      expect(items[0].classes()).not.toContain('disabled');
      expect(items[0].attributes('aria-current')).toBe('true');
      expect(items[1].attributes('aria-current')).toBeFalsy();
    });

    it('pageSizeChanged does not emit when the same page size is clicked', () => {
      const wrapper = mountPagination({ propsData: { totalRows: 100, perPage: 10 } });
      wrapper.vm.pageSizeChanged(10);
      expect(wrapper.emitted('on-page-size-change')).toBeFalsy();
    });

    it('pageSizeChanged emits when a different page size is clicked', () => {
      const wrapper = mountPagination({ propsData: { totalRows: 100, perPage: 10 } });
      wrapper.vm.pageSizeChanged(20);
      expect(wrapper.emitted('on-page-size-change')).toBeTruthy();
      expect(wrapper.emitted('on-page-size-change')[0]).toEqual([20]);
    });
  });
});
