/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ListOfObjects from './index';

describe('ListOfObjects', () => {
  it('ListOfObjects loaded', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        items: {},
        properties: {},
      },
    });
    expect(wrapper.name()).toBe('ListOfObjects');
  });

  it('ListOfObjects sets listValues when there is a value', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        items: {},
        properties: {
          testPropertyKey: {
            type: 'array',
            value: 'testPropertyValue',
          },
        },
        name: 'test',
        value: [{ value: 'test' }],
      },
    });
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: 'test',
    }]);
  });

  it('ListOfObjects adds elements to list', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        items: {},
        properties: {
          testPropertyKey: {
            type: 'array',
            value: 'testPropertyValue',
            items: {
              type: 'other',
            },
          },
        },
        name: 'test',
        value: [{ value: 'test' }],
      },
    });
    wrapper.vm.addObjectToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: 'test',
    }, {
      testPropertyKey: [],
    }]);
    wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'array',
          value: 'testPropertyValue',
          items: {
            type: 'array',
            value: 'testPropertyValue',
            items: {
              type: 'other',
            },
          },
        },
      },
    });
    wrapper.vm.addObjectToList(1);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: 'test',
    }, {
      testPropertyKey: [],
    }, {
      testPropertyKey: [[]],
    }]);
  });

  it('ListOfObjects removes elements from list', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        items: {},
        properties: {
          testPropertyKey: {
            type: 'array',
            value: 'testPropertyValue',
            items: {
              type: 'other',
            },
          },
        },
        name: 'test',
        value: [{ value: 'test' }],
      },
    });
    wrapper.vm.addObjectToList(0);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: 'test',
    }, {
      testPropertyKey: [],
    }]);

    wrapper.vm.removeElementFromList(1);
    expect(wrapper.vm.listValues).toStrictEqual([{
      value: 'test',
    }]);
  });

  it('ListOfObjects checks if field is valid', () => {
    const wrapper = shallowMount(ListOfObjects, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        items: {},
        properties: {
          testPropertyKey: {
            type: 'array',
            value: [
              {
                testPropertyKey: 'testPropertyValue',
              },
            ],
            items: {
              type: 'other',
            },
          },
        },
        name: 'test',
        value: [{ testPropertyKey: 'test' }],
      },
    });
    expect(wrapper.vm.isValidField()).toBe(false);
    wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'object',
          value: [
            {
              testPropertyKey: 'testPropertyValue',
            },
          ],
          items: {
            type: 'other',
          },
        },
      },
    });
    expect(wrapper.vm.isValidField()).toBe(false);
    wrapper.setProps({
      properties: {
        testPropertyKey: {
          type: 'other',
          value: [
            {
              testPropertyKey: 'testPropertyValue',
            },
          ],
          items: {
            type: 'other',
          },
        },
      },
    });
    expect(wrapper.vm.isValidField()).toBe(true);
  });
});
