/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { BButton, BBadge } from 'bootstrap-vue';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import MenuItem from './index';

let wrapper;

function mountComponent(props, mocks = { $route: { name: 'daniel' } }, stubs = {}) {
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

describe('MenuItem Component', () => {
  describe('showing items based on roles', () => {
    it('Determines not to show an item for a user with insufficient roles', () => {
      setupTestPinia();
      mountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
      });

      expect(wrapper.vm.showItemForUser).toBe(false);
    });

    it('Determines to show an item for a user with sufficient roles', () => {
      setupTestPinia({ user: { idmRoles: ['plainOldAdmin'] } });
      mountComponent({
        displayName: 'bob',
        showForRoles: ['plainOldAdmin'],
        userRoles: ['plainOldAdmin'],
      });

      expect(wrapper.vm.showItemForUser).toBe(true);
    });

    it('Determines to show an item for a user if the item has no role restrictions', () => {
      mountComponent({
        displayName: 'bob',
      });

      expect(wrapper.vm.showItemForUser).toBe(true);
    });

    it('determines to show subItem for user if subitem has proper access called out', () => {
      setupTestPinia({ user: { idmRoles: ['employee mate'] } });
      mountComponent({
        displayName: 'subBob',
      });

      expect(wrapper.vm.showSubItemForUser(['employee mate'])).toBe(true);
    });

    it('determines to not show subItem for user if subitem has proper access called out', () => {
      setupTestPinia({ user: { idmRoles: ['employee mate'] } });
      mountComponent({
        displayName: 'subBob',
      });

      expect(wrapper.vm.showSubItemForUser(['employee boss'])).toBe(false);
    });
  });

  describe('showing items based on store values', () => {
    it('Determines not to show an item to the user when the store values passed to the component are not all found to be truthy in the store, even when those properties are in nested structures', () => {
      mountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
        showForStoreValues: ['isFraas', 'SharedStore.hasAmUrl'],
      },
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

    it('Determines to show an item to the user when the store values passed to the component are all found to be truthy in the store, even if they are found in nested structures', () => {
      mountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
        showForStoreValues: ['isFraas', 'SharedStore.hasAmUrl'],
      },
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
      setupTestPinia({ user: { privileges: { FederationAdmin: true } } });
      mountComponent({
        showForPrivileges: ['FederationAdmin'],
      },
      {
        $route: { name: 'little-ted' },
      });

      expect(wrapper.vm.showItemForPrivileges).toBe(true);
    });

    it('Determines to hide any menu option that relies on a falsy value from the FederationAdmin privilege property in the user store', () => {
      setupTestPinia({ user: { privileges: { FederationAdmin: false } } });
      mountComponent({
        showForPrivileges: ['FederationAdmin'],
      },
      {
        $route: { name: 'little-ted-2' },
      });

      expect(wrapper.vm.showItemForPrivileges).toBe(false);
    });
  });

  describe('determining whether the item is expanded', () => {
    it('Will set its state to be expanded if the current route name matches that of one of its sub items', () => {
      mountComponent(
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
        {
          $route: { name: 'little-bob-2' },
        },
      );

      expect(wrapper.vm.isExpanded).toBe(true);
    });

    it('Will not set its state to be expanded if the current route name does not match that of one of its sub items', () => {
      mountComponent(
        {
          displayName: 'bob',
          subItems: [
            {
              displayName: 'lilBob',
              routeTo: { name: 'little-bob' },
            },
          ],
        },
        {
          $route: { name: 'little-ben' },
        },
      );

      expect(wrapper.vm.isExpanded).toBe(false);
    });
  });

  it('Budget on dropdown parent not shown', () => {
    mountComponent(
      {
        displayName: 'inbox',
        subItems: [
          {
            displayName: 'Approvals',
            routeTo: { name: 'approvals' },
          },
        ],
      },
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
    mountComponent(
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
    mountComponent(
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
