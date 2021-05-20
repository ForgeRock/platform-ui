/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ListOfLists from './index';

describe('ListOfLists', () => {
  it('ListOfLists loaded', () => {
    const wrapper = shallowMount(ListOfLists, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        items: {},
      },
    });
    expect(wrapper.name()).toBe('ListOfLists');
  });

  it('ListOfLists sets listValues when there is a value', () => {
    const wrapper = shallowMount(ListOfLists, {
      mocks: {
        $t: () => {},
      },
      propsData: {
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

  it('ListOfLists adds elements to list', () => {
    const wrapper = shallowMount(ListOfLists, {
      mocks: {
        $t: () => {},
      },
      propsData: {
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
    wrapper.setProps({
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
      mocks: {
        $t: () => {},
      },
      propsData: {
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
      mocks: {
        $t: () => {},
      },
      propsData: {
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
});
