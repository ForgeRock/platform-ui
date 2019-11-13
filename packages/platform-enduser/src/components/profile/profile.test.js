/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
Profile.components['fr-edit-personal-info'] = jest.fn();
Profile.components['fr-account-controls'] = jest.fn();
Profile.components['fr-account-security'] = jest.fn();

describe('Profile.vue', () => {
  let wrapper;
  beforeEach(() => {
    const getUserProfile = jest.fn();
    const store = new Vuex.Store({
      state: {
        UserStore: {},
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
      },
      stubs: {
        ToggleButton: true,
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
