import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import sinon from 'sinon';
import i18n from '@/i18n';
import Dashboard from '@/components/dashboard';

describe('Dashboard.vue', () => {
  Vue.use(BootstrapVue);

  it('Dashboard page loaded', () => {
    const userStore = {
      getUserState() {
        return {};
      },
    };


    const applicationStore = {
      state: {},
    };

    const wrapper = shallowMount(Dashboard, {
      i18n,
      methods: { loadData: sinon.stub() },
      mocks: {
        userStore,
        applicationStore,
      },
    });

    expect(wrapper.name()).to.equal('Dashboard');
  });
});
