/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Unshare from '@/components/uma/Unshare';

describe('Unshare.vue', () => {
  let wrapper;
  const props = {
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
      global: {
        plugins: [i18n],
      },
      props,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Emits "unshareResource" event', async () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.unshare('12345');

    await nextTick();

    expect(wrapper.emitted('unshareResource').length).toBe(1);
  });
});
