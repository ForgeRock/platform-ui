/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { noop } from 'lodash';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import ValidationError from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ValidationError.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ValidationError, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        localVue,
        validatorErrors: {
          has: noop,
          first: noop,
        },
        fieldName: 'test',
      },
    });
  });

  it('Validation Error component loaded', () => {
    expect(wrapper.name()).toEqual('ValidationErrorList');
  });
});
