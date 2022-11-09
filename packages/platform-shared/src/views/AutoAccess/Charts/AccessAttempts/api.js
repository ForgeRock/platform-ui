/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import dayjs from 'dayjs';

export const defaultData = (length, startDate, interval = 'day') => {
  const start = dayjs(startDate).startOf(interval);
  const days = [];

  let i = 0;
  while (i < length) {
    days.push(
      {
        value: 0,
        timestamp: start.add(i, interval).format(),
      },
    );
    i += 1;
  }

  return days;
};

export const histogramQuery = (flagRisky, dates, interval = 'day', userId) => {
  const query = {
    sort: [
      {
        'features.timestamp': {
          order: 'desc',
        },
      },
    ],
    size: 10,
    query: {
      bool: {
        must: [
          {
            range: {
              'features.timestamp': {
                gte: dates[0],
                lte: dates[1],
              },
            },
          },
        ],
      },
    },
    aggs: {
      histogram: {
        date_histogram: {
          field: 'features.timestamp',
          calendar_interval: interval,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        aggs: {
          avg_value: {
            avg: {
              field: 'risk_score_data.risk_score',
            },
          },
        },
      },
    },
  };

  if (userId) {
    query.query.bool.must.push(
      {
        term: {
          'features.userId.keyword': userId || null,
        },
      },
    );
  }

  if (flagRisky !== null
  ) {
    query.query.bool.must.push(
      {
        term: {
          'risk_score_data.is_risky_event': flagRisky,
        },
      },
    );
  }

  // if (isRisky) {
  //     // order matches elastic document risk score heuristics order
  //     const heuristics = [
  //         "is_brute_force",
  //         "is_credential_stuffing",
  //         "is_suspicious_ip",
  //     ]

  //     heuristics.forEach((key, i)=> {
  //         query.aggs.histogram.aggs[`${key}`] = {
  //             // filter: {
  //             //     // match: {
  //             //     //     [`risk_score_data.heuristic_agg_result.raw_results[${i}].${key}`]: true,
  //             //     // },
  //             //     // "terms": {
  //             //     //     "field": `risk_score_data.heuristic_agg_result.raw_results[${i}].${key}`,
  //             //     //     "include": "map"
  //             //     //   }
  //             // }
  //             // nested: {
  //             //     path: `risk_score_data.heuristic_agg_result.raw_results[${i}]`,
  //             // },
  //             aggs: {
  //                 [`num_${key}`]: {
  //                     filter: {
  //                         bool: {
  //                             filter: [
  //                                 {
  //                                     term: {
  //                                         [`risk_score_data.heuristic_agg_result.raw_results[${i}].${key}`]: true,
  //                                     }
  //                                 }
  //                             ]
  //                         }
  //                     }
  //                 }
  //             }
  //             // aggs: {
  //             //     [`${key}`]: {
  //             //         filter: {
  //             //             [`${key}`]: true,
  //             //         }
  //             //     }
  //             // }
  //         }
  //     })
  // }

  return query;
};
