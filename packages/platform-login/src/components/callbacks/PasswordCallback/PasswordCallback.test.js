/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import PasswordCallback from '@/components/callbacks/PasswordCallback';

let wrapper;

describe('PasswordCallback', () => {
  function mountComponent(label) {
    wrapper = mount(PasswordCallback, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        name: 'testField',
        type: 'password',
        label,
        value: '',
      },
    });
  }

  describe('successfully loaded', () => {
    it('PasswordCallback successfully loaded', () => {
      mountComponent('What\'s your favorite color?');
      expect(wrapper.find('.password-field').exists()).toEqual(true);
    });
  });
});
