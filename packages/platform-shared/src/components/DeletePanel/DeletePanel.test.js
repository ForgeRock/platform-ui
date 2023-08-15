/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import DeletePanel from './index';

describe('DeletePanel', () => {
  it('DeletePanel successfully loaded', () => {
    const wrapper = shallowMount(DeletePanel, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        isDeleting: true,
      },
    });

    expect(wrapper.vm.isDeleting).toEqual(true);
  });
});
