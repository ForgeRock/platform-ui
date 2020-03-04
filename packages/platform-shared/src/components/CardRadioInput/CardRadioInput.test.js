/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import CardRadioInput from './index';

describe('CardRadioInput Component', () => {
  let wrapper;

  it('CardRadioInput successfully loaded', () => {
    wrapper = shallowMount(CardRadioInput);
    expect(wrapper.name()).toEqual('CardRadioInput');
  });

  it('uses a card containing value text by default', () => {
    wrapper = shallowMount(CardRadioInput, {
      propsData: {
        value: 'test',
      },
    });
    expect(wrapper.find('bcard-stub').exists()).toBe(true);
    expect(wrapper.find('bcard-stub').text()).toEqual('test');
  });

  it('default slot will allow for custom content within card', () => {
    wrapper = shallowMount(CardRadioInput, {
      propsData: {
        value: 'test',
      },
      slots: {
        default: '<code></code>',
      },
    });
    expect(wrapper.find('bcard-stub').exists()).toBe(true);
    expect(wrapper.text()).toEqual('');
    expect(wrapper.find('code').exists()).toBe(true);
  });
});
