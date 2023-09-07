/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { getUserPrivileges } from '@forgerock/platform-shared/src/api/PrivilegeApi';
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
    },
  });
}

describe('App.vue', () => {
  beforeEach(async () => {
    getUserPrivileges.mockImplementation(() => Promise.resolve({ data: [] }));
    store = {
      state: {
        SharedStore: { workforceEnabled: false },
        menusFile: 'menus.platform',
      },
      getters: {
        menusFile: (state) => state.menusFile,
      },
    };
  });

  afterAll(() => {
    wrapper.unmount();
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
});
