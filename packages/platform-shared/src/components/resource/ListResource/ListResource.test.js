/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
        $t: () => {},
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
              viewable: true,
              type: 'number',
            },
            name: {
              viewable: true,
              type: 'string',
            },
            viewTest: {
              viewable: false,
              type: 'boolean',
            },
            typeTest: {
              viewable: true,
              type: 'array',
            },
          },
          order: ['name', 'sn', 'viewTest', 'typeTest'],
        },
      },
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.isVueInstance()).toEqual(true);
    expect(wrapper.name()).toEqual('ListResource');
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
    expect(wrapper).toMatchSnapshot();
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

    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('New search entered', () => {
    wrapper.setMethods({ loadTable: () => { } });
    wrapper.vm.search();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('Generated query filter for search', () => {
    expect(wrapper.vm.generateSearch('test', ['test1', 'test2'])).toBe('test1+sw+"test"+OR+test2+sw+"test"');
    expect(wrapper.vm.generateSearch('', ['test1', 'test2'])).toBe('true');
  });

  it('Clear search and sort', () => {
    wrapper.setMethods({ loadTable: () => { } });
    wrapper.vm.clear();

    expect(wrapper.vm.sortBy).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
  });
});
