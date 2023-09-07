/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import i18n from '@/i18n';
import Profile from '@/components/profile';

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
    setupTestPinia({
      user: {
        userId: '0123456789',
        managedResource: 'people',
      },
    });

    wrapper = shallowMount(Profile, {
      global: {
        plugins: [i18n],
      },
      props: {
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
