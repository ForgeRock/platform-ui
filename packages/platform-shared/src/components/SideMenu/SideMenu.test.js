/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import SideMenu from './index';

describe('SideMenu Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(SideMenu, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
      },
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.vm.dropdownItems).toStrictEqual([]);
  });
});
