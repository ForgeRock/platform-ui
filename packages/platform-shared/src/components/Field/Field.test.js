/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import flushPromises from 'flush-promises';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules.umd';
import i18n from '@/i18n';
import FrField from './index';

const stubs = {
  ValidationObserver,
  ValidationProvider,
};

let localVue;

describe('Field Component', () => {
  let wrapper;
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(BootstrapVue);
    extend('required', {
      ...required,
    });
    // Note: not testing the validation rules, just that validation happens
    extend('email', {
      ...email,
    });
  });

  it('uses string floating label input for string type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        name: 'testField',
        value: '',
      },
      stubs,
    });
    await flushPromises();
    const input = wrapper.find(`#${wrapper.vm.fieldWrapperId}`).find('input');
    input.setValue('test');
    await flushPromises();
    expect(input.element.value).toBe('test');
  });

  it('uses number floating label input for integer type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'number',
        name: 'testField',
        value: '',
      },
      stubs,
    });
    await flushPromises();
    const input = wrapper.find(`#${wrapper.vm.fieldWrapperId}`).find('input');
    input.setValue(5);
    await flushPromises();
    expect(input.element.value).not.toBe('3');
    input.setValue(3);
    await flushPromises();
    expect(input.element.value).toBe('3');
  });

  it('uses password floating label input for password type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'password',
        name: 'testField',
        value: '',
      },
      stubs,
    });
    await flushPromises();
    const input = wrapper.find(`#${wrapper.vm.fieldWrapperId}`).find('input');
    const passwordButton = wrapper.find('.input-group-append');
    expect(passwordButton.exists()).toBe(true);
    input.setValue('pass');
    await flushPromises();
    expect(input.element.value).toBe('pass');
  });

  it('uses select floating label input for select type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'select',
        name: 'testField',
        options: [{ value: 'enum1', text: 'option1' }, { value: 'enum2', text: 'option2' }],
      },
      stubs,
    });
    // Ensure we get a failure when trying to select a value that is not in options
    wrapper.vm.$attrs.value = ['option3'];
    await flushPromises();
    expect(wrapper.vm.$attrs.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    wrapper.vm.$attrs.value = 'option2';
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toBe('option2');
  });

  it('uses multiselect floating label input for multiselect type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'multiselect',
        name: 'testField',
        options: [{ value: 'enum1', text: 'option1' }, { value: 'enum2', text: 'option2' }],
      },
      stubs,
    });
    // Ensure we get a failure when trying to select a value that is not in options
    wrapper.vm.$attrs.value = ['option3'];
    await flushPromises();
    expect(wrapper.vm.$attrs.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    wrapper.vm.$attrs.value = ['option2'];
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual(['option2']);
    // Ensure we get a success when trying to select two values that are in options
    await flushPromises();
    wrapper.vm.$attrs.value = ['option1', 'option2'];
    expect(wrapper.vm.$attrs.value).toStrictEqual(['option1', 'option2']);
  });

  it('uses bootstrap form tags component for tag type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'array',
        name: 'testField',
        value: [],
        options: ['option1', 'option2'],
      },
      stubs,
    });
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual([]);
    const input = wrapper.find(`#${wrapper.vm.fieldWrapperId}`).find('input');
    input.setValue('should convert to empty array without hitting return');
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual([]);
  });

  it('uses key value list component for object type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'object',
        name: 'testField',
        value: {},
      },
      stubs,
    });
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual({});
    expect(wrapper.find('.fr-link')).toBeTruthy();
  });

  it('uses toggle button component for boolean type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        type: 'boolean',
        name: 'testField',
        value: true,
      },
      stubs,
    });
    await flushPromises();
    expect(wrapper.find('.fr-toggle-primary').isVisible()).toBeTruthy();
  });

  it('uses checkbox component for checkbox type', async () => {
    await wrapper.setProps({
      type: 'checkbox',
      name: 'testField',
      value: true,
    });
    expect(wrapper.vm.$attrs.value).toBe(true);
  });

  it('uses spinbutton component for spinbutton type', async () => {
    await wrapper.setProps({
      type: 'spinbutton',
      name: 'testField',
      value: true,
    });
    expect(wrapper.find('.b-form-spinbutton')).toBeTruthy();
  });

  describe('Showing a readonly string input when the field value is a placeholder', () => {
    const defaultProps = {
      i18n,
      mocks: {
        $t: (key) => key,
      },
      propsData: {
        name: 'test',
        id: 'test',
        options: [],
      },
    };

    function setup(props) {
      return mount(FrField, {
        ...defaultProps,
        ...props,
      });
    }

    it('shows the ReadonlyPlaceholderInput instead of the normal input type when the initial value is a placeholder string', async () => {
      wrapper = setup({ propsData: { name: 'bob', value: '&{esv-myesv}', type: 'checkbox' } });

      await flushPromises();

      expect(wrapper.vm.component).toBe('FrReadonlyPlaceholderInput');
      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBeTruthy();
    });

    it('shows the ReadonlyPlaceholderInput instead of the normal input type when the initial value is a placeholder object', async () => {
      wrapper = setup({ propsData: { name: 'bob', value: { key: '&{my-esv}' }, type: 'checkbox' } });

      await flushPromises();

      expect(wrapper.vm.component).toBe('FrReadonlyPlaceholderInput');
      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBeTruthy();
    });

    it('switches to the ReadonlyPlaceholderInput instead of the normal input type when the value is changed to a placeholder string and placeholder entry is allowed', async () => {
      wrapper = setup({
        propsData: {
          name: 'bob',
          value: 'bill',
          type: 'string',
          canEnterPlaceholders: true,
        },
      });

      await flushPromises();

      expect(wrapper.vm.component).toBe('FrEsvInputWrapper');

      const input = wrapper.find('input');
      await input.setValue('&{esv-myesv}');

      expect(wrapper.vm.component).toBe('FrReadonlyPlaceholderInput');
    });

    it('does not switch to the ReadonlyPlaceholderInput instead of the normal input type when the value is changed to a placeholder string and placeholder entry is not allowed', async () => {
      wrapper = setup({
        propsData: {
          name: 'bob',
          value: 'bill',
          type: 'string',
          canEnterPlaceholders: false,
        },
      });

      await flushPromises();

      expect(wrapper.vm.component).toBe('FrBasicInput');

      const input = wrapper.find('input');
      await input.setValue('&{esv-myesv}');

      expect(wrapper.vm.component).toBe('FrBasicInput');
    });

    it('switches to the normal input when a ReadonlyPlaceholderInput clears the field value from a placeholder', async () => {
      wrapper = setup({ propsData: { name: 'bob', value: { key: '&{my-esv}' }, type: 'checkbox' } });

      await flushPromises();

      expect(wrapper.vm.component).toBe('FrReadonlyPlaceholderInput');

      // Clear the input value
      const clearButton = wrapper.find('button');
      clearButton.trigger('click');

      expect(wrapper.vm.component).toBe('FrCheckbox');
    });
  });

  describe('Deciding when to use the EsvInputWrapper component', () => {
    const defaultProps = {
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
      mocks: {
        $t: (key) => key,
      },
      propsData: {
        name: 'test',
        id: 'test',
        canEnterPlaceholders: true,
      },
    };

    function setup(props) {
      return mount(FrField, {
        ...defaultProps,
        ...props,
      });
    }

    it('Has the input wrapper as the top level component when placeholder entry is enabled and supported for the field type', () => {
      wrapper = setup({
        propsData: {
          name: 'bob',
          value: 'bill',
          type: 'checkbox',
          canEnterPlaceholders: true,
        },
      });

      expect(wrapper.vm.component).toBe('FrEsvInputWrapper');
    });

    it('Has the field type component as the top level component when placeholder entry is disabled but supported for the field type', () => {
      wrapper = setup({
        propsData: {
          name: 'bob',
          value: 'bill',
          type: 'checkbox',
          canEnterPlaceholders: false,
        },
      });

      expect(wrapper.vm.component).toBe('FrCheckbox');
    });

    it('Has the field type component as the top level component when placeholder entry is enabled but not supported for the field type', () => {
      wrapper = setup({
        propsData: {
          name: 'bob',
          value: 'bill',
          type: 'json',
          canEnterPlaceholders: true,
        },
      });

      expect(wrapper.vm.component).toBe('FrJsonInput');
    });

    it('Has the field type component as the top level component when placeholder entry is disabled and not supported for the field type', () => {
      wrapper = setup({
        propsData: {
          name: 'bob',
          value: 'bill',
          type: 'json',
          canEnterPlaceholders: false,
        },
      });

      expect(wrapper.vm.component).toBe('FrJsonInput');
    });
  });
});
