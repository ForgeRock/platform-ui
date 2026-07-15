/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  END_USER_MENU_CONSTANTS,
  CUSTOM_MENU_ITEM,
  DIVIDER_MENU_ITEM,
  GROUP_MENU_ITEM,
} from './endUserMenuConstants';

describe('endUserMenuConstants', () => {
  describe('END_USER_MENU_CONSTANTS', () => {
    it('contains a GROUP constant equal to "group"', () => {
      expect(END_USER_MENU_CONSTANTS.GROUP).toBe('group');
    });

    it('is frozen (immutable)', () => {
      expect(Object.isFrozen(END_USER_MENU_CONSTANTS)).toBe(true);
    });

    it('retains all pre-existing constants', () => {
      expect(END_USER_MENU_CONSTANTS.CUSTOM).toBe('custom');
      expect(END_USER_MENU_CONSTANTS.DIVIDER).toBe('divider');
      expect(END_USER_MENU_CONSTANTS.MENU_ITEM_LABEL_LOCALE_PREFIX).toBe('sideMenu.endUser.');
    });
  });

  describe('GROUP_MENU_ITEM', () => {
    it('has id equal to "group"', () => {
      expect(GROUP_MENU_ITEM.id).toBe('group');
    });

    it('has icon equal to "folder"', () => {
      expect(GROUP_MENU_ITEM.icon).toBe('folder');
    });

    it('has isGroup set to true', () => {
      expect(GROUP_MENU_ITEM.isGroup).toBe(true);
    });

    it('has an empty subItems array', () => {
      expect(GROUP_MENU_ITEM.subItems).toEqual([]);
    });
  });

  describe('CUSTOM_MENU_ITEM', () => {
    it('retains its original shape', () => {
      expect(CUSTOM_MENU_ITEM).toEqual({ id: 'custom', icon: 'link' });
    });
  });

  describe('DIVIDER_MENU_ITEM', () => {
    it('retains its original shape', () => {
      expect(DIVIDER_MENU_ITEM).toEqual({ id: 'divider', icon: 'horizontal_rule', isDivider: true });
    });
  });
});
