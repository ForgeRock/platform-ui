/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import SearchInput from './index';

describe('SearchInput Component', () => {
  it('It has correct prepend icon and placeholder text on load', () => {
    const wrapper = mount(SearchInput);
    expect(wrapper.vm.prependIcon).toBe('search');
    expect(wrapper.find('.input-group-prepend .material-icons-outlined').text()).toBe('search');
    expect(wrapper.find('.input-group-append .material-icons-outlined').exists()).toBe(false);
    expect(wrapper.find('input[type="search"]').attributes().placeholder).toBe('Search');
  });

  it('Can set icon and placeholder text with props', () => {
    const wrapper = mount(SearchInput, {
      propsData: {
        prependIcon: 'settings',
        placeholder: 'this is a test',
      },
    });
    expect(wrapper.find('.input-group-prepend .material-icons-outlined').text()).toBe('settings');
    expect(wrapper.find('input[type="search"]').attributes().placeholder).toBe('this is a test');
  });

  it('After typing into the input, the append icon will show', async () => {
    const wrapper = mount(SearchInput);
    expect(wrapper.find('.input-group-append .material-icons-outlined').exists()).toBe(false);
    wrapper.setData({ value: 'Hello' });
    await flushPromises();
    expect(wrapper.find('.input-group-append .material-icons-outlined').exists()).toBe(true);
    expect(wrapper.find('.input-group-append .material-icons-outlined').text()).toBe('close');
  });

  it('clicking the close icon will clear the input value and remove the icon', () => {
    const wrapper = mount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    expect(wrapper.find('.input-group-append .material-icons-outlined').exists()).toBe(true);
    wrapper.find('.input-group-append .material-icons-outlined').trigger('click');
    expect(wrapper.find('input[type="search"]').text()).toBe('');
    expect(wrapper.find('.input-group-append .material-icons-outlined').exists()).toBe(false);
  });

  it('emits an event when the input value changes', () => {
    const wrapper = mount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    expect(wrapper.emitted().input[0]).toEqual(['Hello']);
  });

  it('emits a clear event when the close icon is clicked', () => {
    const wrapper = mount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    wrapper.find('.input-group-append .material-icons-outlined').trigger('click');
    expect(wrapper.emitted().clear).toBeTruthy();
  });

  it('emits a clear event when esc is pressed in the search input', () => {
    const wrapper = mount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    wrapper.find('input[type="search"]').trigger('keydown.esc');
    expect(wrapper.emitted().clear).toBeTruthy();
  });

  it('Pressing enter in the search input will emit an event', () => {
    const wrapper = mount(SearchInput);
    wrapper.setData({ value: 'Hello' });
    wrapper.find('input[type="search"]').trigger('keydown.enter');
    expect(wrapper.emitted().search).toBeTruthy();
  });
});
