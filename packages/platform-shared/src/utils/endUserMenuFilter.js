/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/prefer-default-export */
/**
 * Generates and returns the list of available end user menu items only based on the provided store state.
 * Menu items are filtered according to feature flags.
 * The result is cached for subsequent calls to avoid recomputation.
 *
 * @param {Object} flags - The feature flags can be any arbitrary objects or simply an array of strings
 * on which some or all menu items depends conditionally.
 * @returns {Array<Object>} The filtered and available menu items for the end user.
 */
export function filterAvailableEndUserMenuItems(menuItems, flags) {
  // Filter out items that are not available
  // item.available is a function that should return boolean to indicate if the item is available
  const availableEndUserMenuItems = menuItems
    .filter((item) => (item.available && item.available(flags)) || !('available' in item));
  return availableEndUserMenuItems;
}
