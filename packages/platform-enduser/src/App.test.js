/**
 * Copyright (c) 2020-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import App from '@/App';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

describe('App.vue', () => {
  const store = new Vuex.Store({
    state: {
      SharedStore: { workforceEnabled: false },
      UserStore: { userDetails: {} },
    },
    getters: {
      'UserStore/userDetails': (state) => state.UserStore.userDetails,
      UserStore: (state) => state.UserStore,
    },
  });

  let wrapper;
  let $route;

  beforeEach(() => {
    $route = {
      meta: { hideSideMenu: true },
    };

    wrapper = shallowMount(App, {
      localVue,
      store,
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
  });

  afterAll(() => {
    wrapper = null;
  });

  it('App loaded', () => {
    expect(wrapper.name()).toBe('App');
  });
});
