/**
 * Copyright (c) 2019-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import CenterCard from './index';

describe('CenterCard Component', () => {
  it('Center Card component loaded with header images', () => {
    const wrapper = shallowMount(CenterCard, {
      global: {
        mocks: {
          $t: () => {},
        },
        renderStubDefaultSlot: true,
      },
    });

    expect(wrapper.find('.ping-logo').exists()).toBe(true);
  });

  it('CenterCard has a logo with default props', () => {
    const wrapper = mount(CenterCard, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        showLogo: true,
      },
    });

    const logo = wrapper.find('.ping-logo');
    expect(logo.exists()).toBe(true);
  });

  it('CenterCard slots have the correct items', () => {
    const wrapper = mount(CenterCard, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      props: {
        hideHeader: false,
        hideFooter: false,
      },
      slots: {
        'center-card-header': '<h1>Header</h1>',
        'center-card-body': '<p>body</p>',
        'center-card-footer': '<footer>Footer</footer>',
      },
    });

    expect(
      wrapper.find('.card-header > h1').exists()
      && wrapper.find('.card-body > p').exists()
      && wrapper.find('.card-footer > footer').exists(),
    );
  });
});
