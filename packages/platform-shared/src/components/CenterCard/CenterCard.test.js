/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import CenterCard from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CenterCard Component', () => {
  it('Center Card component loaded with header images', () => {
    const wrapper = shallowMount(CenterCard, {
      localVue,
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.find('.fr-logo').exists()).toBe(true);
  });

  it('CenterCard has a logo with default props', () => {
    const wrapper = mount(CenterCard, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        showLogo: true,
      },
    });

    const logo = wrapper.find('.fr-logo');
    expect(logo.exists()).toBe(true);
  });

  it('CenterCard slots have the correct items', () => {
    const wrapper = mount(CenterCard, {
      mocks: {
        $t: () => {},
      },
      propsData: {
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
