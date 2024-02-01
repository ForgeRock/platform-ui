/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import * as CommonsApi from '@/api/governance/CommonsApi';
import i18n from '@/i18n';
import GovResourceTable from './index';

jest.mock('@/api/governance/CommonsApi');

describe('GovResourceTable', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    CommonsApi.getUserGrants = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [
          {
            item: {
              type: 'accountGrant',
            },
            user: {
              accountStatus: 'active',
            },
            account: {
              userPrincipalName: 'test1@forgerock.com',
            },
            application: {
              name: 'test',
              templateName: 'test',
            },
            relationship: {
              id: '1234',
              properties: {
                grantTypes: [{
                  grantType: 'recon',
                  id: '1234',
                }],
              },
            },
          },
        ],
        totalCount: 1,
      },
    }));
    setupTestPinia({ user: { userId: 'testId' } });
    wrapper = mount(GovResourceTable, {
      global: {
        plugins: [Notifications],
        mocks: {
          $t: (text, prop) => i18n.global.t(text, prop),
        },
      },
      props: {
        grantType: 'account',
        defaultSort: 'application.name',
        fields: [
          {
            key: 'appName',
            label: '',
          },
          {
            key: 'entitlementName',
            label: '',
          },
          {
            key: 'accountName',
            label: '',
          },
        ],
      },
    });
  });

  it('should have a loading spinner then have a table', async () => {
    wrapper.setData({ isLoading: true });
    await flushPromises();
    const myAccessSpinner = wrapper.find('[role="status"]');
    expect(myAccessSpinner.exists()).toBeTruthy();
    wrapper.setData({
      isLoading: false,
    });
    await flushPromises();
    const myAccessTable = findByTestId(wrapper, 'gov-resource-table');
    expect(myAccessTable.exists()).toBeTruthy();
  });

  it('should have an input to search my access review table', () => {
    const searchMyAccessReviewTable = findByTestId(wrapper, 'search-gov-resource-table');
    expect(searchMyAccessReviewTable.exists()).toBeTruthy();
  });

  it('shows the actions menu if passed in and account assignment is direct', async () => {
    let actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeFalsy();
    let badge = findByTestId(wrapper, 'status-badge');
    expect(badge.exists()).toBeFalsy();

    // We set the resourceName to 'directReportDetails' to test that the actions
    // menu should be showing and the badge should be set to 'Direct'.
    await wrapper.setProps({
      resourceName: 'directReportDetail',
      grantType: 'account',
      defaultSort: 'application.name',
      fields: [
        {
          key: 'appName',
          label: '',
        },
        {
          key: 'entitlementName',
          label: '',
        },
        {
          key: 'accountName',
          label: '',
        },
        {
          key: 'assignment',
          label: '',
        },
        {
          key: 'actions',
          label: '',
        },
      ],
    });
    actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeTruthy();
    badge = findByTestId(wrapper, 'status-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe(wrapper.vm.directAssignment);

    // We make the relationship's grantType: 'role' to test that the actions
    // menu should now be hidden since it should only show if set to 'recon'
    // and the badge assignment set to 'Role-based'.
    await wrapper.setData({
      items: [
        {
          item: {
            type: 'accountGrant',
          },
          user: {
            accountStatus: 'active',
          },
          account: {
            userPrincipalName: 'test1@forgerock.com',
          },
          application: {
            name: 'test',
            templateName: 'test',
          },
          relationship: {
            id: '4321',
            properties: {
              grantTypes: [{
                grantType: 'role',
                id: '4321',
              }],
            },
          },
        },
      ],
    });

    actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    expect(actionOptionsMenu.exists()).toBeFalsy();
    badge = findByTestId(wrapper, 'status-badge');
    expect(badge.text()).toBe(wrapper.vm.roleBasedAssignment);
  });

  it('should emit "revoke-request" if a grantType is attempted to be revoked', async () => {
    await wrapper.setProps({
      resourceName: 'directReportDetail',
      grantType: 'account',
      defaultSort: 'application.name',
      fields: [
        {
          key: 'appName',
          label: '',
        },
        {
          key: 'entitlementName',
          label: '',
        },
        {
          key: 'accountName',
          label: '',
        },
        {
          key: 'assignment',
          label: '',
        },
        {
          key: 'actions',
          label: '',
        },
      ],
    });

    const actionOptionsMenu = findByTestId(wrapper, 'actions-relationship-menu');
    await actionOptionsMenu.trigger('click');
    await actionOptionsMenu.find('li:nth-of-type(1) > a').trigger('click'); // Revoke menu item
    expect(wrapper.emitted('revoke-request')).toEqual([[wrapper.vm.itemsWithAssignment[0]]]);
  });

  it('clearing the search input resets the query params', async () => {
    const clearSpy = jest.spyOn(wrapper.vm, 'clear');
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const searchMyAccessReviewTable = findComponentByTestId(wrapper, 'search-gov-resource-table');
    await searchMyAccessReviewTable.vm.$emit('input', 'test');
    await searchMyAccessReviewTable.vm.$emit('clear');

    expect(clearSpy).toHaveBeenCalled();
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.paginationPage).toBe(1);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('can sort table by descending', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.sortChanged({ sortBy: 'appName', sortDesc: true });
    expect(wrapper.vm.sortDesc).toBe(true);
    expect(loadSpy).toBeCalled();
    expect(CommonsApi.getUserGrants).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'desc', grantType: 'account',
    });
  });

  it('can sort table by ascending', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.sortChanged({ sortBy: 'appName', sortDesc: false });
    expect(loadSpy).toBeCalled();
    expect(CommonsApi.getUserGrants).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'accountName', sortDesc: false });
    expect(CommonsApi.getUserGrants).toHaveBeenCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'descriptor.idx./account.displayName', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'entitlementName', sortDesc: false });
    expect(CommonsApi.getUserGrants).toHaveBeenCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'descriptor.idx./entitlement.displayName', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'roleName', sortDesc: false });
    expect(CommonsApi.getUserGrants).toHaveBeenCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'role.name', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'status', sortDesc: false });
    expect(CommonsApi.getUserGrants).toHaveBeenCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: '', sortDir: 'asc', grantType: 'account',
    });
    wrapper.vm.sortChanged({ sortBy: 'other', sortDesc: false });
    expect(CommonsApi.getUserGrants).toHaveBeenCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: '', sortDir: 'asc', grantType: 'account',
    });
  });

  it('can set page size', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.pageSizeChange(20);

    expect(wrapper.vm.paginationPageSize).toBe(20);
    expect(loadSpy).toBeCalled();
  });

  it('can set page', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.pageChange(2);

    expect(wrapper.vm.paginationPage).toBe(2);
    expect(loadSpy).toBeCalled();
  });

  describe('loadData()', () => {
    it('gets my access based on page size', async () => {
      const getMyAccess = jest.spyOn(CommonsApi, 'getUserGrants');
      wrapper.vm.paginationPageSize = 20;
      wrapper.vm.loadData();
      expect(getMyAccess).toBeCalledWith('testId', {
        pageNumber: 0, pageSize: 20, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
      });
    });

    it('gets my access based on page number', () => {
      const getMyAccess = jest.spyOn(CommonsApi, 'getUserGrants');
      wrapper.vm.paginationPage = 2;
      wrapper.vm.loadData();
      expect(getMyAccess).toBeCalledWith('testId', {
        pageNumber: 1, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
      });
    });

    it('gets my access that match a query string', async () => {
      const getMyAccess = jest.spyOn(CommonsApi, 'getUserGrants');
      wrapper.vm.searchQuery = 'test';
      await wrapper.vm.loadData();
      await wrapper.vm.$nextTick();
      expect(getMyAccess).toBeCalledWith('testId', {
        pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account', queryString: 'test',
      });
    });

    it('sets table items when data is successfully loaded', async () => {
      const accounts = [
        {
          item: {
            type: 'roleMembership',
          },
          user: {
            accountStatus: 'active',
          },
          account: {
            userPrincipalName: 'test1@forgerock.com',
          },
          application: {
            name: 'test1',
            templateName: 'test1',
          },
        },
        {
          item: {
            type: 'roleMembership',
          },
          user: {
            accountStatus: 'active',
          },
          account: {
            userPrincipalName: 'test2@forgerock.com',
          },
          application: {
            name: 'test2',
            templateName: 'test2',
          },
        },
      ];
      jest.spyOn(CommonsApi, 'getUserGrants').mockResolvedValue({
        data: { result: accounts },
      });

      wrapper.vm.loadData();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.items[0].account.userPrincipalName).toBe('test1@forgerock.com');
      expect(wrapper.vm.items[1].account.userPrincipalName).toBe('test2@forgerock.com');
    });

    it('displays an error notifcation if API fails', async () => {
      jest.spyOn(CommonsApi, 'getUserGrants').mockRejectedValue('test');
      const errorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.loadData();
      await flushPromises();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('displays noData component when no my access are found', async () => {
      jest.spyOn(CommonsApi, 'getUserGrants').mockResolvedValue({
        data: { result: [] },
      });
      wrapper.vm.loadData(true);
      await flushPromises();
      expect(wrapper.vm.isNoResultsFirstLoad).toBe(true);
      const noData = findByTestId(wrapper, 'gov-resource-table-no-results-first-load');
      expect(noData.exists()).toBeTruthy();
    });
  });

  describe('method getResourceDisplayName should return correct displayName', () => {
    it('item with descriptor should return property displayName value', () => {
      const item = {
        descriptor: {
          idx: {
            '/account': {
              displayName: 'Account name',
            },
          },
        },
      };

      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBe('Account name');
    });

    it('item without displayName property should return undefined', () => {
      const item = {
        descriptor: {
          idx: {
            '/account': {},
          },
        },
      };

      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBeUndefined();
    });

    it('item without resource property should return undefined', () => {
      const item = {
        descriptor: {
          idx: {
            '/account': {
              displayName: 'Account name',
            },
          },
        },
      };

      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/entitlement');

      expect(resourceDisplayName).toBeUndefined();
    });

    it('item without idx property should return undefined', () => {
      const item = {
        descriptor: {},
      };

      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBeUndefined();
    });

    it('item without descriptor property should return undefined', () => {
      const item = {};

      const resourceDisplayName = wrapper.vm.getResourceDisplayName(item, '/account');

      expect(resourceDisplayName).toBeUndefined();
    });
  });
});
