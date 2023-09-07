/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ButtonWithSpinner from './index';

describe('ButtonWithSpinner', () => {
  it('ButtonWithSpinner successfully loaded', () => {
    const wrapper = shallowMount(ButtonWithSpinner, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        disabled: true,
      },
    });

    expect(wrapper.vm.disabled).toEqual(true);
  });
});
