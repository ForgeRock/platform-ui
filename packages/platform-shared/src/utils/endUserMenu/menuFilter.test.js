/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterAvailableEndUserMenuItems } from './menuFilter';

describe('endUserMenuFilter', () => {
  describe('filterAvailableEndUserMenuItems', () => {
    it('returns items which are available by default', () => {
      const items = [{ id: 'item1' }, { id: 'item2' }];
      const result = filterAvailableEndUserMenuItems(items);
      expect(result).toEqual(items);
    });

    it('filters out items based on flags', () => {
      const items = [
        { id: 'item1', available: (flags) => flags.includes('flag1') },
        { id: 'item2', available: (flags) => flags.includes('flag2') },
      ];
      const result = filterAvailableEndUserMenuItems(items, ['flag1']);
      expect(result.filter((item) => item.id === 'item1')).toHaveLength(1);
    });

    it('returns empty array if no items are available for given flags', () => {
      const items = [
        { id: 'item1', available: (flags) => flags.includes('flag1') },
        { id: 'item2', available: (flags) => flags.includes('flag2') },
        { id: 'item3', available: () => false },
      ];
      const result = filterAvailableEndUserMenuItems(items, ['flag3']);
      expect(result).toEqual([]);
    });
  });
});
