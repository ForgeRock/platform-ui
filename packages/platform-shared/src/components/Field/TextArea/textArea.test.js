/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import TextArea from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  name: '',
  description: '',
  isHtml: false,
  label: '',
};

const defaultProps = {
  autofocus: false,
  type: 'test',
};

describe('TextArea input', () => {
  it('TextArea input component loaded', () => {
    const wrapper = shallowMount(TextArea, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });

    expect(wrapper.name()).toBe('TextArea');
  });

  it('TextArea input component has correct attributes', () => {
    const wrapper = shallowMount(TextArea, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        cols: 5,
        rows: 6,
      },
    });

    const textarea = wrapper.find('textarea');

    expect(textarea.attributes('cols')).toBe('5');
    expect(textarea.attributes('rows')).toBe('6');
  });

  it('TextArea input component sets floatLabels correctly', () => {
    const wrapper = shallowMount(TextArea, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.onClick();
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.setProps({ label: 'test' });
    wrapper.vm.onClick();
    expect(wrapper.vm.floatLabels).toBe(true);

    wrapper.vm.floatLabels = false;
    wrapper.vm.inputValueHandler(null);
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.inputValueHandler('test');
    expect(wrapper.vm.floatLabels).toBe(true);
  });
});
