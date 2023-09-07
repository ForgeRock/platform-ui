/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import DurationInput from './index';

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
  it('builds a formatted duration', () => {
    const wrapper = shallowMount(DurationInput, {
      props: {
        ...defaultProps,
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    expect(wrapper.vm.durationUnit).toBe('minutes');
    wrapper.vm.setDurationUnit('seconds');
    expect(wrapper.vm.durationUnit).toBe('seconds');
    expect(wrapper.emitted().input[0][0]).toEqual('PT1S');
  });

  it('builds a formatted duration', async () => {
    const wrapper = shallowMount(DurationInput, {
      props: {
        ...defaultProps,
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    await wrapper.setData({
      durationUnit: 'years',
    });
    wrapper.vm.durationValue = 3;

    expect(wrapper.vm.durationUnit).toBe('years');
    wrapper.vm.setDurationUnit('hours');
    expect(wrapper.vm.durationUnit).toBe('hours');
    expect(wrapper.emitted().input[0][0]).toEqual('PT3H');
  });

  it('sets month input', () => {
    const wrapper = shallowMount(DurationInput, {
      props: {
        ...defaultProps,
        value: 'P1M',
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    expect(wrapper.vm.durationUnit).toBe('months');
  });
});
