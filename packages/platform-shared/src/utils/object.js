/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  each,
  filter,
  isArray,
  isEqual,
} from 'lodash';

/**
 * Compares two objects or arrays and identifies the differences between them.
 *
 * @param {Object|Array} newObj - The new object or array to compare.
 * @param {Object|Array} oldObj - The old object or array to compare against.
 * @param {Boolean} checkRemovedKeys - if we should check for removed keys.
 *
 * @returns {Array} An array of changes. For objects, each change is represented as an object
 *                  with `value` (the new value) and `name` (the key). For arrays, it returns
 *                  the elements from `newObj` that differ from `oldObj`.
 */
// eslint-disable-next-line import/prefer-default-export
export function findChanges(newObj, oldObj, checkRemovedKeys = false) {
  let changes;
  if (isArray(newObj)) {
    changes = filter(newObj, (field, index) => {
      if (isArray(field.value)) {
        if (JSON.stringify(field.value) !== JSON.stringify(oldObj[index].value)) {
          return true;
        }
      } else if (field.value !== oldObj[index].value) {
        return true;
      }
      return false;
    });
  } else {
    changes = [];

    each(newObj, (value, key) => {
      if (!isEqual(oldObj[key], newObj[key])) {
        changes.push({
          value: newObj[key],
          name: key,
        });
      }
    });

    if (checkRemovedKeys) {
      // Check for removed keys. This is a shared function, and this functionality is new
      // to avoid unintended changes to existing usages, only check if desired
      const newKeys = Object.keys(newObj);
      const oldKeys = Object.keys(oldObj);
      const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));
      if (removedKeys.length) {
        each(removedKeys, (key) => {
          changes.push({
            value: undefined,
            name: key,
          });
        });
      }
    }
  }
  return changes;
}
