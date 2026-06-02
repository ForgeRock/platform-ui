/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Extracts the object type from an account resource.
 *
 * Checks item.objectType first, then falls back to parsing the accountId path:
 *   Connected app:    system/<app>/<objectType>/<id>  → index 2
 *   Disconnected app: <app>/<objectType>/<id>         → index 1
 *
 * @param {Object} item - The account item object, may contain objectType.
 * @param {Object} keys - The account keys object containing accountId.
 * @param {boolean} isDisconnected - Whether the application is disconnected.
 * @returns {string|undefined} The object type, or undefined if not determinable.
 */
export function getObjectTypeFromAccountId(item, keys, isDisconnected) {
  if (item?.objectType) return item.objectType;
  const parts = keys?.accountId?.split('/');
  return isDisconnected !== true ? parts?.[2] : parts?.[1];
}

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
export function getAccountAttribute(item) {
  return item?.item?.accountAttribute
  || item?.application?.objectTypes?.find((x) => (x.name === item.item?.objectType))?.accountAttribute;
}
