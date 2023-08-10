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
        ],
      },
      i18n,
      propsData: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('determining where to place the ESV dropdown', () => {
    it.each`
      fieldType     | expectedDropdownWithinInput
      ${'string'}   | ${true}
      ${'text'}     | ${true}
      ${'password'} | ${true}
      ${'number'}   | ${true}
      ${'integer'}  | ${true}
      ${'checkbox'} | ${false}
      `('Given the field type $fieldType', ({ fieldType, expectedDropdownWithinInput }) => {
        const wrapper = setup({ type: fieldType });
        expect(wrapper.vm.dropdownWithinInput).toBe(expectedDropdownWithinInput);
    });
  });

  describe('handles selected placeholder', () => {
    it.each`
      fieldType     | placeholder         | expectedEmit
      ${'string'}   | ${'&{esv.string}'}  | ${{ $string: '&{esv.string}' }}
      ${'text'}     | ${'&{esv.string}'}  | ${{ $string: '&{esv.string}' }}
      ${'password'} | ${'&{esv.string}'}  | ${{ $string: '&{esv.string}' }}
      ${'checkbox'} | ${'&{esv.boolean}'} | ${{ $bool: '&{esv.boolean}' }}
      ${'boolean'}  | ${'&{esv.boolean}'} | ${{ $bool: '&{esv.boolean}' }}
      ${'integer'}  | ${'&{esv.integer}'} | ${{ $int: '&{esv.integer}' }}
      ${'number'}   | ${'&{esv.number}'}  | ${{ $number: '&{esv.number}' }}
      ${'integer'}  | ${'&{esv.integer}'} | ${{ $int: '&{esv.integer}' }}
      `('Given the field type $fieldType and placeholder $placeholder', ({ fieldType, placeholder, expectedEmit }) => {
        const wrapper = setup({ type: fieldType, originalType: fieldType });
        expect(wrapper.emitted().input).toBeFalsy();
        wrapper.vm.handlePlaceholderEntered(placeholder);
        wrapper.vm.$nextTick();
        expect(wrapper.emitted().input).toEqual([[expectedEmit]]);
    });
  });
});
