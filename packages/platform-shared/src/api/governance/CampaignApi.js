/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import dayjs from 'dayjs';
import styles from '@forgerock/platform-shared/src/scss/main.scss';
import i18n from '@/i18n';

const governanceBaseUrl = '/governance';

const CAMPAIGNS_BY_TYPE_KEYS_COLORS = {
  identity: '#2ed47a',
  application: '#2ed47a',
  entitlement: '#109cf1',
  entitlementComposition: styles.red,
  roleMembership: '#ba4de1',
};

const CAMPAIGNS_BY_STATUS_KEYS_COLORS = {
  'in-progress': '#2ed47a',
  'signed-off': '#109cf1',
  staging: '#ffb946',
};

/*
 * @description executes a search query request to the iga API
 * @param {string}  query   - the query object for the requested data
 */
export function searchQuery(query) {
  const resourceUrl = `${governanceBaseUrl}/search`;
  return generateIgaApi().post(resourceUrl, query);
}

/**
 * It returns the number of active certification campaigns
 * @returns A promise that resolves to a string.
 */
export function getActiveCampaignsCount() {
  const query = {
    groupBy: [[
      'status',
      'certificationType',
    ]],
    entityPath: '/repo/governance/certification',
    pageSize: '0',
    targetFilter: {
      operator: 'AND',
      operand: [
        {
          operator: 'EQUALS',
          operand: {
            targetName: 'status',
            targetValue: 'in-progress',
          },
        },
      ],
    },
  };
  return searchQuery(query).then((response) => response.data.total?.toString());
}

/**
 * It returns the number of campaigns that are in-progress and have a deadline within two weeks
 * @returns The number of campaigns that are expiring in the next two weeks.
 */
export function getExpiringCampaigns() {
  const date = dayjs().add(2, 'week');
  const query = {
    entityPath: '/repo/governance/certification',
    targetFilter: {
      operator: 'AND',
      operand: [
        {
          operator: 'LT',
          operand: {
            targetName: 'deadline',
            targetValue: date,
          },
        },
        {
          operator: 'EQUALS',
          operand: {
            targetName: 'status',
            targetValue: 'in-progress',
          },
        },
      ],
    },
    pageSize: '0',
  };
  return searchQuery(query).then((response) => response.data.total?.toString());
}

/**
 * It returns a promise that resolves to an array of objects, each object containing a label, a value and a color
 * @returns An array of objects with the following properties:
 *   label: A string
 *   value: A number
 *   color: A string
 */
export function getCampaignsByType() {
  const query = {
    groupBy: [[
      'certificationType',
    ]],
    entityPath: '/repo/governance/certification',
    pageSize: '0',
  };
  return searchQuery(query).then((response) => response.data.aggregation?.certificationType.map((aggregation) => ({
    label: i18n.global.t(`governance.certification.activeCampaignsLabels.${aggregation.key}`),
    value: aggregation.count,
    color: CAMPAIGNS_BY_TYPE_KEYS_COLORS[aggregation.key],
  })));
}

/**
 * It returns a promise that resolves to an array of objects, each of which has a label, a value, and a color
 * @returns An array of objects with the following properties:
 *   label: A string
 *   value: A number
 *   color: A string
 */
export function getCampaignsByStatus() {
  const query = {
    groupBy: [[
      'status',
    ]],
    entityPath: '/repo/governance/certification',
    pageSize: '0',
  };
  return searchQuery(query).then((response) => response.data.aggregation?.status
    .filter((aggregation) => Object.keys(CAMPAIGNS_BY_STATUS_KEYS_COLORS).includes(aggregation.key))
    .map((aggregation) => ({
      label: i18n.global.t(`governance.certification.campaignsByStatusLabels.${aggregation.key}`),
      value: aggregation.count,
      color: CAMPAIGNS_BY_STATUS_KEYS_COLORS[aggregation.key],
    })));
}

/**
 * It returns the details of a certification campaign
 * @param campaignId - The ID of the campaign you want to get details for.
 * @returns The campaign details
 */
export function getCampaignDetails(campaignId) {
  const resourceUrl = `${governanceBaseUrl}/admin/certification/${campaignId}`;
  return generateIgaApi().get(resourceUrl).then((response) => response.data);
}

/**
 * It updates the deadline of a certification campaign
 * @param campaignId - The id of the campaign you want to update.
 * @param newDeadline - The new deadline for the campaign.
 * @returns The response is a JSON object containing the updated campaign.
 */
export function updateCampaignDeadline(campaignId, newDeadline) {
  const resourceUrl = `${governanceBaseUrl}/certification/${campaignId}/update-deadline`;
  return generateIgaApi().post(resourceUrl, {
    newDeadline,
  }).then((response) => response.data);
}

/**
   * This function cancels a certification campaign.
   * @param campaignId - The ID of the campaign you want to cancel.
   * @returns The response is a promise that resolves to the data returned by the API.
   */
export function cancelCampaign(campaignId) {
  const resourceUrl = `${governanceBaseUrl}/certification/${campaignId}/cancel`;
  return generateIgaApi().post(resourceUrl).then((response) => response.data);
}

/**
   * It deletes a campaign
   * @param campaignId - The ID of the campaign to delete.
   * @returns The response data.
   */
export function deleteCampaign(campaignId) {
  const resourceUrl = `${governanceBaseUrl}/certification/${campaignId}`;
  return generateIgaApi().delete(resourceUrl).then((response) => response.data);
}

/**
   * It activates a campaign
   * @param campaignId - The ID of the campaign to activate.
   * @returns The response is a promise that resolves to the data returned by the API.
   */
export function activateCampaign(campaignId) {
  const resourceUrl = `${governanceBaseUrl}/certification/${campaignId}/activate`;
  return generateIgaApi().post(resourceUrl).then((response) => response.data);
}

/**
   * It gets the tasks for a given campaign
   * @param campaignId - The id of the campaign you want to get the tasks for.
   * @param [aditionalParams] - This is an object that contains the parameters that you want to pass to the API.
   * @returns A promise that will resolve to an object with the following properties:
   */
export function getCampaignTasks(campaignId, aditionalParams = {}) {
  const params = {
    pageNumber: 0,
    pageSize: 10,
    ...aditionalParams,
  };
  const resourceUrl = `${governanceBaseUrl}/admin/certification/${campaignId}/tasks`;
  return generateIgaApi().get(resourceUrl, { params });
}
