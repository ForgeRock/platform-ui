/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import ObjectTypeDataList from './ObjectTypeDataList';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));

const defaultProps = {
  applicationId: 'app-1',
  objectTypeId: 'User',
};

const pageResponse = {
  data: {
    result: [
      { sourceObject: { id: 'u1', displayName: 'Alice' } },
      { sourceObject: { id: 'u2', displayName: 'Bob' } },
    ],
    totalCount: 2,
  },
};

function setup(props = {}) {
  return mount(ObjectTypeDataList, {
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        FrSearchInput: true,
        ListOrganizer: { name: 'ListOrganizer', template: '<div />' },
        FrSpinner: { name: 'Spinner', template: '<div />' },
        FrNoData: { name: 'NoData', template: '<div />' },
        FrPagination: true,
        BTable: true,
      },
    },
    props: { ...defaultProps, ...props },
  });
}

describe('ObjectTypeDataList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getApplicationAccounts.mockResolvedValue(pageResponse);
    ApplicationsApi.getApplicationResources.mockResolvedValue(pageResponse);
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations after loading', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('shows spinner while loading', () => {
      ApplicationsApi.getApplicationAccounts.mockReturnValue(new Promise(() => {}));
      const wrapper = setup();
      expect(wrapper.findComponent({ name: 'Spinner' }).exists()).toBe(true);
    });

    it('shows no-data when result is empty', async () => {
      ApplicationsApi.getApplicationAccounts.mockResolvedValue({ data: { result: [], totalCount: 0 } });
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'NoData' }).exists()).toBe(true);
    });

    it('shows table when results returned', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'BTable' }).exists()).toBe(true);
      expect(wrapper.vm.tableData).toHaveLength(2);
    });
  });

  describe('@actions', () => {
    it('calls getApplicationAccounts by default', async () => {
      setup();
      await flushPromises();
      expect(ApplicationsApi.getApplicationAccounts).toHaveBeenCalledWith('app-1', expect.objectContaining({
        _queryFilter: expect.stringContaining('User'),
      }));
    });

    it('calls getApplicationResources when objectTypeCategory is resource', async () => {
      setup({ objectTypeCategory: 'resource' });
      await flushPromises();
      expect(ApplicationsApi.getApplicationResources).toHaveBeenCalled();
    });

    it('includes search term in query filter when searchValue is set', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.searchValue = 'alice';
      wrapper.vm.loadPage(1, 10);
      await flushPromises();
      expect(ApplicationsApi.getApplicationAccounts).toHaveBeenLastCalledWith('app-1', expect.objectContaining({
        _queryFilter: expect.stringContaining("displayName co 'alice'"),
      }));
    });

    it('resets to page 1 on sort change', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.onSortChanged({ sortBy: 'displayName', sortDesc: true });
      await flushPromises();
      expect(wrapper.vm.currentPage).toBe(1);
      expect(ApplicationsApi.getApplicationAccounts).toHaveBeenLastCalledWith('app-1', expect.objectContaining({
        _sortDir: 'desc',
      }));
    });

    it('builds columns from properties with pinned id and displayName first', async () => {
      const wrapper = setup({
        properties: {
          displayName: { displayName: 'Name' },
          id: { displayName: 'ID' },
          email: { displayName: 'Email' },
        },
      });
      await flushPromises();
      const keys = wrapper.vm.allColumns.map((c) => c.key);
      expect(keys[0]).toBe('id');
      expect(keys[1]).toBe('displayName');
    });

    it('sets totalRows from API response', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.totalRows).toBe(2);
    });

    it('shows error and clears table on API failure', async () => {
      ApplicationsApi.getApplicationAccounts.mockRejectedValue(new Error('fail'));
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.tableData).toEqual([]);
      expect(wrapper.vm.totalRows).toBe(0);
    });
  });
});
