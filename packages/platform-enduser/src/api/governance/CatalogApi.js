/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */
// import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getCatalogMock,
  getUsersApplicationsMock,
  getUsersEntitlementsMock,
  getUsersRolesMock,
} from './CatalogApiMock';

export function searchCatalog(params = {}, payload) {
  // const url = /governance/catalog;
  return Promise.resolve({ data: getCatalogMock(params, payload.targetFilter.operand.targetValue) });
  // return generateIgaApi().post(url, encodeQueryString(params), payload);
}

/**
 * Get the properties available to filter by/search in catalog
 * @param {*} objectType optional - If specified, only shows schema for provided objectType
 */
export function getCatalogFilterSchema(objectType) {
  // const url = '/governance/search/schema';
  // if (objectType) {
  //   url += `/${objectType}`;
  // }
  // return generateIgaApi().get(url);
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
