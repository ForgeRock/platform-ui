/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Unshare from '@/components/uma/Unshare';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Unshare.vue', () => {
  let wrapper;
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
      },
    },
    newScopes: {},
    newShare: false,
  };

  beforeEach(() => {
    wrapper = shallowMount(Unshare, {
      localVue,
      i18n,
      propsData,
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('Emits "unshareResource" event', () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.unshare('12345');

    localVue.nextTick(() => {
      expect(wrapper.emitted('unshareResource').length).toBe(1);
    });
  });
});
