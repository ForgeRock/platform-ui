/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ContextMenu from './ContextMenu';
import i18n from '@/i18n';

describe('ContextMenu', () => {
  function mountComponent(props) {
    return mount(ContextMenu, {
      global: {
        plugins: [i18n],
      },
      props: {
        menuItems: [],
        x: 0,
        y: 0,
        ...props,
      },
    });
  }

  it('positions contextMenu based on props passed in', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.vm.x).toBe(0);
    expect(wrapper.vm.y).toBe(0);

    wrapper.setProps({ x: 100, y: 200 });
    await flushPromises();
    expect(wrapper.vm.x).toBe(100);
    expect(wrapper.vm.y).toBe(200);
  });

  it('shows menu items based on what is passed in', async () => {
    const testAction = jest.fn(() => 1 + 1);
    const wrapper = mountComponent({ menuItems: [{ label: 'Test1', action: testAction }, { label: 'Test2', action: testAction }] });
    await flushPromises();

    const menuItems = wrapper.findAll('.dropdown-item');
    expect(menuItems.length).toBe(2);
    await flushPromises();
  });
});
