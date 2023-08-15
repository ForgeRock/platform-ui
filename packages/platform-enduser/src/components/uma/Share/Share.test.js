/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Share from '@/components/uma/Share';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

let propsData;
let wrapper;

describe('Sharing.vue', () => {
  beforeEach(() => {
    propsData = {
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
      newScopes: { value: '' },
      newShare: 'test',
      value: 'test',
    };

    wrapper = shallowMount(Share, {
      localVue,
      i18n,
      propsData,
      stubs: { BFormInput: true },
    });

    wrapper.vm.$refs.fsModal.hide = jest.fn();
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('Emits "modifyResource" event', () => {
    wrapper.vm.shareResource();

    localVue.nextTick(() => {
      expect(wrapper.emitted('modifyResource').length).toBe(1);
    });
  });

  it('Emits "shareResource" event', () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.shareResource();

    localVue.nextTick(() => {
      expect(wrapper.emitted('modifyResource').length).toBe(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    wrapper.vm.unshareAll();

    localVue.nextTick(() => {
      expect(wrapper.emitted('renderUnshareModal').length).toBe(1);
    });
  });

  it('Emits "unshareOne" event', () => {
    wrapper.vm.unshareOne('testUser');

    localVue.nextTick(() => {
      expect(wrapper.emitted('modifyResource').length).toBe(1);
    });
  });

  it('Validates resource', () => {
    const spy = jest.spyOn(wrapper.vm, 'resetModal');

    wrapper.vm.newShare = 'shareWith';
    wrapper.vm.validateResource();

    expect(spy).toBeCalled();
  });

  it('Validates resource without policy', () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.validateResource();

    localVue.nextTick(() => {
      expect(typeof wrapper.emitted()).toBe('object');
    });
  });

  it('Prevents sharing with same user', () => {
    const spy = jest.spyOn(wrapper.vm, 'resetModal');

    wrapper.setData({ newShare: 'shareWith' });
    wrapper.vm.validateResource();

    expect(spy).toBeCalled();
  });

  it('Calls "shareResource" if resource is valid', () => {
    const spy = jest.spyOn(wrapper.vm, 'shareResource');

    wrapper.setData({ newShare: 'shareWith' });
    wrapper.vm.validateResource();

    expect(spy).toBeCalled();
  });

  it('Calls "shareResource" if resouce is shared for the first time', () => {
    const spy = jest.spyOn(wrapper.vm, 'shareResource');

    wrapper.setData({ newShare: 'shareWith' });
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.validateResource();

    expect(spy).toBeCalled();
  });
});
