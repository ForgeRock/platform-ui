/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
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

let wrapper;
beforeEach(() => {
  wrapper = shallowMount(TimeInput, {
    localVue,
    propsData: {
      ...defaultMixinProps,
      label: 'test',
    },
    mocks: {
      $t: (text) => (text),
    },
  });
});

describe('TimeInput', () => {
  it('builds a formatted time', () => {
    wrapper.vm.emitValidTime('01:01');
    expect(wrapper.emitted().input[0][0]).toContain(':01:00Z');
    wrapper.vm.emitValidTime('02:02:02');
    expect(wrapper.emitted().input[1][0]).toContain(':02:02Z');
    wrapper.vm.emitValidTime('');
    expect(wrapper.emitted().input[2][0]).toContain(':00:00Z');
    wrapper.setData({ inputValue: '03:03:03' });
    expect(wrapper.vm.inputValue).toEqual('03:03:03');
  });
});
