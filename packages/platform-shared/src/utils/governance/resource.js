/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { get } from 'lodash';
import { getManagedRelationshipList, patchManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { searchCatalog } from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getUserGrants, searchGovernanceResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { saveNewRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import {
  getResourceFunction,
  getResourcePath,
  queryParamFunction,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';
import i18n from '@/i18n';

/**
 * Assigns resources to IDM backend
 * @param {String} parentResourceName IDM parent managed resource name
 * @param {String} parentResourceId id of parent IDM resource
 * @param {Array} resourceIds list of resources to create relationship to IDM resource
 * @param {String} managedResourceRev revision id of IDM resource
 * @returns {String} saving status
 */
export async function assignResourcesToIDM(parentResourceName, parentResourceId, resourceIds, managedResourceRev) {
  const saveData = [];
  resourceIds.forEach((resourceId) => {
    saveData.push({
      operation: 'add',
      field: '/assignments/-',
      value: { _ref: resourceId },
    });
  });

  try {
    const requestOverride = { headers: { 'if-match': managedResourceRev } };
    const { data } = await patchManagedResource(parentResourceName, parentResourceId, saveData, requestOverride);
    return { status: 'success', revision: data._rev };
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    return { status: 'error' };
  }
}

/**
 * Assigns resources to IGA backend
 * @param {String} parentResourceId id of parent IDM resource
 * @param {Array} resourceIds list of resources to create relationship to IDM resource
 * @param {String} grantType IGA grant type to attribute new resources to
 * @returns {String} saving status
 */
export async function assignResourcesToIGA(parentResourceId, resourceIds, grantType) {
  const entitlements = resourceIds.map((resourceId) => ({ type: 'entitlement', id: resourceId }));

  const payload = {
    accessModifier: 'add',
    catalogs: entitlements,
    context: { type: 'admin' },
    users: [parentResourceId],
    justification: 'Admin submitted', // Not translated as this is filler text for auto-approved requests
  };
  try {
    const { data } = await saveNewRequest(payload);
    if (data?.errors?.length) {
      data.errors.forEach((error) => {
        showErrorMessage(error, error.message);
      });
    }
    if (!data?.errors?.length || data.errors.length < resourceIds.length) {
      displayNotification('success', i18n.global.t('governance.resource.successfullyAdded', { resource: grantType }));
      return 'success';
    }
    return 'error';
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    return 'error';
  }
}

/**
 * Search the request catalog for entitlements using the provided search value
 * @param {Boolean} resourceIsUser whether parent resource is user
 * @param {String} searchValue search value to find entitlements by
 * @param {String} selectedApplication Application to query entitlements by
 * @param {String} managedResourcePath managed/<realm>_resourceName path to map return values with
 */
export async function getEntitlements(resourceIsUser, searchValue, selectedApplication, managedResourcePath) {
  try {
    const queryParams = {
      pageSize: 10,
    };
    const payload = {
      targetFilter: {
        operator: 'AND',
        operand: [
          {
            operator: 'EQUALS',
            operand: {
              targetName: 'item.type',
              targetValue: 'entitlementGrant',
            },
          },
          {
            operator: 'EQUALS',
            operand: {
              targetName: 'application.id',
              targetValue: selectedApplication,
            },
          },
          {
            operator: 'CONTAINS',
            operand: {
              targetName: 'descriptor.idx./entitlement.displayName',
              targetValue: searchValue,
            },
          },
        ],
      },
    };

    if (resourceIsUser) {
      queryParams.fields = 'application,entitlement,id,descriptor,glossary';
      queryParams.sortKeys = 'assignment.name';
      const { data } = await searchCatalog(queryParams, payload, true);
      return data?.result.map((result) => ({ value: result.id, text: get(result, 'descriptor.idx./entitlement.displayName') })) || [];
    }
    queryParams.sortBy = 'descriptor.idx./entitlement.displayName';
    const { data } = await searchGovernanceResource(payload, queryParams);
    return data?.result.map((result) => ({ value: `${managedResourcePath}/${result.id}`, text: get(result, 'descriptor.idx./entitlement.displayName') })) || [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorSearchingCatalog'));
    return [];
  }
}

/**
 * Loads a list goverance grants (accounts/entitlements/roles) based on the current path
 * @param {String} grantType - specific grant type queried, used in error message
 * @param {String} resourceId - Id of resource to get grants related to
 * @param {object} params - Parameters to be plugged into query string
 */
export async function getGovernanceGrants(grantType, resourceId, params) {
  try {
    const { data } = await getUserGrants(resourceId, params);
    return { items: data.result, totalCount: data.totalCount };
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.access.errorGettingData', { grantType: pluralizeValue(grantType) }));
    return { items: [], totalCount: 0 };
  }
}

/**
 * Queries IDM for a list of resources and combines them with Governance entitlement details
 * @param {String} resourceName resource name to query
 * @param {String} resourceId parent resource id with relationships
 * @param {String} relationshipName resource relationship name
 * @param {Object} params query parameters
 * @returns Entitlement list
 */
export async function getManagedResourceWithIGADetails(resourceName, resourceId, relationshipName, params) {
  const queryParams = {
    queryFilter: params.queryString ?? '',
    pageSize: params.pageSize || 10,
    totalPagedResultsPolicy: 'ESTIMATE',
    fields: 'name',
  };
  if (params.sortBy) {
    queryParams.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortBy}`;
  }
  if (params.pagedResultsCookie) {
    queryParams.pagedResultsCookie = params.pagedResultsCookie;
  }
  if (queryParams.queryFilter) {
    queryParams.queryFilter = `name sw "${params.queryString}" and `;
  }
  queryParams.queryFilter += '(/type eq "__ENTITLEMENT__")';
  try {
    const { data: managedAssignmentData } = await getManagedRelationshipList(resourceName, resourceId, relationshipName, queryParams);

    // get governance resource details from returned assignments
    const payload = {
      targetFilter: {
        operator: 'OR',
        operand: [],
      },
    };
    managedAssignmentData.result.forEach((assignment) => {
      payload.targetFilter.operand.push({
        operator: 'EQUALS',
        operand: {
          targetName: 'id',
          targetValue: assignment._refResourceId,
        },
      });
    });
    const searchGovResourceParams = {
      pageSize: params.pageSize || 10,
    };
    const { data: govResourceResponse } = await searchGovernanceResource(payload, searchGovResourceParams);
    return {
      items: managedAssignmentData.result.map((managedApplication) => {
        const govResource = govResourceResponse.result.find((govResourceResult) => govResourceResult.id === managedApplication._refResourceId);
        return {
          ...managedApplication,
          application: govResource.application,
          entitlementOwner: govResource.entitlementOwner || {},
          glossary: { idx: { '/entitlement': govResource.objGlossary } } || {},
        };
      }),
      totalCount: managedAssignmentData.totalPagedResults,
      pagedResultsCookie: managedAssignmentData.pagedResultsCookie,
      assignments: managedAssignmentData.result,
    };
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.access.errorGettingData', { grantType: i18n.global.t('common.entitlements') }));
    return { items: [], totalCount: 0, assignments: [] };
  }
}

/**
 * Revokes IDM resource from parent IDM resource
 * @param {String} parentResourceName IDM parent managed resource name
 * @param {String} parentResourceId id of parent IDM resource
 * @param {Array} resourcesToRevoke list of resources to create relationship to IDM resource
 * @param {String} managedResourceRev revision id of IDM resource
 * @returns {String} saving status
 */
export async function revokeResourcesFromIDM(parentResourceName, parentResourceId, resourcesToRevoke, managedResourceRev) {
  const saveData = [];
  resourcesToRevoke.forEach((resource) => {
    saveData.push({
      operation: 'remove',
      field: '/assignments',
      value: {
        _ref: resource._ref,
        _refProperties: resource._refProperties,
        _refResourceCollection: resource._refResourceCollection,
        _refResourceId: resource._refResourceId,
      },
    });
  });

  try {
    const requestOverride = { headers: { 'if-match': managedResourceRev } };
    const { data } = await patchManagedResource(parentResourceName, parentResourceId, saveData, requestOverride);
    return { status: 'resourcesRevoked', revision: data._rev };
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.resource.errors.errorCreatingAccessRequest'));
    return { status: 'error' };
  }
}

/**
 * Revokes IDM resource from parent IDM resource
 * @param {Object} revokePayload Contains request access metatdata for save request, as well as items to revoke
 * @param {String} parentResourceId id of parent IDM resource
 * @param {Boolean} adminAccess Whether context should be saved as admin or not
 * @returns {String} saving status
 */
export async function revokeResourcesFromIGA(revokePayload, parentResourceId, adminAccess) {
  try {
    const payload = {
      expiryDate: revokePayload.expiryDate,
      justification: revokePayload.justification || 'Admin submitted', // Not translated as this is filler text for auto-approved requests
      priority: revokePayload.priority,
    };
    payload.accessModifier = 'remove';
    payload.catalogs = revokePayload.itemsToRevoke.map((request) => {
      const typeMap = {
        entitlementGrant: 'entitlement',
        accountGrant: 'application',
        roleMembership: 'role',
      };
      return { type: typeMap[request.item.type], id: get(request.catalog, 'id', '') };
    });
    payload.users = [parentResourceId];
    if (adminAccess) payload.context = { type: 'admin' };

    const { data } = await saveNewRequest(payload);

    if (data.errors?.length) {
      showErrorMessage(null, data.errors[0].message);
      return { status: 'error' };
    }
    displayNotification('success', i18n.global.t('governance.request.requestSuccess'));
    return { status: 'requestsRevoked' };
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.request.requestError'));
    return { status: 'error' };
  }
}

/**
 * Retrieves the display name for a specific resource.
 * If the resource is a user, it will return the full name.
 *
 * @param {string} resourceType - The type of the resource. application, role, user, org
 * @param {string} id - The ID of the resource.
 * @returns {Promise} - A promise that resolves to the display data of the resource.
 */
async function getResourceDisplayName(resourceType, id) {
  const resourceFunction = getResourceFunction(resourceType);
  const resourcePath = getResourcePath(resourceType);
  try {
    const { data } = await resourceFunction(resourcePath, queryParamFunction(id.split('/').pop(), resourcePath, true));
    if (data.result.length === 0) {
      return null;
    }
    if (resourceType === 'user') {
      const user = data.result[0];
      return i18n.global.t('common.userFullName', {
        givenName: user.givenName,
        sn: user.sn,
      });
    }
    return data.result[0].name;
  } catch {
    return null;
  }
}

/**
 * Retrieves the display data for a specific resource.
 * If the value is an array, it will return a comma-separated string.
 *
 * @param {string} objectType - The type of the resource. application, role, user, org
 * @param {string | string[]} value - The ID|s of the resource|s.
 * @returns {Promise} - A promise that resolves to the display data of the resource.
 */
export async function getResourceDisplayData(objectType, value) {
  const resourceType = objectType.split('/').pop();
  const ids = Array.isArray(value) ? value : [value];
  const dataArray = await Promise.all(ids.map(async (id) => {
    const internalId = id.split('/').pop();
    const data = await getResourceDisplayName(resourceType, internalId);
    return data || id;
  }));
  return dataArray.join(', ');
}
