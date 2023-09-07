/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import i18n from '@/i18n';
import Resources from '@/components/uma/Resources';

describe('Sharing.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Resources, {
      global: {
        plugins: [i18n],
      },
      props: {
        viewgrid: false,
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Emits "renderShareModal" event', async () => {
    wrapper.vm.renderShareModal();

    await nextTick();

    expect(wrapper.emitted('renderShareModal').length).toBe(1);
  });

  it('Emits "renderUnshareModal" event', async () => {
    wrapper.vm.renderUnshareModal();

    await nextTick();

    expect(wrapper.emitted('renderUnshareModal').length).toBe(1);
  });

  it('Toggles grid view', async () => {
    expect(wrapper.vm.viewgrid).toBe(false);

    wrapper.vm.toggleGrid();

    await nextTick();

    expect(wrapper.vm.viewgrid).toBe(true);
  });
});
