/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from './BaseApi';

/**
  * Returns privileges of a resourcePath (resourceType/resourceName)
  * @param {String} resourcePath Path of resource example: internal/user or managed/role
  *
  * @returns {Promise}
  */
export function getResourceTypePrivilege(resourcePath) {
  return generateIdmApi().get(`privilege/${resourcePath}`);
}

/**
  * Returns privileges of a specific resource
  * @param {String} resourcePath Path of resource example: internal/user or managed/role
  * @param {String} Id An internal resource _id
  *
  * @returns {Promise}
  */
export function getResourcePrivilege(resourcePath, id) {
  return generateIdmApi().get(`privilege/${resourcePath}/${id}`);
}

/**
 * Gets privileges for the currently authenticated user
 * @returns {Promise} a Promise resolving to the current users privilege object
 */
export function getUserPrivileges() {
  return generateIdmApi().post('privilege?_action=listPrivileges');
}
