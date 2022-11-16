/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { cloneDeep, assign, get } from 'lodash';
import FormGenerator from './index';
// import SchemaMixin from '@/mixins/SchemaMixin';

const SchemaMixin = {
  methods: {
    // combineSchemas: () => Promise.resolve({
    //   getAddressComponent() {
    //     return {
    //       long_name: 'Austin',
    //     };
    //   },
    // }),
    combineSchemas: (apiSchema, uiSchema) => uiSchema.map((row) => row
      .map((formField) => {
        const clonedSchema = cloneDeep(apiSchema);
        const modelIsArrayElement = formField.model.endsWith('[0]');
        const modelName = modelIsArrayElement ? formField.model.substring(0, formField.model.length - 3) : formField.model;
        return assign(get(clonedSchema, modelName), formField);
      })),
  },
};
const uiSchema = [
  [
    {
      columns: 6,
      label: 'StringLabel',
      type: 'string',
      model: 'core.testString',
    },
    {
      columns: 6,
      label: 'ArrayLabel',
      type: 'array',
      model: 'core.testArray',
    },
  ],
  [
    {
      label: 'BooleanLabel',
      type: 'boolean',
      model: 'core.testBoolean',
    },
  ],
  [
    {
      label: 'NumberLabel',
      type: 'integer',
      model: 'core.testNumber',
    },
    {
      label: 'RadioLabel',
      type: 'radio',
      model: 'core.testRadio',
    },
  ],
  [
    {
      label: 'PasswordLabel',
      type: 'password',
      model: 'core.testPassword',
    },
  ],
];

const schema = {
  core: {
    testString: {
      type: 'string',
      title: 'testStringTitle',
      description: 'testStringDescription',
    },
    testArray: {
      type: 'array',
      arrayType: 'addMany',
      title: 'testArrayTitle',
      description: 'testArrayDescription',
    },
    testBoolean: {
      type: 'boolean',
      title: 'testBooleanTitle',
      description: 'testBooleanDescription',
    },
    testNumber: {
      type: 'integer',
      title: 'testNumberTitle',
      description: 'testNumberDescription',
    },
    testRadio: {
      type: 'radio',
      title: 'testRadioTitle',
      description: 'testRadioDescription',
    },
    testPassword: {
      type: 'password',
      title: 'testPasswordTitle',
      description: 'testPasswordDescription',
    },
  },
};

const model = {
  core: {
    testString: {
      value: 'initialValue',
    },
    testArray: {
      value: ['one', 'two'],
    },
    testBoolean: {
      value: false,
    },
    testNumber: {
      value: 1,
    },
    testRadio: {
      value: 1,
      options: [1, 2, 3],
    },
    testPassword: {
      value: 'initialPassword',
    },
  },
};

let wrapper;

beforeEach(() => {
  wrapper = shallowMount(FormGenerator, {
    mocks: {
      $t: () => {},
    },
    mixins: [SchemaMixin],
  });
});

describe('Form Generator', () => {
  it('Renders each of the sub components', async () => {
    const combinedSchema = wrapper.vm.combineSchemas(schema, uiSchema);
    await wrapper.setProps({ schema: combinedSchema, model });
    expect(wrapper.name()).toEqual('FormGenerator');
    expect(wrapper.find('frstringdisplay-stub').exists()).toBe(true);
    expect(wrapper.find('frarraydisplay-stub').exists()).toBe(true);
    expect(wrapper.find('frbooleandisplay-stub').exists()).toBe(true);
    expect(wrapper.find('frnumberdisplay-stub').exists()).toBe(true);
    expect(wrapper.find('frradiodisplay-stub').exists()).toBe(true);
    expect(wrapper.find('frpassworddisplay-stub').exists()).toBe(true);
  });

  describe('safeCompare method', () => {
    it('will return true when value does match type', () => {
      const test = {
        type: 'string',
        value: '',
      };
      expect(wrapper.vm.safeCompare(test)).toBe(true);
    });

    it('will return false when value does not match type', () => {
      const test = {
        type: 'string',
        value: false,
      };
      expect(wrapper.vm.safeCompare(test)).toBe(false);
    });

    it('will return false for unhandled types', () => {
      const test = {
        type: 'faketype',
        value: false,
      };
      expect(wrapper.vm.safeCompare(test)).toBe(false);
    });
  });

  describe('showField method', () => {
    it('returns true if there is no show property', () => {
      const test = {
        type: 'string',
        value: '',
      };
      expect(wrapper.vm.showField(test)).toBe(true);
    });

    it('returns value if show property maps to a value', async () => {
      const combinedSchema = wrapper.vm.combineSchemas(schema, uiSchema);
      await wrapper.setProps({ schema: combinedSchema, model });
      const test = {
        type: 'string',
        value: '',
        show: 'core.testNumber',
      };
      expect(wrapper.vm.showField(test)).toBe(1);
    });

    it('returns false if show property maps to a false value', async () => {
      const combinedSchema = wrapper.vm.combineSchemas(schema, uiSchema);
      await wrapper.setProps({ schema: combinedSchema, model });
      const test = {
        type: 'string',
        value: '',
        show: 'core.testBoolean',
      };
      expect(wrapper.vm.showField(test)).toBe(false);
    });
  });

  describe('getPropertyComponent method', () => {
    it('returns null if safeCompare returns false', () => {
      // type is string but value is a boolean
      const test = {
        type: 'string',
        value: false,
      };
      expect(wrapper.vm.getPropertyComponent(test)).toBe(null);
    });

    it('returns null if showField returns false', async () => {
      // show of field is based on core.testBoolean, which is false
      const newUiSchema = cloneDeep(uiSchema);
      newUiSchema[0][0].show = 'core.testBoolean';
      const combinedSchema = wrapper.vm.combineSchemas(schema, newUiSchema);
      await wrapper.setProps({ schema: combinedSchema, model });

      expect(wrapper.vm.getPropertyComponent(newUiSchema[0][0])).toBe(null);
    });

    it('returns the correct component name for each type', async () => {
      const combinedSchema = wrapper.vm.combineSchemas(schema, uiSchema);
      await wrapper.setProps({ schema: combinedSchema, model });

      const stringTest = {
        type: 'string',
        value: '',
      };
      expect(wrapper.vm.getPropertyComponent(stringTest)).toEqual('FrStringDisplay');

      const arrayTest = {
        type: 'array',
        value: ['one', 'two'],
      };
      expect(wrapper.vm.getPropertyComponent(arrayTest)).toEqual('FrArrayDisplay');

      const booleanTest = {
        type: 'boolean',
        value: false,
      };
      expect(wrapper.vm.getPropertyComponent(booleanTest)).toEqual('FrBooleanDisplay');

      const numberTest = {
        type: 'integer',
        value: 0,
      };
      expect(wrapper.vm.getPropertyComponent(numberTest)).toEqual('FrNumberDisplay');

      const radioTest = {
        type: 'radio',
        value: 1,
      };
      expect(wrapper.vm.getPropertyComponent(radioTest)).toEqual('FrRadioDisplay');

      const passwordTest = {
        type: 'password',
        value: '',
      };
      expect(wrapper.vm.getPropertyComponent(passwordTest)).toEqual('FrPasswordDisplay');

      const nullTest = {
        value: '',
      };
      expect(wrapper.vm.getPropertyComponent(nullTest)).toBeNull();
    });
  });

  describe('getFieldValue method', () => {
    it('returns the modelValue for array field types', () => {
      expect(wrapper.vm.getFieldValue('blah', 'array', false)).toBe('blah');
    });

    it('returns the modelValue for radio field types', () => {
      expect(wrapper.vm.getFieldValue('I am a radio', 'radio', false)).toBe('I am a radio');
    });

    it('returns the modelValue or a default of false for boolean field types', () => {
      expect(wrapper.vm.getFieldValue(true, 'boolean', false)).toBe(true);
      expect(wrapper.vm.getFieldValue(undefined, 'boolean', false)).toBe(false);
    });

    it('returns the modelValue or a default of 0 for integer field types', () => {
      expect(wrapper.vm.getFieldValue(7, 'integer', false)).toBe(7);
      expect(wrapper.vm.getFieldValue(undefined, 'integer', false)).toBe(0);
    });

    it('returns the first element of the modelValue array or an empty string if modelIsArrayElement is true', () => {
      expect(wrapper.vm.getFieldValue(['blah'], 'stuff', true)).toBe('blah');
      expect(wrapper.vm.getFieldValue([], 'stuff', true)).toBe('');
      expect(wrapper.vm.getFieldValue(undefined, 'stuff', true)).toBe('');
    });

    it('returns the modelValue or an empty string for unhandled types which are not array elements', () => {
      expect(wrapper.vm.getFieldValue('meh', 'banana', false)).toBe('meh');
      expect(wrapper.vm.getFieldValue(undefined, 'banana', false)).toBe('');
    });
  });
});
