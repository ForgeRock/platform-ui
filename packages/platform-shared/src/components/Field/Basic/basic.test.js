/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import BasicInput from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const defaultMixinProps = {
  id: '',
  errorMessages: [],
  fieldName: '',
  helpText: '',
  hideLabel: false,
  isHtml: false,
  label: '',
};

const defaultProps = {
  autofocus: false,
  type: 'test',
};

describe('BasicInput', () => {
  it('BasicInput component loaded', () => {
    const wrapper = shallowMount(BasicInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
    });

    expect(wrapper.name()).toBe('BasicInput');
  });

  it('BasicInput component renders reveal button for password', () => {
    const wrapper = mount(BasicInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
        type: 'password',
      },
    });
    const button = wrapper.find('button');
    const input = wrapper.find('input');

    expect(button.exists()).toBe(true);
    expect(button.attributes('name')).toBe('revealButton');
    expect(wrapper.vm.showPassword).toBe(false);
    expect(input.attributes('type')).toBe('password');

    button.trigger('click');

    expect(wrapper.vm.showPassword).toBe(true);
    expect(input.attributes('type')).toBe('text');
  });

  it('BasicInput passes through component slots', () => {
    const wrapper = mount(BasicInput, {
      localVue,
      propsData: {
        ...defaultMixinProps,
        ...defaultProps,
      },
      slots: {
        prepend: '<span class="test_prepend">prepend</span>',
        append: '<span class="test_append">append</span>',
      },
    });

    expect(wrapper.contains('.test_prepend')).toBe(true);
    expect(wrapper.contains('.test_append')).toBe(true);
  });
});
