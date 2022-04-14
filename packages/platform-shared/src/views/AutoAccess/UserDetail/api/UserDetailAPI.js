/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const averageRiskScoreQuery = (userId, dates) => ({
  size: 0,
  query: {
    bool: {
      must: [
        {
          term: {
            'userId.keyword': userId,
          },
        },
        // {
        //     range: {
        //         timestamp: {
        //             gte: dates[0],
        //             lte: dates[1],
        //         },
        //     },
        // },
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
