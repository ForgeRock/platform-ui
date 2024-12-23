/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, shallowMount } from '@vue/test-utils';
import TimeInput from './index';

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

let wrapper;
beforeEach(() => {
  wrapper = shallowMount(TimeInput, {
    props: {
      ...defaultMixinProps,
      label: 'test',
    },
    global: {
      mocks: {
        $t: (text) => (text),
      },
    },
  });
});

describe('TimeInput', () => {
  it('builds a formatted time', async () => {
    wrapper.vm.emitValidTime('01:01');
    expect(wrapper.emitted().input[0][0]).toContain('1:00Z');
    wrapper.vm.emitValidTime('02:02:02');
    expect(wrapper.emitted().input[1][0]).toContain('2:02Z');
    wrapper.vm.emitValidTime('');
    expect(wrapper.emitted().input[2][0]).toContain('');
    wrapper.vm.inputValue = '03:03:03 Z';
    await flushPromises();
    expect(wrapper.vm.inputValue).toEqual('03:03:03');
  });
  it('No input event is emitted when the component is initialized', async () => {
    await flushPromises();
    expect(wrapper.emitted().input).toBeFalsy();
  });
  it('No input event is emitted when the input value is not changed', async () => {
    wrapper.setData({ inputValue: '01:01' });
    await flushPromises();
    wrapper.vm.inputValue = '01:01';
    expect(wrapper.emitted().input).toBeFalsy();
  });
  it('Event is emitted when the input value is changed', async () => {
    wrapper.setData({ inputValue: '01:01' });
    await wrapper.vm.$nextTick();
    wrapper.vm.emitValidTime('02:02');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted().input[0][0]).toBeTruthy();
  });
});
