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
import Dashboard from '@/components/dashboard';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

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
        ApplicationStore: {
          authHeaders: null,
          loginRedirect: null,
          amBaseURL: 'https://default.iam.example.com/am',
          idmBaseURL: 'https://default.iam.example.com/openidm',
          loginURL: 'http://localhost:8083/#/service/Login',
          theme: 'default',
          idmClientID: 'endUserUIClient',
          adminURL: 'http://localhost:8082',
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
    expect(wrapper).toMatchSnapshot();
  });
});
