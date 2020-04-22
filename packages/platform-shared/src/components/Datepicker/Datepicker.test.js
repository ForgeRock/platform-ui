/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import Datepicker from './index';

describe('Datepicker Component', () => {
  it('Datepicker successfully loaded', () => {
    const wrapper = shallowMount(Datepicker);
    expect(wrapper.name()).toEqual('Datepicker');
  });

  it('contains a bootstrap datepicker', () => {
    const wrapper = shallowMount(Datepicker);
    expect(wrapper.find({ name: 'BFormDatepicker' }).exists()).toBe(true);
  });

  it('has placeholder text', () => {
    const wrapper = shallowMount(Datepicker, {
      propsData: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find({ name: 'BFormDatepicker' }).attributes('placeholder')).toBe('test');
  });

  it('floats placeholder text when a value is set', () => {
    const wrapper = shallowMount(Datepicker, {
      propsData: {
        placeholder: 'test',
      },
    });
    expect(wrapper.find('.input-has-value').exists()).toBe(false);
    wrapper.setProps({ value: 'John' });
    expect(wrapper.find('.input-has-value').exists()).toBe(true);
  });
});
