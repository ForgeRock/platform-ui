/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import SystemMessages from './SystemMessages';

function setup(props = {}) {
  return shallowMount(SystemMessages, {
    global: {
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        BCard: { template: '<div><slot /></div>' },
        BMedia: { template: '<li><slot /><slot name="aside" /></li>' },
        BMediaBody: { template: '<div><slot /></div>' },
      },
    },
    props,
  });
}

describe('SystemMessages', () => {
  describe('@renders', () => {
    it('renders FrNoData when both errors and info are empty', () => {
      const wrapper = setup({
        systemMessages: { errors: [], info: [] },
      });

      expect(wrapper.findComponent(FrNoData).exists()).toBe(true);
      expect(wrapper.findComponent(FrPagination).exists()).toBe(false);
      expect(wrapper.findAllComponents(FrIcon).length).toBe(0);
    });

    it('renders FrNoData with correct props when empty', () => {
      const wrapper = setup({
        systemMessages: { errors: [], info: [] },
      });

      const noData = wrapper.findComponent(FrNoData);
      expect(noData.props('icon')).toBe('inbox');
      expect(noData.props('card')).toBe(false);
      expect(noData.props('title')).toBe('governance.certificationDetails.systemMessages.noMessagesTitle');
      expect(noData.props('subtitle')).toBe('governance.certificationDetails.systemMessages.noMessagesSubtitle');
    });

    it('renders message list when messages exist', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'An error', date: '2024-01-02T00:00:00Z' }],
          info: [],
        },
      });

      expect(wrapper.findComponent(FrNoData).exists()).toBe(false);
      expect(wrapper.findAllComponents(FrIcon).length).toBe(1);
    });

    it('does not render FrPagination when messages fit on one page', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'An error', date: '2024-01-02T00:00:00Z' }],
          info: [],
        },
      });

      expect(wrapper.findComponent(FrPagination).exists()).toBe(false);
    });

    it('renders FrIcon with name "error_outline" for error type entries', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Error message', date: '2024-01-01T00:00:00Z' }],
          info: [],
        },
      });

      const icons = wrapper.findAllComponents(FrIcon);
      expect(icons.length).toBe(1);
      expect(icons[0].props('name')).toBe('error_outline');
    });

    it('renders FrIcon with name "info" for info type entries', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [],
          info: [{ message: 'Info message', date: '2024-01-01T00:00:00Z' }],
        },
      });

      const icons = wrapper.findAllComponents(FrIcon);
      expect(icons.length).toBe(1);
      expect(icons[0].props('name')).toBe('message');
    });

    it('renders correct FrIcon name per entry type in a mixed list', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Error msg', date: '2024-01-01T00:00:00Z' }],
          info: [{ message: 'Info msg', date: '2024-01-02T00:00:00Z' }],
        },
      });

      const icons = wrapper.findAllComponents(FrIcon);
      expect(icons.length).toBe(2);
      // sorted ascending by date: error first (Jan 1), info second (Jan 2)
      expect(icons[0].props('name')).toBe('error_outline');
      expect(icons[1].props('name')).toBe('message');
    });

    it('renders two messages in a mixed list', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Error msg', date: '2024-01-01T00:00:00Z' }],
          info: [{ message: 'Info msg', date: '2024-01-02T00:00:00Z' }],
        },
      });

      // Two messages means two FrIcons (one per item in the left aside column)
      expect(wrapper.findAllComponents(FrIcon).length).toBe(2);
    });

    it('renders message text inside a <p> element', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Check this error', date: '2024-01-01T00:00:00Z' }],
          info: [],
        },
      });

      const paragraphs = wrapper.findAll('p');
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0].text()).toBe('Check this error');
    });

    it('renders timestamp in the header row', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'An error', date: '2024-01-15T10:30:00Z' }],
          info: [],
        },
      });

      const timestampEl = wrapper.find('.text-dark');
      expect(timestampEl.exists()).toBe(true);
      expect(timestampEl.text()).toContain('Jan 15, 2024');
    });

    it('renders sr-only type label "common.error" for error entries', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Error message', date: '2024-01-01T00:00:00Z' }],
          info: [],
        },
      });

      const srOnly = wrapper.find('.sr-only');
      expect(srOnly.exists()).toBe(true);
      expect(srOnly.text()).toBe('common.error');
    });

    it('renders sr-only type label for info entries', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [],
          info: [{ message: 'Info message', date: '2024-01-01T00:00:00Z' }],
        },
      });

      const srOnly = wrapper.find('.sr-only');
      expect(srOnly.exists()).toBe(true);
      expect(srOnly.text()).toBe('governance.certificationDetails.systemMessages.typeInfo');
    });
  });

  describe('@computed', () => {
    it('sorts allMessages ascending by date regardless of input order', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Late error', date: '2024-03-01T00:00:00Z' }],
          info: [
            { message: 'Early info', date: '2024-01-01T00:00:00Z' },
            { message: 'Mid info', date: '2024-02-01T00:00:00Z' },
          ],
        },
      });

      const { allMessages } = wrapper.vm;
      expect(allMessages.length).toBe(3);
      expect(allMessages[0].message).toBe('Early info');
      expect(allMessages[1].message).toBe('Mid info');
      expect(allMessages[2].message).toBe('Late error');
    });

    it('tags errors with type "error" and info with type "info"', () => {
      const wrapper = setup({
        systemMessages: {
          errors: [{ message: 'Err', date: '2024-01-01T00:00:00Z' }],
          info: [{ message: 'Inf', date: '2024-01-02T00:00:00Z' }],
        },
      });

      const { allMessages } = wrapper.vm;
      const errorItem = allMessages.find((m) => m.message === 'Err');
      const infoItem = allMessages.find((m) => m.message === 'Inf');
      expect(errorItem.type).toBe('error');
      expect(infoItem.type).toBe('info');
    });
  });

  describe('@pagination', () => {
    /**
     * Build a list of n messages spanning distinct dates.
     * @param {number} n
     * @returns {Array<{message: string, date: string}>}
     */
    function buildMessages(n) {
      return Array.from({ length: n }, (_, i) => ({
        message: `Message ${i + 1}`,
        date: new Date(2024, 0, i + 1).toISOString(),
      }));
    }

    it('shows exactly 10 items on page 1 when total exceeds 10', () => {
      const wrapper = setup({
        systemMessages: {
          errors: buildMessages(12),
          info: [],
        },
      });

      expect(wrapper.vm.allMessages.length).toBe(12);
      expect(wrapper.vm.visibleMessages.length).toBe(10);
      expect(wrapper.findAllComponents(FrIcon).length).toBe(10);
    });

    it('renders FrPagination when there are more than 10 items', () => {
      const wrapper = setup({
        systemMessages: {
          errors: buildMessages(11),
          info: [],
        },
      });

      expect(wrapper.findComponent(FrPagination).exists()).toBe(true);
    });

    it('items on page 2 are not rendered on page 1', () => {
      const wrapper = setup({
        systemMessages: {
          errors: buildMessages(12),
          info: [],
        },
      });

      const { visibleMessages, allMessages } = wrapper.vm;
      // Items 11 and 12 (index 10, 11) should not be in the page-1 slice
      expect(visibleMessages).not.toContainEqual(allMessages[10]);
      expect(visibleMessages).not.toContainEqual(allMessages[11]);
    });

    it('FrPagination receives correct props', () => {
      const wrapper = setup({
        systemMessages: {
          errors: buildMessages(15),
          info: [],
        },
      });

      const pagination = wrapper.findComponent(FrPagination);
      expect(pagination.props('perPage')).toBe(10);
      expect(pagination.props('totalRows')).toBe(15);
    });

    it('resets currentPage to 1 when systemMessages prop changes', async () => {
      const wrapper = setup({
        systemMessages: {
          errors: buildMessages(12),
          info: [],
        },
      });

      wrapper.vm.currentPage = 2;
      await wrapper.setProps({ systemMessages: { errors: buildMessages(12), info: [] } });
      expect(wrapper.vm.currentPage).toBe(1);
    });

    it('updatePageSize updates itemsPerPage and re-slices visibleMessages', () => {
      const wrapper = setup({
        systemMessages: {
          errors: buildMessages(15),
          info: [],
        },
      });

      expect(wrapper.vm.visibleMessages.length).toBe(10);
      wrapper.vm.updatePageSize(20);
      expect(wrapper.vm.itemsPerPage).toBe(20);
      expect(wrapper.vm.visibleMessages.length).toBe(15);
    });
  });
});
