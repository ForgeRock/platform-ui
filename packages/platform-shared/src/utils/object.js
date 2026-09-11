/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  each,
  filter,
  isArray,
  isEqual,
  isObject,
} from 'lodash';

/**
 * Determines whether two values are both objects that carry the given equality key,
 * making them eligible for comparison by that key instead of a full deep comparison.
 *
 * @param {*} obj1 - The first value to check.
 * @param {*} obj2 - The second value to check.
 * @param {String} objEqualityKey - The key to check for on both values.
 *
 * @returns {Boolean} True if both values are objects and both have a truthy value at `objEqualityKey`.
 */
function canCompareObjectsOnEqualityKey(obj1, obj2, objEqualityKey) {
  if (!isObject(obj1) || !isObject(obj2)) {
    return false;
  }
  return objEqualityKey && obj1[objEqualityKey] && obj2[objEqualityKey];
}

/**
 * Compares two objects by the value at the given equality key rather than by full deep equality.
 *
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @param {String} objEqualityKey - The key whose value determines equality.
 *
 * @returns {Boolean} True if both objects have the same truthy value at `objEqualityKey`.
 */
function compareObjectsOnEqualityKey(obj1, obj2, objEqualityKey) {
  if (objEqualityKey && obj1[objEqualityKey] && obj2[objEqualityKey]) {
    return obj1[objEqualityKey] === obj2[objEqualityKey];
  }
  return false;
}

/**
 * Compares two objects or arrays and identifies the differences between them.
 *
 * @param {Object|Array} newObj - The new object or array to compare.
 * @param {Object|Array} oldObj - The old object or array to compare against.
 * @param {Boolean} checkRemovedKeys - if we should check for removed keys.
 * @param {String} [objEqualityKey] - When a top-level value in both objects is itself an object
 *                  carrying this key (e.g. `_ref`), it's compared by that key's value instead of
 *                  full deep equality. Only applies to the top level of the compared objects —
 *                  values nested deeper (e.g. under a wrapping sub-property) fall back to
 *                  standard deep equality.
 *
 * @returns {Array} An array of changes. For objects, each change is represented as an object
 *                  with `value` (the new value) and `name` (the key). For arrays, it returns
 *                  the elements from `newObj` that differ from `oldObj`.
 */
export function findChanges(newObj, oldObj, checkRemovedKeys = false, objEqualityKey = null) {
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
      // optional comparison based on the provided equality key
      if (canCompareObjectsOnEqualityKey(newObj[key], oldObj[key], objEqualityKey)) {
        if (compareObjectsOnEqualityKey(newObj[key], oldObj[key], objEqualityKey)) {
          return;
        }
        changes.push({
          value: newObj[key],
          name: key,
        });
        return;
      }

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
