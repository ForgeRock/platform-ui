/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * @description This Utils is for Filtering/changing things when store.state.isFraas === true
 */

import {
  last,
  reject,
} from 'lodash';
import store from '@/store';

/**
 * Filters out items that don't pertain to the current realm based on the alpha_, bravo_, myrealmname_ naming convention.
 *
 * @param {Array} dataArrayToFilter - The array of data items to filter.
 * @param {string} arrayItemProperty - The property of each item to check against the realm naming convention.
 * @returns {Array} - The filtered array with items that pertain to the current realm.
 */
export default function isFraasFilter(dataArrayToFilter, arrayItemProperty) {
  return reject(dataArrayToFilter, (item) => {
    // filter out anything to do with teammember
    if (item[arrayItemProperty].indexOf(store.state.fraasAdminManagedObjectName) > -1) {
      return true;
    }
    // if there are no underscores in item[arrayItemProperty] we know this is not a realm specific object
    // in this case we want to show it (i.e. internal/role);
    if (item[arrayItemProperty].indexOf('_') === -1) {
      return false;
    }
    // using the last function here for cases where the arrayItemProperty is a path like /managed/alpha_user
    // if the string doesn't have slashes nothing will happen and the stringToTest will just be item[arrayItemProperty]
    const stringToTest = last(item[arrayItemProperty].split('/'));
    return stringToTest.indexOf(store.state.realm) !== 0;
  });
}
