/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getCurrentInstance } from 'vue';
import { isEqual } from 'lodash';

export function useGetId(props) {
  return props.id || `floatingLabelInput${getCurrentInstance().uid}`;
}

/**
 * Determines whether a new value differs from the previously set inputValue
 * @param {Array|Object|Number|String} newVal value to be set for internal model
 * @returns {Boolean} whether the new value is different to the previous value
 */
export function useValueIsDifferent(currentVal, newVal) {
  return !isEqual(currentVal, newVal);
}
