/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import Spinner from './index';

describe('Spinner Component', () => {
  it('Spinner successfully loaded', () => {
    const wrapper = shallowMount(Spinner);
    expect(wrapper.name()).toEqual('Spinner');
  });

  it('Is a large spinner by default', () => {
    const wrapper = shallowMount(Spinner);
    expect(wrapper.find('.spinner-large').text()).toBe('Loading...');
  });

  it('Is a small spinner when using sm size', () => {
    const wrapper = shallowMount(Spinner, {
      propsData: {
        size: 'sm',
      },
    });
    expect(wrapper.find('.spinner-small').text()).toBe('Loading...');
  });

  it('Has the text-primary class by default', () => {
    const wrapper = shallowMount(Spinner);
    expect(wrapper.find('.text-primary').text()).toBe('Loading...');
  });

  it('Does not have the text-primary class when it is a buttonSpinner', () => {
    const wrapper = shallowMount(Spinner, {
      propsData: {
        buttonSpinner: true,
      },
    });
    expect(wrapper.find('.spinner-large').classes('text-primary')).toBe(false);
  });
});
