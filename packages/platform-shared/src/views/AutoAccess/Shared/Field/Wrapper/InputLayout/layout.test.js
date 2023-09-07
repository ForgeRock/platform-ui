/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import InputLayout from './index';

const defaultProps = {
  id: '',
  errorMessages: [],
  fieldName: '',
  helpText: '',
  hideLabel: false,
  label: '',
};

describe('InputLayout', () => {
  it('InputLayout component renders help text and label', () => {
    const wrapper = mount(InputLayout, {
      props: {
        ...defaultProps,
        helpText: 'Help text',
        label: 'Label',
      },
    });
    const label = wrapper.find('label');
    const helpText = wrapper.find('small');

    expect(label.exists()).toBe(true);
    expect(label.html().includes('Label')).toBe(true);
    expect(helpText.exists()).toBe(true);
    expect(helpText.html().includes('Help text')).toBe(true);
  });

  it('InputLayout component renders slots', () => {
    const wrapper = mount(InputLayout, {
      props: {
        ...defaultProps,
      },
      slots: {
        default: '<span class="test_default">default</span>',
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>', // Will match <slot name="FooBar" />,
      },
    });

    expect(wrapper.find('.test_default').exists()).toBe(true);
    expect(wrapper.find('.test_prepend').exists()).toBe(true);
    expect(wrapper.find('.test_append').exists()).toBe(true);
  });
});
