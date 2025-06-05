/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';

/**
 * Reads and returns value from the localStorage based on the input key
 * @param {string} key string representing the key for the local storage
 * @return {string | null } string representing the value stored in the local storage against the input key
 * If the key does not exist in the local storage or the value is not a valid JSON it returns null.
 */
function getValueFromLocalStorage(key) {
  let localStorageValue = null;
  if (store.state.SharedStore.webStorageAvailable) {
    try {
      localStorageValue = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return localStorageValue;
    }
  }
  return localStorageValue;
}

/**
 * Set/Updates local storage value based on the input params for persisting it across user's browser session.
 * @param {string} key string representing the key for the local storage
 * @param {any} value value of any data type to be stored in the local storage against the input key
 */
function setLocalStorageValue(key, value) {
  if (store.state.SharedStore.webStorageAvailable && typeof key === 'string') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export {
  getValueFromLocalStorage,
  setLocalStorageValue,
};
