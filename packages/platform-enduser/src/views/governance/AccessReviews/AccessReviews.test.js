/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import store from '@/store';
import i18n from '@/i18n';
import AccessReviews from './index';

describe('AccessReviews', () => {
  let wrapper;
  beforeEach(() => {
    store.replaceState({
      SharedStore: {
        webStorageAvailable: true,
      },
    });
    setupTestPinia({ user: { userId: 'testId' } });

    CertificationApi.getCertificationItems = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));

    CertificationApi.searchCertificates = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
  });

  const mockRouter = {
    push: jest.fn(),
  };

  function mountComponent(mountFunction = mount, data = {}) {
    return mountFunction(AccessReviews, {
      data() {
        return {
          ...data,
        };
      },
      global: {
        plugins: [i18n],
        directives: {
          'resizable-table': jest.fn(),
        },
        stubs: {
          FrIcon: true,
        },
        mocks: {
          $router: mockRouter,
          getItems: () => jest.fn().mockReturnValue(Promise.resolve({
            data: {
              test: 'test',
            },
          })),
        },
      },
    });
  }

  it('should display noData component when no access reviews are found', async () => {
    wrapper = mountComponent();
    wrapper.vm.setAccessReviewList({ result: [], totalCount: 0 });
    await flushPromises();

    const noData = findByTestId(wrapper, 'access-review-no-data');
    expect(noData.exists()).toBeTruthy();
  });

  it('clicking column picker button should show the column picker modal', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.openColumnsModal();
    expect(wrapper.vm.pickerProps.show).toBe(true);
  });

  it('should maintain all available columns in the picker when some are deselected', async () => {
    wrapper = mountComponent();
    await flushPromises();

    // Total fields defined in tableFields is 5
    expect(wrapper.vm.tableFields.length).toBe(5);

    // Simulate unticking a column by emitting update:activeColumns with only 4 columns
    const updatedColumns = wrapper.vm.tableFields.slice(0, 4);
    const columnPicker = wrapper.findComponent({ name: 'ColumnPicker' });
    await columnPicker.vm.$emit('update:activeColumns', updatedColumns);

    // Table fields should remain 5
    expect(wrapper.vm.tableFields.length).toBe(5);
    // Available columns passed to picker should still be 5
    expect(columnPicker.props('availableColumns').length).toBe(5);
    // Active columns should now be 4
    expect(wrapper.vm.activeColumns.length).toBe(4);
  });

  it('Calling getList with not search params calls getCertificationItems', () => {
    wrapper = mountComponent(shallowMount);
    expect(CertificationApi.searchCertificates).not.toHaveBeenCalled();
    expect(CertificationApi.getCertificationItems).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, sortBy: 'deadline', sortDesc: false, status: 'active',
    });
  });

  it('Calling getList with search params calls searchCertificates', () => {
    wrapper = mountComponent(shallowMount, { searchQuery: 'test search' });
    expect(CertificationApi.getCertificationItems).not.toHaveBeenCalled();
    expect(CertificationApi.searchCertificates).toHaveBeenCalledWith('test search', {
      pageNumber: 0, pageSize: 10, sortBy: 'deadline', sortDesc: false, status: 'active',
    });
  });

  describe('row keyboard accessibility', () => {
    const mockRow = {
      campaignId: 'campaign-1',
      certifierId: 'certifier-1',
      campaignName: 'CertifyAll',
      status: 'active',
      totals: { total: 10, 'in-progress': 3 },
    };

    async function mountWithRows() {
      const componentWrapper = mountComponent();
      await flushPromises();
      componentWrapper.vm.setAccessReviewList({ result: [mockRow], totalCount: 1 });
      await nextTick();
      return componentWrapper;
    }

    it('table rows have tabindex="0" and aria-selected when selectable is set', async () => {
      wrapper = await mountWithRows();
      const rows = wrapper.findAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);
      rows.forEach((row) => {
        expect(row.attributes('tabindex')).toBe('0');
        expect(row.attributes('aria-selected')).toBeDefined();
      });
    });

    it('navigates to CertificationTask when row-selected fires with an item', async () => {
      wrapper = await mountWithRows();

      const table = wrapper.findComponent({ name: 'BTable' });
      expect(table.exists()).toBe(true);

      await table.vm.$emit('row-selected', [wrapper.vm.accessReviewList[0]]);

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'CertificationTask',
        params: { campaignId: mockRow.campaignId },
        query: expect.objectContaining({ actorId: mockRow.certifierId }),
      });
    });

    it('does not navigate when row-selected fires with an empty array (deselect)', async () => {
      wrapper = await mountWithRows();
      mockRouter.push.mockClear();

      const table = wrapper.findComponent({ name: 'BTable' });
      await table.vm.$emit('row-selected', []);

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
