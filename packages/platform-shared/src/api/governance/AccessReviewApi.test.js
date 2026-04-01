/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as AccessReviewsApi from './AccessReviewApi';

const get = jest.fn();
const post = jest.fn();
BaseApi.generateIgaApi = jest.fn(() => ({ get, post }));

describe('Access Reviews API', () => {
  it('getActiveReviews calls searchQuery properly', async () => {
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
    post.mockReturnValue(Promise.resolve({ data: { cardinality: { decisionTaskKey: 21 } } }));
    const response = await AccessReviewsApi.getActiveReviews();
    expect(post).toBeCalledWith('/governance/search', query);
    expect(response).toBe('21');
  });

  it('getAccessReviewHistory calls searchQuery properly', async () => {
    const query = {
      groupBy: [[
        'decision.certification.decision',
      ]],
      entityPath: '/governance/decision',
      pageSize: '0',
    };
    post.mockReturnValue(Promise.resolve({
      data: {
        aggregation: {
          'decision.certification.decision': [
            {
              key: 'NONE',
              count: 11590,
            },
            {
              key: 'certify',
              count: 422,
            },
            {
              key: 'revoke',
              count: 47,
            },
          ],
        },
      },
    }));
    const response = await AccessReviewsApi.getAccessReviewHistory();
    expect(post).toBeCalledWith('/governance/search', query);
    expect(response).toEqual([
      {
        color: '#2ed47a',
        label: 'Certified',
        value: 422,
      },
      {
        color: '#109cf1',
        label: 'Revoked',
        value: 47,
      },
    ]);
  });
});
