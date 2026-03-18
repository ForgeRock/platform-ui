/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { defineRule, Form as VeeForm } from 'vee-validate';
import { required } from '@vee-validate/rules';
import TelephoneInput from './TelephoneInput';
import { runA11yTest } from '../../utils/testHelpers';

defineRule('required', required);
const INPUT_SELECTOR = 'input[type="tel"]';
describe('TelephoneInput Component', () => {
  let wrapper;

  const setupMount = (props = {}) => mount(TelephoneInput, {
    attachTo: document.body,
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
    props: {
      ...props,
    },
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
    document.body.innerHTML = '';
  });

  describe('@a11y', () => {
    it('should have no accessibility violations', async () => {
      wrapper = await setupMount({ label: 'Phone Number' });
      await flushPromises();

      // Wait for intl-tel-input library to fully initialize
      if (wrapper.vm.telephoneInputInstance?.promise) {
        await wrapper.vm.telephoneInputInstance.promise;
      }

      await runA11yTest(wrapper);
    }, 15000);
    it('should have aria-label for country dropdown', async () => {
      wrapper = await setupMount({ label: 'Phone Number' });
      await flushPromises();

      // Wait for intl-tel-input library to fully initialize
      if (wrapper.vm.telephoneInputInstance?.promise) {
        await wrapper.vm.telephoneInputInstance.promise;
      }

      const countryDropdown = wrapper.element.querySelector('.iti__country-container .iti__dropdown-content[role="dialog"]');
      expect(countryDropdown).toBeTruthy();
      expect(countryDropdown.getAttribute('aria-label')).toBe('Select country code');
    }, 15000);
  });

  it('renders InputLayout component with a label for a fallback id', async () => {
    wrapper = await setupMount({ label: 'Phone Number' });
    expect(wrapper.findComponent({ name: 'InputLayout' }).exists()).toBe(true);
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.attributes('for')).toMatch(/^floatingLabelInput/);
  });

  it('renders InputLayout component with given props', async () => {
    const props = {
      id: 'test-id',
      name: 'test-name',
      description: 'Test description',
      label: 'Test Label',
    };
    wrapper = await setupMount(props);

    const inputLayout = wrapper.find('div.w-100');
    expect(inputLayout.exists()).toBe(true);

    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.attributes('for')).toBe(props.id);

    const description = wrapper.find('small');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe(props.description);
  });

  it('renders input element correctly and has a fallback id', () => {
    wrapper = setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    expect(input.exists()).toBe(true);
    expect(input.attributes('id')).toMatch(/^floatingLabelInput/);
  });

  it('renders input element with provided id', async () => {
    wrapper = await setupMount({ id: 'test-id' });
    const input = wrapper.find(INPUT_SELECTOR);
    expect(input.exists()).toBe(true);
    expect(input.attributes('id')).toBe('test-id');
  });

  it('correctly sets initial value for the input', async () => {
    wrapper = await setupMount({ value: '+12345678900' });
    const input = wrapper.find(INPUT_SELECTOR);
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe('234-567-8900');
  });

  it('should initialize intlTelInput on mount', async () => {
    wrapper = await setupMount();
    expect(wrapper.vm.telephoneInputInstance).toBeDefined();
  });

  it('should emit `input` event when the input changes', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    await input.setValue('+19725551234');
    await input.trigger('blur');
    await flushPromises();
    expect(wrapper.emitted().input).toBeTruthy();
  });

  it('should emit `input` event on blur when the input value is valid', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    await input.setValue('+12546579464');
    await input.trigger('blur');
    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().input[0][0]).toBe('+12546579464');
  });

  it('should not emit `input` event on blur when the input value is invalid', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    await input.setValue('+123');
    await input.trigger('blur');
    expect(wrapper.emitted().input).toBeFalsy();
  });

  it('should show error message when the input value is invalid on blur', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    await input.setValue('+123');
    await input.trigger('blur');
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('The telephone number is too short');
  });

  it('should accept a number that is possible but not pattern-valid', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    // +11213131313 has a plausible length but is not an allocated NANP number. The client
    // deliberately does not enforce pattern precision (metadata staleness risk); such numbers
    // are accepted here and left to the backend's valid-phone-format policy to reject on save.
    await input.setValue('+11213131313');
    await input.trigger('blur');
    await flushPromises();
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(false);
    expect(wrapper.emitted().input[0][0]).toBe('+11213131313');
  });

  it('should reject a number whose digits would be silently dropped by canonicalization', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    // +112345678900 parses as a valid NANP number with a trunk prefix (+1 1 2345678900);
    // libphonenumber considers it valid, but getNumber() silently drops the extra digit and
    // returns +12345678900, so the saved value would differ from the displayed input.
    await input.setValue('+112345678900');
    await input.trigger('blur');
    await flushPromises();
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(wrapper.emitted().input).toBeFalsy();
  });

  it('should reject a number whose leading digit would be silently dropped by canonicalization', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    // +3800021313131 auto-selects Ukraine (+380); the displayed national digits are 0021313131
    // (10 digits), but getNumber() drops a leading zero and returns +380021313131 (9 digits),
    // so the saved value would differ from the displayed input.
    await input.setValue('+3800021313131');
    await input.trigger('blur');
    await flushPromises();
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(wrapper.emitted().input).toBeFalsy();
  });

  it('should update country code field when the country code is changed', async () => {
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);

    const countryButton = input.element.parentElement.querySelector('.iti__selected-country');
    countryButton.click();

    const countryOptions = document.querySelectorAll('.iti__country');
    countryOptions[1].click();
    await flushPromises();

    expect(input.element.parentElement.querySelector('.iti__selected-dial-code').textContent).toBe('+358');

    countryButton.click();
    countryOptions[0].click();
    await flushPromises();

    expect(input.element.parentElement.querySelector('.iti__selected-dial-code').textContent).toBe('+93');
  });

  it('should fallback to first error message when error code is out of bound', async () => {
    wrapper = await setupMount();
    wrapper.vm.telephoneInputInstance.getValidationError = jest.fn(() => 10); // Return an out-of-bounds error code
    const input = wrapper.find(INPUT_SELECTOR);
    await input.setValue('+123');
    await input.trigger('blur');
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Please enter a valid telephone number');
    jest.fn().mockRestore();
  });

  it('should invalidate input and show required error message when the field is required and left empty on blur', async () => {
    wrapper = await setupMount({ validation: { required: true } });
    const input = wrapper.find(INPUT_SELECTOR);
    await input.trigger('blur');
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Please provide a value');
    wrapper.unmount();

    wrapper = await setupMount({ validation: 'required' });
    const input2 = wrapper.find(INPUT_SELECTOR);
    await input2.trigger('blur');
    const errorMessage2 = wrapper.find('.error-message');
    expect(errorMessage2.exists()).toBe(true);
    expect(errorMessage2.text()).toBe('Please provide a value');

    wrapper.unmount();

    wrapper = await setupMount({ isRequiredAria: true });
    const input3 = wrapper.find(INPUT_SELECTOR);
    await input3.trigger('blur');
    const errorMessage3 = wrapper.find('.error-message');
    expect(errorMessage3.exists()).toBe(true);
    expect(errorMessage3.text()).toBe('Please provide a value');
  });

  it('should clear the field when value prop is reset to empty string', async () => {
    wrapper = await setupMount({ value: '+12345678900' });
    const input = wrapper.find(INPUT_SELECTOR);
    expect(input.element.value).toBeTruthy();

    await wrapper.setProps({ value: '' });
    await flushPromises();
    expect(input.element.value).toBe('');
  });

  it('should modify the input value when props.value changes', async () => {
    wrapper = await setupMount({ value: '+12345678902' });
    const input = wrapper.find(INPUT_SELECTOR);

    // code 1 is used for national number by the intl-tel-input plugin, so the full number should contain the input value
    expect(wrapper.vm.telephoneInputInstance.getNumber(1)).toContain(input.element.value);

    // on change, watcher should update the input value
    await wrapper.setProps({ value: '+12546579464' });
    expect(wrapper.vm.telephoneInputInstance.getNumber(1)).toContain(input.element.value);
  });

  it('should mark input as disabled when disabled prop is true', async () => {
    wrapper = await setupMount({ disabled: true });
    const input = wrapper.find(INPUT_SELECTOR);
    expect(input.attributes('disabled')).toBeDefined();
  });

  it('sets label position based on selected country width when focused', async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const targetSelector = 'iti__selected-country-primary';
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        // If the element calling .offsetWidth has this class, return 100
        if (this.classList.contains(targetSelector)) {
          return 100;
        }
        return 0;
      },
    });
    const div = document.createElement('div');
    div.className = targetSelector;

    document.body.appendChild(div);

    wrapper = await setupMount();
    await flushPromises();
    const input = wrapper.find(INPUT_SELECTOR);
    await input.trigger('focus');
    expect(wrapper.vm.labelLeftPosition).toBe('100px');
    if (originalDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalDescriptor);
    } else {
      // If there was no descriptor (unlikely in JSDOM), just delete our mock
      delete HTMLElement.prototype.offsetWidth;
    }
  });

  it('sets label position based on country container width when blurred', async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const targetSelector = 'iti__country-container';
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        // If the element calling .offsetWidth has this class, return 100
        if (this.classList.contains(targetSelector)) {
          return 100;
        }
        return 0;
      },
    });
    wrapper = await setupMount();
    const input = wrapper.find(INPUT_SELECTOR);
    const inputParent = input.element.parentElement;
    const countryContainer = document.createElement('div');
    countryContainer.className = targetSelector;

    inputParent.appendChild(countryContainer);

    await input.trigger('blur');
    expect(wrapper.vm.labelLeftPosition).toBe('96px');
    if (originalDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalDescriptor);
    } else {
      // If there was no descriptor (unlikely in JSDOM), just delete our mock
      delete HTMLElement.prototype.offsetWidth;
    }
  });

  it('should destroy intlTelInput instance on unmount', async () => {
    wrapper = await setupMount();
    const destroySpy = jest.spyOn(wrapper.vm.telephoneInputInstance, 'destroy');
    wrapper.unmount();
    expect(destroySpy).toHaveBeenCalled();
  });

  describe('aria-required', () => {
    it('is not set when no required validation is provided', async () => {
      wrapper = await setupMount();
      const input = wrapper.find(INPUT_SELECTOR);
      expect(input.attributes('aria-required')).toBeUndefined();
    });

    it('is true when isRequiredAria prop is true', async () => {
      wrapper = await setupMount({ isRequiredAria: true });
      const input = wrapper.find(INPUT_SELECTOR);
      expect(input.attributes('aria-required')).toBe('true');
    });

    it('is true when validation object has required: true', async () => {
      wrapper = await setupMount({ validation: { required: true } });
      const input = wrapper.find(INPUT_SELECTOR);
      expect(input.attributes('aria-required')).toBe('true');
    });

    it('is true when validation string includes "required"', async () => {
      wrapper = await setupMount({ validation: 'required' });
      const input = wrapper.find(INPUT_SELECTOR);
      expect(input.attributes('aria-required')).toBe('true');
    });
  });

  describe('aria-describedby', () => {
    it('is not set when there are no errors and no describedbyId', async () => {
      wrapper = await setupMount({ name: 'test-phone' });
      const input = wrapper.find(INPUT_SELECTOR);
      await flushPromises();
      expect(input.attributes('aria-describedby')).toBeUndefined();
    });

    it('uses describedbyId when provided and no errors are present', async () => {
      wrapper = await setupMount({ name: 'test-phone', describedbyId: 'external-hint' });
      const input = wrapper.find(INPUT_SELECTOR);
      await flushPromises();
      expect(input.attributes('aria-describedby')).toBe('external-hint');
    });

    it('points to error element ids when there are validation errors', async () => {
      wrapper = await setupMount({ name: 'test-phone', errors: ['Some error'] });
      const input = wrapper.find(INPUT_SELECTOR);
      await flushPromises();
      expect(input.attributes('aria-describedby')).toBe('test-phone0-error');
    });
  });

  describe('aria-invalid', () => {
    it('is not present before the field is touched', async () => {
      wrapper = await setupMount();
      const input = wrapper.find(INPUT_SELECTOR);
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBeUndefined();
    });

    it('is "false" after blur with a valid input', async () => {
      wrapper = await setupMount();
      const input = wrapper.find(INPUT_SELECTOR);
      await input.setValue('+12546579464');
      await input.trigger('blur');
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBe('false');
    });

    it('is "true" after blur with an invalid input', async () => {
      wrapper = await setupMount();
      const input = wrapper.find(INPUT_SELECTOR);
      await input.setValue('+123');
      await input.trigger('blur');
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBe('true');
    });

    it('is "true" after blur when external errors are present', async () => {
      wrapper = await setupMount({ errors: ['External error'] });
      const input = wrapper.find(INPUT_SELECTOR);
      await input.trigger('blur');
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBe('true');
    });

    it('is not present before blur even when external errors are present', async () => {
      wrapper = await setupMount({ errors: ['External error'] });
      const input = wrapper.find(INPUT_SELECTOR);
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBeUndefined();
    });

    it('is "true" when validationImmediate is true and field has errors', async () => {
      wrapper = await setupMount({ validationImmediate: true, errors: ['Immediate error'] });
      const input = wrapper.find(INPUT_SELECTOR);
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBe('true');
    });

    it('is "true" when ariaInvalid prop is true and field is touched', async () => {
      wrapper = await setupMount({ ariaInvalid: true });
      const input = wrapper.find(INPUT_SELECTOR);
      await input.setValue('+12546579464');
      await input.trigger('blur');
      await flushPromises();
      expect(input.attributes('aria-invalid')).toBe('true');
    });
  });

  describe('Wrapper <Form> re-validation', () => {
    // A minimal host so `this.$refs.observer.validate()` (the pattern used by consumers such as
    // ObjectTypeEditor's saveResource()) can be exercised the same way a real parent form uses it.
    const FormHost = {
      components: { VeeForm, TelephoneInput },
      props: {
        value: { type: String, default: '' },
        validation: { type: [Object, String], default: null },
      },
      template: '<VeeForm ref="observer"><TelephoneInput :value="value" :validation="validation" name="phone" /></VeeForm>',
    };

    const mountInForm = (props = {}) => mount(FormHost, {
      attachTo: document.body,
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      props,
    });

    let formWrapper;
    afterEach(() => {
      formWrapper.unmount();
    });

    it('reports the form invalid when an optional telephone field is left showing an invalid value', async () => {
      formWrapper = mountInForm({ value: '+19725551234' });
      const input = formWrapper.find(INPUT_SELECTOR);
      await input.setValue('+123');
      await input.trigger('blur');
      await flushPromises();

      // The field itself is not required, so without re-checking the currently displayed value,
      // vee-validate's own per-field rule would have nothing to run and would report this field valid.
      const { valid } = await formWrapper.vm.$refs.observer.validate();
      expect(valid).toBe(false);
    });

    it('surfaces the specific telephone error, not a generic message, for a required field left invalid', async () => {
      formWrapper = mountInForm({ value: '+19725551234', validation: 'required' });
      const input = formWrapper.find(INPUT_SELECTOR);
      await input.setValue('+123');
      await input.trigger('blur');
      await flushPromises();

      const { valid, errors } = await formWrapper.vm.$refs.observer.validate();
      expect(valid).toBe(false);
      expect(Object.values(errors)[0]).toBe('The telephone number is too short');
    });

    it('reports the form valid once a previously invalid entry is corrected', async () => {
      formWrapper = mountInForm({ value: '+19725551234' });
      const input = formWrapper.find(INPUT_SELECTOR);
      await input.setValue('+123');
      await input.trigger('blur');
      await flushPromises();
      expect((await formWrapper.vm.$refs.observer.validate()).valid).toBe(false);

      await input.setValue('+12546579464');
      await input.trigger('blur');
      await flushPromises();

      const { valid } = await formWrapper.vm.$refs.observer.validate();
      expect(valid).toBe(true);
    });

    it('reports the form invalid for an entry whose digits canonicalization would silently drop', async () => {
      formWrapper = mountInForm({ value: '+19725551234' });
      const input = formWrapper.find(INPUT_SELECTOR);
      // Saving +112345678900 would silently store +12345678900 — a digit shorter than what the
      // user sees — so the field must not be treated as valid even though the loose possible-number
      // check would accept it.
      await input.setValue('+112345678900');
      await input.trigger('blur');
      await flushPromises();

      const { valid } = await formWrapper.vm.$refs.observer.validate();
      expect(valid).toBe(false);
    });

    it('reports the form invalid for a leading-digit drop as well as a trailing one', async () => {
      formWrapper = mountInForm({ value: '+19725551234' });
      const input = formWrapper.find(INPUT_SELECTOR);
      // +3800021313131 auto-selects the country; saving it would silently store +380021313131 with a
      // leading zero dropped, so it must be rejected the same way a trailing-digit drop is.
      await input.setValue('+3800021313131');
      await input.trigger('blur');
      await flushPromises();

      const { valid } = await formWrapper.vm.$refs.observer.validate();
      expect(valid).toBe(false);
    });
  });
});
