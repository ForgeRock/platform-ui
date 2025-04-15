/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Retrieves the account attribute from the provided item.
 *
 * The function checks for the `accountAttribute` property in the `item.item` object.
 * If not found, it searches within the `application.objectTypes` array for an object
 * whose `name` matches the `objectType` of `item.item`, and retrieves its `accountAttribute`.
 *
 * @param {Object} item - The object containing entitlement and application details.
 * @returns {string|undefined} The account attribute if found, otherwise undefined.
 */
// eslint-disable-next-line import/prefer-default-export
export function getAccountAttribute(item) {
  return item?.item?.accountAttribute
  || item?.application?.objectTypes?.find((x) => (x.name === item.item?.objectType))?.accountAttribute;
}
