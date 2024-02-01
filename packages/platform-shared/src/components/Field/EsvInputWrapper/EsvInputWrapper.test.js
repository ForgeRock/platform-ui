/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */

import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import EsvInputWrapper from './index';
import i18n from '@/i18n';

const defaultProps = {
  name: 'stub-name',
  innerComponent: 'FrBasicInput',
  testid: 'stub-testid',
  autofocus: false,
  type: 'string',
  originalType: 'string',
};

describe('EsvInputWrapper', () => {
  function setup(props) {
    return mount(EsvInputWrapper, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              esvInput: { secrets: [], variables: [] },
            },
          }),
          i18n,
        ],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('determining where to place the ESV dropdown', () => {
    const testCases = [
      ['given the field type string', 'string', true],
      ['given the field type text', 'text', true],
      ['given the field type password', 'password', true],
      ['given the field type number', 'number', true],
      ['given the field type integer', 'integer', true],
      ['given the field type select', 'select', true],
      ['given the field type checkbox', 'checkbox', false],
    ];

    it.each(testCases)('%s', (name, fieldType, expectedDropdownWithinInput) => {
      const wrapper = setup({ type: fieldType });
      expect(wrapper.vm.dropdownWithinInput).toBe(expectedDropdownWithinInput);
    });
  });

  describe('handles selected placeholder', () => {
    const testCases = [
      ['given the field type string', 'string', '&{esv.string}', { $string: '&{esv.string}' }],
      ['given the field type text', 'text', '&{esv.string}', { $string: '&{esv.string}' }],
      ['given the field type password', 'password', '&{esv.string}', { $string: '&{esv.string}' }],
      ['given the field type select', 'select', '&{esv.string}', { $string: '&{esv.string}' }],
      ['given the field type checkbox', 'checkbox', '&{esv.boolean}', { $bool: '&{esv.boolean}' }],
      ['given the field type boolean', 'boolean', '&{esv.boolean}', { $bool: '&{esv.boolean}' }],
      ['given the field type integer', 'integer', '&{esv.integer}', { $int: '&{esv.integer}' }],
      ['given the field type number', 'number', '&{esv.number}', { $number: '&{esv.number}' }],
    ];

    it.each(testCases)('%s', (name, fieldType, placeholder, expectedEmit) => {
      const wrapper = setup({ type: fieldType, originalType: fieldType });
      expect(wrapper.emitted().input).toBeFalsy();
      wrapper.vm.handlePlaceholderEntered(placeholder);
      wrapper.vm.$nextTick();
      expect(wrapper.emitted().input).toEqual([[expectedEmit]]);
    });
  });
});
