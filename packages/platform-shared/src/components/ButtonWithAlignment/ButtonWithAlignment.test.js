/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ButtonWithAlignment from './index';

describe('ButtonWithAlignment', () => {
  it('ButtonWithAlignment successfully loaded', () => {
    const wrapper = shallowMount(ButtonWithAlignment, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('ButtonWithAlignment');
  });
});
