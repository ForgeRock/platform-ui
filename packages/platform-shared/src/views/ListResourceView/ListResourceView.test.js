/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { keys, map } from 'lodash';
import { shallowMount, flushPromises } from '@vue/test-utils';
import * as InternalResourceApi from '@forgerock/platform-shared/src/api/InternalResourceApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import i18n from '@/i18n';
import ListResource from './index';

ListResource.mounted = jest.fn();
async function flush() {
  await flushPromises();
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
      global: {
        plugins: [i18n],
        stubs: {
          'router-link': true,
        },
        mocks: {
          $route,
        },
      },
    });

    wrapper.setData({
      currentTableParams: {
        filter: 'true',
        fields: [''],
        sortField: 'sn',
        page: 0,
        pageSize: 10,
      },
      routerParameters: {
        resourceName: 'test',
        resourceType: 'managed',
      },
    });
  });

  it('Builds URL Parameters', () => {
    // with a queryFilter
    expect(wrapper.vm.buildUrlParams('name+sw+"test"+OR+description+sw+"test"', ['name', 'description'], 'name', 0, 10)).toEqual({
      fields: 'name,description',
      pageSize: 10,
      queryFilter: 'name+sw+"test"+OR+description+sw+"test"',
      sortKeys: 'name',
      totalPagedResultsPolicy: 'EXACT',
    });
    // with queryFilter = true
    expect(wrapper.vm.buildUrlParams('true', ['name', 'description'], '', 0, 10)).toEqual({
      fields: 'name,description',
      pageSize: 10,
      queryFilter: 'true',
      sortKeys: 'name',
      totalPagedResultsPolicy: 'EXACT',
    });
    // with a queryThreshold and queryFilter = true
    wrapper.vm.queryThreshold = 2;
    expect(wrapper.vm.buildUrlParams('true', ['name', 'description'], '', 0, 10)).toEqual({
      fields: 'name,description',
      pageSize: 10,
      queryFilter: 'true',
      totalPagedResultsPolicy: 'EXACT',
    });
  });

  it('Gets Table Data', async () => {
    jest.spyOn(ManagedResourceApi, 'getManagedResourceList').mockImplementation(() => Promise.resolve({ data: { result: [], totalPagedResults: 0 } }));
    expect(wrapper.vm.tableData).toStrictEqual([]);
    wrapper.vm.getTableData({
      fields: ['name', 'description'],
      filter: 'name+sw+"test"+OR+description+sw+"test"',
      page: 1,
      pageSize: 10,
      sortField: '',
    });
    await flush();

    expect(wrapper.vm.tableData).toStrictEqual([]);
    expect(wrapper.vm.tableDataTotalRows).toBe(0);
  });

  describe('Deleting resources', () => {
    it('calls deleteInternalResource when the delete button is clicked and the resourceType is "internal"', async () => {
      await wrapper.setData({ routerParameters: { resourceName: 'bob', resourceType: 'internal' } });
      const deleteInternalResourceSpy = jest.spyOn(InternalResourceApi, 'deleteInternalResource').mockImplementation(() => Promise.resolve());
      jest.spyOn(InternalResourceApi, 'getInternalResourceList').mockImplementation(() => Promise.resolve({
        data: {
          pagedResultsCookie: 'sdfsdf',
          result: [],
        },
      }));

      await wrapper.vm.deleteResource('blah');

      expect(deleteInternalResourceSpy).toHaveBeenCalled();
    });

    it('calls deleteManagedResource when the delete button is clicked and the resourceType is "managed"', async () => {
      await wrapper.setData({ routerParameters: { resourceName: 'bob', resourceType: 'managed' } });
      const deleteManagedResourceSpy = jest.spyOn(ManagedResourceApi, 'deleteManagedResource').mockImplementation(() => Promise.resolve());

      await wrapper.vm.deleteResource('blah');

      expect(deleteManagedResourceSpy).toHaveBeenCalled();
    });
  });

  it('Sets Privileges', () => {
    const privileges = {
      data: {
        VIEW: {
          allowed: true,
          properties: [
            'userName',
            'password',
            'givenName',
            'sn',
            'mail',
          ],
        },
        CREATE: {
          allowed: true,
          properties: [
            'userName',
            'password',
            'givenName',
            'sn',
            'mail',
            'privileges',
            'temporalConstraints',
            'condition',
            'description',
            'parent',
            'attributes',
            'memberOfOrg',
          ],
        },
        UPDATE: {
          allowed: true,
          properties: [
            'userName',
            'password',
            'givenName',
            'sn',
            'mail',
          ],
        },
        DELETE: {
          allowed: true,
        },
        ACTION: {
          allowed: false,
          actions: [],
        },
      },
    };
    const schema = {
      data: {
        title: 'User',
        viewable: true,
        order: [
          'userName',
          'password',
          'givenName',
          'sn',
          'mail',
        ],
        properties: {
          password: {
            title: 'Password',
          },
          mail: {
            title: 'Email Address',
          },
          sn: {
            title: 'Last Name',
          },
          givenName: {
            title: 'First Name',
          },
          userName: {
            title: 'Username',
          },
          memberOfOrg: {
            title: 'Organizations to which I Belong',
          },
          attributes: {
            title: 'Attributes',
          },
          privileges: {
            title: 'Privileges',
          },
          condition: {
            title: 'Condition',
          },
          temporalConstraints: {
            title: 'Temporal Constraints',
          },
          description: {
            title: 'Description',
          },
          parent: {
            title: 'Parent',
          },
        },
        type: 'object',
        required: [
          'userName',
          'givenName',
          'sn',
          'mail',
        ],
      },
    };

    wrapper.vm.setPrivileges(privileges, schema);

    expect(keys(wrapper.vm.routerParameters.managedProperties).length).toEqual(5);
    expect(wrapper.vm.routerParameters.order.length).toEqual(5);
    expect(keys(wrapper.vm.routerParameters.managedProperties)).toStrictEqual(['userName', 'password', 'givenName', 'sn', 'mail']);
    expect(wrapper.vm.routerParameters.resourceName).toBe('test');
    expect(wrapper.vm.routerParameters.resourceType).toBe('test');
    expect(wrapper.vm.hasUpdateAccess).toEqual(true);
    expect(wrapper.vm.hasDeleteAccess).toEqual(true);
    expect(map(wrapper.vm.createProperties, 'key')).toStrictEqual(['userName', 'givenName', 'sn', 'mail']);

    wrapper.vm.$route.params.resourceName = 'assignment';
    wrapper.vm.setPrivileges(privileges, schema);
    expect(map(wrapper.vm.createProperties, 'key')).toStrictEqual(['userName', 'givenName', 'sn', 'mail', 'attributes']);

    wrapper.vm.$route.params.resourceName = 'role';
    wrapper.vm.setPrivileges(privileges, schema);
    expect(map(wrapper.vm.createProperties, 'key')).toStrictEqual(['userName', 'givenName', 'sn', 'mail', 'condition', 'temporalConstraints', 'description']);

    wrapper.vm.$route.params.resourceType = 'internal';
    wrapper.vm.setPrivileges(privileges, schema);
    expect(map(wrapper.vm.createProperties, 'key')).toStrictEqual(['userName', 'givenName', 'sn', 'mail', 'privileges', 'condition', 'temporalConstraints', 'description']);

    wrapper.vm.$route.params.resourceName = 'organization';
    wrapper.vm.setPrivileges(privileges, schema);
    expect(map(wrapper.vm.createProperties, 'key')).toStrictEqual(['userName', 'givenName', 'sn', 'mail', 'parent']);

    wrapper.vm.$route.params.resourceName = 'user';
    wrapper.vm.setPrivileges(privileges, schema);
    expect(map(wrapper.vm.createProperties, 'key')).toStrictEqual(['userName', 'givenName', 'sn', 'mail', 'memberOfOrg']);
  });
});
