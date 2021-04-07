/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
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

describe('Field Component', () => {
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
        name: 'testField',
        value: '',
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
        type: 'number',
        name: 'testField',
        value: '',
      },
      stubs,
    });
    await flush();
    const input = wrapper.find('#testField input');
    input.setValue(5);
    await flush();
    expect(input.element.value).not.toBe('3');
    input.setValue(3);
    await flush();
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
    await flush();
    const input = wrapper.find('#testField input');
    const passwordButton = wrapper.find('.input-group-append');
    expect(passwordButton.exists()).toBe(true);
    input.setValue('pass');
    await flush();
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
    await flush();
    expect(wrapper.vm.$attrs.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    wrapper.vm.$attrs.value = 'option2';
    await flush();
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
    await flush();
    expect(wrapper.vm.$attrs.value).not.toBe(['option3']);
    // Ensure we get a success when trying to select a value that is in options
    wrapper.vm.$attrs.value = ['option2'];
    await flush();
    expect(wrapper.vm.$attrs.value).toStrictEqual(['option2']);
    // Ensure we get a success when trying to select two values that are in options
    await flush();
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
        type: 'tag',
        name: 'testField',
        value: [],
        options: ['option1', 'option2'],
      },
      stubs,
    });
    await flush();
    expect(wrapper.vm.$attrs.value).toStrictEqual([]);
    const input = wrapper.find('#testField input');
    input.setValue('should convert to empty array without hitting return');
    await flush();
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
    await flush();
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
    await flush();
    expect(wrapper.find('.fr-toggle-primary').isVisible()).toBeTruthy();
  });

  it('uses checkbox component for checkbox type', async () => {
    wrapper.setProps({
      type: 'checkbox',
      name: 'testField',
      value: true,
    });
    await flush();
    expect(wrapper.vm.$attrs.value).toBe(true);
  });
});
