/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ListItem from './index';

describe('ListItem Component', () => {
  it('ListItem successfully loaded', () => {
    const wrapper = shallowMount(ListItem, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });

    expect(wrapper.vm.id).toEqual('listItem3');
  });
});
