/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import App from '@/App';

const localVue = createLocalVue();
localVue.use(Vuex);

let store;
let wrapper;
let $route;

function shallowMountComponent(storeMock) {
  $route = {
    meta: { hideSideMenu: true },
  };

  wrapper = shallowMount(App, {
    localVue,
    store: storeMock,
    i18n,
    mocks: {
      $route,
    },
    stubs: {
      RouterLink: true,
      RouterView: true,
      Notifications: true,
    },
  });
}

function mountComponent(storeMock) {
  $route = {
    meta: { hideSideMenu: true },
  };

  wrapper = mount(App, {
    localVue,
    store: storeMock,
    i18n,
    mocks: {
      $route,
    },
    stubs: {
      RouterLink: true,
      RouterView: true,
      Notifications: true,
    },
  });
}

describe('App.vue', () => {
  beforeEach(async () => {
    store = new Vuex.Store({
      state: {
        SharedStore: { workforceEnabled: false },
        UserStore: { userDetails: {} },
        menusFile: 'menus.platform',
      },
      getters: {
        'UserStore/userDetails': (state) => state.UserStore.userDetails,
        UserStore: (state) => state.UserStore,
        menusFile: (state) => state.menusFile,
      },
    });
  });

  afterAll(() => {
    wrapper.destroy();
  });

  it('Loaded Menus File should load default items', async () => {
    shallowMountComponent(store);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.menuItems.length).toEqual(8);
  });

  it('Loaded Menus File with governance', async () => {
    store.state.SharedStore.governanceEnabled = true;
    shallowMountComponent(store);
    await wrapper.vm.$nextTick();
    const inbox = wrapper.vm.menuItems.find((item) => item.displayName === 'sideMenu.inbox');
    const approvals = inbox.subItems.find((item) => item.displayName === 'sideMenu.approvals');
    expect(wrapper.vm.menuItems.length).toEqual(8);
    expect(inbox).toBeTruthy();
    expect(approvals).toBeTruthy();
  });

  it('shows a regular layout', async () => {
    store.state.SharedStore.logoutScreen = false;
    shallowMountComponent(store);
    await wrapper.vm.$nextTick();
    const logoutText = wrapper.find('frlayout-stub');
    expect(logoutText.exists()).toBeTruthy();
  });

  it('shows a logout screen', async () => {
    store.state.SharedStore.logoutScreen = true;
    mountComponent(store);
    await wrapper.vm.$nextTick();
    const logoutText = wrapper.find('.lead');
    expect(logoutText.text()).toBe('Signing out...');
  });
});
