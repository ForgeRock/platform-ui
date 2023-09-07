/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import Share from '@/components/uma/Share';

let props;
let wrapper;

describe('Sharing.vue', () => {
  beforeEach(() => {
    props = {
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
      global: {
        plugins: [i18n, Notifications],
        stubs: { BFormInput: true },
      },
      props,
    });

    wrapper.vm.$refs.fsModal.hide = jest.fn();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Emits "modifyResource" event', async () => {
    wrapper.vm.shareResource();

    await nextTick();

    expect(wrapper.emitted('modifyResource').length).toBe(1);
  });

  it('Emits "shareResource" event', async () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.shareResource();

    await nextTick();

    expect(wrapper.emitted('modifyResource').length).toBe(1);
  });

  it('Emits "renderUnshareModal" event', async () => {
    wrapper.vm.unshareAll();

    await nextTick();

    expect(wrapper.emitted('renderUnshareModal').length).toBe(1);
  });

  it('Emits "unshareOne" event', async () => {
    wrapper.vm.unshareOne('testUser');

    await nextTick();

    expect(wrapper.emitted('modifyResource').length).toBe(1);
  });

  it('Validates resource', () => {
    const spy = jest.spyOn(wrapper.vm, 'resetModal');

    wrapper.vm.newShare = 'shareWith';
    wrapper.vm.validateResource();

    expect(spy).toBeCalled();
  });

  it('Validates resource without policy', async () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.validateResource();

    await nextTick();

    expect(typeof wrapper.emitted()).toBe('object');
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
