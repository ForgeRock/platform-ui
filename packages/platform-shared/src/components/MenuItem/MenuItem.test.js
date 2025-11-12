/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { BButton, BBadge } from 'bootstrap-vue';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import MenuItem from './index';
import { runA11yTest } from '../../utils/testHelpers';

let wrapper;

function shallowMountComponent(props, pinia = {}, mocks = { $route: { name: 'daniel' } }, stubs = {}) {
  setupTestPinia(pinia);
  wrapper = shallowMount(MenuItem, {
    props,
    global: {
      mocks: {
        $t: () => {},
        ...mocks,
      },
      stubs,
    },
  });
}

// Dummy menu container with role="menu" to satisfy aria-required-parent reference
function setupDummyHtmlContainer(wrapperElement) {
  const menuBar = document.createElement('nav');
  menuBar.setAttribute('role', 'menu');
  menuBar.setAttribute('id', 'menu-container');
  document.body.appendChild(menuBar);
  if (wrapperElement) {
    menuBar.appendChild(wrapperElement);
  }
}

function removeDummyHtmlContainer(wrapperElement) {
  const menuBar = document.getElementById('menu-container');
  if (!menuBar) return;
  if (wrapperElement && menuBar.contains(wrapperElement)) {
    menuBar.removeChild(wrapperElement);
  }
  document.body.removeChild(menuBar);
}

function mountComponent(props, pinia = {}, mocks = { $route: { name: 'daniel' } }, stubs = {}) {
  setupTestPinia(pinia);
  wrapper = mount(MenuItem, {
    props,
    global: {
      mocks: {
        $t: (msg) => msg,
        ...mocks,
      },
      stubs,
    },
  });
  setupDummyHtmlContainer(wrapper.element);
}

function unmountComponent(wrapperElement) {
  if (wrapper) {
    wrapper.unmount();
  }

  removeDummyHtmlContainer(wrapperElement);
}

afterEach(() => {
  jest.clearAllMocks();
  unmountComponent(wrapper.element);
});

describe('MenuItem Component', () => {
  describe('@a11y', () => {
    describe('should not have any accessibility violations', () => {
      it('with basic menu item', async () => {
        await mountComponent({
          displayName: 'Test menu',
          icon: 'home',
          routeTo: { name: 'Test route' },
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('with menu item being an URL', async () => {
        mountComponent({
          displayName: 'Test url',
          icon: 'link',
          url: '/test/url',
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('with menu having subitems', async () => {
        mountComponent({
          displayName: 'Parent menu',
          icon: 'folder',
          subItems: [
            {
              displayName: 'Child menu 1',
            },
          ],
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('when menu opens a modal', async () => {
        mountComponent({
          displayName: 'Toggle Modal',
          icon: 'launch',
          modal: 'modal-id',
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('when menu item is a divider', async () => {
        mountComponent({
          divider: true,
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('when menu item is shown as nav', async () => {
        mountComponent({
          isNav: true,
          displayName: 'Test menu',
          icon: 'home',
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('when menu item is an event item', async () => {
        mountComponent({
          event: 'custom-event',
          displayName: 'Test Event',
          icon: 'home',
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
      it('when menu item has badge content', async () => {
        mountComponent({
          isNav: true,
          displayName: 'Test menu',
          icon: 'home',
          showBadgeWithContentFromStore: 'userCount',
        },
        {
          userCount: 5,
        });
        await flushPromises();
        await runA11yTest(wrapper);
      });
    });
  });

  describe('showing items based on roles', () => {
    it('Determines not to show an item for a user with insufficient roles', () => {
      shallowMountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
      });

      expect(wrapper.vm.showItemForUser).toBe(false);
    });

    it('Determines to show an item for a user with sufficient roles', () => {
      shallowMountComponent({
        displayName: 'bob',
        showForRoles: ['plainOldAdmin'],
        userRoles: ['plainOldAdmin'],
      }, { user: { idmRoles: ['plainOldAdmin'] } });

      expect(wrapper.vm.showItemForUser).toBe(true);
    });

    it('Determines to show an item for a user if the item has no role restrictions', () => {
      shallowMountComponent({
        displayName: 'bob',
      });

      expect(wrapper.vm.showItemForUser).toBe(true);
    });

    it('determines to show subItem for user if subitem has proper access called out', () => {
      setupTestPinia();
      shallowMountComponent(
        {
          displayName: 'subBob',
        },
        { user: { idmRoles: ['employee mate'] } },
      );

      expect(wrapper.vm.showSubItemForUser(['employee mate'])).toBe(true);
    });

    it('determines to not show subItem for user if subitem has proper access called out', () => {
      shallowMountComponent(
        {
          displayName: 'subBob',
        },
        { user: { idmRoles: ['employee mate'] } },
      );

      expect(wrapper.vm.showSubItemForUser(['employee boss'])).toBe(false);
    });
  });

  describe('showing items based on store values', () => {
    it('Determines not to show an item to the user when the store values passed to the component are not all found to be truthy in the store, even when those properties are in nested structures', () => {
      shallowMountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
        showForStoreValues: ['isFraas', 'SharedStore.hasAmUrl'],
      },
      { },
      {
        $store: {
          state: {
            isFraas: true,
            SharedStore: {
              hasAmUrl: null,
            },
          },
        },
        $route: { name: 'little-bob-2' },
      });
      expect(wrapper.vm.showItemForStoreValues).toBe(false);
    });

    it('Determines not to show an item to the user when a flag is set that should not be set for this item', async () => {
      shallowMountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
        showForStoreValues: ['!isFraas', 'SharedStore.hasAmUrl'],
      },
      {},
      {
        $store: {
          state: {
            isFraas: true,
            SharedStore: {
              hasAmUrl: true,
            },
          },
        },
        $route: { name: 'little-bob-2' },
      });
      await flushPromises();
      expect(wrapper.vm.showItemForStoreValues).toBe(false);
    });

    it('Determines to show an item to the user when the store values passed to the component are all found to be truthy in the store, even if they are found in nested structures', () => {
      shallowMountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
        showForStoreValues: ['isFraas', 'SharedStore.hasAmUrl'],
      },
      {},
      {
        $store: {
          state: {
            isFraas: true,
            SharedStore: {
              hasAmUrl: true,
            },
          },
        },
        $route: { name: 'little-bob-2' },
      });
      expect(wrapper.vm.showItemForStoreValues).toBe(true);
    });

    it('Determines to show any menu option that relies on a truthy value from the FederationAdmin privilege property in the user store', () => {
      shallowMountComponent({
        showForPrivileges: ['FederationAdmin'],
      },
      { user: { privileges: { FederationAdmin: true } } },
      {
        $route: { name: 'little-ted' },
      });

      expect(wrapper.vm.showItemForPrivileges).toBe(true);
    });

    it('Determines to hide any menu option that relies on a falsy value from the FederationAdmin privilege property in the user store', () => {
      shallowMountComponent({
        showForPrivileges: ['FederationAdmin'],
      },
      { user: { privileges: { FederationAdmin: false } } },
      {
        $route: { name: 'little-ted-2' },
      });

      expect(wrapper.vm.showItemForPrivileges).toBe(false);
    });
  });

  describe('determining whether the item is expanded', () => {
    it('Will set its state to be expanded if the current route name matches that of one of its sub items', () => {
      shallowMountComponent(
        {
          displayName: 'bob',
          subItems: [
            {
              displayName: 'lilBob',
              routeTo: { name: 'little-bob' },
            },
            {
              displayName: 'lilBob2',
              routeTo: { name: 'little-bob-2' },
            },
          ],
        },
        {},
        {
          $route: { name: 'little-bob-2' },
        },
      );

      expect(wrapper.vm.isExpanded).toBe(true);
    });

    it('Will not set its state to be expanded if the current route name does not match that of one of its sub items', () => {
      shallowMountComponent(
        {
          displayName: 'bob',
          subItems: [
            {
              displayName: 'lilBob',
              routeTo: { name: 'little-bob' },
            },
          ],
        },
        {},
        {
          $route: { name: 'little-ben' },
        },
      );

      expect(wrapper.vm.isExpanded).toBe(false);
    });
  });

  it('Budget on dropdown parent not shown', () => {
    shallowMountComponent(
      {
        displayName: 'inbox',
        subItems: [
          {
            displayName: 'Approvals',
            routeTo: { name: 'approvals' },
          },
        ],
      },
      {},
      {
        $store: {
          state: {
            inboxTotalCount: 2,
          },
        },
        $route: { name: 'test' },
      },
      {
        BButton,
        BBadge,
      },
    );

    const badge = wrapper.findComponent('.badge');
    expect(badge.exists()).toBe(false);
  });

  it('Budget on dropdown parent shown if is not expanded', () => {
    shallowMountComponent(
      {
        displayName: 'inbox',
        showBadgeWithContentFromStore: 'inboxTotalCount',
        subItems: [
          {
            displayName: 'Approvals',
            routeTo: { name: 'approvals' },
          },
        ],
      },
      {},
      {
        $store: {
          state: {
            inboxTotalCount: 2,
          },
        },
        $route: { name: 'test' },
      },
      {
        BButton,
        BBadge,
      },
    );

    const badge = wrapper.find('.badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('2');
    expect(wrapper.vm.isExpanded).toBe(false);
  });

  it('Budget on dropdown parent not shown if is expanded', () => {
    shallowMountComponent(
      {
        displayName: 'inbox',
        showBadgeWithContentFromStore: 'inboxTotalCount',
        subItems: [
          {
            displayName: 'Approvals',
            routeTo: { name: 'approvals' },
          },
        ],
      },
      {},
      {
        $store: {
          state: {
            inboxTotalCount: 2,
          },
        },
        $route: { name: 'approvals' },
      },
      {
        BButton,
        BBadge,
      },
    );

    const badge = wrapper.find('.badge');
    expect(badge.exists()).toBe(false);
    expect(wrapper.vm.isExpanded).toBe(true);
  });
});
