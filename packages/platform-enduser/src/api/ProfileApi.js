/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
/**
  * Returns a list of user's apps
  * @param {String} userManagedObject user object name example: user, alpha_user, or bravo_user
  * @param {String} Id user's _id
  *
  * @returns {Promise}
  */
// eslint-disable-next-line import/prefer-default-export
export function getUserSsoApplications(userManagedObject, id) {
  return generateIdmApi().get(`profile/managed/${userManagedObject}/${id}/applications?_fields=*&_queryFilter=true`);
}
