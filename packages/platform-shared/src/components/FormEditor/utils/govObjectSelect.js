/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { searchCatalogEntitlements } from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import i18n from '@/i18n';

/**
 * Returns the appropriate resource function based on the provided property type.
 *
 * @param {String} propertyType - The type of property to get the resource function for.
 * @returns {Function} The resource function corresponding to the property type.
 */
export function getResourceFunction(propertyType) {
  switch (propertyType) {
    case 'user':
    case 'role':
    case 'organization':
      return getManagedResourceList;
    case 'entitlement':
      return searchCatalogEntitlements;
    case 'application':
      return getResource;
    default:
      return getManagedResourceList;
  }
}

/**
 * Returns the resource path based on the given property type.
 *
 * @param {string} propertyType - The type of the property (e.g., 'user', 'role').
 * @returns {string} The corresponding resource path.
 */
export function getResourcePath(propertyType) {
  switch (propertyType) {
    case 'user':
      return 'alpha_user';
    case 'role':
      return 'alpha_role';
    case 'organization':
      return 'alpha_organization';
    default:
      return propertyType;
  }
}

/**
 * Extracts the resource type from a given full resource path.
 *
 * The function splits the input path by '/' and takes the last segment.
 * It then splits this segment by '_' and returns the last part.
 * For example, 'managed/alpha_user' would return 'user'.
 *
 * @param {string} fullResourcePath - The full path to the resource.
 * @returns {string} - The extracted resource type.
 */
export function getResourceType(fullResourcePath) {
  return fullResourcePath.split('/').pop().split('_').pop();
}

/**
 * Generates an option object for a given resource and resource type.
 *
 * @param {Object} resource - The resource object containing data.
 * @param {string} resourceType - The type of the resource (e.g., 'alpha_user', 'alpha_role', 'entitlement').
 * @returns {Object} An object containing 'text' and 'value' properties for the option.
 */
export function optionFunction(resource, resourceType) {
  switch (resourceType) {
    case 'alpha_user':
      return {
        userInfo: { ...resource },
        text: i18n.global.t('common.userFullNameUserName', { givenName: resource.givenName, sn: resource.sn, userName: resource.userName }),
        value: resource._id,
      };
    case 'alpha_role':
    case 'alpha_organization':
      return {
        text: resource.name,
        value: resource._id,
      };
    case 'entitlement':
      return {
        text: resource.descriptor.idx['/entitlement'].displayName,
        value: resource.assignment.id,
      };
    default:
      return {
        text: resource.name,
        value: resource.id,
      };
  }
}

/**
 * Creates a function that generates a custom option object for a given resource.
 *
 * @param {string} displayProperty - The property of the resource to use for the `text` field in the option object.
 * @returns {function(Object): {value: string, text: string}} - A function that takes a resource object and returns an option object
 * with `value` set to the resource's `_id` and `text` set to the value of the specified `displayProperty`.
 */
export function getCustomOptionFunction(displayProperty) {
  function returnFunction(resource) {
    return {
      value: resource._id,
      text: resource[displayProperty],
    };
  }
  return returnFunction;
}

/**
 * Returns a function to handle options based on whether the option is for a custom managed object.
 *
 * @param {boolean} isCustom - Is the option for a custom managed object
 * @param {string} displayProperty - The property to display for custom object.
 * @returns {Function} A function to handle options
 */
export function optionFunctionWithCustom(isCustom, displayProperty) {
  return isCustom
    ? getCustomOptionFunction(displayProperty)
    : optionFunction;
}

/**
 * Generates a query filter string based on the provided query string, fields, and custom query filter.
 *
 * @param {string} queryString - The query string to search for within the fields.
 * @param {string[]} fields - An array of field names to search within.
 * @param {string} [customQueryFilter] - An optional custom query filter to be combined with the generated query filter.
 * @returns {string|boolean} - The generated query filter string or true if no query string is provided and no custom query filter is provided.
 */
export function getQueryFilterWithCustomFilter(queryString, fields, customQueryFilter) {
  let queryFilter;
  if (queryString) {
    const tempQuery = fields.map((field) => `/${field} sw "${queryString}"`).join(' or ');
    queryFilter = customQueryFilter
      ? `(${tempQuery}) and (${customQueryFilter})`
      : tempQuery;
  } else {
    queryFilter = customQueryFilter || true;
  }
  return queryFilter;
}

/**
 * Generates query parameters for different resource types.
 *
 * @param {string} queryString - The query string to filter resources.
 * @param {string} resourceType - The type of resource to query. Can be 'alpha_user', 'alpha_role', or 'application'.
 * @param {boolean} [singleResource=false] - Whether to query for a single resource by ID.
 * @param {string} [customQueryFilter=''] - A custom query filter to apply to the query.
 * @returns {Object} The query parameters object.
 */
export function queryParamFunction(queryString, resourceType, singleResource = false, customQueryFilter = '') {
  const queryParams = {};
  if (resourceType === 'alpha_user' || resourceType === 'alpha_role' || resourceType === 'alpha_organization') {
    const fields = resourceType === 'alpha_user'
      ? ['givenName', 'sn', 'userName']
      : ['name'];
    queryParams.pageSize = 10;
    queryParams.fields = fields.join(',');
    if (singleResource) {
      queryParams.queryFilter = `_id eq "${queryString}"`;
    } else {
      queryParams.queryFilter = getQueryFilterWithCustomFilter(queryString, fields, customQueryFilter);
    }
    return queryParams;
  }

  queryParams.queryString = queryString;
  if (resourceType === 'application') {
    queryParams.authoritative = false;
  }
  return queryParams;
}

/**
 * Generates a custom query parameter function based on the provided query properties.
 *
 * @param {Array<string>} queryProperties - An array of property names to be used for constructing query filters.
 * @returns {Function} A function that generates query parameters for API requests.
 */
export function getCustomQueryParamFunction(queryProperties) {
  function returnFunction(queryString, resourceType, singleResource = false, customQueryFilter = '') {
    const queryParams = {};
    queryParams.pageSize = 10;
    queryParams.fields = '*';

    queryParams.queryFilter = singleResource
      ? `_id eq "${queryString}"`
      : getQueryFilterWithCustomFilter(queryString, queryProperties, customQueryFilter);
    return queryParams;
  }
  return returnFunction;
}

/**
 * Determines the appropriate query parameter function to use based on whether
 * the input is custom or not.
 *
 * @param {Boolean} isCustom - Flag indicating if query parameter function is for custom managed object
 * @param {Array<string>} queryProperties - An array of property names to be used for constructing query filters.
 * @returns {Function} - function that generates query parameters for API requests.
 */
export function queryParamFunctionWithCustom(isCustom, queryProperties) {
  return isCustom
    ? getCustomQueryParamFunction(queryProperties)
    : queryParamFunction;
}

/**
 * Constructs a value path string based on the provided resource type and id.
 *
 * @param {string} resourceType - The type of the resource (e.g., 'user', 'role', 'organization', 'application', 'entitlement').
 * @param {string} id - The unique identifier for the resource.
 * @returns {string} The constructed value path string.
 */
export function getValuePath(resourceType, id) {
  switch (resourceType) {
    case 'user':
    case 'role':
    case 'organization':
    case 'application':
      return `managed/${resourceType}/${id}`;
    case 'entitlement':
      return `entitlement/${id}`;
    default:
      return `managed/${resourceType}/${id}`;
  }
}
