/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import ReadonlyPlaceholderInput from './index';
import i18n from '@/i18n';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

const defaultProps = {
  name: 'name',
  autofocus: false,
  validation: 'required',
  'validation-immediate': true,
};

describe('ReadonlyPlaceholderInput', () => {
  function setup(props, provide) {
    return mount(ReadonlyPlaceholderInput, {
      global: {
        plugins: [i18n],
        provide,
      },
      attachTo: document.body,
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('shows a string placeholder value as-is in a readonly text input', async () => {
      const wrapper = setup({ value: '&{esv-test}' });
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBe('');
      expect(input.element.value).toBe('&{esv-test}');
    });

    it('shows the placeholder key from an object value in a readonly text input', async () => {
      const wrapper = setup({ value: { $string: '&{esv-fromobject}' } });
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBe('');
      expect(input.element.value).toBe('&{esv-fromobject}');
    });

    it('Adds text-truncate class to input when in a readonly text input', async () => {
      const wrapper = setup({ value: '&{esv-test}' });
      const input = wrapper.find('input');
      expect(input.classes().includes('text-truncate')).toBeTruthy();
    });

    it('shows a clear button on the field', async () => {
      const wrapper = setup({ value: '&{esv-test}' });
      await wrapper.vm.$nextTick();

      const clearButton = wrapper.find('button').element;
      expect(clearButton).toBeVisible();
    });

    it('hides clear button on the field when showClearField set to false', async () => {
      const wrapper = setup({ value: '&{esv-test}' }, { showClearField: false });
      await wrapper.vm.$nextTick();

      const clearButton = wrapper.find('button');
      expect(clearButton.exists()).toBeFalsy();
    });
  });

  describe('@actions', () => {
    it('should clear the input value when the clear button is clicked', async () => {
      const wrapper = setup({ value: '&{esv-test}' });
      await wrapper.vm.$nextTick();

      const clearButton = wrapper.find('button');
      clearButton.trigger('click');
      expect(wrapper.emitted().input).toStrictEqual([['']]);
    });
  });
});
