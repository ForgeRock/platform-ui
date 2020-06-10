/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import AccountSecurity from '@/components/profile/AccountSecurity';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

describe('AccountSecurity.vue', () => {
  let wrapper;
  beforeEach(() => {
    const store = new Vuex.Store({
      state: {
        UserStore: { userName: 'test user' },
        ApplicationStore: {},
      },
      getters: {
        UserStore: (state) => state.UserStore,
        ApplicationStore: (state) => state.ApplicationStore,
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
