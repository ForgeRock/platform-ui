/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
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

describe('App.vue', () => {
  beforeEach(async () => {
    store = new Vuex.Store({
      state: {
        SharedStore: { workforceEnabled: false },
        menusFile: 'menus.platform',
      },
      getters: {
        menusFile: (state) => state.menusFile,
      },
    });
    setupTestPinia({ enduser: { access: {} } });
  });

  afterAll(() => {
    wrapper.destroy();
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
    const logoutText = wrapper.find('frlayout-stub');
    expect(logoutText.exists()).toBeTruthy();
  });
});
