/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import MenuItem from './index';

let wrapper;

function mountComponent(propsData, mocks = { $route: { name: 'daniel' } }) {
  wrapper = shallowMount(MenuItem, {
    propsData,
    mocks: {
      $t: () => {},
      ...mocks,
    },
  });
}

describe('MenuItem Component', () => {
  describe('showing items based on roles', () => {
    it('Determines not to show an item for a user with insufficient roles', () => {
      mountComponent({
        displayName: 'bob',
        showForRoles: ['superAdmin'],
        userRoles: ['plainOldAdmin'],
      });

      expect(wrapper.vm.showItemForUser).toBe(false);
    });

    it('Determines to show an item for a user with sufficient roles', () => {
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
        userRoles: ['employee'],
      });

      expect(wrapper.vm.showItemForUser).toBe(true);
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
          userRoles: ['plainOldAdmin'],
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
          userRoles: ['plainOldAdmin'],
        },
        {
          $route: { name: 'little-ben' },
        },
      );

      expect(wrapper.vm.isExpanded).toBe(false);
    });
  });
});
