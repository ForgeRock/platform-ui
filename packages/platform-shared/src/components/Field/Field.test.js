/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { Form as VeeForm, Field } from 'vee-validate';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import uuid from 'uuid/v4';
import i18n from '@/i18n';
import FrField from './index';

jest.mock('uuid/v4');

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
  email: ValidationRules.getRules(i18n).email,
});

const stubs = {
  Field,
  VeeForm,
};

describe('Field Component', () => {
  let wrapper;

  it('uses string floating label input for string type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      props: {
        name: 'testField',
        value: '',
      },
    });
    await flushPromises();
    const input = wrapper.find('#testField input');
    input.setValue('test');
    await flushPromises();
    expect(input.element.value).toBe('test');
  });

  it('uses number floating label input for integer type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      props: {
        type: 'number',
        name: 'testField',
        value: '',
      },
    });
    await flushPromises();
    const input = wrapper.find('#testField input');
    input.setValue(5);
    await flushPromises();
    expect(input.element.value).not.toBe('3');
    input.setValue(3);
    await flushPromises();
    expect(input.element.value).toBe('3');
  });

  it('uses password floating label input for password type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      propsData: {
        type: 'password',
        name: 'testField',
        value: '',
      },
    });
    await flushPromises();
    const input = wrapper.find('#testField input');
    const passwordButton = wrapper.find('.input-group-append');
    expect(passwordButton.exists()).toBe(true);
    input.setValue('pass');
    await flushPromises();
    expect(input.element.value).toBe('pass');
  });

  it('uses select floating label input for select type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      props: {
        type: 'select',
        name: 'testField',
        options: [{ value: 'enum1', text: 'option1' }, { value: 'enum2', text: 'option2' }],
      },
    });
    await flushPromises();
    // Ensure we get a failure when trying to select a value that is not in options
    await wrapper.setProps({
      value: ['option3'],
    });
    await flushPromises();
    expect(wrapper.vm.$attrs.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    await wrapper.setProps({
      value: 'option2',
    });
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toBe('option2');
  });

  it('uses multiselect floating label input for multiselect type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        type: 'multiselect',
        name: 'testField',
        options: [{ value: 'enum1', text: 'option1' }, { value: 'enum2', text: 'option2' }],
        value: [],
      },
    });
    await flushPromises();

    const multiselect = wrapper.findComponent('.multiselect');

    // Ensure we get a success when trying to select a value that is in options
    await wrapper.setProps({
      value: ['enum2'],
    });
    await flushPromises();

    expect(multiselect.vm.value).toEqual([{ multiselectId: 1, text: 'option2', value: 'enum2' }]);
    expect(wrapper.vm.$attrs.value).toStrictEqual(['enum2']);

    // Ensure we get a success when trying to select two values that are in options
    await wrapper.setProps({
      value: ['enum1', 'enum2'],
    });
    await flushPromises();

    expect(multiselect.vm.value).toEqual([{ multiselectId: 0, text: 'option1', value: 'enum1' }, { multiselectId: 1, text: 'option2', value: 'enum2' }]);
    expect(wrapper.vm.$attrs.value).toStrictEqual(['enum1', 'enum2']);
  });

  it('uses bootstrap form tags component for tag type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      props: {
        type: 'array',
        name: 'testField',
        value: [],
        options: ['option1', 'option2'],
      },
    });
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual([]);
    const input = wrapper.find('#testField input');
    input.setValue('should convert to empty array without hitting return');
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual([]);
  });

  it('uses key value list component for object type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      props: {
        type: 'object',
        name: 'testField',
        value: {},
      },
    });
    await flushPromises();
    expect(wrapper.vm.$attrs.value).toStrictEqual({});
    expect(wrapper.find('.fr-link')).toBeTruthy();
  });

  it('uses toggle button component for boolean type', async () => {
    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
        stubs,
      },
      props: {
        type: 'boolean',
        name: 'testField',
        value: true,
      },
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

  it('generates a name using uuid when the name and label properties are empty', async () => {
    const uuidValue = 'b0e688a4-9345-4ace-9864-4a8276794e83';
    uuid.mockImplementation(() => uuidValue);

    wrapper = mount(FrField, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });
    await flushPromises();
    const input = wrapper.find('input');

    expect(input.attributes('name')).toBe(uuidValue);
  });

  describe('Showing a readonly string input when the field value is a placeholder', () => {
    const defaultProps = {
      global: {
        plugins: [i18n],
      },
      props: {
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
      expect(input.attributes('readonly')).toBe('');
    });

    it('shows the ReadonlyPlaceholderInput instead of the normal input type when the initial value is a placeholder object', async () => {
      wrapper = setup({ propsData: { name: 'bob', value: { key: '&{my-esv}' }, type: 'checkbox' } });

      await flushPromises();

      expect(wrapper.vm.component).toBe('FrReadonlyPlaceholderInput');
      const input = wrapper.find('input');
      expect(input.attributes('readonly')).toBe('');
    });

    it('switches to the ReadonlyPlaceholderInput instead of the normal input type when the value is changed to a placeholder string and placeholder entry is allowed', async () => {
      wrapper = setup({
        props: {
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
        props: {
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
          i18n,
        ],
      },
      props: {
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
        props: {
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
        props: {
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
        props: {
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
        props: {
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
