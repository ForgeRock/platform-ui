/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import CountCard from './index';

describe('CountCard Component', () => {
  let wrapper;
  const propsData = {
    count: 100,
    title: 'Unit Test Count',
    tooltip: 'Unit Test tooltip description',
  };

  it('CountCard to show loader and hide count when loader prop set to true', () => {
    wrapper = shallowMount(CountCard, {
      props: {
        ...propsData,
        loading: true,
      },
      global: {
        stubs: ['RouterLink'],
        mocks: {
          $t: () => {},
        },
        renderStubDefaultSlot: true,
      },
    });

    expect(wrapper.find('.fr-spinner').exists()).toBe(true);
    expect(wrapper.find('h1').exists()).toBe(false);
  });

  it('CountCard to hide loader and show correct count when loader prop set to false', () => {
    wrapper = shallowMount(CountCard, {
      props: {
        ...propsData,
        loading: false,
      },
      global: {
        stubs: ['RouterLink'],
        mocks: {
          $t: () => {},
        },
        renderStubDefaultSlot: true,
      },
    });

    expect(wrapper.find('.fr-spinner').exists()).toBe(false);
    expect(wrapper.find('h1').exists()).toBe(true);

    const h1 = findByTestId(wrapper, 'counter-unit_test_count');
    expect(h1.text()).toBe('100');
  });
});
