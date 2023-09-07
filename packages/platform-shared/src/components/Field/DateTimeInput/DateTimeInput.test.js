/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import DateTimeInput from './index';

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
  it('sets date and time from formatted string', () => {
    const wrapper = shallowMount(DateTimeInput, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        label: 'test',
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
    });

    wrapper.vm.setInputValue('0100-01-01');
    expect(wrapper.vm.dateValue).toBe(null);
    expect(wrapper.vm.timeValue).toBe(null);
    wrapper.vm.setInputValue('0200-02-02T02:02:02');
    expect(wrapper.vm.dateValue).toBe('0200-02-02');
    expect(wrapper.vm.timeValue).toBe('02:02:02');
    wrapper.vm.setInputValue('2023-03-03T03:03:03+00:00');
    expect(wrapper.vm.dateValue).toContain('2023-03-0');
    expect(wrapper.vm.timeValue).toContain(':03:03');
  });

  it('builds a formatted datetime', () => {
    const wrapper = shallowMount(DateTimeInput, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
        label: 'test',
      },
      global: {
        mocks: {
          $t: (text) => (text),
        },
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
    expect(wrapper.emitted().input[1][0]).toContain('100-01-0');

    wrapper.setData({
      dateValue: '0100-01-01',
      timeValue: '01:01:01Z',
    });
    wrapper.vm.emitDateTimeValue();
    expect(wrapper.emitted().input[2][0]).toContain('T01:01:01Z');
  });
});
