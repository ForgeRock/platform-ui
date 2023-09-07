/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Timepicker from './index';

describe('Timepicker Component', () => {
  it('contains a bootstrap timepicker', () => {
    const wrapper = shallowMount(Timepicker);
    expect(wrapper.findComponent({ name: 'BFormTimepicker' }).exists()).toBe(true);
  });

  it('has placeholder text', () => {
    const wrapper = shallowMount(Timepicker, {
      props: {
        placeholder: 'test',
      },
    });
    expect(wrapper.findComponent({ name: 'BFormTimepicker' }).attributes('placeholder')).toBe('test');
  });

  it('floats placeholder text when a value is set', async () => {
    const wrapper = shallowMount(Timepicker, {
      props: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    await wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });
});
