/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import PolicyPasswordInput from './index';

const localVue = createLocalVue();

PolicyPasswordInput.mounted = jest.fn();
describe('PasswordPolicyInput.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(PolicyPasswordInput, {
      localVue,
      sync: false,
      mocks: {
        $t: () => {},
        $store: {
          state: {},
        },
      },
      propsData: {
        resourceType: 'managed',
        resourceName: 'user',
      },
    });
  });

  describe('proper render', () => {
    it('should load the page', () => {
      expect(wrapper.vm.resourceType).toBe('managed');
    });
  });
});
