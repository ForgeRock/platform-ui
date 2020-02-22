/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import SearchInput from './index';

describe('SearchInput Component', () => {
  it('SearchInput successfully loaded', () => {
    const wrapper = shallowMount(SearchInput);
    expect(wrapper.name()).toEqual('SearchInput');
  });

  it('It has correct prepend icon and placeholder text on load', () => {
    const wrapper = shallowMount(SearchInput);
    expect(wrapper.find('.fr-icon-input-left').text()).toBe('search');
    expect(wrapper.find('.fr-icon-input-right').exists()).toBe(false);
    expect(wrapper.find('.fr-icon-input').attributes().placeholder).toBe('Search');
  });

  it('Can set icon and placeholder text with props', () => {
    const wrapper = shallowMount(SearchInput, {
      propsData: {
        prependIcon: 'settings',
        placeholder: 'this is a test',
      },
    });
    expect(wrapper.find('.fr-icon-input-left').text()).toBe('settings');
    expect(wrapper.find('.fr-icon-input').attributes().placeholder).toBe('this is a test');
  });

  it('After typing into the input, the append icon will show', () => {
    const wrapper = shallowMount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    expect(wrapper.find('.fr-icon-input').attributes().value).toBe('Hello');
    expect(wrapper.find('.fr-icon-input-right').exists()).toBe(true);
    expect(wrapper.find('.fr-icon-input-right').text()).toBe('close');
  });

  it('clicking the close icon will clear the input value and remove the icon', () => {
    const wrapper = shallowMount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    wrapper.find('.fr-icon-input-right').trigger('click');
    expect(wrapper.find('.fr-icon-input').attributes().value).toBe('');
    expect(wrapper.find('.fr-icon-input-right').exists()).toBe(false);
  });

  it('emits an event when the input value changes', () => {
    const wrapper = shallowMount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    expect(wrapper.emitted().input[0]).toEqual(['Hello']);
  });

  it('emits an event when the close icon is clicked', () => {
    const wrapper = shallowMount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    wrapper.find('.fr-icon-input-right').trigger('click');
    expect(wrapper.emitted().clear).toBeTruthy();
  });

  it('Pressing enter in the search input will emit an event', () => {
    const wrapper = shallowMount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    wrapper.find('.fr-icon-input').trigger('keydown.enter');
    expect(wrapper.emitted().search).toBeTruthy();
  });
});
