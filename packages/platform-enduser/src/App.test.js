/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import App from '@/App';

const localVue = createLocalVue();
localVue.use(Vuex);

let store;
let wrapper;
let $route;

function mountComponent(storeMock) {
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

  it('Loaded Menus File should load default items', async () => {
    mountComponent(store);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.menuItems.length).toEqual(7);
  });

  it('Loaded Menus File with governance V3 Enabled', async () => {
    store.state.SharedStore.governanceEnabled = true;
    store.state.SharedStore.governanceEnabledV3 = true;
    mountComponent(store);
    await wrapper.vm.$nextTick();
    const inbox = wrapper.vm.menuItems.find((item) => item.displayName === 'sideMenu.inbox');
    const approvals = inbox.subItems.find((item) => item.displayName === 'sideMenu.approvals');
    expect(wrapper.vm.menuItems.length).toEqual(7);
    expect(inbox).toBeTruthy();
    expect(approvals).toBeTruthy();
  });
});
