/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import uuid from 'uuid/v4';
import i18n from '@/i18n';
import EditorLayoutSidebar from './EditorLayoutSidebar';
import { EDITOR_LAYOUT_SIDEBAR_DEFAULT_MIN_WIDTH, EDITOR_LAYOUT_SIDEBAR_POSITION } from './Utils/constants';

jest.mock('uuid/v4');

describe('EditorLayoutSidebar', () => {
  uuid.mockImplementation(() => 'uuid');
  function setup(props) {
    return mount(EditorLayoutSidebar, {
      global: {
        plugins: [i18n],
        stubs: ['BTooltip'],
        renderStubDefaultSlot: true,
      },
      props: {
        title: 'Sidebar Title',
        closeButtonTooltip: 'Close Tooltip',
        ...props,
      },
    });
  }

  it('should render correctly the sidebar title and close button', () => {
    const wrapper = setup();

    const panelClasses = wrapper.find('.fr-panel').classes();
    expect(panelClasses.includes('open')).toBe(true);
    expect(panelClasses.includes('active')).toBe(true);
    expect(panelClasses.includes('resizable')).toBe(false);

    const title = wrapper.find('h2');
    expect(title.text()).toBe('Sidebar Title');
    const closeButton = wrapper.find('#btnClose-uuid');
    expect(closeButton.text()).toBe('close');
    expect(closeButton.attributes('aria-label')).toBe('Close Tooltip');
    expect(wrapper.vm.resizable).toBe(false);

    const tooltip = wrapper.findComponent({ name: 'BTooltip' });
    expect(tooltip.text()).toBe('Close Tooltip');
  });

  it('should emit toggle-sidebar event when close button is clicked', async () => {
    const wrapper = setup();

    const closeButton = wrapper.find('#btnClose-uuid');
    await closeButton.trigger('click');

    expect(wrapper.emitted('toggle-sidebar')).toBeTruthy();
  });

  it('sidebar position right is resizable', async () => {
    const wrapper = setup({
      position: EDITOR_LAYOUT_SIDEBAR_POSITION.RIGHT,
      width: EDITOR_LAYOUT_SIDEBAR_DEFAULT_MIN_WIDTH,
      resizable: true,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.fr-panel').classes().includes('resizable')).toBe(true);
    expect(wrapper.find('.fr-panel').attributes('style')).toBe('position: absolute; top: 0px; left: 0px; width: 320px; height: 200px; z-index: auto; user-select: auto;');
  });

  it('vue draggable resizable changes width correctly', async () => {
    const wrapper = setup();

    const vueDraggableResizable = wrapper.findComponent({ name: 'VueDraggableResizable' });
    vueDraggableResizable.vm.$emit('resizing', 0, 0, 400);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.savedWidth).toBe(400);
    expect(wrapper.vm.calculatedWidth).toBe(400);
    expect(wrapper.find('.fr-panel').attributes('style')).toBe('position: absolute; top: 0px; left: 0px; width: 400px; height: 200px; z-index: auto; user-select: auto;');
  });

  it('should close the sidebar when open prop is false', async () => {
    const wrapper = setup({ open: false });

    await wrapper.vm.$nextTick();

    const panelClasses = wrapper.find('.fr-panel').classes();
    expect(panelClasses.includes('open')).toBe(false);
    expect(panelClasses.includes('active')).toBe(false);
  });
});
