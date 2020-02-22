/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
    expect(wrapper).toMatchSnapshot();
  });
});
