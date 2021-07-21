/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import Dashboard from '@/components/dashboard';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

Dashboard.mounted = jest.fn();

describe('Dashboard.vue', () => {
  it('Dashboard page loaded', () => {
    const store = new Vuex.Store({
      state: {
        UserStore: {
          userId: null,
          managedResource: null,
          roles: null,
          internalUser: false,
          adminUser: false,
          profile: {},
          schema: {},
          access: [],
          givenName: '',
          sn: '',
          email: '',
          userName: '',
        },
      },
    });

    const wrapper = shallowMount(Dashboard, {
      localVue,
      i18n,
      methods: { loadData: jest.fn() },
      store,
    });

    expect(wrapper.name()).toBe('Dashboard');
  });
});
