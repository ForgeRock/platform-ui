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
import Profile from '@/components/profile';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

Profile.components['fr-consent'] = jest.fn();
Profile.components['fr-account-controls'] = jest.fn();
Profile.components['fr-account-security'] = jest.fn();
Profile.components['fr-edit-profile'] = jest.fn();

describe('Profile.vue', () => {
  let wrapper;
  beforeEach(() => {
    const getUserProfile = jest.fn();
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
        ApplicationStore: {},
      },
    });

    wrapper = shallowMount(Profile, {
      localVue,
      i18n,
      store,
      computed: {
        fullName() {
          return '';
        },
        profileImage() {
          return '';
        },
      },
      methods: {
        getUserProfile,
      },
    });
  });

  it('Profile page loaded', () => {
    expect(wrapper.name()).toBe('Profile');
    expect(wrapper).toMatchSnapshot();
  });
});
