/**
 * Copyright (c) 2021-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrListOfObjects from '@forgerock/platform-shared/src/components/ListOfObjects';
import ListField from './index';

describe('ListField', () => {
  it('ListField sets inputValue to array when value is empty', () => {
    const wrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        value: '',
      },
    });
    expect(wrapper.vm.inputValue).toStrictEqual([]);
  });

  it('ListField sets inputValue to value when value is not empty', () => {
    const wrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        value: 'test',
      },
    });
    expect(wrapper.vm.inputValue).toStrictEqual('test');
  });

  it('ListField sets validation', async () => {
    const wrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        type: '',
      },
    });
    expect(wrapper.vm.validation).toBe('');
    await wrapper.setProps({
      items: {
        type: 'boolean',
      },
    });
    expect(wrapper.vm.validation).toBe('oneOf:true,false');
    await wrapper.setProps({
      items: {
        type: 'number',
      },
    });
    expect(wrapper.vm.validation).toBe('numeric');
    await wrapper.setProps({
      items: {
        type: 'number',
      },
      numberValidation: 'number',
    });
    expect(wrapper.vm.validation).toBe('number');
  });

  it('ListField passes disabled=true to FrField for an array of strings', () => {
    const wrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        items: {
          type: 'string',
        },
        disabled: true,
      },
    });
    // FrField does not declare `disabled` — it is forwarded through $attrs
    expect(wrapper.findComponent(FrField).vm.$attrs.disabled).toBe(true);
  });

  it('ListField passes disabled=true to FrListOfObjects for an array of objects', () => {
    const wrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        items: {
          type: 'object',
          properties: {
            a: {
              type: 'string',
            },
          },
        },
        disabled: true,
      },
    });
    expect(wrapper.findComponent(FrListOfObjects).props('disabled')).toBe(true);
  });

  it('ListField defaults disabled=false for FrField and FrListOfObjects', () => {
    const stringWrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        items: {
          type: 'string',
        },
      },
    });
    expect(stringWrapper.findComponent(FrField).vm.$attrs.disabled).toBe(false);

    const objectWrapper = shallowMount(ListField, {
      props: {
        name: 'test',
        items: {
          type: 'object',
          properties: {
            a: {
              type: 'string',
            },
          },
        },
      },
    });
    expect(objectWrapper.findComponent(FrListOfObjects).props('disabled')).toBe(false);
  });
});
