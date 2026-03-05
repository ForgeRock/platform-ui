/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Key to 404 back navigation in window history state
 */
const NOT_FOUND_BACK_KEY = '__notFoundBack';

/**
 * Navigate to the NotFound route with optional back button config.
 * @param {Object} router - Vue Router instance
 * @param {Object} options - Navigation options
 * @param {String} options.backPath - Path to navigate back to (default: '/')
 * @param {String} options.backLabel - pageTitles key for the back button (default: 'Dashboard')
 */
export function navigateToNotFound(router, {
  backPath = '/dashboard/overview',
  backLabel = 'Dashboard',
} = {}) {
  router.replace({
    name: 'NotFound',
    state: {
      [NOT_FOUND_BACK_KEY]: { backPath, backLabel },
    },
  });
}

/**
 * Attempt to get the back navigation options from route state or history state.
 * @param {Object} state - window.history.state object
 * @returns {Object|null} Object with backPath and backLabel, or null if not found
 */
export function getNotFoundBackNavigation(state) {
  return state?.[NOT_FOUND_BACK_KEY] || null;
}
