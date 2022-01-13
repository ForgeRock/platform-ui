/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import CountCard from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CountCard Component', () => {
  let wrapper;
  const propsData = {
    count: 100,
    title: 'Unit Test Count',
    tooltip: 'Unit Test tooltip description',
  };

  it('CountCard successfully loaded with all required props', () => {
    wrapper = shallowMount(CountCard, {
      propsData,
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('CountCard');
  });

  it('CountCard to show loader and hide count when loader prop set to true', () => {
    wrapper = shallowMount(CountCard, {
      propsData: {
        ...propsData,
        loading: true,
      },
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.contains('.fr-spinner')).toBe(true);
    expect(wrapper.find('h1').exists()).toBe(false);
  });

  it('CountCard to hide loader and show count when loader prop set to false', () => {
    wrapper = shallowMount(CountCard, {
      propsData: {
        ...propsData,
        loading: false,
      },
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.contains('.fr-spinner')).toBe(false);
    expect(wrapper.find('h1').exists()).toBe(true);
  });
});
