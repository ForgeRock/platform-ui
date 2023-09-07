/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises, mount } from '@vue/test-utils';
import TextArea from './index';

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
  it('TextArea input component has correct attributes', () => {
    const wrapper = mount(TextArea, {
      props: {
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

  it('TextArea input component sets floatLabels correctly', async () => {
    const wrapper = shallowMount(TextArea, {
      props: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.onClick();
    await flushPromises();
    expect(wrapper.vm.floatLabels).toBe(false);
    await wrapper.setProps({ label: 'test' });
    wrapper.vm.onClick();
    await flushPromises();
    expect(wrapper.vm.floatLabels).toBe(true);

    wrapper.vm.floatLabels = false;
    wrapper.vm.inputValueHandler(null);
    expect(wrapper.vm.floatLabels).toBe(false);
    wrapper.vm.inputValueHandler('test');
    expect(wrapper.vm.floatLabels).toBe(true);
  });
});
