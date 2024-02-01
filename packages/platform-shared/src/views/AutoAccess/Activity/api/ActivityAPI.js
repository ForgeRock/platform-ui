/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { uniq } from 'lodash';
import { generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
import store from '@/store';

const entitySearch = '/entity/search/';

export const MODELS = {
  ensemble: 'Model C',
  vae: 'Model A',
  ae: 'Model B',
};

export const causeMap = {
  browser: 'Browser',
  city: 'City',
  component: 'Component',
  country: 'Country',
  day_of_week: 'Day of Week',
  dayparting: 'Time of Day',
  device: 'Device',
  deviceType: 'Device Type',
  goto: 'Goto',
  model: 'Device',
  origin: 'Origin',
  os: 'OS',
  osWithVersion: 'OS Version',
  os_version: 'OS Version',
  referer: 'referer',
  time_of_day: 'Time of Day',
  userAgentType: 'Browser Family',
  userId: 'User ID',
  user_agent: 'Browser Family',
  weekday: 'Day of Week',
};

/**
 * Converts the api response data into an object useful to the UI
 *
 * @param {Object} data - API response
 * @returns {Object} object containing useful data
 */
export const apiToInternalEvent = (data) => {
  const { predictionResult } = data._source;
  const {
    ipAddress, userId, eventId, timestamp, geoData, dayparting, weekday, browserData,
  } = predictionResult.features;
  const { botD, raw_event_data: rawEventData, risk_score_data: riskScoreData } = predictionResult;
  const { heuristic_agg_result: heuristics } = riskScoreData;
  const {
    device, deviceType, os, osVersion, userAgentType,
  } = browserData;

  const heuristicReasons = heuristics?.raw_results?.filter((result) => {
    const heuristicKey = Object.keys(result).find((propName) => propName.indexOf('is_') === 0);
    return result[heuristicKey];
  })
    .map((result) => Object.keys(result).find((propName) => propName.indexOf('is_') === 0)) || [];

  // Is IP Blocked Heuristic
  const isIpBlocked = heuristics?.block_rule_result?.is_blocked || false;
  if (isIpBlocked) {
    heuristicReasons.push('is_ip_blocked');
  }

  // Is Advanced Bot Detection Heuristic
  const isBot = botD?.isBot || false;
  if (isBot) {
    heuristicReasons.push('is_advanced_bot_detection');
  }

  let clusteringReasons = [];
  const uebaReasons = [];
  if (riskScoreData.risk_score_threshold < riskScoreData.clustering_model_risk_score) {
    clusteringReasons = riskScoreData.clustering_result?.top_cluster_explainability;
  }
  if (riskScoreData.risk_score_threshold < riskScoreData.ueba_avg_risk_score) {
    if (predictionResult.ueba_signal.explainability
        && predictionResult.ueba_signal.explainability?.response !== 'failed'
        && predictionResult.ueba_signal.explainability?.response !== 'unknown') {
      uebaReasons.push(predictionResult.ueba_signal.explainability?.response);
    }
    if (!predictionResult.ueba_signal.explainability && !clusteringReasons.length && !heuristicReasons.length) {
      uebaReasons.push('no_explainable');
    }
  }

  return {
    dayparting,
    device,
    deviceType,
    eventId,
    geoData,
    heuristics: heuristics ? heuristics.raw_results : [],
    id: eventId,
    ipAddress,
    os,
    osVersion,
    raw: data._source,
    risk: Math.round(riskScoreData.risk_score),
    riskScoreData,
    timestamp,
    timezone: geoData ? geoData.timeZone : 'GMT',
    transactionId: rawEventData.transactionId,
    userAgentType,
    userId,
    weekday,

    clusteringReasons,
    heuristicReasons,
    uebaReasons,
  };
};

export const logAttributes = [
  { label: 'User ID', id: 'userId' },
  { label: 'City', id: 'geo_info.city' },
  { label: 'Country', id: 'geo_info.country' },
  { label: 'Day of the Week', id: 'day_of_week' },
  { label: 'Time of Day', id: 'dayparting' },
  { label: 'OS', id: 'http.request.headers.user-agent.os' },
  { label: 'OS Version', id: 'http.request.headers.user-agent.os_version' },
  { label: 'referer', id: 'http.request.headers.referer' },
  { label: 'Browser', id: 'http.request.headers.user-agent.user_agent' },
  { label: 'Model', id: 'http.request.headers.user-agent.model' },
  { label: 'Device', id: 'http.request.headers.user-agent.device' },
];

export const getEventLogs = (param) => {
  const queryParam = {
    indexName: 'risk_explainability',
    query: param,
  };
  return generateAutoAccessJas().post(entitySearch, queryParam);
};

export const getFeatures = () => {
  const features = [
    'predictionResult.features.geoData.city',
    'predictionResult.features.geoData.country',
    'predictionResult.features.browserData.os',
    'predictionResult.features.browserData.osVersion',
    'predictionResult.features.browserData.userAgentType',
    'predictionResult.features.browserData.device',
    'predictionResult.features.browserData.deviceType',
    'predictionResult.features.dayparting',
    'predictionResult.features.rawUserId',
  ];

  return new Promise((resolve, reject) => {
    const param = {
      indexName: 'risk_explainability',
      query: {
        query: {
          term: {
            'predictionResult.risk_score_data.is_risky_event': true,
          },
        },
        aggs: {
        },
        size: 0,
      },
    };
    features.forEach((feature) => {
      param.query.aggs[feature] = {
        terms: {
          field: `${feature}.keyword`,
          size: 100,
        },
      };
    });
    generateAutoAccessJas().post(entitySearch, param)
      .then(({ data }) => {
        resolve(Object.keys(data.aggregations).map((key) => {
          const cached = data.aggregations[key].buckets.length <= 50;
          return {
            key,
            cached,
            values: cached ? data.aggregations[key].buckets.map((value) => value.key).sort((a, b) => (a).localeCompare(b)) : [],
          };
        }));
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getAvailableFilters = (key, searchTerm) => new Promise((resolve, reject) => {
  const param = {
    indexName: 'risk_explainability',
    query: {
      query: {
        bool: {
          must: [
            {
              term: {
                'predictionResult.risk_score_data.is_risky_event': true,
              },
            },
          ],
        },
      },
      aggs: {
        [key]: {
          terms: {
            field: `${key}.keyword`,
            size: 50,
            order: {
              _key: 'asc',
            },
          },
        },
      },
      size: 0,
    },
  };

  if (searchTerm) {
    param.query.query.bool.should = [
      {
        wildcard: {
          [`${key}.keyword`]: `${searchTerm}*`,
        },
      },
      {
        match: {
          [`${key}.keyword`]: searchTerm,
        },
      },
      {
        wildcard: {
          [`${key}.keyword`]: `${searchTerm.toLowerCase()}*`,
        },
      },
      {
        match: {
          [`${key}.keyword`]: searchTerm.toLowerCase(),
        },
      },
    ];
    param.query.query.bool.minimum_should_match = 1;
  }

  generateAutoAccessJas().post(entitySearch, param)
    .then(({ data }) => {
      resolve(
        data.aggregations[key].buckets.map((value) => value.key),
      );
    })
    .catch((e) => {
      reject(e);
    });
});

export const getUEBAClusteringExplainability = () => new Promise((resolve, reject) => {
  const param = {
    indexName: 'risk_explainability',
    query: {
      query: {
        term: {
          'predictionResult.risk_score_data.is_risky_event': true,
        },
      },
      aggs: {
        ueba_reason: {
          terms: {
            field: 'predictionResult.ueba_signal.explainable_features',
            size: 100,
          },
        },
        clustering_reason: {
          terms: {
            field: 'predictionResult.risk_score_data.clustering_result.top_cluster_explainability.keyword',
            size: 100,
          },
        },
      },
      size: 0,
    },
  };
  generateAutoAccessJas().post(entitySearch, param)
    .then(({ data }) => {
      const clustering = data.aggregations.clustering_reason.buckets;
      const ueba = data.aggregations.ueba_reason.buckets.filter((type) => !store.state.Dashboard.ignoreReasons.includes(type.key));
      const reason = [...ueba, ...clustering];
      const keys = uniq(reason.map(({ key }) => key))
        .sort((a, b) => (causeMap[a] || a).localeCompare(causeMap[b] || b)).filter((key) => key !== 'failed' && key !== 'unknown');
      resolve({ keys, ueba: ueba.map(({ key }) => key), clustering: clustering.map(({ key }) => key) });
    })
    .catch((e) => {
      reject(e);
    });
});
