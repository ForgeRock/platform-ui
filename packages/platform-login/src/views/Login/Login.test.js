/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Login from './index';

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    meta: { hideToolbar: true },
    params: {
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Login, {
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
        $t: () => {},
      },
      methods: {
        nextStep() {},
      },
    });
  });

  it('Load login component', () => {
    expect(wrapper.name()).toEqual('Login');
  });
});
