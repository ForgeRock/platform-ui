/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const averageRiskScoreQuery = (userId) => ({
  size: 0,
  query: {
    bool: {
      must: [
        {
          term: {
            'userId.keyword': userId,
          },
        },
      ],
    },
  },
  aggs: {
    avg_risk_score: {
      avg: {
        field: 'risk.ensemble_model.score',
      },
    },
  },
});

export default averageRiskScoreQuery;
