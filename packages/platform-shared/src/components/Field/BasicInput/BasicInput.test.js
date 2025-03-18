/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as clipboard from 'clipboard-polyfill/text';
import * as AccessibilityUtils from '@forgerock/platform-shared/src/utils/accessibilityUtils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import Notifications from '@kyvg/vue3-notification';
import BasicInput from './index';
import i18n from '@/i18n';
import { findByTestId } from '../../../utils/testHelpers';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

const defaultProps = {
  name: 'stub-name',
  testid: 'stub-testid',
  autofocus: false,
  type: 'test',
  isRequiredAria: true,
};

describe('BasicInput', () => {
  function setup(props) {
    return mount(BasicInput, {
      global: {
        plugins: [i18n, Notifications],
      },
      attachTo: document.body,
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    describe('as number', () => {
      it('default', () => {
        const wrapper = setup({ type: 'number' });
        const input = findByTestId(wrapper, 'input-stub-testid');

        // has correct default classes
        expect(input.classes()).toContain('form-control');
        expect(input.classes()).not.toContain('polyfill-placeholder');
        expect(input.classes()).not.toContain('is-invalid');
        expect(input.classes()).not.toContain('text-truncate');

        expect(input.attributes('disabled')).toBeFalsy();
        expect(input.attributes('readonly')).toBeFalsy();
        expect(input.attributes('type')).toBe('text');
        expect(input.attributes('inputmode')).toBe('numeric');
        expect(input.attributes('pattern')).toBe('[0-9]*');
        expect(input.attributes('aria-required')).toBe('true');

        const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
        expect(showPasswordButton.exists()).toBeFalsy();

        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeFalsy();
      });

      describe('when placeholder', () => {
        it('when no floatLabel', async () => {
          const wrapper = setup({ type: 'number', floatingLabel: false, placeholder: 'stub-placeholder' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBe('stub-placeholder');
        });

        it('when floatLabel', async () => {
          const wrapper = setup({ type: 'number', placeholder: 'stub-placeholder', label: 'stub-label' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBeUndefined();

          const label = wrapper.find(`#floatingLabelInput${wrapper.vm._uid}-label`);
          expect(label.text()).toBe('stub-label');
        });
      });

      it('copy value button', () => {
        const wrapper = setup({
          type: 'number',
          copy: true,
        });
        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeTruthy();

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.classes()).toContain('text-truncate');
      });

      it('when disabled', () => {
        const wrapper = setup({ type: 'number', disabled: true });

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('disabled')).toBeDefined();
      });
    });

    describe('as text', () => {
      it('default', async () => {
        const createAriaDescribedByListSpy = jest.spyOn(AccessibilityUtils, 'createAriaDescribedByList');
        jest.useFakeTimers();
        const wrapper = setup({ autofocus: true });

        // Note: there is a manual delay when setting focus - to maintain consistency between browsers
        jest.advanceTimersByTime(600);
        expect(createAriaDescribedByListSpy).not.toHaveBeenCalled();
        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('id')).toBe(document.activeElement.id);

        // has correct default classes
        expect(input.classes()).toContain('form-control');
        expect(input.classes()).not.toContain('polyfill-placeholder');
        expect(input.classes()).not.toContain('is-invalid');
        expect(input.classes()).not.toContain('text-truncate');

        expect(input.attributes('disabled')).toBeFalsy();
        expect(input.attributes('readonly')).toBeFalsy();
        expect(input.attributes('type')).toBe('text');
        expect(input.attributes('aria-required')).toBe('true');

        const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
        expect(showPasswordButton.exists()).toBeFalsy();

        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeFalsy();
        jest.useRealTimers();

        // has is-invalid class when error
        await wrapper.setData({ errorMessages: 'Failed' });
        expect(input.classes()).toContain('is-invalid');
      });

      it('when given describedbyId', () => {
        const createAriaDescribedByListSpy = jest.spyOn(AccessibilityUtils, 'createAriaDescribedByList');
        const wrapper = setup({ describedbyId: 'stub-describedbyid' });
        expect(createAriaDescribedByListSpy).not.toHaveBeenCalled();

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('aria-describedby')).toBe('stub-describedbyid');
      });

      it('when describedbyId is not given', () => {
        const createAriaDescribedByListSpy = jest.spyOn(AccessibilityUtils, 'createAriaDescribedByList');
        const wrapper = setup();
        expect(createAriaDescribedByListSpy).not.toHaveBeenCalled();

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('aria-describedby')).toBeUndefined();
      });

      describe('when placeholder', () => {
        it('when no floatLabel', async () => {
          const wrapper = setup({ floatingLabel: false, placeholder: 'stub-placeholder' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBe('stub-placeholder');

          input.trigger('blur');

          expect(wrapper.emitted().blur[0]).toBeTruthy();
          expect(wrapper.vm.floatLabels).toBeFalsy();

          input.setValue('test');

          input.trigger('blur');
          expect(wrapper.emitted().blur[1]).toBeTruthy();
          expect(wrapper.vm.floatLabels).toBeFalsy();
        });

        it('when floatLabel', async () => {
          const wrapper = setup({ placeholder: 'stub-placeholder', label: 'stub-label' });
          await wrapper.vm.$nextTick();

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('placeholder')).toBeUndefined();

          const label = wrapper.find(`#floatingLabelInput${wrapper.vm._uid}-label`);
          expect(label.text()).toBe('stub-label');

          await input.trigger('blur');

          expect(wrapper.emitted().blur[0]).toBeTruthy();
          expect(wrapper.vm.floatLabels).toBeFalsy();

          await input.setValue('test');

          await input.trigger('blur');
          expect(wrapper.emitted().blur[1]).toBeTruthy();
          expect(wrapper.vm.floatLabels).toBeTruthy();
        });
      });

      it('copy value button', () => {
        const wrapper = setup({ copy: true });
        const copyValueButton = findByTestId(wrapper, 'btn-copy-stub-testid');
        expect(copyValueButton.exists()).toBeTruthy();
      });

      it('when disabled', () => {
        const wrapper = setup({ disabled: true });

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('disabled')).toBeDefined();
      });

      describe('when validation errors', () => {
        beforeEach(() => {
          jest.useFakeTimers();
        });

        afterEach(() => {
          jest.useRealTimers();
        });

        // Note: when an error occurs due to user input in the component.
        // TODO: If anyone can figure out how to get this test working properly, please do
        xit('when component errors', async () => {
          const createAriaDescribedByListSpy = jest.spyOn(AccessibilityUtils, 'createAriaDescribedByList');
          const wrapper = setup({ validation: 'required', errors: [] });

          const input = findByTestId(wrapper, 'input-stub-testid');

          // Note: this is due to how often the Field is computed, see: https://vee-validate.logaretm.com/v3/advanced/testing.html#testing-Field-debounced-state
          await flushPromises();
          jest.runAllTimers();
          expect(createAriaDescribedByListSpy).toHaveBeenCalledWith('stub-name', ['stub-name is not valid.']);

          expect(input.attributes('aria-describedby')).toBe('stub-name0-error');

          const error = findByTestId(wrapper, 'stub-name-validation-error-0');
          expect(error.text()).toBe('stub-name is not valid.');
        });

        // Note: when an error is provided to the component by its parent on load.
        it('when parent errors', async () => {
          const createAriaDescribedByListSpy = jest.spyOn(AccessibilityUtils, 'createAriaDescribedByList');
          const wrapper = setup({ validation: 'required', errors: ['parent error.'] });

          // Note: this is due to how often the Field is computed, see: https://vee-validate.logaretm.com/v3/advanced/testing.html#testing-Field-debounced-state
          await flushPromises();
          expect(createAriaDescribedByListSpy).toHaveBeenCalledWith('stub-name', ['parent error.']);

          const input = findByTestId(wrapper, 'input-stub-testid');
          expect(input.attributes('aria-describedby')).toBe('stub-name0-error');

          const error = findByTestId(wrapper, 'stub-name-validation-error-0');
          expect(error.text()).toBe('parent error.');
        });

        // Note: when an error is provided to the component by its parent on load and there is an error due to user input.
        it('when combined parent & component errors', async () => {
          const createAriaDescribedByListSpy = jest.spyOn(AccessibilityUtils, 'createAriaDescribedByList');
          const wrapper = setup({ validation: { required: true }, errors: ['parent error.'] });
          await flushPromises();

          const input = findByTestId(wrapper, 'input-stub-testid');

          expect(createAriaDescribedByListSpy).toHaveBeenCalledWith('stub-name', ['parent error.']);
          expect(input.attributes('aria-describedby')).toBe('stub-name0-error');

          await input.setValue('');
          await flushPromises();

          expect(createAriaDescribedByListSpy).toHaveBeenCalledWith('stub-name', ['parent error.', 'Please provide a value']);
          expect(input.attributes('aria-describedby')).toBe('stub-name0-error stub-name1-error');

          const firstError = findByTestId(wrapper, 'stub-name-validation-error-0');
          expect(firstError.text()).toBe('parent error.');

          const secondError = findByTestId(wrapper, 'stub-name-validation-error-1');
          expect(secondError.text()).toBe('Please provide a value');
        });
      });
    });

    describe('as password', () => {
      it('with show password button', () => {
        const wrapper = setup({ type: 'password' });
        const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');
        expect(showPasswordButton.exists()).toBeTruthy();
      });

      it('when disabled', () => {
        const wrapper = setup({ type: 'password', disabled: true });

        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.attributes('disabled')).toBeDefined();
      });
    });

    describe('passing through slots for the InputLayout component to render', () => {
      it('renders the prepend slot', () => {
        const wrapper = mount(BasicInput, {
          global: {
            plugins: [i18n],
          },
          props: {
            ...defaultProps,
          },
          slots: {
            prepend: '<span class="test_prepend">prepend</span>',
          },
        });

        expect(wrapper.find('.test_prepend').exists()).toBe(true);

        // When prepending, the input text should not be truncated
        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.classes()).not.toContain('text-truncate');
      });

      it('prepend & append slots', () => {
        const wrapper = mount(BasicInput, {
          global: {
            plugins: [i18n],
          },
          props: {
            ...defaultProps,
          },
          slots: {
            append: '<span class="test_append">append</span>',
          },
        });

        expect(wrapper.find('.test_append').exists()).toBe(true);

        // When appending, the input text should be truncated
        const input = findByTestId(wrapper, 'input-stub-testid');
        expect(input.classes()).toContain('text-truncate');
      });
    });

    it('as custom class', () => {
      const wrapper = mount(BasicInput, {
        global: {
          plugins: [i18n],
        },
        props: {
          ...defaultProps,
          inputClass: 'custom-class',
        },
      });

      expect(wrapper.find('.custom-class').exists()).toBe(true);
    });

    describe('aria-invalid validation', () => {
      it('does not add aria-invalid attribute if the component is not touched and is not validation immediate', async () => {
        const wrapper = setup();
        const input = findByTestId(wrapper, 'input-stub-testid');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBeUndefined();
      });

      it('aria-invalid attribute is false string if the component is touched and the field does not have validation issues', async () => {
        const wrapper = setup();
        const input = findByTestId(wrapper, 'input-stub-testid');
        await input.trigger('blur');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBe('false');
      });

      it('aria-invalid attribute is true string if the component is touched and the field has validation issues', async () => {
        const wrapper = setup({ validation: 'required' });
        const input = findByTestId(wrapper, 'input-stub-testid');
        await input.trigger('blur');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBe('true');
      });

      it('aria-invalid attribute is true string if the component is touched and the field has external validation issues', async () => {
        const wrapper = setup({ errors: ['please provide a valid value'] });
        const input = findByTestId(wrapper, 'input-stub-testid');
        await input.trigger('blur');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBe('true');
      });

      it('aria-invalid attribute is not present if the component is not touched and the field has external validation issues', async () => {
        const wrapper = setup({ errors: ['please provide a valid value'] });
        const input = findByTestId(wrapper, 'input-stub-testid');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBeUndefined();
      });

      it('aria-invalid attribute is true string if the component is not touched, the field is validated immediatly and the field has external validation issues', async () => {
        const wrapper = setup({ validationImmediate: true, errors: ['please provide a valid value'] });
        const input = findByTestId(wrapper, 'input-stub-testid');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBe('true');
      });

      it('aria-invalid attribute is true string if the component is not touched, the field is validated immediatly and the field has internal validation issues', async () => {
        const wrapper = setup({ validationImmediate: true, validation: 'required' });
        const input = findByTestId(wrapper, 'input-stub-testid');
        await flushPromises();
        expect(input.attributes('aria-invalid')).toBe('true');
      });
    });
  });

  describe('@actions', () => {
    it('should reveal password', async () => {
      const wrapper = setup({ type: 'password', label: 'My Input' });
      const input = findByTestId(wrapper, 'input-stub-testid');
      const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');

      expect(showPasswordButton.attributes('name')).toBe('revealButton');
      expect(input.attributes('type')).toBe('password');
      expect(showPasswordButton.attributes('aria-label')).toBe('Show My Input');

      await showPasswordButton.trigger('click');

      expect(input.attributes('type')).toBe('text');
      expect(showPasswordButton.attributes('aria-label')).toBe('Hide My Input');
    });

    it('should not reveal password when input is disabled', async () => {
      const wrapper = setup({
        disabled: true,
        type: 'password',
      });
      const input = findByTestId(wrapper, 'input-stub-testid');
      const showPasswordButton = findByTestId(wrapper, 'btn-show-password-stub-testid');

      expect(input.attributes('type')).toBe('password');
      await showPasswordButton.trigger('click');
      expect(input.attributes('type')).toBe('password');
    });

    it('should copy value to clipboard', async () => {
      jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.resolve());

      const wrapper = setup({ copy: true });
      const basicInputClipboardCopySpy = jest.spyOn(wrapper.vm, 'copyValueToClipboard');
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      expect(basicInputClipboardCopySpy).not.toHaveBeenCalled();
      expect(displayNotificationSpy).not.toHaveBeenCalled();

      const copyButton = findByTestId(wrapper, 'btn-copy-stub-testid');
      await copyButton.trigger('click');

      expect(basicInputClipboardCopySpy).toHaveBeenCalledTimes(1);
      expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Copied to your clipboard');
    });

    it('should display error when clipboard.writeText fails', async () => {
      const writeTextError = Error('Something went wrong.');
      jest.spyOn(clipboard, 'writeText').mockImplementation(() => Promise.reject(writeTextError));

      const wrapper = setup({ copy: true });
      const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
      expect(showErrorMessageSpy).not.toHaveBeenCalled();

      const copyButton = findByTestId(wrapper, 'btn-copy-stub-testid');
      await copyButton.trigger('click');

      expect(showErrorMessageSpy).toHaveBeenCalledWith(writeTextError, 'Failed to copy');
    });

    describe('when number field', () => {
      const testCases = [
        ['should allow input given numeric value', '583', '583'],
        ['should prevent input given non-numeric value', 'text', ''],
        ['should prevent input given non-numeric value after .', '.text', ''],
        ['should allow negative numbers', '-1', '-1'],
        ['should allow decimals', '1.1', '1.1'],
        ['should allow decimals with no leading number', '.1', '0.1'],
        ['should not leave trailing decimal', '1.', '1'],
        ['should clear out a single hyphen', '-', ''],
        ['should clear out an invalid input of -.', '-.', ''],
      ];
      it.each(testCases)('%s', async (name, value, expectedValue) => {
        const wrapper = setup({ type: 'number' });

        const input = findByTestId(wrapper, 'input-stub-testid');
        await input.setValue(value);
        await input.trigger('blur');
        await flushPromises();

        expect(input.element.value).toBe(expectedValue);
      });
    });
  });

  describe('@unit tests', () => {
    it('starts animation', async () => {
      const wrapper = setup({ label: 'test' });
      await flushPromises();

      wrapper.vm.$refs.input.matches = {
        call: () => true,
      };
      const input = findByTestId(wrapper, 'input-stub-testid');

      expect(input.classes()).not.toContain('polyfill-placeholder');
      expect(wrapper.vm.floatLabels).toBe(false);
      wrapper.vm.animationStart();
      expect(wrapper.vm.floatLabels).toBe(true);
      await wrapper.vm.$nextTick();

      expect(input.classes()).toContain('polyfill-placeholder');
    });

    it('given floatingLabel false, should not start animation', async () => {
      const wrapper = mount(BasicInput, {
        global: {
          plugins: [i18n],
        },
        props: {
          ...defaultProps,
          floatingLabel: false,
          testid: 'stub-testid',
        },
      });
      const animationStartSpy = jest.spyOn(wrapper.vm, 'animationStart');

      expect(wrapper.vm.floatLabels).toBe(false);
      findByTestId(wrapper, 'input-stub-testid').trigger('animationstart');
      expect(animationStartSpy).not.toHaveBeenCalled();
      expect(wrapper.vm.floatLabels).toBe(false);
    });

    it('should set floatLabels to false when inputValue is string', async () => {
      const wrapper = setup({ type: 'number', placeholder: 'stub-placeholder', label: 'stub-label' });
      await wrapper.vm.$nextTick();
      const input = findByTestId(wrapper, 'input-stub-testid');
      input.setValue('test');
      input.trigger('blur');
      expect(wrapper.vm.floatLabels).toBe(false);
    });

    it('should set floatLabels to true when inputValue is number', async () => {
      const wrapper = setup({ type: 'number', placeholder: 'stub-placeholder', label: 'stub-label' });
      await wrapper.vm.$nextTick();
      const input = findByTestId(wrapper, 'input-stub-testid');
      input.setValue(1);
      input.trigger('blur');
      expect(wrapper.vm.floatLabels).toBe(true);
    });

    it('should seet floatLabels to false when inputValue is empty string', async () => {
      const wrapper = setup({ type: 'number', placeholder: 'stub-placeholder', label: 'stub-label' });
      await wrapper.vm.$nextTick();
      const input = findByTestId(wrapper, 'input-stub-testid');
      input.setValue('');
      input.trigger('blur');
      expect(wrapper.vm.floatLabels).toBe(false);
    });
  });
});
