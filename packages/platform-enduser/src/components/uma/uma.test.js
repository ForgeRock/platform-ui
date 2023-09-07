/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import Uma from '@/components/uma';

let wrapper;

describe('uma.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(Uma, {
      global: {
        mocks: {
          $bvModal: {
            show: jest.fn(),
          },
        },
        plugins: [i18n, BootstrapVue, Notifications],
      },
    });
    jest.spyOn(wrapper.vm, 'getRequestService').mockReturnValue({
      get: () => Promise.resolve(),
      put: () => Promise.resolve(),
      post: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Emits "renderShareModal" event', async () => {
    wrapper.vm.$emit('renderShareModal');

    expect(wrapper.emitted().renderShareModal.length).toBe(1);

    wrapper.vm.renderShareModal();

    await nextTick();

    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('shareModal');
  });

  it('Emits "renderUnshareModal" event', async () => {
    wrapper.vm.$emit('renderUnshareModal');

    expect(wrapper.emitted().renderUnshareModal.length).toBe(1);

    wrapper.vm.renderUnshareModal();

    await nextTick();

    expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('unshareModal');
  });
});
