/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint-disable import/no-extraneous-dependencies */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';
import FloatingLabelInput from './index';

const localVue = createLocalVue();
localVue.use(ValidationErrorList);
localVue.use(BootstrapVue);

describe('FloatingLabelInput.vue', () => {
  it('Floating Label Input component loaded', () => {
    const wrapper = shallowMount(FloatingLabelInput, {
      localVue,
      propsData: {
        label: '',
        type: '',
        autofocus: '',
        fieldName: 'test',
      },
    });

    expect(wrapper.name()).toBe('FloatingLabelInput');
    expect(wrapper).toMatchSnapshot();
  });

  it('Floating Label Input emits a change on value change', () => {
    const wrapper = shallowMount(FloatingLabelInput, {
      localVue,
      propsData: {
        label: '',
        type: '',
        autofocus: '',
        fieldName: 'test',
      },
    });

    wrapper.vm.inputValue = 'test';
    expect(wrapper.emitted().input.length).toBe(1);
  });

  it('Floating Label password reveal', () => {
    const wrapper = shallowMount(FloatingLabelInput, {
      localVue,
      propsData: {
        label: '',
        type: 'password',
        autofocus: '',
        fieldName: 'test',
        reveal: true,
      },
    });

    wrapper.setData({ showPassword: true });

    expect(wrapper.vm.showPassword).toBe(true);

    wrapper.vm.revealText();

    expect(wrapper.vm.showPassword).toBe(false);

    wrapper.vm.revealText();

    expect(wrapper.vm.showPassword).toBe(true);
  });
});
