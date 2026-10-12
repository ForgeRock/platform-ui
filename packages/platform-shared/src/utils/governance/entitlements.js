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

/**
 * Determines the object type for a modifyEntitlement request, used to fetch the correct entitlement schema.
 *
 * Connected applications carry the attribute name on the assignment; it is matched against the
 * application's object types to find the one that owns that attribute.
 *
 * Disconnected applications synthesize assignments without attributes, so the object type is parsed
 * from the entitlement id instead, which is formatted {applicationId}/{objectType}/{sourceId}.
 *
 * @param {Object} request - The hydrated request object.
 * @returns {string} The object type name, or an empty string if it cannot be determined.
 */
export function getModifyEntitlementObjectType(request) {
  if (request?.application?.isDisconnected) {
    const parts = request?.request?.entitlement?.entitlementId?.split('/');
    return parts?.length === 3 ? parts[1] : '';
  }
  const attributeName = request?.assignment?.attributes?.[0]?.name;
  if (attributeName === undefined) return '';
  return request?.application?.objectTypes?.find((type) => type.accountAttribute === attributeName)?.name || '';
}

/**
 * Normalizes an entitlementOwner/roleOwner field into an array of owners, for display or editing.
 *
 * Handles the legacy single-owner object shape, the current multi-owner array shape, and the
 * empty-owner placeholder (e.g. `{}`) some backend responses use for "no owner" - which is
 * otherwise truthy and would render as a blank owner row.
 *
 * @param {Object|Object[]} owners - The raw entitlementOwner/roleOwner field value.
 * @returns {Object[]} Array of owner objects with no empty/nullish entries.
 */
export function normalizeOwners(owners) {
  const isNonEmptyOwner = (owner) => !!owner && typeof owner === 'object' && Object.keys(owner).length > 0;
  if (Array.isArray(owners)) return owners.filter(isNonEmptyOwner);
  if (isNonEmptyOwner(owners)) return [owners];
  return [];
}
