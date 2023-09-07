/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import StateCard from './index';

describe('StateCard', () => {
  const wrapper = shallowMount(StateCard, {
    global: {
      mocks: { $t: () => {} },
    },
    props: { enabled: false },
  });

  it('Emits change event with new value', () => {
    wrapper.vm.changeState(true);
    expect(wrapper.emitted().change).toBeTruthy();
    expect(wrapper.emitted().change[0][0]).toBeTruthy();
  });
});
