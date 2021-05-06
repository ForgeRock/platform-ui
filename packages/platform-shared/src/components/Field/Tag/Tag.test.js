/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Tag from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  errors: [],
  name: '',
  description: '',
  isHtml: false,
  label: 'test',
};

const defaultProps = {
  options: [],
};

describe('Tag input', () => {
  it('Tag input component loaded', () => {
    const wrapper = shallowMount(Tag, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });

    expect(wrapper.name()).toBe('Tag');
  });

  it('Tag input sets input value', async () => {
    const wrapper = shallowMount(Tag, {
      localVue,
      mocks: {
        $t: () => {},
      },
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        options: ['a', 'b', 'c'],
      },
    });
    wrapper.vm.setInputValue('');
    expect(wrapper.vm.inputValue).toStrictEqual([]);
    wrapper.vm.setInputValue(['test']);
    expect(wrapper.vm.inputValue).toStrictEqual(['test']);

    expect(wrapper.vm.floatLabels).toBe(true);
    wrapper.vm.inputValueHandler(['test'], false);
    expect(wrapper.vm.floatLabels).toBe(true);
    wrapper.vm.inputValueHandler('', true);
    expect(wrapper.vm.floatLabels).toBe(true);
    wrapper.vm.inputValueHandler('', false);
    expect(wrapper.vm.floatLabels).toBe(false);
  });
});
