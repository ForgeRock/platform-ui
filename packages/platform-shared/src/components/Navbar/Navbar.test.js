/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, createLocalVue } from '@vue/test-utils';
import Navbar from './index';

describe('Navbar Component', () => {
  let wrapper = null;

  beforeEach(() => {
    const localVue = createLocalVue();
    wrapper = shallowMount(Navbar, {
      localVue,
      mocks: {
        $t: () => {},
        $store: {
          state: {
            userId: 'foo',
            UserStore: {
              adminUser: false,
            },
          },
        },
      },
      stubs: ['RouterLink'],
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.vm.profileImage).toEqual(null);
  });
});
