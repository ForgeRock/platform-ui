/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getUsersApplicationsMock,
  getUsersEntitlementsMock,
  getUsersRolesMock,
} from './CatalogApiMock';

export function searchCatalog(params = {}, payload) {
  params.action = 'search';
  const url = `/governance/catalog${encodeQueryString(params)}`;
  return generateIgaApi().post(url, payload);
}

/**
 * Get the properties available to filter by/search in catalog
 * @param {*} objectType optional - If specified, only shows schema for provided objectType
 */
export function getCatalogFilterSchema(objectType) {
  let url = '/governance/search/schema';
  if (objectType) {
    url += `/${objectType}`;
  }
  return generateIgaApi().get(url);
}

export function getUsersApplications(/* userIds */) {
  return Promise.resolve({ data: getUsersApplicationsMock() });
}

export function getUsersEntitlements(/* userIds */) {
  return Promise.resolve({ data: getUsersEntitlementsMock() });
}

export function getUsersRoles(/* userIds */) {
  return Promise.resolve({ data: getUsersRolesMock() });
}
