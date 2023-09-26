/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
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

const RestMixin = {
  methods: {
    getRequestService: jest.fn().mockImplementation(() => ({ get: () => Promise.resolve({ data: {} }) })),
  },
};

describe('Profile.vue', () => {
  let wrapper;
  beforeEach(() => {
    const store = new Vuex.Store({
      state: {
        UserStore: {
          userId: '0123456789',
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

    wrapper = shallowMount(Profile, {
      localVue,
      i18n,
      store,
      propsData: {
        theme: {},
      },
      mixins: [RestMixin],
    });
  });

  it('Sets fullName properly', () => {
    wrapper.vm.profile = {
      givenName: 'Stan',
      sn: 'Marsh',
    };

    expect(wrapper.vm.fullName).toBe('Stan Marsh');
    wrapper.vm.profile.givenName = null;
    expect(wrapper.vm.fullName).toBe(' Marsh');
    wrapper.vm.profile.givenName = 'Stan';
    wrapper.vm.profile.sn = null;
    expect(wrapper.vm.fullName).toBe('Stan ');
    wrapper.vm.profile.givenName = null;
    wrapper.vm.profile.sn = null;
    expect(wrapper.vm.fullName).toBe('0123456789');
  });
});
