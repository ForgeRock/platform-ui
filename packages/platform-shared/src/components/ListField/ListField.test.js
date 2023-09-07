/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
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
  });
});
