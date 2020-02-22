/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import FrField from './index';

describe('FrField.vue', () => {
  let wrapper;
  const requiredTest = 'RequiredTest';
  const AtLeastMinimumTest = 'AtLeastMinimumTest';
  beforeEach(() => {
    wrapper = shallowMount(FrField, {
      mocks: {
        $t: (key) => {
          const map = {
            'common.required': requiredTest,
            'trees.editPanel.minimumRequired': AtLeastMinimumTest,
          };
          return map[key];
        },
      },
      propsData: {
        schema: {
          properties: {},
        },
      },
    });
  });

  it('Checks for field errors', () => {
    const field = {
      required: true,
      enum: true,
      type: 'array',
      key: 'fieldName',
      value: '',
      minItems: 2,
      validation: 'required',
    };
    // Will need to interact with floatinglabelinput field to test other types
    wrapper.vm.checkRequiredInput(field);
    expect(wrapper.vm.errors).toEqual([AtLeastMinimumTest]);
    field.type = 'object';
    wrapper.vm.checkRequiredInput(field);
    expect(wrapper.vm.errors).toEqual([AtLeastMinimumTest]);
    field.type = '';
    wrapper.vm.checkRequiredInput(field);
    expect(wrapper.vm.errors).toEqual([]);
  });
});
