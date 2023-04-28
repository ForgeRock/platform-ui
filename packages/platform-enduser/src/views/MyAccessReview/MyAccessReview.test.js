/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import MyAccessReview from './index';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';

jest.mock('@/api/GovernanceEnduserApi');

describe('MyAccessReview Component under /my-accounts', () => {
  const mockAccountItems = [
    {
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
    },
  ];
  let wrapper;
  beforeEach(() => {
    jest.spyOn(GovernanceEnduserApi, 'getMyAccess').mockImplementation(() => Promise.resolve({ data: { result: [] } }));
    wrapper = mount(MyAccessReview, {
      mocks: {
        $t: (t) => t,
        $store: {
          state: {
            UserStore: {
              userId: 'testId',
            },
          },
        },
        $route: {
          name: 'Accounts',
        },
      },
    });
  });
  afterEach(() => {
    wrapper.destroy();
    jest.clearAllMocks();
  });

  it('should have a loading spinner & a table', async () => {
    await wrapper.setData({ isLoading: true });
    const myAccessSpinner = findByTestId(wrapper, 'spinner-my-access');
    expect(myAccessSpinner.exists()).toBeTruthy();
    await wrapper.setData({
      isLoading: false,
      items: mockAccountItems,
    });
    const myAccessTable = findByTestId(wrapper, 'table-my-access');
    expect(myAccessTable.exists()).toBeTruthy();
  });

  it('should have an input to search my-access', () => {
    const searchMyAccess = findByTestId(wrapper, 'search-my-access');
    expect(searchMyAccess.exists()).toBeTruthy();
  });

  it('clearing the search input resets the query params', async () => {
    const clearSpy = jest.spyOn(wrapper.vm, 'clear');
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const searchMyAccess = findByTestId(wrapper, 'search-my-access');
    await searchMyAccess.vm.$emit('input', 'test');
    await searchMyAccess.vm.$emit('clear');
    expect(clearSpy).toHaveBeenCalled();
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.paginationPage).toBe(1);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('can sort table by descending', async () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const tableContext = { sortBy: 'appName', sortDesc: true };
    await wrapper.vm.sortChanged(tableContext);
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'desc', grantType: 'account',
    });
  });

  it('can sort table by ascending', async () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const tableContext = { sortBy: 'appName', sortDesc: false };
    await wrapper.vm.sortChanged(tableContext);
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
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 20, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
    });
  });

  it('can set page', () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    wrapper.vm.pageChange(2);
    expect(wrapper.vm.paginationPage).toBe(2);
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 1, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account',
    });
  });

  it('can display an error if API fails', async () => {
    const error = new Error();
    const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');
    GovernanceEnduserApi.getMyAccess.mockImplementation(() => Promise.reject(error));
    wrapper.vm.loadData();
    await wrapper.vm.$nextTick();
    expect(spyNotification).toHaveBeenCalledWith(error, 'pages.myAccess.accounts.errorGettingData');
  });

  it('adjusting search input adjusts search query', () => {
    wrapper.setData({ searchQuery: 'test' });
    wrapper.vm.loadData();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'account', queryString: 'test',
    });
  });
});

describe('MyAccessReview Component under /my-entitlements', () => {
  const mockEntitlementItems = [
    {
      account: {
        userPrincipalName: 'test1@forgerock.com',
      },
      application: {
        name: 'test 1',
      },
      entitlement: {
        __NAME__: 'test 1',
      },
    },
    {
      account: {
        userPrincipalName: 'test2@forgerock.com',
      },
      application: {
        name: 'test 2',
      },
      entitlement: {
        __NAME__: 'test 2',
      },
    },
  ];
  let wrapper;
  beforeEach(() => {
    GovernanceEnduserApi.getMyAccess = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
    wrapper = mount(MyAccessReview, {
      mocks: {
        $t: (t) => t,
        $store: {
          state: {
            UserStore: {
              userId: 'testId',
            },
          },
        },
        $route: {
          name: 'Entitlements',
        },
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have a loading spinner & a table', async () => {
    await wrapper.setData({ isLoading: true });
    const myAccessSpinner = await findByTestId(wrapper, 'spinner-my-access');
    expect(myAccessSpinner.exists()).toBeTruthy();
    await wrapper.setData({
      isLoading: false,
      items: mockEntitlementItems,
    });
    const myAccessTable = await findByTestId(wrapper, 'table-my-access');
    expect(myAccessTable.exists()).toBeTruthy();
  });

  it('can display an error if API fails', async () => {
    const error = new Error();
    const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');
    GovernanceEnduserApi.getMyAccess.mockImplementation(() => Promise.reject(error));
    wrapper.vm.loadData();
    await wrapper.vm.$nextTick();
    expect(spyNotification).toHaveBeenCalledWith(error, 'pages.myAccess.entitlements.errorGettingData');
  });

  it('adjusting search input adjusts search query', async () => {
    await wrapper.setData({ searchQuery: 'test' });
    wrapper.vm.loadData();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'application.name', sortDir: 'asc', grantType: 'entitlement', queryString: 'test',
    });
  });
});

describe('MyAccessReview Component under /my-roles', () => {
  const mockRoleItems = [
    {
      relationship: {},
      role: {
        name: 'IT Analyst',
      },
    },
    {
      relationship: {},
      role: {
        name: 'Risk Analyst',
      },
    },
  ];
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    GovernanceEnduserApi.getMyAccess = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
    wrapper = mount(MyAccessReview, {
      mocks: {
        $t: (t) => t,
        $store: {
          state: {
            UserStore: {
              userId: 'testId',
            },
          },
        },
        $route: {
          name: 'Roles',
        },
      },
    });
  });

  it('should have a loading spinner & a table', async () => {
    await wrapper.setData({ isLoading: true });
    const myAccessSpinner = await findByTestId(wrapper, 'spinner-my-access');
    expect(myAccessSpinner.exists()).toBeTruthy();
    await wrapper.setData({
      isLoading: false,
      items: mockRoleItems,
    });
    const myAccessTable = await findByTestId(wrapper, 'table-my-access');
    expect(myAccessTable.exists()).toBeTruthy();
  });

  it('can sort table by descending', async () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const tableContext = { sortBy: 'roleName', sortDesc: true };
    await wrapper.vm.sortChanged(tableContext);
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'role.name', sortDir: 'desc', grantType: 'role',
    });
  });

  it('can sort table by ascending', async () => {
    const loadSpy = jest.spyOn(wrapper.vm, 'loadData');
    const tableContext = { sortBy: 'roleName', sortDesc: true };
    await wrapper.vm.sortChanged(tableContext);
    expect(loadSpy).toBeCalled();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'role.name', sortDir: 'asc', grantType: 'role',
    });
  });

  it('can display an error if API fails', async () => {
    const error = new Error();
    const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');
    GovernanceEnduserApi.getMyAccess.mockImplementation(() => Promise.reject(error));
    wrapper.vm.loadData();
    await wrapper.vm.$nextTick();
    expect(spyNotification).toHaveBeenCalledWith(error, 'pages.myAccess.roles.errorGettingData');
  });

  it('adjusting search input adjusts search query', async () => {
    await wrapper.setData({ searchQuery: 'test' });
    wrapper.vm.loadData();
    expect(GovernanceEnduserApi.getMyAccess).toBeCalledWith('testId', {
      pageNumber: 0, pageSize: 10, sortBy: 'role.name', sortDir: 'asc', grantType: 'role', queryString: 'test',
    });
  });
});
