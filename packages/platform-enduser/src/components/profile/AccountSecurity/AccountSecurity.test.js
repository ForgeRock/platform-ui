/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import AccountSecurity from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

describe('AccountSecurity.vue', () => {
  let wrapper;
  beforeEach(() => {
    const store = new Vuex.Store({
      state: {
        UserStore: {
          userId: null,
          managedResource: null,
          roles: null,
          internalUser: true,
          adminUser: false,
          userName: 'user1234',
        },
        ApplicationStore: {},
        getters: {
          UserStore: (state) => state.UserStore,
          ApplicationStore: (state) => state.ApplicationStore,
        },
      },
    });
    wrapper = shallowMount(AccountSecurity, {
      localVue,
      store,
      i18n,
    });
  });

  it('AccountSecurity page loaded', () => {
    expect(wrapper.name()).toBe('AccountSecurity');
    expect(wrapper).toMatchSnapshot();
  });
});
