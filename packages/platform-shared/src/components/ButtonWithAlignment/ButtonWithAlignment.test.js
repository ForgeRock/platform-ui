/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ButtonWithAlignment from './index';

describe('ButtonWithAlignment', () => {
  it('ButtonWithAlignment successfully loaded', () => {
    const wrapper = shallowMount(ButtonWithAlignment, {
      mocks: {
        $t: () => {},
      },
      slots: {
        default: 'button content',
      },
    });

    expect(wrapper.name()).toEqual('ButtonWithAlignment');
    expect(wrapper.html()).toContain('button content');
    // default props
    expect(wrapper.props().buttonPosition).toBe('button-full-width');
    expect(wrapper.props().disabled).toBe(false);
    expect(wrapper.props().type).toBe('button');
    expect(wrapper.props().variant).toBe('primary');
    // defult button position class exists
    expect(wrapper.find('.flex-column').exists()).toBe(true);
  });

  it('ButtonWithAlignment button position change and render the correct class', () => {
    const wrapper = shallowMount(ButtonWithAlignment, {
      mocks: {
        $t: () => {},
      },
    });

    // defult button position class exists
    expect(wrapper.find('.flex-column').exists()).toBe(true);

    wrapper.setProps({ buttonPosition: 'button-center' });
    expect(wrapper.find('.justify-content-center').exists()).toBe(true);

    wrapper.setProps({ buttonPosition: 'button-left' });
    expect(wrapper.find('.justify-content-start').exists()).toBe(true);

    wrapper.setProps({ buttonPosition: 'button-right' });
    expect(wrapper.find('.justify-content-end').exists()).toBe(true);
  });
});
