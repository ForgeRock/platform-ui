/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { convertTargetFilterToQueryFilter } from '@forgerock/platform-shared/src/utils/governance/filters';

export function searchCatalog(params = {}, payload, ignoreRequestable = false) {
  params.action = 'search';

  let queryString = encodeQueryString(params);
  if (ignoreRequestable) queryString = `${queryString}&ignoreRequestable=true`;

  const url = `/governance/catalog${queryString}`;
  return generateIgaApi().post(url, payload);
}

/**
 * A query on the catalog, using _queryFilter and other supported params
 * @param {object} params Map of query parameters
 * @param {object} targetFilter To support existing calls to catalog, will accept a targetFilter object and convert to queryFilter
 * @param {boolean} ignoreRequestable For admin use, can bypass the required requestable flag on catalog items
 * @returns List of catalog entries
 */
export function queryCatalog(params = {}, targetFilter, ignoreRequestable = false) {
  if (targetFilter && !params.queryFilter) {
    params.queryFilter = convertTargetFilterToQueryFilter(targetFilter);
  }

  let queryString = encodeQueryString(params);
  if (ignoreRequestable) queryString = `${queryString}&ignoreRequestable=true`;

  const url = `/governance/catalog${queryString}`;
  return generateIgaApi().get(url);
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

export function searchCatalogEntitlements(resource, params = {}) {
  const queryParams = {
    fields: 'descriptor,assignment',
    pageSize: 10,
    pagedResultsOffset: 0,
    sortKeys: '-assignment.name',
    action: 'search',
  };
  const payload = {
    targetFilter: {
      operand: {
        targetName: 'item.type',
        targetValue: 'entitlementGrant',
      },
      operator: 'EQUALS',
    },
  };

  if (params.queryString) {
    payload.targetFilter = {
      operator: 'AND',
      operand: [
        {
          operator: 'OR',
          operand: [
            {
              operator: 'CONTAINS',
              operand: {
                targetName: 'descriptor.idx./entitlement.displayName',
                targetValue: params.queryString,
              },
            },
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'assignment.id',
                targetValue: params.queryString,
              },
            },
          ],
        },
        {
          operator: 'EQUALS',
          operand: {
            targetName: 'item.type',
            targetValue: 'entitlementGrant',
          },
        },
      ],
    };
  }

  let queryString = encodeQueryString(queryParams);
  queryString = `${queryString}`;

  const url = `/governance/catalog${queryString}`;
  return generateIgaApi().post(url, payload);
}
