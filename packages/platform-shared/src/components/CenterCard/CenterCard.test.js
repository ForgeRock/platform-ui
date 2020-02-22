/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';

import CenterCard from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CenterCard Component', () => {
  it('CenterCard successfully loaded', () => {
    const wrapper = shallowMount(CenterCard, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('CenterCard');
  });

  it('CenterCard has a logo with default props', () => {
    const wrapper = mount(CenterCard, {
      mocks: {
        $t: () => {},
      },
      propsData: {},
    });

    const logo = wrapper.find('.fr-logo');
    expect(logo.exists()).toBe(true);
  });

  it('CenterCard has a logo with props set', () => {
    const wrapper = mount(CenterCard, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        hideLogo: false,
      },
    });

    const logo = wrapper.find('.fr-logo');
    expect(logo.exists()).toBe(true);
  });

  it('CenterCard does not have a logo with props set', () => {
    const wrapper = mount(CenterCard, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        hideLogo: true,
      },
    });

    const logo = wrapper.find('.fr-logo');
    expect(logo.exists()).toBe(false);
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
