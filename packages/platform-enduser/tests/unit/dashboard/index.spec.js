import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import sinon from 'sinon';
import i18n from '@/i18n';
import Dashboard from '@/components/dashboard';

describe('Dashboard.vue', () => {
  Vue.use(Vuex);
  Vue.use(BootstrapVue);

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
          amDataEndpoints: null,
          loginRedirect: null,
          amBaseURL: 'https://default.iam.example.com/am',
          idmBaseURL: 'https://default.iam.example.com/openidm',
          loginURL: 'http://localhost:8083/#/service/login',
          theme: 'default',
          idmClientID: 'endUserUIClient',
          adminURL: 'http://localhost:8082',
        },
      },
    });

    const wrapper = shallowMount(Dashboard, {
      i18n,
      methods: { loadData: sinon.stub() },
      store,
    });

    expect(wrapper.name()).to.equal('Dashboard');
  });
});
