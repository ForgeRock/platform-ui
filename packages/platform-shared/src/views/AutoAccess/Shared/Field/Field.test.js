/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import {
  createLocalVue, mount,
} from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules.umd';
import FrField from './index';

// function to clear promises and trigger timers (validation runs every 16ms)
async function flush() {
  await flushPromises();
  jest.runAllTimers();
}

const stubs = {
  ValidationObserver,
  ValidationProvider,
};

let localVue;

describe('FrField.vue', () => {
  let wrapper;
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(BootstrapVue);
    jest.useFakeTimers();
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
        field: {
          key: 'testField',
          value: '',
        },
      },
      stubs,
    });
    await flush();
    const input = wrapper.find('#testField input');
    input.setValue('test');
    await flush();
    expect(input.element.value).toBe('test');
  });

  it('uses number floating label input for integer type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'number',
          key: 'testField',
          value: '',
        },
      },
      stubs,
    });
    await flush();
    const input = wrapper.find('#testField input');
    input.setValue('5');
    await flush();
    expect(wrapper.vm.field.value).not.toBe('5');
    input.setValue('3');
    await flush();
    expect(wrapper.vm.field.value).toBe(3);
  });

  it('uses password floating label input for password type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'password',
          key: 'testField',
          value: '',
        },
      },
      stubs,
    });
    await flush();
    const input = wrapper.find('#testField input');
    const passwordButton = wrapper.find('.input-group-append');
    expect(passwordButton.exists()).toBe(true);
    input.setValue('pass');
    await flush();
    expect(wrapper.vm.field.value).toBe('pass');
  });

  it('uses select floating label input for select type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'select',
          key: 'testField',
          enum: ['enum1', 'enum2'],
          enumNames: ['option1', 'option2'],
        },
      },
      stubs,
    });
    // Ensure we get a failure when trying to select a value that is not in options
    wrapper.vm.field.value = ['option3'];
    await flush();
    expect(wrapper.vm.field.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    wrapper.vm.field.value = 'option2';
    await flush();
    expect(wrapper.vm.field.value).toBe('option2');
  });

  it('uses multiselect floating label input for multiselect type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'multiselect',
          key: 'testField',
          enum: ['enum1', 'enum2'],
          enumNames: ['option1', 'option2'],
        },
      },
      stubs,
    });
    // Ensure we get a failure when trying to select a value that is not in options
    wrapper.vm.field.value = ['option3'];
    await flush();
    expect(wrapper.vm.field.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    wrapper.vm.field.value = ['option2'];
    await flush();
    expect(wrapper.vm.field.value).toStrictEqual(['option2']);
    // Ensure we get a success when trying to select two values that are in options
    await flush();
    wrapper.vm.field.value = ['option1', 'option2'];
    expect(wrapper.vm.field.value).toStrictEqual(['option1', 'option2']);
  });

  it('uses bootstrap form tags component for tag type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'tag',
          key: 'testField',
          value: [],
          options: ['option1', 'option2'],
        },
      },
      stubs,
    });
    await flush();
    expect(wrapper.vm.field.value).toStrictEqual([]);
    const input = wrapper.find('#testField input');
    input.setValue('should convert to empty array without hitting return');
    await flush();
    expect(wrapper.vm.field.value).toStrictEqual([]);
  });

  it('uses key value list component for object type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'object',
          key: 'testField',
          value: {},
        },
      },
      stubs,
    });
    await flush();
    expect(wrapper.vm.field.value).toStrictEqual({});
    expect(wrapper.find('.fr-key-link')).toBeTruthy();
  });

  it('uses toggle button component for boolean type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      mocks: {
        $t: () => {},
      },
      propsData: {
        field: {
          type: 'boolean',
          key: 'testField',
          value: true,
        },
      },
      stubs,
    });
    await flush();
    expect(wrapper.find('.fr-toggle-primary').isVisible()).toBeTruthy();
  });

  it('uses checkbox component for boolean type', async () => {
    await wrapper.setProps({
      field: {
        type: 'checkbox',
        key: 'testField',
        value: true,
      },
    });
    expect(wrapper.vm.field.value).toBe(true);
  });

  // Need to figure out how to get vee-validate and jest working together
  // it('Checks for required on string type', async () => {
  //   wrapper.vm.field.type = 'string';
  //   wrapper.vm.field.value = '';
  //   wrapper.vm.field.validation = 'required|email';
  //   await flush();
  //   const stringInput = wrapper.find('#testField input');
  //   stringInput.setValue('test');
  //   await flush();
  //   expect(stringInput.element.value).toBe('test');

  //   const errorEl = wrapper.find('.error-message');
  //   expect(errorEl.text()).toBeTruthy();
  // });
});
