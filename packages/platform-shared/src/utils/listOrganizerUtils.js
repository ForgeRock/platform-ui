/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getTranslation } from './translations';
import { getValueFromLocalStorage } from './localStorageUtils';

/**
 * Returns an ordered list of keys based on the provided localStorageValue and orderList.
 * @param {string[]} localStorageValue - An array of stored column key strings.
 * @param {string[]} orderList - The ordered list of available properties for the managed resources.
 * @returns {string[]} An array of keys ordered first by their appearance in localStorageValue (if present in orderList), followed by the remaining keys from orderList.
 */
function getIterablePropertyList(localStorageValue, orderList) {
  if (localStorageValue?.length > 0) {
    const filteredKeyListFromLocalStorage = localStorageValue.filter((key) => orderList.includes(key));
    const unavailableKeyListFromLocalStorage = orderList.filter((key) => !filteredKeyListFromLocalStorage.includes(key));
    return [
      ...filteredKeyListFromLocalStorage,
      ...unavailableKeyListFromLocalStorage,
    ];
  }
  return orderList || [];
}

/**
 * Returns the default columns for a managed object (those that would be enabled by default).
 * @param {Object} managedProperties - The managed properties for the resource.
 * @param {string[]} orderList - The ordered list of properties.
 * @returns {Array} List of default active columns.
 */
export function getDefaultManagedObjectColumnList(managedProperties, orderList) {
  if (!orderList || !managedProperties) {
    return [];
  }
  const columnList = [];
  orderList.forEach((columnName) => {
    const column = managedProperties[columnName];
    if (column
      && ['string', 'boolean', 'number'].includes(column.type)
      && column.searchable
      && columnList.length < 4
    ) {
      columnList.push({
        key: columnName,
        label: getTranslation(column.title),
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
        class: 'text-truncate',
      });
    }
  });
  return columnList;
}

/**
 * Returns filter column list for customize columns modal based on the resource tab data
 * @param {string} localStorageKey - String representing the key for the local storage
 * @param {Object} managedProperties - Object value representing the current tab data for managed resources
 * @param {string[]} orderList - The ordered list of available properties for the managed resources
 * @returns {Array} List of columns to be used for customize column modal
 */
export function getManagedObjectColumnList(localStorageKey, managedProperties, orderList) {
  if (!localStorageKey || !orderList || !managedProperties) {
    return [];
  }
  const rawStoredValue = getValueFromLocalStorage(localStorageKey);
  // Only use stored value if it's an array of strings (column keys), which is the expected format.
  const localStorageValue = Array.isArray(rawStoredValue) && rawStoredValue.every((item) => typeof item === 'string')
    ? rawStoredValue
    : null;
  const columnList = [];
  const propertyList = getIterablePropertyList(localStorageValue, orderList);
  propertyList.forEach((columnName) => {
    const column = managedProperties[columnName];
    if (column
      && ['string', 'boolean', 'number'].includes(column.type)
      && column.searchable
    ) {
      const isEnabled = localStorageValue?.length > 0
        ? localStorageValue.some((item) => item === columnName)
        : columnList.length < 4;

      columnList.push({
        key: columnName,
        label: getTranslation(column.title),
        sortable: true,
        enabled: isEnabled,
        sortDirection: 'desc',
        class: 'text-truncate',
      });
    }
  });
  return columnList;
}
