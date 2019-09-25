import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';
import i18n from '@/i18n';
import Share from '@/components/uma/Share';

describe('Sharing.vue', () => {
  Vue.use(BootstrapVue);

  const propsData = {
    resource: {
      _id: '12345',
      name: 'test resource',
      resourceOwnerId: 'alice',
      scopes: ['view', 'comment', 'download'],
      policy: {
        permissions: [{
          subject: 'bob',
          scopes: ['download'],
        }],
        icon_uri: '',
      },
    },
    newScopes: {},
    newShare: false,
  };

  it('Resources page loaded', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });

    expect(wrapper.name()).to.equal('Share');
  });

  it('Emits "modifyResource" event', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });

    wrapper.vm.shareResource();

    Vue.nextTick(() => {
      expect(wrapper.emitted('modifyResource').length).to.equal(1);
    });
  });

  it('Emits "modifyResource" event', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });

    wrapper.vm.modifyResource('bob', 'view');

    Vue.nextTick(() => {
      expect(wrapper.emitted('modifyResource').length).to.equal(1);
    });
  });

  it.skip('Emits "shareResource" event', () => {
    const propsIn = {
      resource: {
        _id: '12345',
        name: 'test resource',
        resourceOwnerId: 'alice',
        scopes: ['view', 'comment', 'download'],
        icon_uri: '',
      },
      newScopes: {},
      newShare: false,
    };


    const wrapper = mount(Share, {
      i18n,
      propsIn,
    });

    wrapper.vm.shareResource();

    Vue.nextTick(() => {
      expect(wrapper.emitted('shareResource').length).to.equal(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });

    wrapper.vm.unshareAll();

    Vue.nextTick(() => {
      expect(wrapper.emitted('renderUnshareModal').length).to.equal(1);
    });
  });

  it('Emits "unshareOne" event', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });

    wrapper.vm.unshareOne('testUser');

    Vue.nextTick(() => {
      expect(wrapper.emitted('modifyResource').length).to.equal(1);
    });
  });

  it('Validates resource', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });


    const spy = Sinon.spy();

    wrapper.setMethods({ resetModal: spy, displayNotification: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });

  it.skip('Validates resource without policy', () => {
    const passedProps = {
      resource: {
        _id: '12345',
        name: 'test resource',
        resourceOwnerId: 'alice',
        scopes: ['view', 'comment', 'download'],
        icon_uri: '',
      },
      newScopes: {},
      newShare: false,
    };

    const wrapper = mount(Share, {
      i18n,
      passedProps,
    });

    wrapper.vm.validateResource();

    Vue.nextTick(() => {
      expect(wrapper.emitted()).to.be.an('object');
    });
  });

  it('Prevents sharing with same user', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });


    const spy = Sinon.spy();

    wrapper.setData({ newShare: 'bob' });
    wrapper.setMethods({ resetModal: spy, displayNotification: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });

  it('Calls "shareResource" if resource is valid', () => {
    const wrapper = mount(Share, {
      i18n,
      propsData,
    });


    const spy = Sinon.spy();

    wrapper.setData({ newShare: 'steve' });
    wrapper.setMethods({ shareResource: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });

  it.skip('Calls "shareResource" if resouce is shared for the first time', () => {
    const props = {
      resource: {
        _id: '12345',
        name: 'test resource',
        resourceOwnerId: 'alice',
        scopes: ['view', 'comment', 'download'],
        icon_uri: '',
      },
      newScopes: {},
      newShare: false,
    };


    const wrapper = mount(Share, {
      props,
      i18n,
    });


    const spy = Sinon.spy();

    wrapper.setData({ newShare: 'bob' });
    wrapper.setMethods({ shareResource: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
    expect(spy.called).to.be.ok;
  });
});
