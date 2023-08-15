/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import DateInput from './index';

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
  autofocus: false,
  type: 'test',
};

describe('DateInput', () => {
  it('builds a formatted date', () => {
    const wrapper = shallowMount(DateInput, {
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

    expect(wrapper.vm.buildFormattedDate('100-1-1')).toBe('0100-01-01');
    expect(wrapper.vm.buildFormattedDate('00200-0002-002')).toBe('0200-02-02');
    wrapper.vm.setInputValue('0300-03-03');
    expect(wrapper.vm.inputValue).toBe('0300-03-03');
    wrapper.vm.emitDateValue('4000-1-1');
    expect(wrapper.emitted().input[0][0]).toBe('4000-01-01');
    wrapper.vm.emitDateValue('');
    expect(wrapper.emitted().input[1][0]).toBe('');
  });
});
