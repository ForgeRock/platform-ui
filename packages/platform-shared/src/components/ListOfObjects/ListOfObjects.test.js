/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { Field } from 'vee-validate';
import uuid from 'uuid/v4';
import ListOfObjects from './index';

jest.mock('uuid/v4');

const stubs = { Field };
const wrapperNoValue = {
  global: {
    mocks: { $t: () => {} },
    stubs,
  },
  props: {
    properties: {
      testPropertyKey: {
        type: 'boolean',
        title: 'testPropertyValue',
      },
      test: {
        type: 'string',
        title: 'test',
      },
    },
    label: 'test',
  },
};

describe('ListOfObjects', () => {
  it('ListOfObjects sets listValues when there is an array value', () => {
    const wrapper = shallowMount(ListOfObjects, {
      global: {
        mocks: { $t: () => {} },
        stubs,
      },
      props: {
        properties: {
          testPropertyKey: {
            type: 'boolean',
            title: 'testPropertyValue',
          },
          test: {
            type: 'string',
            title: 'test',
          },
        },
        label: 'test',
        value: [{ test: 'test' }],
      },
    });
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: 'test',
    }]);
  });

  it('ListOfObjects sets listValues and converts to array when there is an object value', () => {
    const wrapper = shallowMount(ListOfObjects, {
      global: {
        mocks: { $t: () => {} },
        stubs,
      },
      props: {
        properties: {
          testPropertyKey: {
            type: 'boolean',
            title: 'testPropertyValue',
          },
          test: {
            type: 'string',
            title: 'test',
          },
        },
        label: 'test',
        multiValued: false,
        value: { test: 'test' },
      },
    });
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: 'test',
    }]);
  });

  it('ListOfObjects adds empty elements to list', () => {
    const wrapper = shallowMount(ListOfObjects, wrapperNoValue);

    wrapper.vm.addObjectToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: '',
      testPropertyKey: false,
    }]);
  });

  it('ListOfObjects removes elements from list', () => {
    const wrapper = shallowMount(ListOfObjects, wrapperNoValue);
    wrapper.vm.$data.listValues = [{
      listUniqueIndex: 1,
      test: '',
      testPropertyKey: false,
    }];

    wrapper.vm.removeElementFromList(0);
    expect(wrapper.vm.listValues).toStrictEqual([]);
  });

  it('ListOfObjects checks if field is valid', async () => {
    const wrapper = shallowMount(ListOfObjects, {
      global: {
        mocks: { $t: () => {} },
        stubs,
      },
      props: {
        properties: {
          testPropertyKey: {
            type: 'array',
            title: 'testPropertyKey',
          },
        },
        label: 'test',
      },
    });
    expect(wrapper.vm.isValidField()).toBe(false);
    await wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'object',
          title: 'testPropertyKey',
        },
      },
    });
    expect(wrapper.vm.isValidField()).toBe(false);
    await wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'other',
          title: 'testPropertyKey',
        },
      },
    });
    expect(wrapper.vm.isValidField()).toBe(true);
  });

  it('Add button disabled if field is disabled', async () => {
    const wrapper = shallowMount(ListOfObjects, wrapperNoValue);
    await wrapper.setProps({ disabled: true });

    const addButton = findByTestId(wrapper, 'list-objects-none-add');
    expect(addButton.attributes('disabled')).toBeDefined();
  });

  it('If all fields are empty or null, remove the object', async () => {
    const wrapper = shallowMount(ListOfObjects, {
      global: {
        mocks: { $t: () => {} },
        stubs,
      },
      props: {
        label: 'test',
        properties: {
          test: {
            type: 'string',
            title: 'test',
          },
          testtwo: {
            type: 'string',
            title: 'testtwo',
          },
        },
      },
    });
    const emptyObj = [{ test: '', testtwo: null }];
    wrapper.vm.emitInput(emptyObj);
    await flushPromises();
    expect(wrapper.emitted().input[0]).toEqual([[]]);
  });

  it('Generates an uuid as a name for the useField method', () => {
    const uuidValue = '48e64f6b-f946-485e-af17-2d703cfe7d42';
    uuid.mockImplementation(() => uuidValue);
    shallowMount(ListOfObjects, {
      global: {
        mocks: { $t: () => {} },
        stubs,
      },
      props: {
        properties: {
          testPropertyKey: {
            type: 'boolean',
            title: 'testPropertyValue',
          },
          test: {
            type: 'string',
            title: 'test',
          },
        },
        value: [{ test: 'test' }],
      },
    });

    expect(uuid).toHaveBeenCalled();
  });
});
