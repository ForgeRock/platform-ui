/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import ObjectTypeEditor from './index';

describe('ObjectTypeEditor', () => {
  function mountComponent(propsData) {
    const wrapper = mount(ObjectTypeEditor, {
      global: {
        mocks: {
          $t: () => {},
        },
        plugins: [Notifications],
      },
      props: {
        displayProperties: [
          {
            title: '',
            description: 'description',
            value: 'initialValue',
            key: 'testKey',
            type: 'string',
          },
        ],
        formFields: {
          testKey: '',
        },
        subPropertyName: 'subPropertyName',
        ...propsData,
      },
    });
    return wrapper;
  }

  it('loads data', async () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.clonedDisplayProperties[0].title).toEqual('description');

    await wrapper.setProps({
      displayProperties: [
        {
          title: '',
          description: '',
          key: 'testKey',
        },
      ],
    });
    expect(wrapper.vm.clonedDisplayProperties[0].title).toEqual('Test Key');
    wrapper.unmount();
  });

  it('sets singleton relationship value', () => {
    const wrapper = mountComponent();
    const field = {
      value: 'initial',
    };
    wrapper.vm.setSingletonRelationshipValue('final', field);
    expect(field.value).toEqual('final');
    wrapper.unmount();
  });

  it('saves resource', async () => {
    const wrapper = mountComponent();
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.resolve(),
      }
    ));
    await wrapper.vm.saveResource();
    expect(wrapper.vm.oldFormFields.testKey).toBe('initialValue');

    const error400 = { response: { status: 400 } };
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.reject(error400),
      }
    ));
    const setFieldErrorSpy = jest.spyOn(wrapper.vm.$refs.observer, 'setFieldError');
    jest.spyOn(wrapper.vm, 'findPolicyError').mockImplementation(() => ([
      {
        exists: true,
        field: 'testKey',
        msg: 'errorMessage',
      },
    ]));
    await wrapper.vm.saveResource();
    const mockCalls = setFieldErrorSpy.mock.calls;
    expect(mockCalls.length).toBe(1);
    expect(mockCalls[0][0].startsWith('testKey')).toBe(true);
    expect(mockCalls[0][1]).toBe('errorMessage');
    wrapper.unmount();
  });

  it('updates field', () => {
    const wrapper = mountComponent();
    const index = 0;
    const newValue = 'newValue';
    expect(wrapper.vm.clonedDisplayProperties[0].value).toEqual('initialValue');
    wrapper.vm.updateField(index, newValue);
    expect(wrapper.vm.clonedDisplayProperties[0].value).toEqual('newValue');
    wrapper.unmount();
  });

  it('getFieldType should return the correct field type', () => {
    const wrapper = mountComponent();
    const field = {
      type: 'string',
    };

    expect(wrapper.vm.getFieldType(field)).toBe('string');

    field.enum = ['one', 'two'];
    expect(wrapper.vm.getFieldType(field)).toBe('select');

    field.type = 'boolean';
    expect(wrapper.vm.getFieldType(field)).toBe('checkbox');

    field.format = 'date';
    expect(wrapper.vm.getFieldType(field)).toBe('date');
    wrapper.unmount();
  });

  it('should show select field for field that has enum property', () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'Enum Field',
          value: 'one',
          enum: ['one', 'two'],
          key: 'enum_test',
          type: 'string',
        },
      ],
    });

    const enumValueOne = wrapper.findAll('.multiselect__element').at(0);
    expect(enumValueOne.text()).toBe('one');
    const enumValueTwo = wrapper.findAll('.multiselect__element').at(1);
    expect(enumValueTwo.text()).toBe('two');
    wrapper.unmount();
  });

  it('should show multiselect field for field that has enum property', () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'Enum Multiselect String Field',
          type: 'array',
          description: '',
          viewable: true,
          searchable: false,
          userEditable: true,
          items: {
            value: 'red',
            type: 'string',
            enum: ['red', 'blue'],
          },
          key: 'enum_test',
          isVirtual: false,
        },
      ],
    });

    const enumValueOne = wrapper.findAll('.multiselect__element').at(0);
    expect(enumValueOne.text()).toBe('red');
    const enumValueTwo = wrapper.findAll('.multiselect__element').at(1);
    expect(enumValueTwo.text()).toBe('blue');
    wrapper.unmount();
  });
});
