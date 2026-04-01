/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { searchQuery } from '@forgerock/platform-shared/src/api/governance/CampaignApi';
import i18n from '@/i18n';

const ACCESS_REVIEW_HISTORY_KEYS_COLORS = {
  certify: '#2ed47a',
  revoke: '#109cf1',
};

/**
 * It returns the number of active reviews
 * @returns The number of active reviews
 */
export function getActiveReviews() {
  const query = {
    groupBy: [[
      'decision.certification.status',
      'decision.certification.decision',
    ]],
    entityPath: '/governance/decision',
    pageSize: '0',
    targetFilter: {
      operator: 'EQUALS',
      operand: {
        targetName: 'decision.certification.status',
        targetValue: 'in-progress',
      },
    },
    cardinality: ['decisionTaskKey'],
  };
  return searchQuery(query).then((response) => response.data.cardinality?.decisionTaskKey?.toString());
}

/**
 * It returns a promise that resolves to an array of objects with the following shape:
 * @returns An array of objects with the following properties:
 *   label: A string that is the translation of the key
 *   value: A number that is the count of the key
 *   color: A string that is the color of the key
 */
export function getAccessReviewHistory() {
  const query = {
    groupBy: [[
      'decision.certification.decision',
    ]],
    entityPath: '/governance/decision',
    pageSize: '0',
  };
  return searchQuery(query).then((response) => response.data.aggregation?.['decision.certification.decision']
    .filter((aggregation) => Object.keys(ACCESS_REVIEW_HISTORY_KEYS_COLORS).includes(aggregation.key))
    .map((aggregation) => ({
      label: i18n.global.t(`governance.certification.accessReviewHistoryLabels.${aggregation.key}`),
      value: aggregation.count,
      color: ACCESS_REVIEW_HISTORY_KEYS_COLORS[aggregation.key],
    })));
}
