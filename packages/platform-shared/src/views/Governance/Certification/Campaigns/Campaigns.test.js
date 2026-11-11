/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createAppContainer, findByTestId, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import dayjs from 'dayjs';
import store from '@/store';
import i18n from '@/i18n';
import Campaigns from './index';

// downloadAsType writes asynchronously after the test ends, when jsdom's
// document is gone; the unhandled rejection crashes the Jest worker
jest.mock('@forgerock/platform-shared/src/utils/downloadFile', () => ({
  downloadAsType: jest.fn(),
}));

// the filters panel's owner select fetches managed/user on mount — without
// this mock the real Axios mock-guard fires and pins console-error snapshots
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi', () => ({
  getResource: jest.fn().mockReturnValue(Promise.resolve({ data: { result: [], totalCount: 0 } })),
  getResourceList: jest.fn().mockReturnValue(Promise.resolve({ data: { result: [], totalCount: 0 } })),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/CampaignApi');

describe('Campaigns', () => {
  let wrapper;
  beforeEach(() => {
    setupTestPinia({ user: { userId: 'owner-user-id' } });
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
      },
    });
    wrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      props: {
        isAdmin: true,
      },
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

  it('uses the legacy admin endpoint and status dropdown when the new list endpoint has fallen back', async () => {
    wrapper.vm.engageLegacyFallback();
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

  it('defaults to only the active status selected on mount', async () => {
    expect(wrapper.vm.selectedStatuses).toEqual(['active']);
    expect(wrapper.vm.selectedStatuses).not.toContain('staging');
    expect(wrapper.vm.selectedStatuses).not.toContain('completed');
  });

  it('getList always sends a status filter, expanding active to its raw statuses', async () => {
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDir: 'asc',
      _queryFilter: "(status eq 'active' or status eq 'in-progress' or status eq 'creating')",
    });
  });

  it('getList passes name co queryFilter when searchQuery is set', async () => {
    await wrapper.setData({ searchQuery: 'test campaign' });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDir: 'asc',
      _queryFilter: "name co 'test campaign' and (status eq 'active' or status eq 'in-progress' or status eq 'creating')",
    });
  });

  it('getList expands complete to complete and signed-off', async () => {
    await wrapper.setData({ selectedStatuses: ['completed'] });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDir: 'asc',
      _queryFilter: "(status eq 'complete' or status eq 'signed-off')",
    });
  });

  it('getList combines the expanded status filters of multiple checkboxes', async () => {
    await wrapper.setData({ selectedStatuses: ['active', 'completed'] });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDir: 'asc',
      _queryFilter: "(status eq 'active' or status eq 'in-progress' or status eq 'creating' or status eq 'complete' or status eq 'signed-off')",
    });
  });

  it('filterStatusParams dedupes overlapping raw statuses', async () => {
    await wrapper.setData({ selectedStatuses: ['active', 'cancelled', 'expired'] });
    expect(wrapper.vm.filterStatusParams).toEqual(['active', 'in-progress', 'creating', 'cancelled', 'expired']);
  });

  it('getList omits the status filter when every checkbox is checked', async () => {
    await wrapper.setData({ selectedStatuses: ['active', 'staging', 'completed', 'cancelled', 'expired'] });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDir: 'asc',
    });
  });

  it('getList combines name and status filters with and', async () => {
    await wrapper.setData({ searchQuery: 'foo', selectedStatuses: ['active', 'staging'] });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith({
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'name',
      sortDir: 'asc',
      _queryFilter: "name co 'foo' and (status eq 'active' or status eq 'in-progress' or status eq 'creating' or status eq 'staging')",
    });
  });

  it('getList sends sortType date when sorting by startDate or deadline, and not for other columns', async () => {
    await wrapper.setData({ sortBy: 'formattedStartDate' });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'startDate',
      sortType: 'date',
    }));

    await wrapper.setData({ sortBy: 'formattedDeadline' });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'deadline',
      sortType: 'date',
    }));

    await wrapper.setData({ sortBy: 'name' });
    wrapper.vm.getList();
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'name',
    }));
    expect(CertificationApi.getCertificationList.mock.calls.at(-1)[0].sortType).toBeUndefined();
  });

  it('export all rows sends sortType date when sorted by a date column', async () => {
    await wrapper.setData({ sortBy: 'formattedDeadline' });
    await wrapper.vm.exportItemsToFile({ format: 'csv', rows: 'all' });
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'deadline',
      sortType: 'date',
      pageSize: 10000,
    }));
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
      sortDir: 'asc',
      _queryFilter: "ownerId co 'owner-id' and certificationType eq 'identity' and (status eq 'active' or status eq 'in-progress' or status eq 'creating')",
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
      selectedStatuses: ['completed'],
    });
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    wrapper.vm.resetFilters();
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.selectedOwner).toBe('');
    expect(wrapper.vm.selectedCampaignType).toBe('');
    expect(wrapper.vm.selectedStatuses).toEqual(['active']);
    expect(getListSpy).toHaveBeenCalled();
  });

  it('disables the last remaining status checkbox so one status is always selected', async () => {
    expect(wrapper.vm.statusCheckboxOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'active', disabled: true }),
      expect.objectContaining({ value: 'staging', disabled: false }),
      expect.objectContaining({ value: 'completed', disabled: false }),
    ]));
    await wrapper.setData({ selectedStatuses: ['active', 'completed'] });
    expect(wrapper.vm.statusCheckboxOptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'active', disabled: false }),
      expect.objectContaining({ value: 'completed', disabled: false }),
    ]));
  });

  it('unchecking the last status restores the previous selection without requerying', async () => {
    await wrapper.setData({ selectedStatuses: ['active', 'completed'] });
    const getListSpy = jest.spyOn(wrapper.vm, 'getList');
    await wrapper.setData({ selectedStatuses: [] });
    expect(wrapper.vm.selectedStatuses).toEqual(['active', 'completed']);
    expect(getListSpy).not.toHaveBeenCalled();
  });

  it('reset filters omit owner and type from the query filter', async () => {
    await wrapper.setData({
      selectedOwner: 'managed/user/owner-id',
      selectedCampaignType: 'identity',
    });
    wrapper.vm.resetFilters();
    expect(wrapper.vm.buildQueryFilter()).toBe("(status eq 'active' or status eq 'in-progress' or status eq 'creating')");
  });

  it('should sort ascending or descending on name', async () => {
    await wrapper.vm.setAccessReviewList({ result: [{}], totalCount: 1 });
    const certTable = wrapper.find('.table');
    certTable.find('th').trigger('click');
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDir: 'asc' }),
    );
    certTable.find('th').trigger('click');
    expect(CertificationApi.getCertificationList).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'name', sortDir: 'desc' }),
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

  describe('canExportRevokes', () => {
    it('allows the owner only once the campaign is signed-off', () => {
      expect(wrapper.vm.canExportRevokes({ status: 'signed-off', ownerInfo: { id: 'owner-user-id' } })).toBe(true);
      expect(wrapper.vm.canExportRevokes({ status: 'complete', ownerInfo: { id: 'owner-user-id' } })).toBe(true);
      expect(wrapper.vm.canExportRevokes({ status: 'in-progress', ownerInfo: { id: 'owner-user-id' } })).toBe(false);
      expect(wrapper.vm.canExportRevokes({ status: 'staging', ownerInfo: { id: 'owner-user-id' } })).toBe(false);
      expect(wrapper.vm.canExportRevokes({ status: 'expired', ownerInfo: { id: 'owner-user-id' } })).toBe(false);
    });

    it('normalizes managed/user paths on both id sides', () => {
      expect(wrapper.vm.canExportRevokes({ status: 'signed-off', ownerInfo: { id: 'managed/user/owner-user-id' } })).toBe(true);
    });

    it('rejects non-owner non-admin callers even when signed-off', async () => {
      await wrapper.setProps({ isAdmin: false });
      expect(wrapper.vm.canExportRevokes({ status: 'signed-off', ownerInfo: { id: 'someone-else' } })).toBe(false);
      await wrapper.setProps({ isAdmin: true });
    });
  });

  it('escapes single quotes in the name search query filter', async () => {
    await wrapper.setData({ searchQuery: "O'Brien review" });
    expect(wrapper.vm.buildQueryFilter()).toBe("name co 'O\\'Brien review' and (status eq 'active' or status eq 'in-progress' or status eq 'creating')");
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

  it('keeps legacy actions on the status dropdown path when the list endpoint has fallen back', async () => {
    wrapper.vm.engageLegacyFallback();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isStagedStatus).toBe(false);
    wrapper.vm.handleStatusSort(wrapper.vm.statuses.get('staging'));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isStagedStatus).toBe(true);
  });

  it('renders activate and delete actions for a staged campaign in legacy mode', async () => {
    // stub ActionsCell to render its custom actions inline (the real menu
    // teleports only when opened, which this test does not need)
    const ActionsCellStub = { template: '<div><slot name="custom-top-actions" /></div>' };
    const legacyWrapper = mount(Campaigns, {
      attachTo: createAppContainer(),
      props: { isAdmin: true },
      global: {
        mocks: { $store: store },
        plugins: [i18n],
        directives: { 'resizable-table': jest.fn() },
        stubs: { FrActionsCell: ActionsCellStub },
      },
    });
    legacyWrapper.vm.engageLegacyFallback();
    await legacyWrapper.vm.handleStatusSort(legacyWrapper.vm.statuses.get('staging'));
    await new Promise(process.nextTick);
    await legacyWrapper.vm.setAccessReviewList({
      result: [{ name: 'legacy staged campaign', status: 'staging', ownerInfo: { id: 'owner-user-id' } }],
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
        SharedStore: { webStorageAvailable: true },
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
        SharedStore: { webStorageAvailable: true },
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
        _queryFilter: "name co 'O\\'Hara' and (status eq 'active' or status eq 'in-progress' or status eq 'creating')",
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

  // IGA-1116: the row menu's revokes export — the same remediation artifact
  // the details page exposes, gated to owner/admin on signed-off campaigns
  describe('revokes export from the row menu', () => {
    const ActionsCellStub = { template: '<div><slot name="custom-top-actions" /></div>' };

    const mountWithSignedOffCampaign = async (props = {}) => {
      // stub ActionsCell to render its custom actions inline (the real menu
      // teleports only when opened, which these tests do not need)
      const exportWrapper = mount(Campaigns, {
        attachTo: createAppContainer(),
        props: { isAdmin: true, ...props },
        global: {
          mocks: { $store: store },
          plugins: [i18n],
          directives: { 'resizable-table': jest.fn() },
          stubs: { FrActionsCell: ActionsCellStub },
        },
      });
      // let the background getList from mounted() settle before seeding rows,
      // or its resolution overwrites the list with the empty mock result
      await flushPromises();
      await exportWrapper.vm.setAccessReviewList({
        result: [{
          id: 'camp-1', name: 'Signed Off Campaign', status: 'signed-off', ownerInfo: { id: 'owner-user-id' },
        }],
        totalCount: 1,
      });
      await exportWrapper.vm.$nextTick();
      // NotificationMixin methods, stubbed so export tests can assert
      // notification calls without the vue3-notification plugin
      exportWrapper.vm.displayNotification = jest.fn();
      exportWrapper.vm.showErrorMessage = jest.fn();
      // the module-level downloadAsType mock accumulates calls across the
      // suite; each export test asserts its own call in isolation
      downloadAsType.mockClear();
      return exportWrapper;
    };

    const mockItemsSearch = (data) => {
      if (!jest.isMockFunction(CertificationApi.getCertificationTasksListByCampaign)) {
        CertificationApi.getCertificationTasksListByCampaign = jest.fn();
      }
      // call history does not survive into the test — the modal-open probes
      // and export requests assert their own call counts
      CertificationApi.getCertificationTasksListByCampaign.mockClear();
      CertificationApi.getCertificationTasksListByCampaign.mockReturnValue(Promise.resolve({ data }));
    };

    // Type-aware search mock for fan-out exports: data keyed by the
    // item.type value the request's IN clause matches; an unmatched type
    // returns empty so the fan-out skips it.
    const mockItemsSearchByType = (dataByType) => {
      if (!jest.isMockFunction(CertificationApi.getCertificationTasksListByCampaign)) {
        CertificationApi.getCertificationTasksListByCampaign = jest.fn();
      }
      CertificationApi.getCertificationTasksListByCampaign.mockClear();
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation((urlParams, campaignId, payload) => {
        const itemTypes = payload.targetFilter.operand.find((o) => o.operator === 'IN')?.operand.targetValue || [];
        const match = itemTypes.find((type) => dataByType[type]);
        return Promise.resolve({ data: (match && dataByType[match]) || { totalCount: 0, result: [] } });
      });
    };

    it('renders the export item for the owner on a signed-off campaign row', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      expect(findByTestId(exportWrapper, 'export-revocation-decisions-button').exists()).toBe(true);
      exportWrapper.unmount();
    });

    it('hides the export item for a non-owner non-admin caller', async () => {
      setupTestPinia({ user: { userId: 'someone-else' } });
      const exportWrapper = await mountWithSignedOffCampaign({ isAdmin: false });
      expect(findByTestId(exportWrapper, 'export-revocation-decisions-button').exists()).toBe(false);
      exportWrapper.unmount();
    });

    it('openExportRevokesModal loads totals and uiConfig then prepares the export', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      mockItemsSearch({ totalCount: 4, resultCount: 1, result: [] });
      // jest.mock automocks the module; the component's named import reads
      // this same mock instance
      const {
        getCampaignDetails,
      } = jest.requireMock('@forgerock/platform-shared/src/api/governance/CampaignApi');
      getCampaignDetails.mockReturnValue(Promise.resolve({
        // real shape: uiConfig.columnConfig is a map keyed by grant type
        uiConfig: { columnConfig: { accounts: ['user.user', 'application.application'] } },
      }));
      await exportWrapper.vm.openExportRevokesModal({ id: 'camp-1', name: 'Signed Off Campaign', certificationType: 'identity' });
      await flushPromises();

      // identity campaigns are mixed-type: one totals probe for the whole
      // worklist plus one per candidate type (accounts/entitlements/roles)
      const probeCalls = CertificationApi.getCertificationTasksListByCampaign.mock.calls;
      expect(probeCalls.length).toBe(4);
      // the whole-worklist probe runs first, unfiltered by item type
      expect(probeCalls[0][0]).toEqual({ pageSize: 1, pageNumber: 0, fields: 'id' });
      expect(probeCalls[0][2].targetFilter.operand).toHaveLength(3);
      // each type probe carries its item.type IN clause
      const typeProbes = probeCalls.slice(1).map(([, , payload]) => payload.targetFilter.operand.find((o) => o.operator === 'IN')?.operand.targetValue);
      expect(typeProbes).toEqual([
        ['accountGrant', 'AccountGrant', 'sharedAccount'],
        ['entitlementGrant', 'resourceGrant'],
        ['roleMembership'],
      ]);
      expect(getCampaignDetails).toHaveBeenCalledWith('camp-1');
      expect(exportWrapper.vm.selectedRevokesCampaign.uiConfig).toEqual({ columnConfig: { accounts: ['user.user', 'application.application'] } });
      // all four probes return totalCount 4 → every candidate type non-empty
      // → the item-type step is offered
      expect(exportWrapper.vm.revokesItemTypeOptions).toEqual([
        { value: 'accountGrants', count: 4 },
        { value: 'entitlementGrants', count: 4 },
        { value: 'roleMemberships', count: 4 },
      ]);
      expect(exportWrapper.vm.revokesTotals).toEqual({ currentPage: 1, all: 4 });
      exportWrapper.unmount();
    });

    it('openExportRevokesModal shows an error and no export when the probe fails', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      CertificationApi.getCertificationTasksListByCampaign.mockReturnValue(Promise.reject(new Error('probe failed')));
      await exportWrapper.vm.openExportRevokesModal({ id: 'camp-1', name: 'Signed Off Campaign', certificationType: 'identity' });
      await flushPromises();
      expect(exportWrapper.vm.showErrorMessage).toHaveBeenCalled();
      exportWrapper.unmount();
    });

    it('exportRevokesToFile downloads the mapped rows with the chosen format', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      // identity campaign with no type chosen fans out per type; the worklist
      // items are account grants here
      mockItemsSearchByType({
        accountGrant: {
          totalCount: 1,
          result: [{
            id: 'task-1',
            user: { userName: 'andrew.och' },
            application: { name: 'SNOW' },
            keys: { accountId: 'system/SNOW/User/abc' },
            entitlement: { displayName: 'sn_incident_write' },
            decision: { certification: { remediationStatus: 'pending' } },
          }],
        },
      });
      exportWrapper.vm.selectedRevokesCampaign = { id: 'camp-1', name: 'Signed Off Campaign', certificationType: 'identity' };

      await exportWrapper.vm.exportRevokesToFile({ format: 'csv', rows: 'all' });

      // one request per candidate type (accounts, entitlements, roles)
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledTimes(3);
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledWith(
        { pageSize: 10000, pageNumber: 0, fields: expect.stringContaining('id,user.userName') },
        'camp-1',
        { targetFilter: expect.objectContaining({ operator: 'AND' }) },
      );
      // only the accounts slice held items — one file
      expect(downloadAsType).toHaveBeenCalledTimes(1);
      const [exportData, format, fileName, title] = downloadAsType.mock.calls[0];
      expect(format).toBe('csv');
      // this file's suite mounts with the real i18n instance — the label
      // renders in English (CampaignDetails stubs $t and asserts the key)
      expect(fileName).toBe('Signed Off Campaign - Accounts.csv');
      expect(title).toBe('Signed Off Campaign - Accounts');
      expect(exportData[0]).toEqual({
        'Task ID': 'task-1',
        Identity: 'andrew.och',
        Application: 'SNOW',
        Account: 'system/SNOW/User/abc',
        'Remediation Status': 'pending',
        'Completion Date': '',
        'Remediation Comments': '',
        'Evidence Reference': '',
      });
      exportWrapper.unmount();
    });

    it('exportRevokesToFile with the all-types choice downloads one file per non-empty kind', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      mockItemsSearchByType({
        accountGrant: {
          totalCount: 1,
          result: [{
            id: 'acct-task-1',
            user: { userName: 'andrew.och' },
            application: { name: 'SNOW' },
            keys: { accountId: 'system/SNOW/User/abc' },
            decision: { certification: { remediationStatus: 'pending' } },
          }],
        },
        roleMembership: {
          totalCount: 1,
          result: [{
            id: 'role-task-1',
            user: { userName: 'alyson' },
            role: { name: 'auditor-role' },
            decision: { certification: { remediationStatus: 'pending' } },
          }],
        },
      });
      exportWrapper.vm.selectedRevokesCampaign = { id: 'camp-1', name: 'Signed Off Campaign', certificationType: 'identity' };

      await exportWrapper.vm.exportRevokesToFile({ format: 'csv', itemType: 'all' });

      // three requests (one per candidate type), two files (entitlements empty)
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalledTimes(3);
      expect(downloadAsType).toHaveBeenCalledTimes(2);
      const [accountData, , accountFile] = downloadAsType.mock.calls[0];
      const [roleData, , roleFile] = downloadAsType.mock.calls[1];
      expect(accountFile).toBe('Signed Off Campaign - Accounts.csv');
      expect(accountData[0]).toEqual(expect.objectContaining({ 'Task ID': 'acct-task-1', Account: 'system/SNOW/User/abc' }));
      expect(roleFile).toBe('Signed Off Campaign - Role Memberships.csv');
      expect(roleData[0]).toEqual(expect.objectContaining({ 'Task ID': 'role-task-1', Role: 'auditor-role' }));
      // real i18n here — the fan-out notice renders in English
      expect(exportWrapper.vm.displayNotification).toHaveBeenCalledWith('success', '2 files downloaded — one per item type.');
      exportWrapper.unmount();
    });

    it('exportRevokesToFile notifies with no download when the worklist is empty', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      mockItemsSearch({ totalCount: 0, result: [] });
      exportWrapper.vm.selectedRevokesCampaign = { id: 'camp-1', name: 'Signed Off Campaign', certificationType: 'identity' };

      await exportWrapper.vm.exportRevokesToFile({ format: 'csv', rows: 'all' });

      expect(downloadAsType).not.toHaveBeenCalled();
      expect(exportWrapper.vm.displayNotification).toHaveBeenCalledWith('info', 'No revoke decisions with pending remediation to export.');
      exportWrapper.unmount();
    });

    it('exportRevokesToFile warns when the result is truncated at the page cap', async () => {
      const exportWrapper = await mountWithSignedOffCampaign();
      // the truncation notice fires per exported slice; the worklist items
      // are role memberships so the fan-out covers exactly one slice
      mockItemsSearchByType({
        roleMembership: {
          totalCount: 12000,
          result: [{
            id: 'task-1',
            user: { userName: 'andrew.och' },
            decision: { certification: { remediationStatus: 'pending' } },
          }],
        },
      });
      exportWrapper.vm.selectedRevokesCampaign = { id: 'camp-1', name: 'Signed Off Campaign', certificationType: 'identity' };

      await exportWrapper.vm.exportRevokesToFile({ format: 'csv', rows: 'all' });

      expect(exportWrapper.vm.displayNotification).toHaveBeenCalledWith(
        'info',
        'The export is limited to the first 1 items (12000 items have revokes pending remediation).',
      );
      expect(downloadAsType).toHaveBeenCalledTimes(1);
      exportWrapper.unmount();
    });
  });
});
