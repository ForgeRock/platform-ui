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
 * @param {Array<{key: string}>} localStorageValue - An array of objects, each containing a 'key' property.
 * @param {string[]} orderList - The ordered list of available properties for the managed resources.
 * @returns {string[]} An array of keys ordered first by their appearance in localStorageValue (if present in orderList), followed by the remaining keys from orderList.
 */
function getIterablePropertyList(localStorageValue, orderList) {
  if (localStorageValue?.length > 0) {
    const localStorageKeys = localStorageValue.map((obj) => obj.key);
    const filteredKeyListFromLocalStorage = localStorageKeys.filter((key) => orderList.includes(key));
    const unavailableKeyListFromLocalStorage = orderList.filter((key) => !filteredKeyListFromLocalStorage.includes(key));
    return [
      ...filteredKeyListFromLocalStorage,
      ...unavailableKeyListFromLocalStorage,
    ];
  }
  return orderList || [];
}

/**
 * Returns filter column list for customize columns modal based on the resource tab data
 * @param string localStorageKey string representing the key for the local storage
 *  * @param {Object} resourceTabData Object value representing the current tab data for managed resources
 * @returns {Array} List of columns to be used for customize column modal
 */
export default function getManagedObjectColumnList(localStorageKey, managedProperties, orderList) {
  if (!localStorageKey || !orderList || !managedProperties) {
    return [];
  }
  const localStorageValue = getValueFromLocalStorage(localStorageKey);
  const columnList = [];
  const propertyList = getIterablePropertyList(localStorageValue, orderList);
  propertyList.forEach((columnName, index) => {
    const column = managedProperties[columnName];
    if (column
      && ['string', 'boolean', 'number'].includes(column.type)
      && column.searchable
    ) {
      columnList.push({
        key: columnName,
        label: getTranslation(column.title),
        sortable: true,
        enabled: localStorageValue?.[index] ? localStorageValue[index]?.enabled : columnList.length < 4, // To maintain consistency with the table display data, enable first 4 set of display property in the filter list
        sortDirection: 'desc',
      });
    }
  });
  return columnList;
}
