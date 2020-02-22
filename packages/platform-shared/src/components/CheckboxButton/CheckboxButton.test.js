/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';

import CheckboxButton from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('CheckboxButton Component', () => {
  it('CheckboxButton successfully loaded', () => {
    const wrapper = shallowMount(CheckboxButton);

    expect(wrapper.name()).toEqual('CheckboxButton');
  });

  it('CheckboxButton loads unselected with default props', () => {
    const wrapper = mount(CheckboxButton);

    const checkbox = wrapper.find('.btn-outline-secondary');

    expect(checkbox.exists()).toBe(true);
    expect(checkbox.classes('active')).toBe(false);
  });

  it('CheckboxButton loads selected with default props', () => {
    const wrapper = mount(CheckboxButton, {
      propsData: {
        defaultChecked: true,
      },
    });

    const checkbox = wrapper.find('.btn-outline-secondary');

    expect(checkbox.exists()).toBe(true);
    expect(checkbox.classes('active')).toBe(true);
  });

  it('CheckboxButton toggles selected when clicked', () => {
    const wrapper = mount(CheckboxButton);

    const button = wrapper.find('.btn');
    const checkbox = wrapper.find('.btn-outline-secondary');

    expect(checkbox.classes('active')).toBe(false);
    button.trigger('click');
    expect(checkbox.classes('active')).toBe(true);
  });
});
