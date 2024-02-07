/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getManagedRelationshipList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getUserGrants, searchGovernanceResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';

/**
 * Loads a list goverance grants (accounts/entitlements/roles) based on the current path
 * @param {object} params - Parameters to be plugged into query string
 * @param {Boolean} isInit - Parameter check whether the component is inital rendering, passed from loadData()
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
        };
      }),
      totalCount: managedAssignmentData.totalPagedResults,
      pagedResultsCookie: managedAssignmentData.pagedResultsCookie,
    };
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.access.errorGettingData', { grantType: i18n.global.t('common.entitlements') }));
    return { items: [], totalCount: 0 };
  }
}
