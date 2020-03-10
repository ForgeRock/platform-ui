/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
    expect(wrapper).toMatchSnapshot();
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
