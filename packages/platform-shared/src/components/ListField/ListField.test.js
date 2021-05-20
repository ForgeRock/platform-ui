/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ListField from './index';

describe('ListField', () => {
  it('ListField loaded', () => {
    const wrapper = shallowMount(ListField, {
      propsData: {
        name: 'test',
      },
    });
    expect(wrapper.name()).toBe('ListField');
  });

  it('ListField sets inputValue to array when value is empty', () => {
    const wrapper = shallowMount(ListField, {
      propsData: {
        name: 'test',
        value: '',
      },
    });
    expect(wrapper.vm.inputValue).toStrictEqual([]);
  });

  it('ListField sets inputValue to value when value is not empty', () => {
    const wrapper = shallowMount(ListField, {
      propsData: {
        name: 'test',
        value: 'test',
      },
    });
    expect(wrapper.vm.inputValue).toStrictEqual('test');
  });

  it('ListField sets validation', () => {
    const wrapper = shallowMount(ListField, {
      propsData: {
        name: 'test',
        type: '',
      },
    });
    expect(wrapper.vm.validation).toBe('');
    wrapper.setProps({
      items: {
        type: 'boolean',
      },
    });
    expect(wrapper.vm.validation).toBe('oneOf:true,false');
    wrapper.setProps({
      items: {
        type: 'number',
      },
    });
    expect(wrapper.vm.validation).toBe('numeric');
  });
});
