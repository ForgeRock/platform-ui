/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { getUserPrivileges } from '@forgerock/platform-shared/src/api/PrivilegeApi';
import * as ServerinfoApi from '@forgerock/platform-shared/src/api/ServerinfoApi';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as menuItemTranslations from '@forgerock/platform-shared/src/utils/endUserMenu/menuItemTranslations';
import * as AccessReviewApi from '@/api/governance/AccessReviewApi';
import * as ViolationsApi from '@/api/governance/ViolationsApi';
import * as TasksApi from '@/api/governance/TasksApi';
import i18n from '@/i18n';
import App from '@/App';

jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/utils/endUserMenu/menuItemTranslations');
jest.mock('axios');

const store = {
  state: {
    SharedStore: {
      webStorageAvailable: false,
      workforceEnabled: false,
    },
    menusFile: 'menus.platform',
    certificationCount: null,
    approvalsCount: null,
    violationsCount: null,
    fulfillmentTasksCount: null,
    realm: '',
    privileges: [],
  },
  getters: {
    menusFile: (state) => state.menusFile,
  },
  mutations: {
    setCertificationCount(state, count) {
      state.certificationCount = count;
    },
    setApprovalsCount(state, count) {
      state.approvalsCount = count;
    },
    setViolationsCount(state, count) {
      state.violationsCount = count;
    },
    setFulfillmentTasksCount(state, count) {
      state.fulfillmentTasksCount = count;
    },
    setPrivileges(state, privileges) {
      state.privileges = privileges;
    },
  },
};
const governanceEnabledStore = cloneDeep(store);
governanceEnabledStore.state.SharedStore.governanceEnabled = true;
governanceEnabledStore.state.realm = 'alpha';
let wrapper;
let storePlugin;

async function shallowMountComponent(storeMock) {
  storePlugin = createStore(storeMock);

  wrapper = shallowMount(App, {
    mixins: [NotificationMixin],
    global: {
      plugins: [i18n, storePlugin],
      stubs: ['RouterLink', 'RouterView'],
      mocks: {
        $route: { meta: { hideSideMenu: true } },
      },
    },
  });
  await flushPromises();
}

describe('App.vue', () => {
  beforeEach(async () => {
    setupTestPinia({ theme: { theme: null }, user: { userId: '123' } });
    AccessReviewApi.getCertificationItems = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    AccessRequestApi.getUserApprovals = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    ViolationsApi.getViolations = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    TasksApi.getUserFulfillmentTasks = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    ManagedResourceApi.getManagedResourceList = jest.fn().mockImplementation(() => Promise.resolve({ data: { result: [] } }));
    ServerinfoApi.getIdmServerInfo = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
    ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
    ThemeApi.getThemerealm = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [] } } }));
    getUserPrivileges.mockImplementation(() => Promise.resolve({ data: [] }));
    menuItemTranslations.updateMenuItemsWithTranslations.mockImplementation(() => Promise.resolve());
  });

  afterAll(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('Loaded Menus File should load default items', async () => {
    await shallowMountComponent(store);
    expect(wrapper.vm.menuItems.length).toEqual(2);
  });

  it('should load dynamic menu items depending on the enduser privileges', async () => {
    ConfigApi.getConfig = jest.fn().mockResolvedValue({
      data: {
        objects: [
          { name: 'users', schema: { 'mat-icon': 'users', title: 'Alpha Users' } },
        ],
      },
    });
    store.state.privileges = [
      {
        privilegePath: 'managed/users',
        'mat-icon': 'people',
        icon: 'fa-user',
        title: 'User',
      },
      {
        privilegePath: 'internal/role',
        'mat-icon': 'assignment_ind',
        icon: 'fa-check-square',
        title: 'Internal Role',
      },
    ];
    await shallowMountComponent(store);

    expect(wrapper.vm.menuItems.length).toEqual(4);

    store.state.privileges = [];
  });

  it('shows a regular layout', async () => {
    await shallowMountComponent(store);
    const logoutText = wrapper.find('fr-layout-stub');
    expect(logoutText.exists()).toBeTruthy();
  });

  describe('governance disabled', () => {
    const governanceDisabled = cloneDeep(store);
    governanceDisabled.state.SharedStore.governanceEnabled = false;

    it('should not set view IDM users privilege', async () => {
      await shallowMountComponent(governanceDisabled);
      expect(wrapper.vm.setIDMUsersViewPrivilege).not.toHaveBeenCalled();
    });
  });

  describe('governance enabled', () => {
    it('Loaded Menus File with governance', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const inbox = wrapper.vm.menuItems.find((item) => item.id === 'inbox');
      const approvals = inbox.subItems.find((item) => item.id === 'approvals');
      expect(wrapper.vm.menuItems.length).toEqual(6);
      expect(inbox).toBeTruthy();
      expect(approvals).toBeTruthy();
    });

    it('should set view IDM users privilege as false when the getManagedResourceList call fails', async () => {
      ManagedResourceApi.getManagedResourceList = jest.fn().mockRejectedValue({ response: { status: 403 } });
      await shallowMountComponent(governanceEnabledStore);
      expect(wrapper.vm.setIDMUsersViewPrivilege).toHaveBeenCalledWith(false);
    });

    it('should set view IDM users privilege as true when the getManagedResourceList call is correct', async () => {
      await shallowMountComponent(governanceEnabledStore);
      expect(wrapper.vm.setIDMUsersViewPrivilege).toHaveBeenCalledWith(true);
    });

    it('should get access reviews count and save it in the store on call getAccessReviewsCount', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const getCertificationItemsSpy = jest.spyOn(AccessReviewApi, 'getCertificationItems');
      wrapper.vm.getAccessReviewsCount();
      await flushPromises();
      expect(getCertificationItemsSpy).toHaveBeenCalledWith({ status: 'active' });
      expect(storePlugin.state.certificationCount).toBe(1);
    });

    it('should set a 0 to access reviews count and save it in the store on call getAccessReviewsCount when the call to API fails', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const error = new Error('ERROR');
      AccessReviewApi.getCertificationItems = jest.fn().mockImplementation(() => Promise.reject(error));
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getAccessReviewsCount();
      await flushPromises();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving access reviews');
      expect(storePlugin.state.certificationCount).toBe(0);
    });

    it('should get pending approvals count and save it in the store on call getPendingApprovalsCount', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const getUserApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');
      wrapper.vm.getPendingApprovalsCount();
      await flushPromises();
      expect(getUserApprovalsSpy).toHaveBeenCalledWith('123', {
        pageSize: 0,
        actorStatus: 'active',
      });
      expect(storePlugin.state.approvalsCount).toBe(1);
    });

    it('should set a 0 to pending approvals count and save it in the store on call getPendingApprovalsCount when the call to API fails', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const error = new Error('ERROR');
      AccessRequestApi.getUserApprovals = jest.fn().mockImplementation(() => Promise.reject(error));
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getPendingApprovalsCount();
      await flushPromises();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving pending approvals');
      expect(storePlugin.state.approvalsCount).toBe(0);
    });

    it('should get pending violations count and save it in the store on call getViolationsCount', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const getViolationsSpy = jest.spyOn(ViolationsApi, 'getViolations');
      wrapper.vm.getViolationsCount();
      await flushPromises();
      expect(getViolationsSpy).toHaveBeenCalled();
      expect(storePlugin.state.violationsCount).toBe(1);
    });

    it('should set a 0 to pending violations count and save it in the store on call getViolationsCount when the call to API fails', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const error = new Error('ERROR');
      ViolationsApi.getViolations = jest.fn().mockImplementation(() => Promise.reject(error));
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getViolationsCount();
      await flushPromises();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving pending violations');
      expect(storePlugin.state.violationsCount).toBe(0);
    });

    it('should get pending fulfillment tasks count and save it in the store on call getFulfillmentTasksCount', async () => {
      await shallowMountComponent(governanceEnabledStore);
      const getUserFulfillmentTasks = jest.spyOn(TasksApi, 'getUserFulfillmentTasks');
      wrapper.vm.getFulfillmentTasksCount();
      await flushPromises();
      expect(getUserFulfillmentTasks).toHaveBeenCalled();
      expect(storePlugin.state.fulfillmentTasksCount).toBe(1);
    });

    it('adds entitlement lcm menu item when entitlement lcm is enabled', async () => {
      const entitlementLcmEnabled = cloneDeep(governanceEnabledStore);
      entitlementLcmEnabled.state.govLcmEnabled = true;
      entitlementLcmEnabled.state.govLcmEntitlement = true;

      await shallowMountComponent(entitlementLcmEnabled);
      const administerMenuGroup = wrapper.vm.menuItems.find((item) => item.id === 'lcm');
      expect(administerMenuGroup).toBeTruthy();
      expect(administerMenuGroup.subItems.find((item) => item.id === 'lcmEntitlements')).toBeTruthy();
    });
  });
});
