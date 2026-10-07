/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import { defineRule } from 'vee-validate';
import ObjectTypeEditor from './index';

defineRule('required', (value) => !!String(value ?? '').length);

describe('ObjectTypeEditor', () => {
  function mountComponent(propsData, mountOptions = {}) {
    const wrapper = mount(ObjectTypeEditor, {
      ...mountOptions,
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

  it('moves focus to the first invalid field when form validation fails on save', async () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'First Field',
          value: 'initialValue',
          key: 'firstKey',
          type: 'string',
        },
        {
          title: 'Second Field',
          value: '',
          key: 'secondKey',
          type: 'string',
          validation: 'required',
        },
      ],
      formFields: { firstKey: 'initialValue', secondKey: '' },
    }, { attachTo: document.body });

    const patchSpy = jest.fn();
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: patchSpy,
      }
    ));

    await wrapper.vm.saveResource();

    // The invalid-validation path should return before making any HTTP call
    expect(patchSpy).not.toHaveBeenCalled();

    const focusedElement = document.activeElement;
    expect(focusedElement).not.toBeNull();
    expect(focusedElement.tagName).toBe('INPUT');
    expect(focusedElement.name.startsWith('secondKey')).toBe(true);
    wrapper.unmount();
  });

  it('moves focus to the correct field when the schema key contains "-id-"', async () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'ID Field',
          value: '',
          key: 'my-id-field',
          type: 'string',
          validation: 'required',
        },
      ],
      formFields: { 'my-id-field': '' },
    }, { attachTo: document.body });

    // getRequestService is invoked at the top of saveResource, before validation, so it must be mocked
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.resolve(),
      }
    ));

    await wrapper.vm.saveResource();

    const focusedElement = document.activeElement;
    expect(focusedElement.tagName).toBe('INPUT');
    expect(focusedElement.name.startsWith('my-id-field')).toBe(true);
    wrapper.unmount();
  });

  it('focusFirstInvalidField returns early when there are no validation errors', async () => {
    const wrapper = mountComponent();

    jest.spyOn(wrapper.vm.$refs.observer, 'getErrors').mockReturnValue({});

    await wrapper.vm.focusFirstInvalidField();

    expect(document.activeElement.tagName).toBe('BODY');
    wrapper.unmount();
  });

  it('focusFirstInvalidField uses the field-wrapper fallback when no named input exists', async () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'Tags Field',
          value: '',
          key: 'tagKey',
          type: 'string',
        },
      ],
      formFields: { tagKey: '' },
    });

    // Wrapper element as FrField renders it: root div with id = field key, containing a focusable input
    const focusableInput = document.createElement('input');
    const fieldWrapper = document.createElement('div');
    fieldWrapper.id = 'tagKey';
    fieldWrapper.appendChild(focusableInput);
    document.body.appendChild(fieldWrapper);

    jest.spyOn(wrapper.vm.$refs.observer, 'getErrors').mockReturnValue({ 'tagKey-id-abc': ['Tag is required'] });
    const querySelectorSpy = jest.spyOn(wrapper.vm.$refs.observer.$el, 'querySelector')
      .mockImplementation((selector) => {
        if (selector.startsWith('[name=')) return null;
        if (selector.startsWith('[id=')) return fieldWrapper;
        return null;
      });

    await wrapper.vm.focusFirstInvalidField();

    // The error key resolved back to the display property key before querying
    expect(querySelectorSpy).toHaveBeenCalledWith('[name="tagKey"]');
    expect(document.activeElement).toBe(focusableInput);

    fieldWrapper.remove();
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

  it('getFieldType should not return telephone format for a field without a policy', () => {
    const wrapper = mountComponent();
    const field = {
      type: 'string',
    };
    expect(wrapper.vm.getFieldType(field)).not.toBe('telephone');
  });

  it('getFieldType should not return telephone format for a field with phone policy but no require-country-code', () => {
    const wrapper = mountComponent();
    const field = {
      type: 'string',
      policies: [
        { policyId: 'valid-phone-format', params: { 'require-country-code': false } },
      ],
    };
    expect(wrapper.vm.getFieldType(field)).not.toBe('telephone');
  });

  it('getFieldType should return telephone format for a field with valid phone policy and require-country-code set to true', () => {
    const wrapper = mountComponent();
    const field = {
      type: 'string',
      policies: [
        { policyId: 'valid-phone-format', params: { 'require-country-code': true } },
      ],
    };
    expect(wrapper.vm.getFieldType(field)).toBe('telephone');
  });

  it('getFieldType should fall back to the underlying field type when phone policy without require-country-code', () => {
    const wrapper = mountComponent();
    const field = {
      type: 'string',
      format: 'telephone',
      policies: [
        { policyId: 'valid-phone-format', params: { 'require-country-code': false } },
      ],
    };
    expect(wrapper.vm.getFieldType(field)).toBe('string');
  });

  it('does not set autocomplete="off" by default (end-user self-service is unaffected)', () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'First Name',
          description: '',
          value: 'John',
          key: 'givenName',
          type: 'string',
        },
      ],
      formFields: { givenName: 'John' },
    });

    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input.attributes('autocomplete')).toBeUndefined();
    });

    wrapper.unmount();
  });

  it('sets autocomplete="off" on all inputs when disableAutocomplete=true (admin Managed Identities)', () => {
    const wrapper = mountComponent({
      displayProperties: [
        {
          title: 'First Name',
          description: '',
          value: 'John',
          key: 'givenName',
          type: 'string',
        },
        {
          title: 'Last Name',
          description: '',
          value: 'Doe',
          key: 'sn',
          type: 'string',
        },
      ],
      formFields: { givenName: 'John', sn: 'Doe' },
      disableAutocomplete: true,
    });

    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input.attributes('autocomplete')).toBe('off');
    });

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
