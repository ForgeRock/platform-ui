/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import EditorLayout from './EditorLayout';
import i18n from '@/i18n';
import { setupTestPinia } from '../../utils/testPiniaHelpers';

describe('EditorLayout', () => {
  function setup(props = {
    sidebarLeftOpen: true,
    sidebarRightOpen: true,
  }) {
    setupTestPinia();
    return mount(EditorLayout, {
      global: {
        plugins: [i18n],
        stubs: ['BTooltip', 'RouterLink'],
        renderStubDefaultSlot: true,
      },
      slots: {
        'sidebar-left': '<div class="sidebar-left">Sidebar Left</div>',
        'sidebar-right': '<div class="sidebar-right">Sidebar Right</div>',
      },
      props,
    });
  }

  it('should render sidebar, toolbar, sidebarRight', async () => {
    const wrapper = setup();

    wrapper.vm.$nextTick();

    const toolbar = wrapper.findComponent({ name: 'EditorLayoutToolbar' });
    expect(toolbar.exists()).toBeTruthy();

    const sidebars = wrapper.findAllComponents({ name: 'EditorLayoutSidebar' });
    expect(sidebars.length).toBe(2);

    const sidebarLeft = sidebars[0];
    const sidebarLeftContent = sidebarLeft.find('.sidebar-left');
    expect(sidebarLeftContent.exists()).toBeTruthy();
    expect(sidebarLeft.vm.open).toBe(true);
    expect(sidebarLeftContent.text()).toBe('Sidebar Left');

    const sidebarRight = sidebars[1];
    const sidebarRightContent = sidebarRight.find('.sidebar-right');
    expect(sidebarRightContent.exists()).toBeTruthy();
    expect(sidebarRight.vm.open).toBe(true);
    expect(sidebarRightContent.text()).toBe('Sidebar Right');
  });

  it('should render only toolbar', async () => {
    const wrapper = setup({
      sidebarLeftOpen: false,
      sidebarRightOpen: false,
    });

    await wrapper.vm.$nextTick();

    const toolbar = wrapper.findComponent({ name: 'EditorLayoutToolbar' });
    expect(toolbar.exists()).toBeTruthy();

    const sidebars = wrapper.findAllComponents({ name: 'EditorLayoutSidebar' });
    const sidebarLeft = sidebars[0];
    expect(sidebarLeft.vm.open).toBe(false);
    const sidebarRight = sidebars[1];
    expect(sidebarRight.vm.open).toBe(false);
  });

  it('should render a custom sidebar when slot is provided', () => {
    const wrapper = setup({
      sidebarLeftCustom: true,
      sidebarLeftOpen: true,
      sidebarRightOpen: true,
    });

    const sidebars = wrapper.findAllComponents({ name: 'EditorLayoutSidebar' });
    expect(sidebars.length).toBe(1);
    expect(sidebars[0].find('.sidebar-left').exists()).toBe(false);
    const customSidebar = wrapper.find('.sidebar-left');
    expect(customSidebar.exists()).toBeTruthy();
    expect(customSidebar.text()).toBe('Sidebar Left');
  });
});
