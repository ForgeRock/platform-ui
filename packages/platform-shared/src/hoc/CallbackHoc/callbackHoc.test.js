/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import Field from '@forgerock/platform-shared/src/components/Field';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import WithCallback from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('WithCallback', () => {
  it('WithCallback component loaded as wrapper', () => {
    const wrapper = shallowMount(WithCallback(Field), {
      localVue,
    });

    expect(wrapper.name()).toBe('WithCallback');
  });

  it('WithCallback component loaded', () => {
    const setInputValue = jest.fn();
    const wrapper = mount(WithCallback(Field), {
      localVue,
      propsData: {
        type: 'text',
        callback: {
          setInputValue,
        },
      },
    });

    expect(setInputValue).not.toHaveBeenCalled();
    wrapper.find(Field).setData({ field: { value: 'test' } });
    expect(setInputValue).toHaveBeenCalledWith('test');
  });
});
