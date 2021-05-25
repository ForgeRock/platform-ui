/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, createLocalVue } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import generateIDMAPI from './__mocks__/generateIDMAPI';
import ListResource from './index';

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
    const localVue = createLocalVue();
    localVue.use(BootstrapVue);

    wrapper = shallowMount(ListResource, {
      localVue,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
        $t: (translation) => translation,
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
      },
      propsData: {
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
  });

  it('Component successfully loaded', () => {
    expect(wrapper.isVueInstance()).toEqual(true);
    expect(wrapper.name()).toEqual('ListResource');
    expect(wrapper.vm.columns.length).toEqual(2);
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
    // TODO: ensure we can test within return value
    // expect(wrapper.vm.tableData).toEqual('test');
  });

  beforeEach(() => {
    jest.spyOn(ListResource, 'mounted')
      .mockImplementation(() => { });
  });

  it('ListResource page loaded', () => {
    expect(wrapper.name()).toBe('ListResource');
  });

  it('ListResource sort column', () => {
    wrapper.setMethods({ loadTable: () => { } });

    expect(wrapper.vm.calculateSort(false, 'test')).toBe('-test');
    expect(wrapper.vm.calculateSort(true, 'test')).toBe('test');
  });

  it('Sorting change reset', () => {
    wrapper.setMethods({ loadTable: () => { } });
    wrapper.vm.sortingChanged({
      sortDesc: false,
      sortBy: 'test',
    });

    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('Empty search entered', () => {
    wrapper.setMethods({ loadTable: () => { } });
    wrapper.vm.search();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('New search entered with queryThreshold enabled', () => {
    wrapper.setMethods({ loadTable: () => { } });

    wrapper.setProps({
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
    expect(wrapper.vm.generateSearch('test', ['test1', 'test2'])).toBe('test1 sw "test" OR test2 sw "test"');
    expect(wrapper.vm.generateSearch('', ['test1', 'test2'])).toBe('true');
  });

  it('Clear search and sort', () => {
    wrapper.setMethods({ loadTable: () => { } });
    wrapper.vm.clear();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('Sets help text from search field length', () => {
    wrapper.setProps({
      queryThreshold: 0,
    });

    wrapper.vm.filter = '';

    wrapper.vm.setHelpTextFromSearchLength();

    expect(wrapper.vm.hasFocus).toBe(true);
    expect(wrapper.vm.searchHelpText).toBe('');

    wrapper.setProps({
      queryThreshold: 3,
    });

    wrapper.vm.setHelpTextFromSearchLength();
    expect(wrapper.vm.searchHelpText).toBe('listResource.searchInProgressText');

    wrapper.vm.filter = 'fo';
    wrapper.vm.setHelpTextFromSearchLength();
    expect(wrapper.vm.searchHelpText).toBe('listResource.searchInProgressText');

    wrapper.vm.filter = 'foo';
    wrapper.vm.setHelpTextFromSearchLength();
    expect(wrapper.vm.searchHelpText).toBe('listResource.searchActiveText');
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

    wrapper.vm.filter = '';
    wrapper.setProps({
      queryThreshold: 3,
      tableData: ['doNotSortWithEmptyFilterAndQueryThreshold'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(false);
    expect(wrapper.vm.defaultSort).toEqual('');

    wrapper.vm.filter = 'foo';
    wrapper.setProps({
      queryThreshold: 0,
      tableData: ['sortAgainWithAFilter'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(true);

    wrapper.vm.filter = 'fo';
    wrapper.setProps({
      queryThreshold: 3,
      tableData: ['doNotSort'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(false);

    wrapper.vm.filter = 'foo';
    wrapper.setProps({
      queryThreshold: 3,
      tableData: ['sortWithQueryThresholdAndLongEnoughFilter'],
    });
    expect(wrapper.vm.columns[0].sortable).toEqual(true);
  });

  it('Sets hasClearSessionAccess', () => {
    let rowData = { item: { hasActiveSessions: true } };
    wrapper.setProps({
      canClearSessions: false,
    });
    expect(wrapper.vm.hasClearSessionAccess(rowData)).toEqual(false);
    wrapper.setProps({
      canClearSessions: true,
    });
    expect(wrapper.vm.hasClearSessionAccess(rowData)).toEqual(true);
    rowData = { item: { hasActiveSessions: false } };
    expect(wrapper.vm.hasClearSessionAccess(rowData)).toEqual(false);
  });

  it('Removes help text and focus', () => {
    wrapper.vm.hasFocus = true;
    wrapper.vm.searchHelpText = 'foo';

    wrapper.vm.removeHelpText();
    expect(wrapper.vm.hasFocus).toEqual(false);
    expect(wrapper.vm.searchHelpText).toEqual('');
  });

  it('Pagination change works', () => {
    wrapper.setMethods({ loadTable: () => { } });
    wrapper.vm.paginationChange(2);

    expect(wrapper.vm.currentPage).toBe(2);
  });
});
