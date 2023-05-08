/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';
import MyAccessReviewTable from './index';

jest.mock('@/api/GovernanceEnduserApi');

describe('MyAccessReviewTable', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    GovernanceEnduserApi.getMyAccess = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [{
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
        }],
        totalCount: 1,
      },
    }));
    wrapper = mount(MyAccessReviewTable, {
      mocks: {
        $t: (t) => t,
        $store: {
          state: {
            UserStore: {
              userId: 'testId',
            },
          },
        },
      },
      propsData: {
        grantType: 'account',
        defaultSort: 'application.name',
        fields: [
          {
            key: 'appName',
            label: 'common.name',
            sortable: true,
          },
          {
            key: 'status',
            label: 'common.status',
            sortable: true,
          },
        ],
      },
    });
  });

  it('should have a loading spinner then have a table', () => {
    wrapper.setData({ isLoading: true });
    const myAccessSpinner = findByTestId(wrapper, 'my-access-review-table-spinner');
    expect(myAccessSpinner.exists()).toBeTruthy();
    wrapper.setData({
      isLoading: false,
    });
    const myAccessTable = findByTestId(wrapper, 'my-access-review-table');
    expect(myAccessTable.exists()).toBeTruthy();
  });

  it('should have an input to search my access review table', () => {
    const searchMyAccessReviewTable = findByTestId(wrapper, 'search-my-access-review-table');
    expect(searchMyAccessReviewTable.exists()).toBeTruthy();
  });

  it('clearing the search input resets the query params', async () => {
    const clearSpy = jest.spyOn(wrapper.vm, 'clear');
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const searchMyAccessReviewTable = findByTestId(wrapper, 'search-my-access-review-table');
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
    expect(wrapper.vm.sortDesc).toBeTruthy();
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'desc', grantType: 'account',
    });
  });

  it('can sort table by ascending', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.sortChanged({ sortBy: 'appName', sortDesc: false });
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
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
      const getMyAccess = jest.spyOn(GovernanceEnduserApi, 'getMyAccess');
      wrapper.vm.paginationPageSize = 20;
      wrapper.vm.loadData();
      expect(getMyAccess).toBeCalledWith('testId', {
        pageNumber: 0, pageSize: 20, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
      });
    });

    it('gets my access based on page number', () => {
      const getMyAccess = jest.spyOn(GovernanceEnduserApi, 'getMyAccess');
      wrapper.vm.paginationPage = 2;
      wrapper.vm.loadData();
      expect(getMyAccess).toBeCalledWith('testId', {
        pageNumber: 1, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
      });
    });

    it('gets my access that match a query string', async () => {
      const getMyAccess = jest.spyOn(GovernanceEnduserApi, 'getMyAccess');
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
      jest.spyOn(GovernanceEnduserApi, 'getMyAccess').mockResolvedValue({
        data: { result: accounts },
      });

      wrapper.vm.loadData();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.items[0].account.userPrincipalName).toBe('test1@forgerock.com');
      expect(wrapper.vm.items[1].account.userPrincipalName).toBe('test2@forgerock.com');
    });

    it('displays an error notifcation if API fails', async () => {
      jest.spyOn(GovernanceEnduserApi, 'getMyAccess').mockRejectedValue('test');
      const errorSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.loadData();
      await wrapper.vm.$nextTick();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('displays noData component when no my access are found', async () => {
      jest.spyOn(GovernanceEnduserApi, 'getMyAccess').mockResolvedValue({
        data: { result: [] },
      });
      wrapper.vm.loadData(true);
      await flushPromises();
      expect(wrapper.vm.isNoResultsFirstLoad).toBe(true);
      const noData = findByTestId(wrapper, 'my-access-review-table-no-results-first-load');
      expect(noData.exists()).toBeTruthy();
    });
  });
});
