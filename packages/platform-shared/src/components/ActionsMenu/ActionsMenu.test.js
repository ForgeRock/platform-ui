/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ActionsMenu from './ActionsMenu';

let wrapper;

function setup(propsData) {
  wrapper = mount(ActionsMenu, {
    attachTo: document.body,
    slots: {
      default: '<li data-v-68a6b289="" role="presentation"><a class="active dropdown-item" role="menuitem" href="#" target="_self">Pending</a></li><li data-v-68a6b289="" role="presentation"><a class="active dropdown-item" role="menuitem" href="#" target="_self">Completed</a></li>',
      'button-content': '<div data-v-68a6b289="" class="p-0 toolbar-link-text" data-testid="status-dropdown-button"><span data-v-68a6b289="" class="font-weight-bold mr-1">Status:</span> Pending</div>',
    },
    props: {
      ...propsData,
    },
  });
}

describe('Actions Menu Component', () => {
  it('Will render button content', () => {
    setup();
    const button = wrapper.find('[data-testid="status-dropdown-button"]');
    const menu = wrapper.find('[role="menu"]');

    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Status: Pending');
    expect(menu.exists()).toBe(false);
  });

  it('Will render menu content and keep focus on button when clicked', async () => {
    setup();
    const button = wrapper.find('button');
    let menu = wrapper.find('[role="menu"]');

    await button.element.focus();

    expect(menu.exists()).toBe(false);
    expect(document.activeElement).toBe(button.element);

    await button.element.click();

    menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(button.element);
  });

  it('Will render menu content and focus first element when arrow down is pressed', async () => {
    setup();
    const button = wrapper.find('button');
    let menu = wrapper.find('[role="menu"]');

    await button.element.focus();

    expect(menu.exists()).toBe(false);
    expect(document.activeElement).toBe(button.element);

    await button.trigger('keydown', { key: 'ArrowDown' });

    menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);
  });

  it('Will render menu content and focus first element when space is pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Space' });

    const menu = wrapper.find('[role="menu"]');

    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);
  });

  it('Will render menu content and focus first element when enter is pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Enter' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);
  });

  it('Will render menu content and focus last element when arrow up is pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will render menu content, focus first and last element when home and end keys are pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowDown' });

    let menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);

    await menu.trigger('keydown', { key: 'End' });

    menu = wrapper.find('[role="menu"]');
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);

    await menu.trigger('keydown', { key: 'Home' });

    menu = wrapper.find('[role="menu"]');
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);
  });

  it('Will render menu content, focus item that starts with c when c key is pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowDown' });

    let menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);

    await menu.trigger('keydown', { key: 'c' });

    menu = wrapper.find('[role="menu"]');
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will render menu content, focus item with index 1 when selectedItemIndex is 1 and Enter is pressed', async () => {
    setup({ 'selected-item-index': 1 });
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Enter' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will render menu content, focus item with index 1 when selectedItemIndex is 1 and space is pressed', async () => {
    setup({ 'selected-item-index': 1 });
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Space' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will focus button element when item is selected', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);

    const firstItem = menu.findAll('a')[0];
    await firstItem.trigger('keydown', { key: 'Enter' });
    expect(document.activeElement).toBe(button.element);
  });

  it('Will focus button element when menu is opened and Escape is pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);

    const firstItem = menu.findAll('a')[0];
    await firstItem.trigger('keydown', { key: 'Escape' });
    expect(document.activeElement).toBe(button.element);
  });

  it('Will focus button element when menu is opened and Tab is pressed', async () => {
    setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);

    const firstItem = menu.findAll('a')[0];
    await firstItem.trigger('keydown', { key: 'Tab' });
    expect(document.activeElement).toBe(button.element);
  });
});
