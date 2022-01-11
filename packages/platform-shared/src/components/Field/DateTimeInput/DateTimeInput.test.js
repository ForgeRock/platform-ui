/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import DateTimeInput from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
  readonly: false,
  autofocus: true,
};

const defaultProps = {
  type: 'test',
};

describe('DateTimeInput', () => {
  it('DateTimeInput component loaded', () => {
    const wrapper = shallowMount(DateTimeInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    expect(wrapper.name()).toBe('DateTimeInput');
  });

  it('sets date and time from formatted string', () => {
    const wrapper = shallowMount(DateTimeInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        label: 'test',
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    wrapper.vm.setInputValue('0100-01-01');
    expect(wrapper.vm.dateValue).toBe(null);
    expect(wrapper.vm.timeValue).toBe(null);
    wrapper.vm.setInputValue('0200-02-02T02:02:02');
    expect(wrapper.vm.dateValue).toBe('0200-02-02');
    expect(wrapper.vm.timeValue).toBe('02:02:02');
    wrapper.vm.setInputValue('0300-03-03T03:03:03+00:00');
    expect(wrapper.vm.dateValue).toBe('0300-03-03');
    expect(wrapper.vm.timeValue).toBe('03:03:03');
  });

  it('builds a formatted datetime', () => {
    const wrapper = shallowMount(DateTimeInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        label: 'test',
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    wrapper.setData({
      dateValue: '',
      timeValue: '01:01:01',
    });
    wrapper.vm.emitDateTimeValue();
    expect(wrapper.emitted().input[0][0]).toBe('');

    wrapper.setData({
      dateValue: '0100-01-01',
      timeValue: '',
    });
    wrapper.vm.emitDateTimeValue();
    expect(wrapper.emitted().input[1][0]).toBe('');

    wrapper.setData({
      dateValue: '0100-01-01',
      timeValue: '01:01:01',
    });
    wrapper.vm.emitDateTimeValue();
    expect(wrapper.emitted().input[2][0]).toBe('0100-01-01T01:01:01');
  });
});
