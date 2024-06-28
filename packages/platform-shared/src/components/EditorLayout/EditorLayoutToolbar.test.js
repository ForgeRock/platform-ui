/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import EditorLayoutToolbar from './EditorLayoutToolbar';
import i18n from '@/i18n';

describe('EditorLayoutToolbar', () => {
  function setup(props = {}) {
    return mount(EditorLayoutToolbar, {
      global: {
        plugins: [i18n],
        stubs: ['BTooltip'],
        renderStubDefaultSlot: true,
      },
      props,
    });
  }

  it('should not show open sidebar button when sidebar left is open', async () => {
    const wrapper = setup({
      sidebarLeftOpen: true,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('#btnOpenSidebar').exists()).toBeFalsy();
  });

  it('should show open sidebar button when sidebar is closed', async () => {
    const wrapper = setup();

    await wrapper.vm.$nextTick();

    const openButton = wrapper.find('#btnOpenSidebar');
    expect(openButton.text()).toBe('addToggle sidebar');
    expect(openButton.attributes('aria-label')).toBe('Toggle sidebar');

    const tooltip = wrapper.findComponent({ name: 'BTooltip' });
    expect(tooltip.text()).toBe('Toggle sidebar');
  });

  it('should emit toggle-sidebar-left event on click open sidebar button', async () => {
    const wrapper = setup();

    await wrapper.vm.$nextTick();

    const openButton = wrapper.find('#btnOpenSidebar');
    await openButton.trigger('click');

    expect(wrapper.emitted('toggle-sidebar-left')).toBeTruthy();
  });
});
