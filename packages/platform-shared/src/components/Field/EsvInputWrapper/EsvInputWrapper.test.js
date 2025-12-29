/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */

import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import EsvInputWrapper from './index';
import i18n from '@/i18n';

mockValidation();

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
      attachTo: document.body,
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
      wrapper.unmount();
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
      wrapper.unmount();
    });
  });

  describe('inputValueHandler intercepts placeholder values', () => {
    it('should intercept and coerce placeholder values when they contain ESV placeholders', async () => {
      const wrapper = setup({ type: 'string', originalType: 'string' });
      const placeholderValue = '&{esv.string}';

      // Spy on inputValueHandler and then call it by directly emitting from the wrapper's child
      // This simulates the inner component emitting an input event
      const inputValueHandlerSpy = jest.spyOn(wrapper.vm, 'inputValueHandler');

      // Simulate the inner component emitting by triggering the handler bound via v-on
      // Ideally, we would trigger an emit on the inner component, but this is proving difficult due to veeValidate
      wrapper.vm.inputValueHandler(placeholderValue);
      await flushPromises();

      expect(inputValueHandlerSpy).toHaveBeenCalledWith(placeholderValue);
      const emittedInput = wrapper.emitted().input;
      expect(emittedInput).toBeTruthy();
      expect(emittedInput[0][0]).toEqual({ $string: '&{esv.string}' });

      wrapper.unmount();
    });

    it('should pass through regular values without interception', async () => {
      const wrapper = setup({ type: 'string', originalType: 'string' });
      const regularValue = 'regular input value';

      // Spy on inputValueHandler and then call it by directly emitting from the wrapper's child
      const inputValueHandlerSpy = jest.spyOn(wrapper.vm, 'inputValueHandler');

      // Simulate the inner component emitting by triggering the handler bound via v-on
      // Ideally, we would trigger an emit on the inner component, but this is proving difficult due to veeValidate
      wrapper.vm.inputValueHandler(regularValue);
      await flushPromises();

      expect(inputValueHandlerSpy).toHaveBeenCalledWith(regularValue);
      const emittedInput = wrapper.emitted().input;
      expect(emittedInput).toBeTruthy();
      expect(emittedInput[0][0]).toBe('regular input value');

      wrapper.unmount();
    });

    it('should handle array values with placeholders by extracting the first element', async () => {
      const wrapper = setup({ type: 'tag', originalType: 'array', innerComponent: 'FrTag' });
      const placeholderValue = '&{esv.array}';

      // Spy on inputValueHandler and then call it with an array value
      const inputValueHandlerSpy = jest.spyOn(wrapper.vm, 'inputValueHandler');

      // Simulate the FrTag component emitting an array value
      // Ideally, we would trigger an emit on the inner component, but this is proving difficult due to veeValidate
      wrapper.vm.inputValueHandler([placeholderValue]);
      await flushPromises();

      expect(inputValueHandlerSpy).toHaveBeenCalledWith([placeholderValue]);
      const emittedInput = wrapper.emitted().input;
      expect(emittedInput).toBeTruthy();
      expect(emittedInput[0][0]).toEqual({ $array: '&{esv.array}' });

      wrapper.unmount();
    });
  });
});
