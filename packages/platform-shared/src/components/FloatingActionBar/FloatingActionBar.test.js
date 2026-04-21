/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { BDropdown } from 'bootstrap-vue';
import FloatingActionBar from './FloatingActionBar';
import i18n from '@/i18n';

function mountComponent(props) {
  const wrapper = mount(FloatingActionBar, {
    global: {
      plugins: [i18n],
    },
    props: {
      count: 0,
      buttons: [],
      menuItems: [],
      ...props,
    },
  });
  return wrapper;
}

describe('FloatingActionBar Component', () => {
  it('Bar does not appear if count (context items) is 0', () => {
    const wrapper = mountComponent();
    const floatingActionBar = wrapper.find('.floating-action-bar');
    expect(floatingActionBar.exists()).toBe(false);
  });

  it('Bar exists if count (context items) is greater than 0', async () => {
    const wrapper = mountComponent({ count: 1 });
    const floatingActionBar = wrapper.find('.floating-action-bar');
    expect(floatingActionBar.exists()).toBe(true);
    expect(wrapper.find('.font-weight-bold').text()).toBe('1');
  });

  it('Shows buttons passed in', () => {
    const wrapper = mountComponent({ count: 1, buttons: [{ label: 'Test Button', icon: 'plus', event: 'clicked-button' }] });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[1].exists()).toBe(true);
    expect(buttons[1].text()).toBe('plusTest Button');
  });

  it('Shows divider if a divider is passed in', () => {
    const wrapper = mountComponent({ count: 1, buttons: [{ label: 'Test Button', icon: 'plus', event: 'clicked-button' }, { divider: true }] });
    const divider = wrapper.find('.vertical-divider');
    expect(divider.exists()).toBe(true);
  });

  it('Emits clicked button event', async () => {
    const wrapper = mountComponent({ count: 1, buttons: [{ label: 'Test Button', icon: 'plus', event: 'clicked-button' }] });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    buttons[1].trigger('click');
    expect(wrapper.emitted('clicked-button')).toBeTruthy();
  });

  it('focusDeselectButton moves focus to the deselect button', () => {
    const wrapper = mountComponent({ count: 1 });
    const deselectBtn = wrapper.findAll('button').find((b) => b.text() === 'Deselect');
    const focusSpy = jest.spyOn(deselectBtn.element, 'focus');
    wrapper.vm.focusDeselectButton();
    expect(focusSpy).toHaveBeenCalled();
  });

  describe('more dropdown focus management', () => {
    const menuItems = [{ label: 'Allow exception', icon: 'schedule', event: 'exception' }];

    it('closes the more dropdown when focus moves outside the wrapper', () => {
      const wrapper = mountComponent({ count: 1, menuItems });
      const dropdown = wrapper.findComponent(BDropdown);
      const hideSpy = jest.spyOn(dropdown.vm, 'hide');

      const wrapperEl = dropdown.element.parentElement;
      wrapperEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));

      expect(hideSpy).toHaveBeenCalled();
    });

    it('does not close the more dropdown when focus stays inside the wrapper', () => {
      const wrapper = mountComponent({ count: 1, menuItems });
      const dropdown = wrapper.findComponent(BDropdown);
      const hideSpy = jest.spyOn(dropdown.vm, 'hide');

      const wrapperEl = dropdown.element.parentElement;
      const insideEl = wrapperEl.querySelector('button');
      wrapperEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: insideEl }));

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it('emits the item event with the dropdown toggle button as the second argument when a menu item is clicked', async () => {
      const wrapper = mountComponent({ count: 1, menuItems });
      // The toggle button is the .dropdown-toggle inside the wrapper div.
      // BV adds this class to the toggle button reliably.
      const toggleEl = wrapper.element.querySelector('.dropdown-toggle');

      await wrapper.find('.dropdown-item').trigger('click');

      const emitted = wrapper.emitted('exception');
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toBe(toggleEl);
    });
  });
});
