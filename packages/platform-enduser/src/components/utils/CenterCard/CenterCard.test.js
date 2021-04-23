/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import CenterCard from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CenterCard.vue', () => {
  it('Center Card component loaded without header images', () => {
    const wrapper = shallowMount(CenterCard, {
      localVue,
      i18n,
    });

    expect(wrapper.name()).toBe('CenterCard');
    expect(wrapper.contains('.fr-logo')).toBe(false);
  });

  it('Center Card component loaded with header images', () => {
    const wrapper = shallowMount(CenterCard, {
      localVue,
      i18n,
      propsData: {
        showLogo: true,
      },
    });

    expect(wrapper.contains('.fr-logo')).toBe(true);
  });
});
