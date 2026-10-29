/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * The four resource categories a governance scope can grant permissions against.
 * A category is "present" on a scope when its targetCondition is set (the scope targets it at all).
 */
export const SCOPE_PERMISSION_CATEGORIES = ['application', 'entitlement', 'role', 'user'];

/**
 * Icon shown for each scope permission category.
 * `role` mirrors the Identities > Manage side-menu icon.
 */
export const scopePermissionCategoryIcons = {
  application: 'apps',
  entitlement: 'article',
  role: 'people',
  user: 'person',
};

/**
 * Circle colors per category, in display order, reusing the form-editor field
 * palette's first four colors (green, blue, orange, purple) — see
 * platform-admin FormEditor Schemas/editorItems.js and EditorItem.vue.
 */
export const scopePermissionCategoryColors = {
  application: 'green',
  entitlement: 'blue',
  role: 'orange',
  user: 'purple',
};

/**
 * Permission keys granted within each category, in display order.
 * `always: true` permissions (view access) are implied whenever the category is targeted at all;
 * the rest reflect the scope's `permissions` object.
 */
const CATEGORY_PERMISSION_DEFINITIONS = {
  application: [
    { key: 'viewApplications', always: true },
    { key: 'createEntitlement' },
  ],
  entitlement: [
    { key: 'viewEntitlements', always: true },
    { key: 'modifyEntitlement' },
    { key: 'viewGrants' },
  ],
  role: [
    { key: 'viewRoles', always: true },
    { key: 'createRole' },
    { key: 'modifyRole' },
    { key: 'publishRole' },
    { key: 'deleteRole' },
  ],
  user: [
    { key: 'viewUsers', always: true },
    { key: 'createUser' },
    { key: 'modifyUser' },
    { key: 'deleteUser' },
    { key: 'viewUserAccess' },
  ],
};

/**
 * Determine which permission categories are present (targeted) on a raw scope resource.
 * @param {Object} scope raw scope resource, as returned by the scope API
 * @returns {Array<String>} category keys present on the scope, in display order; empty when the
 * given object isn't a scope (e.g. an entitlement/application/role simulation result)
 */
export function getScopePermissionCategories(scope) {
  if (!scope?.targetCondition) return [];
  return SCOPE_PERMISSION_CATEGORIES.filter((category) => !!scope.targetCondition[category]);
}

/**
 * Get the permission keys a scope grants within a given category, for display in a hover popover.
 * @param {Object} scope raw scope resource
 * @param {String} category one of SCOPE_PERMISSION_CATEGORIES
 * @returns {Array<String>} permission keys granted, always-on view permission listed first
 */
export function getScopePermissionKeys(scope, category) {
  const definitions = CATEGORY_PERMISSION_DEFINITIONS[category] || [];
  return definitions
    .filter((definition) => definition.always || !!scope?.permissions?.[definition.key])
    .map((definition) => definition.key);
}

/**
 * Build one row per permission a scope grants, for the simulator's permission-level
 * before/after table.
 * @param {Object} scope raw scope resource
 * @returns {Array<{category: String, key: String}>} each permission the scope grants
 */
export function getScopePermissionRows(scope) {
  return getScopePermissionCategories(scope).flatMap((category) => getScopePermissionKeys(scope, category)
    .map((key) => ({ category, key })));
}
