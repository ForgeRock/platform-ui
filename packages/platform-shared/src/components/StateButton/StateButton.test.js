/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import StateButton from './index';

describe('StateButton', () => {
  it('StateButton successfully loaded', () => {
    const wrapper = shallowMount(StateButton, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });

    expect(wrapper.vm.active).toEqual(false);
  });
});
