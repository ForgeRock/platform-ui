/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import TimeInput from './index';

const localVue = createLocalVue();

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

describe('TimeInput', () => {
  it('TimeInput component loaded', () => {
    const wrapper = shallowMount(TimeInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    expect(wrapper.name()).toBe('TimeInput');
  });

  it('builds a formatted time', () => {
    const wrapper = shallowMount(TimeInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        label: 'test',
      },
      mocks: {
        $t: (text) => (text),
      },
    });

    wrapper.vm.emitValidTime('01:01');
    expect(wrapper.emitted().input[0][0]).toEqual('01:01:00.000');
    wrapper.vm.emitValidTime('02:02:02');
    expect(wrapper.emitted().input[1][0]).toEqual('02:02:02.000');
    wrapper.vm.emitValidTime('');
    expect(wrapper.emitted().input[2][0]).toEqual('');
    wrapper.setData({ inputValue: '03:03:03' });
    expect(wrapper.vm.inputValue).toEqual('03:03:03');
  });
});
