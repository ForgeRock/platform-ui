/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';
import { generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
import store from '@/store';

/**
 * Format an object to be used as the payload for an elastic query search
 *
 * @param {Array} dateRange - Start and end date of the query
 * @param {Object} filterObject - Object containing risk range, geo coords, and filters
 * @param {String} userId - User id for specific user query
 * @returns {Object} Elastic query search compatible object
 */
export function getQueryFilters(dateRange, filterObject, userId) {
  // Date Range
  const bool = {
    must: [{
      range: {
        'predictionResult.features.timestamp': {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
    },
    ],
  };

  // Risk Range
  if (filterObject.riskRange) {
    bool.must.push({
      range: {
        'predictionResult.risk_score_data.risk_score': {
          lt: filterObject.riskRange[1] + 0.5,
          gte: filterObject.riskRange[0],
        },
      },
    });
  }

  // Geo Coordinates
  if (Object.keys(filterObject.geoCoordinates).length) {
    bool.must.push({
      range: {
        'predictionResult.features.geoData.lat': {
          lte: filterObject.geoCoordinates.north,
          gte: filterObject.geoCoordinates.south,
        },
      },
    });
    bool.must.push({
      range: {
        'predictionResult.features.geoData.longitude': {
          lte: filterObject.geoCoordinates.east,
          gte: filterObject.geoCoordinates.west,
        },
      },
    });
  }

  // Is Risky Event
  if (filterObject.is_risky_event) {
    bool.must.push({
      term: {
        'predictionResult.risk_score_data.is_risky_event': filterObject.is_risky_event,
      },
    });
  }

  // Attribute Filters
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

  bool.must.push(
    {
      term: {
        realm: `/${store.state.realm}`,
      },
    },
  );

  // User
  if (userId) {
    bool.must.push({
      term: {
        'predictionResult.features.userId': this.userId,
      },
    });
  }

  const clusteringReasons = [];
  const heuristicRawResultsReasons = [];
  let isIpBlocked = false;
  let isAdvancedBotDetection = false;
  const uebaReasons = [];
  filterObject.reasons.forEach((reasons) => {
    reasons.forEach((reason) => {
      if (reason === 'is_ip_blocked') {
        isIpBlocked = true;
      } else if (reason === 'is_advanced_bot_detection') {
        isAdvancedBotDetection = true;
      } else if (reason.indexOf('is_') === 0) {
        heuristicRawResultsReasons.push(reason);
      }
      if (store.state.Dashboard.uebaReasons.includes(reason)) {
        uebaReasons.push(reason);
      }
      if (store.state.Dashboard.clusteringReasons.includes(reason)) {
        clusteringReasons.push(reason);
      }
    });
  });

  // Heuristic, UEBA, Clustering Reason
  const allQuery = { bool: { should: [], minimum_should_match: 1 } };
  if (filterObject.reasons.length > 0) {
    const hueristicsRawResultsQuery = [];

    // Heuristics IP Block Rule
    if (isIpBlocked) {
      allQuery.bool.should.push({
        bool: {
          should: {
            term: {
              'predictionResult.risk_score_data.heuristic_agg_result.block_rule_result.is_blocked': true,
            },
          },
          minimum_should_match: 1,
        },
      });
    }

    // Heuristics Advanced Bot Detection
    if (isAdvancedBotDetection) {
      allQuery.bool.should.push({
        bool: {
          should: {
            term: {
              'predictionResult.botD.isBot': true,
            },
          },
          minimum_should_match: 1,
        },
      });
    }

    // Heuristic Raw Results
    if (heuristicRawResultsReasons.length > 0) {
      hueristicsRawResultsQuery.push({
        bool: {
          should: heuristicRawResultsReasons.map((heuristic) => ({
            term: {
              [`predictionResult.risk_score_data.heuristic_agg_result.raw_results.${heuristic}`]: true,
            },
          })),
          minimum_should_match: 1,
        },
      });

      allQuery.bool.should.push({
        nested: {
          path: 'predictionResult.risk_score_data.heuristic_agg_result.raw_results',
          query: {
            bool: {
              should: hueristicsRawResultsQuery,
            },
          },
        },
      });
    }

    // UEBA
    if (uebaReasons.length > 0) {
      const uebaQuery = uebaReasons.map((reason) => ({
        term: {
          'predictionResult.ueba_signal.explainable_features': reason,
        },
      }));

      allQuery.bool.should.push({
        bool: {
          filter: {
            script: {
              script: "return doc['predictionResult.risk_score_data.ueba_avg_risk_score'].value > doc['predictionResult.risk_score_data.risk_score_threshold'].value;",
            },
          },
          should: uebaQuery,
          minimum_should_match: 1,
        },
      });
    }

    // Clustering
    if (clusteringReasons.length > 0) {
      const clusteringQuery = clusteringReasons.map((reason) => ({
        term: {
          'predictionResult.risk_score_data.clustering_result.top_cluster_explainability': reason,
        },
      }));

      allQuery.bool.should.push({
        bool: {
          filter: {
            script: {
              script: "return doc['predictionResult.risk_score_data.clustering_model_risk_score'].value > doc['predictionResult.risk_score_data.risk_score_threshold'].value;",
            },
          },
          should: clusteringQuery,
          minimum_should_match: 1,
        },
      });
    }

    bool.must.push(allQuery);
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
          high: _.get(data, 'data.hits.hits[0]._source.predictionResult.risk_score_data.risk_score_threshold', 0),
        },
      });
    })
    .catch((e) => {
      reject(e);
    });
});
