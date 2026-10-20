/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import ListOfLists from './index';
import { runA11yTest } from '../../utils/testHelpers';

describe('ListOfLists', () => {
  describe('@a11y', () => {
    it('should pass accessibility tests with default props', async () => {
      const wrapper = mount(ListOfLists, {
        global: {
          mocks: {
            $t: (label) => label,
          },
        },
        props: {
          label: 'Test Label',
          description: 'This is a test list',
          items: {},
          name: 'test',
          value: ['test'],
        },
      });
      await runA11yTest(wrapper);
    });
  });

  it('ListOfLists sets listValues when there is a value', () => {
    const wrapper = shallowMount(ListOfLists, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        items: {},
        name: 'test',
        value: ['test'],
      },
    });
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: 'test',
      listUniqueIndex: 1,
    }]);
  });

  it('ListOfLists adds elements to list', async () => {
    const wrapper = shallowMount(ListOfLists, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        items: {
          type: 'boolean',
        },
        name: 'test',
        value: [],
      },
    });
    wrapper.vm.addElementToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: false,
      listUniqueIndex: 1,
    }]);
    await wrapper.setProps({
      items: {
        type: 'number',
      },
    });
    wrapper.vm.addElementToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: false,
      listUniqueIndex: 1,
    }, {
      value: 0,
      listUniqueIndex: 2,
    }]);
  });

  it('ListOfLists removes elements from list', () => {
    const wrapper = shallowMount(ListOfLists, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        items: {
          type: 'boolean',
        },
        name: 'test',
        value: [],
      },
    });
    wrapper.vm.addElementToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: false,
      listUniqueIndex: 1,
    }]);

    wrapper.vm.removeElementFromList(0);
    expect(wrapper.vm.listValues).toStrictEqual([]);
  });

  it('ListOfLists checks if field is valid', () => {
    const wrapper = shallowMount(ListOfLists, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        items: {
          type: 'boolean',
        },
        name: 'test',
        value: [],
      },
    });
    expect(wrapper.vm.isValidField({
      items: {
        type: 'array',
      },
    })).toBe(false);
    expect(wrapper.vm.isValidField({
      items: {
        type: 'object',
      },
    })).toBe(false);
    expect(wrapper.vm.isValidField({
      items: {
        type: 'other',
      },
    })).toBe(true);
  });

  it('disables the add button and tag input for a read-only array of arrays', async () => {
    const wrapper = mount(ListOfLists, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        items: {},
        name: 'test',
        value: [['one', 'two']],
        disabled: true,
      },
    });
    await flushPromises();

    // $t is mocked, so buttons are found by class rather than aria-label.
    // One row of values renders the row's remove + add buttons.
    const buttons = wrapper.findAll('button.btn-outline-secondary');
    expect(buttons.length).toBe(2);
    buttons.forEach((button) => {
      expect(button.attributes('disabled')).toBeDefined();
    });

    const tagInput = wrapper.find('input.fr-tag-input');
    expect(tagInput.exists()).toBeTruthy();
    expect(tagInput.attributes('disabled')).toBeDefined();
  });

  it('keeps controls enabled for an editable array of arrays', async () => {
    const wrapper = mount(ListOfLists, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        items: {},
        name: 'test',
        value: [['one', 'two']],
      },
    });
    await flushPromises();

    const buttons = wrapper.findAll('button.btn-outline-secondary');
    expect(buttons.length).toBe(2);
    buttons.forEach((button) => {
      expect(button.attributes('disabled')).toBeFalsy();
    });

    const tagInput = wrapper.find('input.fr-tag-input');
    expect(tagInput.attributes('disabled')).toBeFalsy();
  });
});
