/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
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
    default:
      return getResource;
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
        text: i18n.global.t('common.userFullName', { givenName: resource.givenName, sn: resource.sn }),
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
 * Generates query parameters for different resource types.
 *
 * @param {string} queryString - The query string to filter resources.
 * @param {string} resourceType - The type of resource to query. Can be 'alpha_user', 'alpha_role', or 'application'.
 * @param {boolean} [singleResource=false] - Whether to query for a single resource by ID.
 * @returns {Object} The query parameters object.
 */
export function queryParamFunction(queryString, resourceType, singleResource = false) {
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
      queryParams.queryFilter = queryString
        ? fields.map((field) => `/${field} sw "${queryString}"`).join(' or ')
        : true;
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
      return `${resourceType}/${id}`;
  }
}
