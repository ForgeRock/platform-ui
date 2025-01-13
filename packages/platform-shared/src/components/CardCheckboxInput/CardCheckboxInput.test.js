/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import CardCheckboxInput from './index';

describe('CardCheckboxInput Component', () => {
  function setup(props = {}, slotContent = '') {
    const wrapper = mount(CardCheckboxInput, {
      props: {
        ...props,
      },
      slots: {
        default: slotContent,
      },
    });
    return wrapper;
  }

  it('has a checkbox input', () => {
    const wrapper = setup();
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('uses a card', () => {
    const wrapper = setup();
    expect(wrapper.find('input[type="checkbox"]').attributes('class')).toBe('card-input-element');
  });

  it('has a default value of false', () => {
    const wrapper = setup();
    expect(wrapper.find('input[type="checkbox"]').attributes('value')).toBe('false');
  });

  it('sets value to true based on prop', () => {
    const wrapper = setup({ value: true });
    expect(wrapper.find('input[type="checkbox"]').attributes('value')).toBe('true');
  });

  it('renders default slot content', () => {
    const wrapper = setup({}, '<div>Test</div>');
    expect(wrapper.find('div').text()).toBe('Test');
  });
});
