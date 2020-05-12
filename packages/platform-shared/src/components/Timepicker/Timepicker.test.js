/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import Timepicker from './index';

describe('Timepicker Component', () => {
  it('Timepicker successfully loaded', () => {
    const wrapper = shallowMount(Timepicker);
    expect(wrapper.name()).toEqual('Timepicker');
  });

  it('contains a bootstrap timepicker', () => {
    const wrapper = shallowMount(Timepicker);
    expect(wrapper.find({ name: 'BFormTimepicker' }).exists()).toBe(true);
  });

  it('has placeholder text', () => {
    const wrapper = shallowMount(Timepicker, {
      propsData: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find({ name: 'BFormTimepicker' }).attributes('placeholder')).toBe('test');
  });

  it('floats placeholder text when a value is set', () => {
    const wrapper = shallowMount(Timepicker, {
      propsData: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });
});
