/**
 * Copyright (c) 2019-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { generateSearchQuery } from '@forgerock/platform-shared/src/utils/queryFilterUtils';
import * as listOrganizerUtils from '@forgerock/platform-shared/src/utils/listOrganizerUtils';
import generateIDMAPI from './__mocks__/generateIDMAPI';
import ListResource from './index';
import i18n from '@/i18n';

describe('ListResource Component', () => {
  let wrapper = null;

  const $route = {
    path: '/test',
    meta: {},
    params: {
      resourceName: 'resourceName',
      resourceType: 'managed',
    },
  };

  beforeEach(() => {
    wrapper = mount(ListResource, {
      global: {
        stubs: {
          'router-link': true,
        },
        directives: {
          'resizable-table': true,
        },
        plugins: [i18n],
        mocks: {
          $route,
          $store: {
            state: {
              realm: 'alpha',
            },
          },
          generateIDMAPI: () => {
            const retv = {
              data: {
                pagedResultsCookie: {},
              },
              get: () => {
                const retva = {
                  then: () => {},
                };
                return retva;
              },
            };
            return retv;
          },
          pluralizeValue: () => {},
        },
      },
      props: {
        resourceTitle: 'Resource title',
        routerParameters: {
          resourceName: 'resourceName',
          icon: 'testIcon',
          routeName: 'ListResource',
          resourceType: 'managed',
          managedProperties: {
            sn: {
              viewable: false,
              searchable: true,
              type: 'number',
            },
            name: {
              viewable: false,
              searchable: true,
              type: 'string',
            },
            viewTest: {
              viewable: false,
              searchable: false,
              type: 'boolean',
            },
            typeTest: {
              viewable: false,
              searchable: true,
              type: 'array',
            },
          },
          order: ['name', 'sn', 'viewTest', 'typeTest'],
        },
        propColumns: [
          {
            key: 'userName',
            label: 'Username',
            sortable: true,
            sortDirection: 'desc',
          },
        ],
      },
    });

    wrapper.setData({
      columns: [],
    });

    jest.spyOn(ListResource, 'mounted').mockImplementation(() => { });
  });

  it('Component successfully loaded and displays the "no data" state', () => {
    const noDataHeading = wrapper.find('h5');
    const noDataSubheading = wrapper.find('h5 + p');
    expect(wrapper.vm.columns.length).toEqual(2);
    expect(noDataHeading.text()).toEqual('No Resource titles Found');
    expect(noDataSubheading.text()).toEqual('Try a new search in the seach box above.');
  });

  it('Loads table column definitions', () => {
    wrapper.vm.resource = 'user';
    wrapper.vm.loadTableDefs();
    expect(wrapper.vm.resourceName).toEqual('resourceName');
    expect(wrapper.vm.displayFields[0]).toEqual('name');
    expect(wrapper.vm.displayFields[1]).toEqual('sn');
    expect(wrapper.vm.displayFields.length).toEqual(2);
  });

  it('Loads data for table rows', async () => {
    generateIDMAPI.get.mockImplementationOnce(() => Promise.resolve({
      data: { result: ['test'] },
    }));
    wrapper.vm.loadData({}, ['field1'], 'field1', '');
    const result = await generateIDMAPI.get();
    expect(result.data.result[0]).toEqual('test');
  });

  it('Ensures emitted get-table-data only includes sortField if one is specified', () => {
    wrapper.vm.loadData('', ['field1'], '', '');
    expect(wrapper.emitted()['get-table-data'][0][0]).toEqual({
      fields: ['field1'],
      filter: '',
      page: '',
      sortField: 'field1',
    });
    wrapper.vm.loadData('', ['field1'], 'sortField', '');
    expect(wrapper.emitted()['get-table-data'][1][0]).toEqual({
      fields: ['field1'],
      filter: '',
      page: '',
      sortField: 'sortField',
    });
  });

  it('emits get-table-data without sortField if queryThreshold is specified, but with sortField if search filter & sort field are both specified', async () => {
    await wrapper.setProps({ queryThreshold: 3 });
    wrapper.vm.loadData('', ['field1'], '', '', 20);
    expect(wrapper.emitted()['get-table-data'][0][0]).toEqual({
      fields: ['field1'],
      filter: '',
      page: '',
      pageSize: 20,
    });
    wrapper.vm.loadData('true', ['field1'], 'sortField', '', 20);
    expect(wrapper.emitted()['get-table-data'][1][0]).toEqual({
      fields: ['field1'],
      filter: 'true',
      page: '',
      pageSize: 20,
      sortField: 'sortField',
    });
    wrapper.vm.clear();
    expect(wrapper.emitted()['get-table-data'][2][0]).toEqual({
      fields: [],
      filter: 'true',
      page: 1,
      pageSize: 10,
    });
    wrapper.setProps({ queryThreshold: 0 });
    wrapper.vm.columns = [{ key: 'userName' }];
    wrapper.vm.clear();
    expect(wrapper.emitted()['get-table-data'][3][0]).toEqual({
      fields: ['userName'],
      filter: 'true',
      page: 1,
      pageSize: 10,
    });
  });

  it('ListResource sort column', () => {
    expect(wrapper.vm.calculateSort(false, 'test')).toBe('-test');
    expect(wrapper.vm.calculateSort(true, 'test')).toBe('test');
  });

  it('Sorting change reset', () => {
    wrapper.vm.sortingChanged({
      sortDesc: false,
      sortBy: 'test',
    });
    expect(wrapper.emitted().sort).toBeTruthy();
    expect(wrapper.emitted().sort[0]).toEqual(['-test']);
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('Empty search entered', () => {
    wrapper.vm.search();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('New search entered with queryThreshold enabled', async () => {
    await wrapper.setProps({
      queryThreshold: 3,
    });

    wrapper.vm.filter = 'foo';
    wrapper.vm.search();
    expect(wrapper.vm.submitBeforeLengthValid).toEqual(false);

    wrapper.vm.filter = 'fo';
    wrapper.vm.search();
    expect(wrapper.vm.submitBeforeLengthValid).toEqual(true);
  });

  it('Generated query filter for search', () => {
    expect(generateSearchQuery('test', ['test1', 'test2'])).toBe('test1 sw "test" OR test2 sw "test"');
    expect(generateSearchQuery('', ['test1', 'test2'])).toBe('true');
  });

  it('Clear search and sort', () => {
    wrapper.vm.clear();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('Enables/disables column sorting based on queryThreshold when table data changes', async () => {
    wrapper.vm.columns = [
      {
        key: 'userName',
        label: 'Username',
        sortable: true,
        sortDirection: 'desc',
      },
    ];

    wrapper.vm.filter = '';
    wrapper.setProps({
      queryThreshold: 0,
      tableData: ['sortWithNoFilter'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(true);
    expect(wrapper.vm.defaultSort).toEqual('userName');

    wrapper.vm.filter = 'foo';
    wrapper.setProps({
      queryThreshold: 0,
      tableData: ['sortAgainWithAFilter'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(true);

    wrapper.vm.filter = '';
    await wrapper.setProps({
      queryThreshold: 3,
      tableData: ['doNotSortWithEmptyFilterAndQueryThreshold'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(false);
    expect(wrapper.vm.defaultSort).toEqual('');

    wrapper.vm.filter = 'fo';
    wrapper.setProps({
      queryThreshold: 3,
      tableData: ['doNotSort'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(false);

    wrapper.vm.filter = 'foo';
    await wrapper.setProps({
      queryThreshold: 3,
      tableData: ['sortWithQueryThresholdAndLongEnoughFilter'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(true);
  });

  it('Sets hasClearSessionAccess', async () => {
    let item = { hasActiveSessions: true };
    wrapper.setProps({
      canClearSessions: false,
    });
    expect(wrapper.vm.hasClearSessionAccess(item)).toEqual(false);
    await wrapper.setProps({
      canClearSessions: true,
    });
    expect(wrapper.vm.hasClearSessionAccess(item)).toEqual(true);
    item = { hasActiveSessions: false };
    expect(wrapper.vm.hasClearSessionAccess(item)).toEqual(false);
  });

  it('Pagination change works', () => {
    const paginationChangeSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.paginationChange();

    expect(paginationChangeSpy).toHaveBeenCalled();
  });

  it('regenerates column list when propColumns are provided', async () => {
    await wrapper.setProps({
      propColumns: [
        {
          key: 'userName',
          label: 'Username',
          sortable: true,
          sortDirection: 'desc',
        },
        {
          key: 'description',
          label: 'Description',
          sortable: true,
          sortDirection: 'desc',
        },
      ],
    });

    expect(wrapper.vm.displayFields).toStrictEqual(['userName', 'description']);
    expect(wrapper.vm.columns).toStrictEqual([
      {
        key: 'userName',
        label: 'Username',
        sortDirection: 'desc',
        sortable: true,
      },
      {
        key: 'description',
        label: 'Description',
        sortable: true,
        sortDirection: 'desc',
      },
    ]);
  });

  it('Pagination change page size should load data table', () => {
    const paginationChangeSpy = jest.spyOn(wrapper.vm, 'paginationChange');
    wrapper.vm.pageSizeChange(2);

    expect(paginationChangeSpy).toHaveBeenCalled();
    expect(wrapper.vm.paginationPage).toBe(1);
    expect(wrapper.vm.paginationPageSize).toBe(2);
  });

  it('should be a responsive table', async () => {
    const tableContainerElement = wrapper.find('.table-responsive');
    expect(tableContainerElement.exists()).toBe(true);
  });

  describe('Pagination attributes verification', () => {
    it('hide pagination when data table is empty', () => {
      expect(wrapper.findComponent(FrPagination).exists()).toBe(false);
    });

    it('show pagination when data table have data', async () => {
      await wrapper.setProps({ tableData: [{}, {}] });

      expect(wrapper.findComponent(FrPagination).exists()).toBe(true);
    });

    it('hide pagination when data table have data and is loading', async () => {
      await wrapper.setProps({ tableData: [{}, {}], isLoading: true });

      expect(wrapper.findComponent(FrPagination).exists()).toBe(false);
    });

    it('pagination page should be equal to current page prop', async () => {
      await wrapper.setProps({ currentPage: 2 });

      expect(wrapper.vm.paginationPage).toBe(2);

      await wrapper.setProps({ currentPage: 3 });

      expect(wrapper.vm.paginationPage).toBe(3);
    });

    it('passes tableData.length as current-page-rows to FrPagination', async () => {
      await wrapper.setProps({ tableData: [{}, {}, {}] });

      const pagination = wrapper.findComponent(FrPagination);
      expect(pagination.exists()).toBe(true);
      expect(pagination.props('currentPageRows')).toBe(3);
    });

    it('current-page-rows updates when tableData changes', async () => {
      await wrapper.setProps({ tableData: [{}, {}, {}, {}, {}] });
      expect(wrapper.findComponent(FrPagination).props('currentPageRows')).toBe(5);

      await wrapper.setProps({ tableData: [{}] });
      expect(wrapper.findComponent(FrPagination).props('currentPageRows')).toBe(1);
    });
  });

  describe('Table column visibility', () => {
    it('should display icon for customizing column if columnOrganizerKey is present', async () => {
      await wrapper.setProps({
        columnOrganizerKey: 'test-key',
      });
      await flushPromises();
      const columnOrganizerIcon = wrapper.find('button[type="button"]');
      expect(columnOrganizerIcon.text()).toBe('view_column');
    });

    it('fetchSearchQueryString should include all searchable columns if columnOrganizerKey is not present', () => {
      wrapper.vm.columns = [{ key: 'userName', searchable: true }, { key: 'email', searchable: true }, { key: 'phone', searchable: true }, { key: 'non-searchable-column' }];
      wrapper.vm.filter = 'test';
      const results = wrapper.vm.fetchSearchQueryString();
      expect(results).toBe('userName sw "test" OR email sw "test" OR phone sw "test"');
      expect(results).not.toContain('non-searchable-column');
    });

    it('fetchSearchQueryString should exclude non-searchable fields like password management, date, and integer fields', async () => {
      await wrapper.setProps({
        columnOrganizerKey: 'test-key',
      });
      await flushPromises();
      wrapper.vm.columns = [{ key: 'userName', searchable: true }, { key: 'passwordLastChangedTime', searchable: true }, { key: 'frIndexedInteger', searchable: true }, { key: 'frIndexedDate1', searchable: true }, { key: 'email', searchable: true }, { key: 'phone', searchable: true }];
      wrapper.vm.filter = 'test';
      const results = wrapper.vm.fetchSearchQueryString();
      expect(results).toBe('userName sw "test" OR email sw "test" OR phone sw "test"');
    });

    it('fetchSearchQueryString should filter on searchable fields if columnOrganizerKey is present', async () => {
      await wrapper.setProps({
        columnOrganizerKey: 'test-key',
      });
      await flushPromises();
      wrapper.vm.columns = [{ key: 'userName', searchable: true }, { key: 'otherCol1' }];
      wrapper.vm.filter = 'test';
      const results = wrapper.vm.fetchSearchQueryString();
      expect(results).toBe('userName sw "test"');
    });

    it('Only loads data from visible fields', async () => {
      generateIDMAPI.get.mockImplementationOnce(() => Promise.resolve({
        data: { result: ['test'] },
      }));
      await wrapper.setProps({
        columnOrganizerKey: 'test-key',
      });
      await flushPromises();

      const listOrganizer = wrapper.findComponent({ name: 'ListOrganizer' });
      expect(listOrganizer.exists()).toBe(true);

      listOrganizer.vm.$emit('list-updated', [{ key: 'userName', enabled: true }]);
      await flushPromises();

      expect(wrapper.emitted()['get-table-data'][0][0]).toEqual({
        fields: ['userName'],
        filter: 'true',
        page: 1,
        pageSize: 10,
        sortField: 'userName',
      });
    });
  });

  describe('buildColumnListFromRouterParams', () => {
    const routerParamsWithColumns = {
      resourceName: 'alpha_user',
      resourceType: 'managed',
      managedProperties: {
        userName: { type: 'string', searchable: true, title: 'Username' },
        givenName: { type: 'string', searchable: true, title: 'First Name' },
        sn: { type: 'string', searchable: true, title: 'Last Name' },
        mail: { type: 'string', searchable: true, title: 'Email' },
        extra: { type: 'string', searchable: true, title: 'Extra' },
      },
      order: ['userName', 'givenName', 'sn', 'mail', 'extra'],
    };

    it('sets availableColumnList and columns from routerParameters when columnOrganizerKey is set', async () => {
      jest.spyOn(listOrganizerUtils, 'getManagedObjectColumnList').mockReturnValue([
        { key: 'userName', label: 'Username', enabled: true },
        { key: 'givenName', label: 'First Name', enabled: true },
        { key: 'sn', label: 'Last Name', enabled: false },
      ]);
      jest.spyOn(listOrganizerUtils, 'getDefaultManagedObjectColumnList').mockReturnValue([
        { key: 'userName', label: 'Username', enabled: true },
        { key: 'givenName', label: 'First Name', enabled: true },
      ]);

      await wrapper.setProps({ columnOrganizerKey: 'test-key', routerParameters: routerParamsWithColumns });
      wrapper.vm.buildColumnListFromRouterParams();

      expect(wrapper.vm.availableColumnList).toHaveLength(3);
      expect(wrapper.vm.columns).toHaveLength(2);
      expect(wrapper.vm.columns.map((c) => c.key)).toEqual(['userName', 'givenName']);
      expect(wrapper.vm.internalDefaultColumns).toHaveLength(2);
    });

    it('falls back to loadTableDefs when getManagedObjectColumnList returns empty', async () => {
      jest.spyOn(listOrganizerUtils, 'getManagedObjectColumnList').mockReturnValue([]);
      jest.spyOn(listOrganizerUtils, 'getDefaultManagedObjectColumnList').mockReturnValue([]);
      const loadTableDefsSpy = jest.spyOn(wrapper.vm, 'loadTableDefs');

      await wrapper.setProps({ columnOrganizerKey: 'test-key', routerParameters: routerParamsWithColumns });
      wrapper.vm.buildColumnListFromRouterParams();

      expect(loadTableDefsSpy).toHaveBeenCalled();
    });

    it('resolvedDefaultColumns returns internalDefaultColumns when set', () => {
      wrapper.vm.internalDefaultColumns = [{ key: 'userName' }];
      expect(wrapper.vm.resolvedDefaultColumns).toEqual([{ key: 'userName' }]);
    });

    it('resolvedDefaultColumns falls back to defaultColumns prop when internalDefaultColumns is empty', async () => {
      wrapper.vm.internalDefaultColumns = [];
      await wrapper.setProps({ defaultColumns: [{ key: 'fallback' }] });
      expect(wrapper.vm.resolvedDefaultColumns).toEqual([{ key: 'fallback' }]);
    });

    it('does not set internalDefaultColumns when defaultColumns prop is provided', async () => {
      jest.spyOn(listOrganizerUtils, 'getManagedObjectColumnList').mockReturnValue([
        { key: 'userName', label: 'Username', enabled: true },
      ]);
      jest.spyOn(listOrganizerUtils, 'getDefaultManagedObjectColumnList').mockReturnValue([
        { key: 'userName', label: 'Username', enabled: true },
      ]);

      await wrapper.setProps({
        columnOrganizerKey: 'test-key',
        routerParameters: routerParamsWithColumns,
        defaultColumns: [{ key: 'external-default' }],
      });
      wrapper.vm.buildColumnListFromRouterParams();

      expect(wrapper.vm.internalDefaultColumns).toHaveLength(0);
      expect(wrapper.vm.resolvedDefaultColumns).toEqual([{ key: 'external-default' }]);
    });

    it('falls back to loadTableDefs when routerParameters is missing managedProperties', async () => {
      const loadTableDefsSpy = jest.spyOn(wrapper.vm, 'loadTableDefs');
      await wrapper.setProps({
        columnOrganizerKey: 'test-key',
        routerParameters: { resourceName: 'alpha_user', resourceType: 'managed' },
      });
      wrapper.vm.buildColumnListFromRouterParams();
      expect(loadTableDefsSpy).toHaveBeenCalled();
    });

    it('mounted calls buildColumnListFromRouterParams when columnOrganizerKey set and columnOrganizerList empty', () => {
      const getMock = jest.spyOn(listOrganizerUtils, 'getManagedObjectColumnList').mockReturnValue([
        { key: 'userName', label: 'Username', enabled: true },
        { key: 'givenName', label: 'First Name', enabled: false },
      ]);
      const getDefaultMock = jest.spyOn(listOrganizerUtils, 'getDefaultManagedObjectColumnList').mockReturnValue([
        { key: 'userName', label: 'Username', enabled: true },
      ]);

      // Restore the beforeEach spy so the real mounted lifecycle runs
      ListResource.mounted.mockRestore();

      const localWrapper = mount(ListResource, {
        global: {
          stubs: { 'router-link': true },
          directives: { 'resizable-table': true },
          plugins: [i18n],
          mocks: {
            $route,
            $store: { state: { realm: 'alpha' } },
            pluralizeValue: () => {},
          },
        },
        props: {
          resourceTitle: 'Resource title',
          columnOrganizerKey: 'test-key',
          routerParameters: routerParamsWithColumns,
        },
      });

      getMock.mockRestore();
      getDefaultMock.mockRestore();

      expect(localWrapper.vm.availableColumnList).toHaveLength(2);
      expect(localWrapper.vm.columns.map((c) => c.key)).toContain('userName');
      expect(localWrapper.vm.columns.map((c) => c.key)).not.toContain('givenName');
    });
  });
});
