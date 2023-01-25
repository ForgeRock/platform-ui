/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';
import { generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
// import { postData } from './axios-utils';

export function getQueryFilters(dateRange, filterObject, userId) {
  const bool = {
    must: [
      {
        range: {
          'predictionResult.features.timestamp': {
            gte: dateRange[0],
            lte: dateRange[1],
          },
        },
      },
    ],
  };

  if (filterObject.riskRange) {
    bool.must.push(
      {
        range: {
          'predictionResult.risk_score_data.risk_score': {
            lte: filterObject.riskRange[1] + 0.49,
            gte: filterObject.riskRange[0],
          },
        },
      },
    );
  }

  if (filterObject.geoCoordinates) {
    bool.must.push(
      {
        range: {
          'predictionResult.features.geoData.lat': {
            lte: filterObject.geoCoordinates.north,
            gte: filterObject.geoCoordinates.south,
          },
        },
      },
    );
    bool.must.push(
      {
        range: {
          'predictionResult.features.geoData.longitude': {
            lte: filterObject.geoCoordinates.east,
            gte: filterObject.geoCoordinates.west,
          },
        },
      },
    );
  }

  if (typeof filterObject.is_risky_event === 'boolean') {
    bool.must.push({
      term: {
        'predictionResult.risk_score_data.is_risky_event': filterObject.is_risky_event,
      },
    });
  }

  const featureMap = {};
  filterObject.features.forEach((feature) => {
    if (!featureMap[feature.key]) {
      featureMap[feature.key] = [];
    }
    featureMap[feature.key].push(...feature.value);
  });

  Object.keys(featureMap).forEach((key) => {
    bool.must.push({
      bool: {
        should: featureMap[key].map((value) => (
          {
            term: {
              [`${key}.keyword`]: value,
            },
          }
        )),
        minimum_should_match: 1,
      },
    });
  });

  if (userId) {
    bool.must.push(
      {
        term: {
          'predictionResult.features.userId': this.userId,
        },
      },
    );
  }

  if (filterObject.reasons.length > 0) {
    const reasons = [];
    const hueristicsReasons = [];
    const heuristics = filterObject.reasons.flat().filter((el) => el.indexOf('is_') === 0);
    const ueba = filterObject.reasons.flat().filter((el) => el.indexOf('is_') === -1);

    if (heuristics.length > 0) {
      hueristicsReasons.push({
        bool: {
          should: heuristics.map((heurisic) => ({
            term: {
              [`predictionResult.risk_score_data.heuristic_agg_result.raw_results.${heurisic}`]: true,
            },
          })),
          minimum_should_match: 1,
        },
      });

      bool.must.push(
        {
          nested: {
            path: 'predictionResult.risk_score_data.heuristic_agg_result.raw_results',
            query: {
              bool: {
                should: hueristicsReasons,
              },
            },
          },
        },
      );
    }

    if (ueba.length > 0) {
      const uebaReason = ueba.map((reason) => ({
        term: {
          'predictionResult.ueba_signal.explainable_features': reason,
        },
      }));
      const clusterReason = ueba.map((reason) => ({
        term: {
          'predictionResult.risk_score_data.clustering_result.top_cluster_explainability': reason,
        },
      }));
      reasons.push({
        bool: {
          must: [
            {
              bool: {
                should: [...uebaReason, ...clusterReason],
                minimum_should_match: 1,
              },
            },
            {
              term: {
                'predictionResult.risk_score_data.heuristic_risk_score': 0,
              },
            },
          ],
        },
      });

      bool.must.push(
        {
          bool: {
            should: reasons,
            minimum_should_match: 1,
          },
        },
      );
    }
  }

  return bool;
}

export const getConfig = () => new Promise((resolve, reject) => {
  const param = {
    indexName: 'risk_explainability',
    query: {
      query: {
        term: {
          'predictionResult.risk_score_data.is_risky_event': true,
        },
      },
      size: 1,
    },
  };
  generateAutoAccessJas().post('/entity/search/', param)
    .then((data) => {
      resolve({
        thresholds: {
          high: _.get(data, 'hits.hits[0]._source.predictionResult.risk_score_data.risk_score_threshhold', 0),
        },
      });
    })
    .catch((e) => {
      reject(e);
    });
});
