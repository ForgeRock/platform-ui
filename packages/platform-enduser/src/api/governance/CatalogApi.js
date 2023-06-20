/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */
import {
  getCatalogMock,
  getUsersApplicationsMock,
  getUsersEntitlementsMock,
  getUsersRolesMock,
} from './CatalogApiMock';

export function searchCatalog(params = {}, type) {
  return Promise.resolve({ data: getCatalogMock(params, type) });
}

export function getCatalogFilterSchema(type) {
  // types will likely be 'application', 'entitlement', 'role'

  // return generateIgaApi().post('/catalog/get-filter-schema/${type}', filter);
}

export function getUsersApplications(userIds) {
  return Promise.resolve({ data: getUsersApplicationsMock() });
}

export function getUsersEntitlements(userIds) {
  return Promise.resolve({ data: getUsersEntitlementsMock() });
}

export function getUsersRoles(userIds) {
  return Promise.resolve({ data: getUsersRolesMock() });
}
