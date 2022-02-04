/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Tests to see whether localStorage and sessionStorage is available
 *
 * @returns {Boolean} true if webStorage is available, false otherwise
 */
export default function isWebStorageAvailable() {
  const test = 'frWebStorageTest';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
