/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

export function getPermissionsForUser(userId, scopePermission) {
  const params = {
    scopePermission,
    _queryFilter: `id eq "${userId}"`,
  };
  return generateIgaApi().get(`governance/user${encodeQueryString(params)}`);
}

export function getPermissionsForUsers(userIds, scopePermission) {
  const params = {
    scopePermission,
    _queryFilter: userIds.map((id) => `id eq "${id}"`).join(' or '),
  };
  return generateIgaApi().get(`governance/user${encodeQueryString(params)}`);
}

export function getPrivileges(userId) {
  return generateIgaApi().get(`governance/user/${userId}/privileges`);
}
