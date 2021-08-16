/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import FormGenerator from './index';

const uiSchema = [
  {
    label: 'StringLabel',
    type: 'string',
    model: 'core.testString',
  },
  {
    label: 'ArrayLabel',
    type: 'array',
    model: 'core.testArray',
  },
  {
    label: 'BooleanLabel',
    type: 'boolean',
    model: 'core.testBoolean',
  },
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
  {
    label: 'PasswordLabel',
    type: 'password',
    model: 'core.testPassword',
  },
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
  });
});

describe('Form Generator', () => {
  it('Renders each of the sub components', async () => {
    await wrapper.setProps({ uiSchema, schema, model });
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
      await wrapper.setProps({ uiSchema, schema, model });
      const test = {
        type: 'string',
        value: '',
        show: 'core.testNumber',
      };
      expect(wrapper.vm.showField(test)).toBe(1);
    });

    it('returns false if show property maps to a false value', async () => {
      await wrapper.setProps({ uiSchema, schema, model });
      const test = {
        type: 'string',
        value: '',
        show: 'core.testBoolean',
      };
      expect(wrapper.vm.showField(test)).toBe(false);
    });
  });

  describe('getDisplayComponent method', () => {
    it('returns null if safeCompare returns false', () => {
      // type is string but value is a boolean
      const test = {
        type: 'string',
        value: false,
      };
      expect(wrapper.vm.getDisplayComponent(test)).toBe(null);
    });

    it('returns null if showField returns false', async () => {
      // show of field is based on core.testBoolean, which is false
      const newUiSchema = cloneDeep(uiSchema);
      newUiSchema[0].show = 'core.testBoolean';
      await wrapper.setProps({ uiSchema: newUiSchema, schema, model });

      expect(wrapper.vm.getDisplayComponent(newUiSchema[0])).toBe(null);
    });

    it('returns the correct component name for each type', async () => {
      await wrapper.setProps({ uiSchema, schema, model });

      const stringTest = {
        type: 'string',
        value: '',
      };
      expect(wrapper.vm.getDisplayComponent(stringTest)).toEqual('FrStringDisplay');

      const arrayTest = {
        type: 'array',
        value: ['one', 'two'],
      };
      expect(wrapper.vm.getDisplayComponent(arrayTest)).toEqual('FrArrayDisplay');

      const booleanTest = {
        type: 'boolean',
        value: false,
      };
      expect(wrapper.vm.getDisplayComponent(booleanTest)).toEqual('FrBooleanDisplay');

      const numberTest = {
        type: 'integer',
        value: 0,
      };
      expect(wrapper.vm.getDisplayComponent(numberTest)).toEqual('FrNumberDisplay');

      const radioTest = {
        type: 'radio',
        value: 1,
      };
      expect(wrapper.vm.getDisplayComponent(radioTest)).toEqual('FrRadioDisplay');

      const passwordTest = {
        type: 'password',
        value: '',
      };
      expect(wrapper.vm.getDisplayComponent(passwordTest)).toEqual('FrPasswordDisplay');

      const nullTest = {
        value: '',
      };
      expect(wrapper.vm.getDisplayComponent(nullTest)).toBeNull();
    });
  });
});
