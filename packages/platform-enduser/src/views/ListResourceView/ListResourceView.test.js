/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import flushPromises from 'flush-promises';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ListResource from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
ListResource.mounted = jest.fn();
function flush() {
  flushPromises();
  jest.runAllTimers();
}

describe('ListResource.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.useFakeTimers();
    const $route = {
      path: '/test',
      meta: {},
      params: {
        resourceName: 'test',
        resourceType: 'test',
      },
    };

    wrapper = shallowMount(ListResource, {
      localVue,
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
      },
    });
    wrapper.setMethods({ loadGrid: () => { } });
  });

  it('ListResourceView page loaded', () => {
    expect(wrapper.name()).toBe('ListResourceView');
    expect(wrapper).toMatchSnapshot();
  });

  it('Builds URL Parameters', () => {
    expect(wrapper.vm.buildUrlParams('name+sw+"test"+OR+description+sw+"test"', ['name', 'description'], '', 1)).toEqual({
      fields: 'name,description',
      pageSize: 10,
      queryFilter: 'name+sw+"test"+OR+description+sw+"test"',
      sortKeys: 'name',
      totalPagedResultsPolicy: 'EXACT',
    });
  });

  it('Gets Table Data', async () => {
    expect(wrapper.vm.tableData).toStrictEqual([]);
    wrapper.vm.routerParameters = { resourceType: 'managed' };
    wrapper.vm.getTableData({
      fields: ['name', 'description'],
      filter: 'name+sw+"test"+OR+description+sw+"test"',
      page: 1,
      sortField: '',
    });
    await flush();

    expect(wrapper.vm.tableData).toStrictEqual([]);
  });
});
