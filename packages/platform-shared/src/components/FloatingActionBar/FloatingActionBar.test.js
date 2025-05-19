/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
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
});
