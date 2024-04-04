/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { getUserPrivileges } from '@forgerock/platform-shared/src/api/PrivilegeApi';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import * as AccessReviewApi from '@/api/governance/AccessReviewApi';
import * as ViolationsApi from '@/api/governance/ViolationsApi';
import i18n from '@/i18n';
import App from '@/App';

jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');

let store;
let wrapper;
let $route;

function shallowMountComponent(storeMock) {
  $route = {
    meta: { hideSideMenu: true },
  };

  const storePlugin = createStore(storeMock);

  wrapper = shallowMount(App, {
    global: {
      plugins: [i18n, storePlugin],
      stubs: ['RouterLink', 'RouterView'],
      mocks: {
        $route,
      },
      mixins: [NotificationMixin],
    },
  });
}

describe('App.vue', () => {
  beforeEach(async () => {
    setupTestPinia({ user: { userId: '123' } });
    AccessReviewApi.getCertificationItems = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    AccessRequestApi.getUserApprovals = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    ViolationsApi.getViolations = jest.fn().mockImplementation(() => Promise.resolve({ data: { totalCount: 1 } }));
    getUserPrivileges.mockImplementation(() => Promise.resolve({ data: [] }));
    store = {
      state: {
        SharedStore: { workforceEnabled: false },
        menusFile: 'menus.platform',
        certificationCount: null,
        approvalsCount: null,
        violationsCount: null,
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
      },
    };
  });

  afterAll(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('Loaded Menus File should load default items', async () => {
    shallowMountComponent(store);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.menuItems.length).toEqual(9);
  });

  it('Loaded Menus File with governance', async () => {
    store.state.SharedStore.governanceEnabled = true;
    shallowMountComponent(store);
    await wrapper.vm.$nextTick();
    const inbox = wrapper.vm.menuItems.find((item) => item.displayName === 'sideMenu.inbox');
    const approvals = inbox.subItems.find((item) => item.displayName === 'sideMenu.approvals');
    expect(wrapper.vm.menuItems.length).toEqual(9);
    expect(inbox).toBeTruthy();
    expect(approvals).toBeTruthy();
  });

  it('shows a regular layout', async () => {
    store.state.SharedStore.logoutScreen = false;
    shallowMountComponent(store);
    await wrapper.vm.$nextTick();
    const logoutText = wrapper.find('fr-layout-stub');
    expect(logoutText.exists()).toBeTruthy();
  });

  describe('with wrapper mounted', () => {
    beforeEach(async () => {
      shallowMountComponent(store);
      await flushPromises();
    });

    it('should get access reviews count and save it in the store on call getAccessReviewsCount', async () => {
      const getCertificationItemsSpy = jest.spyOn(AccessReviewApi, 'getCertificationItems');
      wrapper.vm.getAccessReviewsCount();
      await flushPromises();
      expect(getCertificationItemsSpy).toHaveBeenCalledWith({ status: 'active' });
      expect(wrapper.vm.$store.state.certificationCount).toBe(1);
    });

    it('should set a 0 to access reviews count and save it in the store on call getAccessReviewsCount when the call to API fails', async () => {
      const error = new Error('ERROR');
      AccessReviewApi.getCertificationItems = jest.fn().mockImplementation(() => Promise.reject(error));
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getAccessReviewsCount();
      await flushPromises();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving access reviews');
      expect(wrapper.vm.$store.state.certificationCount).toBe(0);
    });

    it('should get pending approvals count and save it in the store on call getPendingApprovalsCount', async () => {
      const getUserApprovalsSpy = jest.spyOn(AccessRequestApi, 'getUserApprovals');
      wrapper.vm.getPendingApprovalsCount();
      await flushPromises();
      expect(getUserApprovalsSpy).toHaveBeenCalledWith('123', {
        pageSize: 0,
        actorStatus: 'active',
      });
      expect(wrapper.vm.$store.state.approvalsCount).toBe(1);
    });

    it('should set a 0 to pending approvals count and save it in the store on call getPendingApprovalsCount when the call to API fails', async () => {
      const error = new Error('ERROR');
      AccessRequestApi.getUserApprovals = jest.fn().mockImplementation(() => Promise.reject(error));
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getPendingApprovalsCount();
      await flushPromises();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving pending approvals');
      expect(wrapper.vm.$store.state.approvalsCount).toBe(0);
    });

    it('should get pending violations count and save it in the store on call getViolationsCount', async () => {
      const getViolationsSpy = jest.spyOn(ViolationsApi, 'getViolations');
      wrapper.vm.getViolationsCount();
      await flushPromises();
      expect(getViolationsSpy).toHaveBeenCalled();
      expect(wrapper.vm.$store.state.violationsCount).toBe(1);
    });

    it('should set a 0 to pending violations count and save it in the store on call getViolationsCount when the call to API fails', async () => {
      const error = new Error('ERROR');
      ViolationsApi.getViolations = jest.fn().mockImplementation(() => Promise.reject(error));
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.getViolationsCount();
      await flushPromises();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error retrieving pending violations');
      expect(wrapper.vm.$store.state.violationsCount).toBe(0);
    });
  });
});
