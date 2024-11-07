/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByTestId, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import { Field } from 'vee-validate';
import uuid from 'uuid/v4';
import ListOfObjects from './index';
import i18n from '@/i18n';

jest.mock('uuid/v4');

const stubs = { Field };
const wrapperNoValue = {
  global: {
    plugins: [i18n],
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
    const wrapper = mount(ListOfObjects, {
      global: {
        plugins: [i18n],
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
    const wrapper = mount(ListOfObjects, {
      global: {
        plugins: [i18n],
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
    const wrapper = mount(ListOfObjects, wrapperNoValue);

    wrapper.vm.addObjectToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      listUniqueIndex: 1,
      test: '',
      testPropertyKey: false,
    }]);
  });

  it('ListOfObjects removes elements from list', () => {
    const wrapper = mount(ListOfObjects, wrapperNoValue);
    wrapper.vm.$data.listValues = [{
      listUniqueIndex: 1,
      test: '',
      testPropertyKey: false,
    }];

    wrapper.vm.removeElementFromList(0);
    expect(wrapper.vm.listValues).toStrictEqual([]);
  });

  it('ListOfObjects checks if field is valid', async () => {
    const wrapper = mount(ListOfObjects, {
      global: {
        plugins: [i18n],
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
    const wrapper = mount(ListOfObjects, wrapperNoValue);
    await wrapper.setProps({ disabled: true });

    const addButton = findByTestId(wrapper, 'list-objects-none-add');
    expect(addButton.attributes('disabled')).toBeDefined();
  });

  it('If all fields are empty or null, remove the object', async () => {
    const wrapper = mount(ListOfObjects, {
      global: {
        plugins: [i18n],
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
    mount(ListOfObjects, {
      global: {
        plugins: [i18n],
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

  it('ensures that the label is not capitalized if the preventLabelCapitalization prop is true', async () => {
    const wrapper = mount(ListOfObjects, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: {
        properties: {},
        label: 'my label',
      },
    });

    // expect default label to be capitalized
    const labelDefaultCapitalized = findByText(wrapper, 'label', 'My label (optional)');
    expect(labelDefaultCapitalized.exists()).toBe(true);

    // expect label to not be capitalized when the preventLabelCapitalization prop is true
    await wrapper.setProps({ preventLabelCapitalization: true });
    const labelNotCapitalized = findByText(wrapper, 'label', 'my label (optional)');
    expect(labelNotCapitalized.exists()).toBe(true);
  });

  it('ensures that the label is not modified with the (optional) appended text if the preventOptionalLabelAppend prop is true', async () => {
    const wrapper = mount(ListOfObjects, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: {
        properties: {},
        label: 'my label',
      },
    });

    // expect default label to have the (optional) text appended
    const labelDefaultOptional = findByText(wrapper, 'label', 'My label (optional)');
    expect(labelDefaultOptional.exists()).toBe(true);

    // expect label to not have the (optional) text appended when the preventOptionalLabelAppend prop is true
    await wrapper.setProps({ preventOptionalLabelAppend: true });
    const labelNotOptional = findByText(wrapper, 'label', 'My label');
    expect(labelNotOptional.exists()).toBe(true);
  });
});
