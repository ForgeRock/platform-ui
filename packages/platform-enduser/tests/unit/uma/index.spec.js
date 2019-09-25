import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';
import Sinon from 'sinon';
import i18n from '@/i18n';
import Sharing from '@/components/uma';

describe('Sharing.vue', () => {
  Vue.use(BootstrapVue);

  let sandbox = null;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();

    sandbox.stub(Sharing.methods, 'getResources').callsFake(() => {
      this.resources = [];
    });

    sandbox.stub(Sharing.methods, 'getActivity').callsFake(() => {
      this.activity = [];
    });

    sandbox.stub(Sharing.methods, 'getRequests').callsFake(() => {
      this.requests = [];
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it.skip('Sharing page loaded', () => {
    const wrapper = shallowMount(Sharing, {
      i18n,
    });

    expect(wrapper.name()).to.equal('Sharing');
  });

  it.skip('Emits "renderShareModal" event', () => {
    const wrapper = mount(Sharing, {
      i18n,
    });

    wrapper.vm.$emit('renderShareModal');

    expect(wrapper.emitted().renderShareModal.length).to.equal(1);

    wrapper.vm.renderShareModal();

    Vue.nextTick(() => {
      expect(wrapper.emitted('bv::show::modal').length).to.equal(1);
    });
  });

  it.skip('Emits "renderUnshareModal" event', () => {
    const wrapper = mount(Sharing, {
      i18n,
    });

    wrapper.vm.$emit('renderUnshareModal');

    expect(wrapper.emitted().renderUnshareModal.length).to.equal(1);

    wrapper.vm.renderUnshareModal();

    Vue.nextTick(() => {
      expect(wrapper.emitted('bv::show::modal').length).to.equal(1);
    });
  });
});
