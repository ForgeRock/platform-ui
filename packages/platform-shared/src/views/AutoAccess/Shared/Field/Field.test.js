/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import FrField from './index';

// function to clear promises and trigger timers (validation runs every 16ms)
async function flush() {
  await flushPromises();
  jest.runAllTimers();
}

describe('FrField.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('uses string floating label input for string type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          key: 'testField',
          value: '',
          title: 'testField',
        },
      },
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'number',
          key: 'testField',
          value: '',
          title: 'testField',
        },
      },
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'password',
          key: 'testField',
          value: '',
          title: 'testField',
        },
      },
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'select',
          key: 'testField',
          enum: ['enum1', 'enum2'],
          enumNames: ['option1', 'option2'],
          title: 'testField',
        },
      },
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'multiselect',
          key: 'testField',
          enum: ['enum1', 'enum2'],
          enumNames: ['option1', 'option2'],
          title: 'testField',
        },
      },
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'tag',
          key: 'testField',
          value: [],
          options: ['option1', 'option2'],
          title: 'testField',
        },
      },
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
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'object',
          key: 'testField',
          value: {},
          title: 'testField',
        },
      },
    });
    await flush();
    expect(wrapper.vm.field.value).toStrictEqual({});
    expect(wrapper.find('.fr-key-link')).toBeTruthy();
  });

  it('uses toggle button component for boolean type', async () => {
    wrapper = mount(FrField, {
      sync: false,
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        field: {
          type: 'boolean',
          key: 'testField',
          value: true,
          title: 'testField',
        },
      },
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
        title: 'testField',
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
