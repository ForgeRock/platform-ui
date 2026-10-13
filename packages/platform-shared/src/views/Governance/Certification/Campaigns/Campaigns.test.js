/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createAppContainer, findByTestId, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import dayjs from 'dayjs';
import store from '@/store';
import i18n from '@/i18n';
import Campaigns from './index';

// downloadAsType writes asynchronously after the test ends, when jsdom's
// document is gone; the unhandled rejection crashes the Jest worker
jest.mock('@forgerock/platform-shared/src/utils/downloadFile', () => ({
  downloadAsType: jest.fn(),
}));

describe('Campaigns', () => {
  let wrapper;
  beforeEach(() => {
    CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.getAdminCertificationItems = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [],
        totalCount: 0,
      },
    }));
    CertificationApi.activateCertification = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.cancelCertification = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.deleteCertification = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    CertificationApi.updateCertificationDeadline = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        test: 'test',
      },
    }));
    store.replaceState({
      SharedStore: {
        webStorageAvailable: true,
        governanceDevEnabled: true,
      },
    });
    wrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      global: {
        mocks: {
          $store: store,
        },
        plugins: [i18n],
        directives: {
          'resizable-table': jest.fn(),
        },
      },
    });
  });

  it('uses the legacy admin endpoint and status dropdown when governance dev is disabled', async () => {
    store.state.SharedStore.governanceDevEnabled = false;
    wrapper.vm.sortBy = 'formattedDeadline';
    await wrapper.vm.$nextTick();
    wrapper.vm.getList();
    expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active',
      queryString: '',
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'deadline',
      sortDesc: false,
    }));
    expect(wrapper.find('#dropdown-status').exists()).toBe(true);
    expect(wrapper.find('[data-testid="filter-toggle"]').exists()).toBe(false);
  });

  it('should display noData component when no campaigns are found', async () => {
    await wrapper.vm.setAccessReviewList({ result: [], totalCount: 0 });

    const noData = findByTestId(wrapper, 'campaigns-no-data');
    expect(noData.exists()).toBeTruthy();
  });

  it('signed-off and staging statuses are added on mount', async () => {
    expect(wrapper.vm.statuses.get('signed-off')).toEqual(expect.objectContaining({ sortHide: true, type: 'signed-off' }));
    expect(wrapper.vm.statuses.get('staging')).toEqual(expect.objectContaining({ param: 'staging', type: 'staging' }));
  });

  it('only filterable (non-sortHide) statuses are selected by default', async () => {
    expect(wrapper.vm.selectedStatuses).toEqual(wrapper.vm.filterableStatusKeys);
    expect(wrapper.vm.selectedStatuses).not.toContain('in-progress');
    expect(wrapper.vm.selectedStatuses).not.toContain('expiring');
    expect(wrapper.vm.selectedStatuses).toContain('active');
    expect(wrapper.vm.selectedStatuses).toContain('staging');
  });

  it('getList calls getCertificationList without _queryFilter when all statuses selected', async () => {
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, sortBy: 'name', sortDesc: false,
    });
  });

  it('getList passes name co queryFilter when searchQuery is set', async () => {
    await wrapper.setData({ searchQuery: 'test campaign' });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, sortBy: 'name', sortDesc: false, _queryFilter: "name co 'test campaign'",
    });
  });

  it('getList passes status eq queryFilter when a subset of statuses is selected', async () => {
    await wrapper.setData({ selectedStatuses: ['active'] });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0, pageSize: 10, sortBy: 'name', sortDesc: false, _queryFilter: "status eq 'active'",
    });
  });

  it('getList combines name and status filters with and', async () => {
    await wrapper.setData({ searchQuery: 'foo', selectedStatuses: ['active', 'staging'] });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDesc: false,
      _queryFilter: "name co 'foo' and (status eq 'active' or status eq 'staging')",
    });
  });

  it('getList filters by owner and campaign type', async () => {
    await wrapper.setData({
      selectedOwner: 'managed/user/owner-id',
      selectedCampaignType: 'identity',
    });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDesc: false,
      _queryFilter: "ownerId co 'owner-id' and certificationType eq 'identity'",
    });
  });

  it('campaign type options include an all option and supported campaign types', () => {
    expect(wrapper.vm.campaignTypeOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: '' }),
      expect.objectContaining({ value: 'identity' }),
      expect.objectContaining({ value: 'roleMembership' }),
      expect.objectContaining({ value: 'entitlementComposition' }),
    ]));
  });

  it('resetFilters restores all filters to their defaults', async () => {
    await wrapper.setData({
      searchQuery: 'campaign',
      selectedOwner: 'managed/user/owner-id',
      selectedCampaignType: 'identity',
      selectedStatuses: ['active'],
    });
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    wrapper.vm.resetFilters();
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.selectedOwner).toBe('');
    expect(wrapper.vm.selectedCampaignType).toBe('');
    expect(wrapper.vm.selectedStatuses).toEqual(wrapper.vm.filterableStatusKeys);
    expect(getListSpy).toHaveBeenCalled();
  });

  it('reset filters omit owner and type from the query filter', async () => {
    await wrapper.setData({
      selectedOwner: 'managed/user/owner-id',
      selectedCampaignType: 'identity',
    });
    wrapper.vm.resetFilters();
    expect(wrapper.vm.buildQueryFilter()).toBeUndefined();
  });

  it('should sort ascending or descending on name', async () => {
    await wrapper.vm.setAccessReviewList({ result: [{}], totalCount: 1 });
    const certTable = wrapper.find('.table');
    certTable.find('th').trigger('click');
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDesc: false }),
    );
    certTable.find('th').trigger('click');
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDesc: true }),
    );
  });

  it('displayList mirrors accessReviewList directly', async () => {
    await wrapper.vm.setAccessReviewList({
      result: [{ status: 'active' }, { status: 'staging' }],
      totalCount: 2,
    });
    expect(wrapper.vm.displayList).toStrictEqual(wrapper.vm.accessReviewList);
  });

  it('clicking column picker button should show the column picker modal', async () => {
    wrapper.vm.openColumnsModal();
    expect(wrapper.vm.pickerProps.show).toBe(true);
  });

  it('should maintain all available columns in the picker when some are deselected and preserve actions column', async () => {
    expect(wrapper.vm.tableFields.length).toBe(6);
    expect(wrapper.vm.activeColumns.length).toBe(6);

    const updatedColumns = wrapper.vm.tableFields.slice(0, 4);
    expect(updatedColumns.find((c) => c.key === 'actions')).toBeUndefined();

    const columnPicker = wrapper.findComponent({ name: 'ColumnPicker' });
    await columnPicker.vm.$emit('update:activeColumns', updatedColumns);

    expect(wrapper.vm.activeColumns.length).toBe(5);
    expect(wrapper.vm.activeColumns.find((c) => c.key === 'actions')).toBeDefined();
    expect(wrapper.vm.tableFields.length).toBe(6);
    expect(columnPicker.props('availableColumns').length).toBe(6);
  });

  it('Calling openModal resets modal values', () => {
    wrapper.vm.openModal('action', 'testId');

    expect(wrapper.vm.modalType).toEqual('action');
    expect(wrapper.vm.selectedCertId).toEqual('testId');
  });

  it('Calling closeModal resets modal values', () => {
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    wrapper.setData({
      selectedCertId: 'testCertId',
      currentDeadline: '12-12-2022',
      isRequestLoading: true,
    });

    wrapper.vm.closeModal('campaign-modal');

    expect(wrapper.vm.selectedCertId).toBeFalsy();
    expect(wrapper.vm.currentDeadline).toBeFalsy();
    expect(wrapper.vm.isRequestLoading).toBeFalsy();
    expect(getListSpy).toHaveBeenCalled();
  });

  it('Calling activateCampaign calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
    });

    wrapper.vm.activateCampaign();
    await new Promise(process.nextTick);

    expect(CertificationApi.activateCertification).toHaveBeenCalledWith('testCertId');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('Calling cancelCampaign calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
    });

    wrapper.vm.cancelCampaign();
    await new Promise(process.nextTick);

    expect(CertificationApi.cancelCertification).toHaveBeenCalledWith('testCertId');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('Calling deleteCampaign calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
    });

    wrapper.vm.deleteCampaign();
    await new Promise(process.nextTick);

    expect(CertificationApi.deleteCertification).toHaveBeenCalledWith('testCertId');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('Calling updateCampaignDeadline calls api and closes modal', async () => {
    const closeModalSpy = jest.spyOn(wrapper.vm, 'closeModal');
    wrapper.setData({
      selectedCertId: 'testCertId',
      currentDeadline: '2023-01-26',
    });

    wrapper.vm.updateCampaignDeadline('2023-01-26');
    await new Promise(process.nextTick);

    expect(CertificationApi.updateCertificationDeadline).toHaveBeenCalledWith('testCertId', '2023-01-26');
    expect(closeModalSpy).toHaveBeenCalled();
  });

  describe('status mutation via getList', () => {
    it('sets overdue when in-progress campaign deadline has passed', async () => {
      const pastDeadline = dayjs().subtract(1, 'day').toISOString();
      CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
        data: { result: [{ status: 'in-progress', deadline: pastDeadline }], totalCount: 1 },
      }));
      wrapper.vm.getList();
      await new Promise(process.nextTick);
      expect(wrapper.vm.accessReviewList[0].status).toBe('overdue');
    });

    it('sets expiring when in-progress campaign deadline is within 2 days', async () => {
      const nearDeadline = dayjs().add(1, 'day').toISOString();
      CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
        data: { result: [{ status: 'in-progress', deadline: nearDeadline }], totalCount: 1 },
      }));
      wrapper.vm.getList();
      await new Promise(process.nextTick);
      expect(wrapper.vm.accessReviewList[0].status).toBe('expiring');
    });

    it('does not mutate in-progress status when deadline is far away', async () => {
      const farDeadline = dayjs().add(10, 'day').toISOString();
      CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
        data: { result: [{ status: 'in-progress', deadline: farDeadline }], totalCount: 1 },
      }));
      wrapper.vm.getList();
      await new Promise(process.nextTick);
      expect(wrapper.vm.accessReviewList[0].status).toBe('in-progress');
    });

    it('sets completed when numInProgress >= doc_count for non-in-progress campaign', async () => {
      CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
        data: { result: [{ status: 'active', numInProgress: 5, doc_count: 5 }], totalCount: 1 },
      }));
      wrapper.vm.getList();
      await new Promise(process.nextTick);
      expect(wrapper.vm.accessReviewList[0].status).toBe('completed');
    });

    it('does not mutate status when numInProgress is 0', async () => {
      CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
        data: { result: [{ status: 'active', numInProgress: 0, doc_count: 5 }], totalCount: 1 },
      }));
      wrapper.vm.getList();
      await new Promise(process.nextTick);
      expect(wrapper.vm.accessReviewList[0].status).toBe('active');
    });
  });

  it('isActiveLikeItem returns true for active-like statuses', () => {
    expect(wrapper.vm.isActiveLikeItem({ status: 'active' })).toBe(true);
    expect(wrapper.vm.isActiveLikeItem({ status: 'in-progress' })).toBe(true);
    expect(wrapper.vm.isActiveLikeItem({ status: 'expiring' })).toBe(true);
    expect(wrapper.vm.isActiveLikeItem({ status: 'expired' })).toBe(false);
    expect(wrapper.vm.isActiveLikeItem({ status: 'staging' })).toBe(false);
  });

  it('isClosedLikeItem returns true for closed-like statuses', () => {
    expect(wrapper.vm.isClosedLikeItem({ status: 'completed' })).toBe(true);
    expect(wrapper.vm.isClosedLikeItem({ status: 'cancelled' })).toBe(true);
    expect(wrapper.vm.isClosedLikeItem({ status: 'expired' })).toBe(true);
    expect(wrapper.vm.isClosedLikeItem({ status: 'active' })).toBe(false);
  });

  it('isStagedItem returns true only for staging status', () => {
    expect(wrapper.vm.isStagedItem({ status: 'staging' })).toBe(true);
    expect(wrapper.vm.isStagedItem({ status: 'active' })).toBe(false);
  });

  it('escapes single quotes in the name search query filter', async () => {
    await wrapper.setData({ searchQuery: "O'Brien review" });
    expect(wrapper.vm.buildQueryFilter()).toBe("name co 'O\\'Brien review'");
  });

  it('renders a status badge and view details action for a mutated completed campaign', async () => {
    await wrapper.vm.setAccessReviewList({
      result: [{ status: 'completed' }],
      totalCount: 1,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.statuses.get('completed')).toBeDefined();
    expect(wrapper.find('.table').text()).toContain('Complete');
    expect(wrapper.vm.isClosedLikeItem(wrapper.vm.displayList[0])).toBe(true);
  });

  it('keeps legacy actions on the status dropdown path when governance dev is disabled', async () => {
    store.state.SharedStore.governanceDevEnabled = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isStagedStatus).toBe(false);
    wrapper.vm.handleStatusSort(wrapper.vm.statuses.get('staging'));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isStagedStatus).toBe(true);
  });

  it('renders activate and delete actions for a staged campaign in legacy mode', async () => {
    store.state.SharedStore.governanceDevEnabled = false;
    // stub ActionsCell to render its custom actions inline (the real menu
    // teleports only when opened, which this test does not need)
    const ActionsCellStub = { template: '<div><slot name="custom-top-actions" /></div>' };
    const legacyWrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      global: {
        mocks: { $store: store },
        plugins: [i18n],
        directives: { 'resizable-table': jest.fn() },
        stubs: { FrActionsCell: ActionsCellStub },
      },
    });
    await legacyWrapper.vm.handleStatusSort(legacyWrapper.vm.statuses.get('staging'));
    await new Promise(process.nextTick);
    await legacyWrapper.vm.setAccessReviewList({
      result: [{ name: 'legacy staged campaign', status: 'staging' }],
      totalCount: 1,
    });
    await legacyWrapper.vm.$nextTick();
    const actionTexts = legacyWrapper.findAll('.dropdown-item').map((w) => w.text());
    expect(actionTexts.join(' ')).toContain('Activate');
    expect(actionTexts.join(' ')).toContain('Delete');
    legacyWrapper.unmount();
  });

  it('commits the certification count to the store after getList', async () => {
    // only platform-enduser registers setCertificationCount, seeded with a
    // truthy count at boot; mirror that contract with a mock store
    const mockStore = {
      state: {
        SharedStore: { webStorageAvailable: true, governanceDevEnabled: true },
        certificationCount: 1,
      },
      commit: jest.fn(),
    };
    const countWrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      global: {
        mocks: { $store: mockStore },
        plugins: [i18n],
        directives: {
          'resizable-table': jest.fn(),
        },
      },
    });
    CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
      data: { result: [], totalCount: 7 },
    }));
    countWrapper.vm.getList();
    await new Promise(process.nextTick);
    expect(mockStore.commit).toHaveBeenCalledWith('setCertificationCount', 7);
    countWrapper.unmount();
  });

  it('commits the normalized totalHits to the store when the list endpoint returns totalHits', async () => {
    const mockStore = {
      state: {
        SharedStore: { webStorageAvailable: true, governanceDevEnabled: true },
        certificationCount: 1,
      },
      commit: jest.fn(),
    };
    const countWrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      global: {
        mocks: { $store: mockStore },
        plugins: [i18n],
        directives: {
          'resizable-table': jest.fn(),
        },
      },
    });
    CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
      data: { result: [], totalHits: 7 },
    }));
    countWrapper.vm.getList();
    await new Promise(process.nextTick);
    expect(mockStore.commit).toHaveBeenCalledWith('setCertificationCount', 7);
    countWrapper.unmount();
  });

  it('does not table-spin after exporting all rows', async () => {
    CertificationApi.getCertificationList = jest.fn().mockReturnValue(Promise.resolve({
      data: { result: [{ status: 'active', campaignName: 'exported' }], totalHits: 1 },
    }));
    const getItemsSpy = jest.spyOn(wrapper.vm, 'getItems');
    await wrapper.vm.exportItemsToFile({ format: 'csv', rows: 'all' });
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(expect.objectContaining({
      pageSize: 10000,
    }));
    // export goes through the API function directly, not getItems, so the
    // table's loading state is untouched by the export
    expect(getItemsSpy).not.toHaveBeenCalled();
  });

  it('shows a filter toggle button with an accessible name in dev mode', () => {
    const toggle = wrapper.find('[data-testid="filter-toggle"]');
    expect(toggle.exists()).toBe(true);
    expect(toggle.attributes('aria-label')).toBeDefined();
  });

  it('debounced search triggers getList with the escaped query', async () => {
    jest.useFakeTimers();
    try {
      await wrapper.setData({ searchQuery: "O'Hara" });
      wrapper.vm.debouncedSearch();
      jest.advanceTimersByTime(400);
      expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(expect.objectContaining({
        _queryFilter: "name co 'O\\'Hara'",
      }));
    } finally {
      jest.useRealTimers();
    }
  });

  describe('legacy fallback when the new certification endpoint is unavailable', () => {
    it('falls back to the legacy admin endpoint on a 404, keeping search but resetting the other filters', async () => {
      await wrapper.setData({
        searchQuery: 'audit',
        selectedOwner: 'managed/user/owner-id',
        selectedCampaignType: 'identity',
        selectedStatuses: ['active'],
        showFilters: true,
      });
      CertificationApi.getCertificationList = jest.fn().mockRejectedValue({ response: { status: 404 } });
      CertificationApi.getAdminCertificationItems = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          result: [{ status: 'in-progress', deadline: dayjs().subtract(1, 'day').toISOString() }],
          totalCount: 1,
        },
      }));

      wrapper.vm.getList();
      await flushPromises();
      await wrapper.vm.$nextTick();

      // legacy client called with status/queryString params, not _queryFilter
      expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalledWith(expect.objectContaining({
        status: 'active',
        queryString: 'audit',
        sortBy: 'deadline',
        sortDesc: false,
      }));
      expect(CertificationApi.getAdminCertificationItems.mock.calls[0][0]._queryFilter).toBeUndefined();

      // mutateCampaignStatus was not applied to the legacy row
      expect(wrapper.vm.accessReviewList[0].status).toBe('in-progress');

      // fallback engaged: dev-only filter state reset, search kept, panel/toolbar swapped to legacy
      expect(wrapper.vm.usingNewListApi).toBe(false);
      expect(wrapper.vm.newListUnavailable).toBe(true);
      expect(wrapper.vm.searchQuery).toBe('audit');
      expect(wrapper.vm.selectedOwner).toBe('');
      expect(wrapper.vm.selectedCampaignType).toBe('');
      expect(wrapper.vm.selectedStatuses).toEqual([]);
      expect(wrapper.vm.showFilters).toBe(false);
      expect(wrapper.find('#campaigns-filter-panel').exists()).toBe(false);
      expect(wrapper.find('#dropdown-status').exists()).toBe(true);

      // export-all follows the same fallback
      const getItemsSpy = jest.spyOn(wrapper.vm, 'getItems');
      await wrapper.vm.exportItemsToFile({ format: 'csv', rows: 'all' });
      expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalledWith(expect.objectContaining({
        pageSize: 10000,
      }));
      expect(getItemsSpy).not.toHaveBeenCalled();
    });

    it('does not fall back on a 500 — surfaces the error and never calls the legacy endpoint', async () => {
      CertificationApi.getCertificationList = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.getList();
      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalled();
      expect(CertificationApi.getAdminCertificationItems).not.toHaveBeenCalled();
      expect(wrapper.vm.usingNewListApi).toBe(true);
      expect(wrapper.vm.tableLoading).toBe(false);
    });

    it('is one-way: a subsequent getList (e.g. pagination) still routes to the legacy client', async () => {
      CertificationApi.getCertificationList = jest.fn().mockRejectedValue({ response: { status: 404 } });
      CertificationApi.getAdminCertificationItems = jest.fn().mockReturnValue(Promise.resolve({
        data: { result: [], totalCount: 0 },
      }));

      wrapper.vm.getList();
      await flushPromises();
      expect(wrapper.vm.newListUnavailable).toBe(true);
      // filters are unreachable once the fallback engages — the panel is v-if'd on usingNewListApi
      expect(wrapper.find('#campaigns-filter-panel').exists()).toBe(false);

      CertificationApi.getAdminCertificationItems.mockClear();
      CertificationApi.getCertificationList.mockClear();
      wrapper.vm.paginationChange(2);
      await flushPromises();

      expect(CertificationApi.getAdminCertificationItems).toHaveBeenCalled();
      expect(CertificationApi.getCertificationList).not.toHaveBeenCalled();
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations with the campaigns table rendered', async () => {
      await wrapper.vm.setAccessReviewList({
        result: [{ name: 'test campaign', status: 'active', progress: 0.5 }],
        totalCount: 1,
      });
      await flushPromises();
      // pre-existing heading structure across governance lists: the campaign
      // name cell renders an h3 with no preceding h1/h2 (heading-order), and
      // FrNoData renders an empty h1 when only a subtitle is passed
      // (empty-heading) — TaskList and other views share both patterns
      await runA11yTest(wrapper, {
        overrideRules: {
          rules: {
            'heading-order': { enabled: false },
            'empty-heading': { enabled: false },
          },
        },
      });
    });

    it('has no accessibility violations with the filter side panel open', async () => {
      // axe follows aria-controls, so the panel must exist in the DOM when
      // the toggle advertises it via aria-expanded/aria-controls
      await wrapper.setData({ showFilters: true });
      await wrapper.vm.$nextTick();
      expect(findByTestId(wrapper, 'filter-toggle').attributes('aria-expanded')).toBe('true');
      await flushPromises();
      // same pre-existing FrNoData empty-heading pattern as above
      await runA11yTest(wrapper, {
        overrideRules: {
          rules: { 'empty-heading': { enabled: false } },
        },
      });
    });
  });
});
