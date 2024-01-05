/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';
import useBvModal from './bvModal';

jest.mock('vue', () => ({
  ...jest.requireActual('vue'),
  getCurrentInstance: jest.fn(() => ({
    ctx: {
      _bv__modal: 'bvModal',
    },
  })),
}));

describe('useBvModal', () => {
  const testComponent = defineComponent({
    template: '',
    setup() {
      return {
        ...useBvModal(),
      };
    },
  });

  it('expect to set the value with the instance', async () => {
    const wrapper = mount(testComponent);
    await flushPromises();
    expect(wrapper.vm.bvModal).toBe('bvModal');
  });
});
