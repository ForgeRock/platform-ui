/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ResetSecretField from './index';

let wrapper;

beforeEach(() => {
  wrapper = mount(ResetSecretField, {
    mocks: {
      $t: () => {},
    },
  });
});

describe('Reset secret field', () => {
  it('Reset secret field successfully loaded', () => {
    expect(wrapper.name()).toEqual('ResetSecretField');
  });
});
