/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import DurationInput from './index';

const localVue = createLocalVue();

const defaultProps = {
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
  readonly: false,
  autofocus: true,
  value: 'PT1M',
};

describe('DurationInput', () => {
  it('DurationInput component loaded', () => {
    const wrapper = shallowMount(DurationInput, {
      localVue,
      propsData: {
        ...defaultProps,
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    expect(wrapper.name()).toBe('DurationInput');
  });

  it('builds a formatted duration', () => {
    const wrapper = shallowMount(DurationInput, {
      localVue,
      propsData: {
        ...defaultProps,
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    expect(wrapper.vm.durationUnit).toBe('minutes');
    wrapper.vm.setDurationUnit('seconds');
    expect(wrapper.vm.durationUnit).toBe('seconds');
    expect(wrapper.emitted().input[0][0]).toEqual('PT1S');
  });

  it('builds a formatted duration', () => {
    const wrapper = shallowMount(DurationInput, {
      localVue,
      propsData: {
        ...defaultProps,
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    wrapper.setData({
      durationValue: 3,
      durationUnit: 'years',
    });

    expect(wrapper.vm.durationUnit).toBe('years');
    wrapper.vm.setDurationUnit('hours');
    expect(wrapper.vm.durationUnit).toBe('hours');
    expect(wrapper.emitted().input[0][0]).toEqual('PT3H');
  });

  it('sets month input', () => {
    const wrapper = shallowMount(DurationInput, {
      localVue,
      propsData: {
        ...defaultProps,
        value: 'P1M',
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    expect(wrapper.vm.durationUnit).toBe('months');
  });
});
