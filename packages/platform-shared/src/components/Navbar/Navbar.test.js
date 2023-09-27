/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import Navbar from './index';

describe('Navbar Component', () => {
  let wrapper = null;

  beforeEach(() => {
    setupTestPinia();
    wrapper = shallowMount(Navbar, {
      mocks: {
        $t: () => {},
        $store: {
          state: {},
        },
      },
      stubs: ['RouterLink'],
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.vm.profileImage).toEqual('');
  });
});
