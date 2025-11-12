/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, DOMWrapper, flushPromises } from '@vue/test-utils';
import ActionsMenu from './ActionsMenu';
import { runA11yTest } from '../../utils/testHelpers';

function setupApp() {
  const app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
  return app;
}

async function setup(propsData, slots = {}) {
  const target = setupApp();
  mount(ActionsMenu, {
    attachTo: target,
    slots: {
      default: '<li data-v-68a6b289="" role="presentation"><a class="active dropdown-item" role="menuitem" href="#" target="_self">Pending</a></li><li data-v-68a6b289="" role="presentation"><a class="active dropdown-item" role="menuitem" href="#" target="_self">Completed</a></li>',
      ...slots,
    },
    props: {
      ...propsData,
    },
    global: {
      mocks: {
        $t: (msg) => msg,
      },
    },
  });
  await flushPromises();
  const bodyWrapper = new DOMWrapper(document.body);

  return { wrapper: bodyWrapper };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Actions Menu Component', () => {
  describe('@a11y', () => {
    it('should have no accessibility violations with default props', async () => {
      const { wrapper } = await setup();
      await runA11yTest(wrapper);
    });
  });
  it('Will render button content', async () => {
    // button-content slot is only needed for this test case.
    const buttonContentSlot = {
      'button-content': '<div data-v-68a6b289="" class="p-0 toolbar-link-text" data-testid="status-dropdown-button"><span data-v-68a6b289="" class="font-weight-bold mr-1">Status:</span> Pending</div>',
    };
    const { wrapper } = await setup({}, buttonContentSlot);
    const button = wrapper.find('[data-testid="status-dropdown-button"]');
    const menu = wrapper.find('[role="menu"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Status: Pending');
    expect(menu.exists()).toBe(false);
  });

  it('Will render menu content and keep focus on button when clicked', async () => {
    const { wrapper } = await setup();
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
    const { wrapper } = await setup();
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
    const { wrapper } = await setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Space' });

    const menu = wrapper.find('[role="menu"]');

    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);
  });

  it('Will render menu content and focus first element when enter is pressed', async () => {
    const { wrapper } = await setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Enter' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[0].element);
  });

  it('Will render menu content and focus last element when arrow up is pressed', async () => {
    const { wrapper } = await setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will render menu content, focus first and last element when home and end keys are pressed', async () => {
    const { wrapper } = await setup();
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
    const { wrapper } = await setup();
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
    const { wrapper } = await setup({ 'selected-item-index': 1 });
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Enter' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will render menu content, focus item with index 1 when selectedItemIndex is 1 and space is pressed', async () => {
    const { wrapper } = await setup({ 'selected-item-index': 1 });
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'Space' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);
    expect(document.activeElement).toBe(menu.findAll('a')[1].element);
  });

  it('Will focus button element when item is selected', async () => {
    const { wrapper } = await setup();
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
    const { wrapper } = await setup();
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
    const { wrapper } = await setup();
    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menu = wrapper.find('[role="menu"]');
    expect(menu.exists()).toBe(true);

    const firstItem = menu.findAll('a')[0];
    await firstItem.trigger('keydown', { key: 'Tab' });
    expect(document.activeElement).toBe(button.element);
  });

  it('Will render ul inside menu container', async () => {
    const { wrapper } = await setup();

    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menuContainer = wrapper.find('.menu-container');
    expect(menuContainer.exists()).toBe(true);

    const menuContainerSecondChild = menuContainer.element.children[1];

    expect(menuContainerSecondChild.tagName.toLowerCase()).toBe('ul');
    expect(menuContainerSecondChild.getAttribute('role')).toBe('menu');

    const app = wrapper.find('#app');
    expect(app.exists()).toBe(true);

    const appSecondChild = app.element.children[1];

    expect(appSecondChild).toBeUndefined();
  });

  it('Will teleport ul to app div', async () => {
    const { wrapper } = await setup({ 'use-floating-menu': true });

    const button = wrapper.find('button');

    await button.element.focus();
    await button.trigger('keydown', { key: 'ArrowUp' });

    const menuContainer = wrapper.find('.menu-container');
    expect(menuContainer.exists()).toBe(true);

    const menuContainerSecondChild = menuContainer.element.children[1];

    expect(menuContainerSecondChild).toBeUndefined();

    const app = wrapper.find('#app');
    expect(app.exists()).toBe(true);

    const appSecondChild = app.element.children[1];

    expect(appSecondChild.tagName.toLowerCase()).toBe('ul');
    expect(appSecondChild.getAttribute('role')).toBe('menu');
  });
});
