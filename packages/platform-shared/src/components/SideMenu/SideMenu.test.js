/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { shallowMount } from '@vue/test-utils';
import SideMenu from './index';

describe('SideMenu Component', () => {
  let wrapper;
  beforeEach(() => {
    setupTestPinia({ theme: { theme: {} } });
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
