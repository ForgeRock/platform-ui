/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
// import { postData } from '../../Shared/utils/axios-utils';

const entitySearch = '/entity/search/';

export const MODELS = {
  ensemble: 'Model C',
  vae: 'Model A',
  ae: 'Model B',
};

export const causeMap = {
  userId: 'User ID',
  referer: 'referer',
  goto: 'Goto',
  origin: 'Origin',
  city: 'City',
  country: 'Country',
  day_of_week: 'Day of Week',
  weekday: 'Day of Week',
  dayparting: 'Time of Day',
  device: 'Device',
  model: 'Device',
  os: 'OS',
  os_version: 'OS Version',
  user_agent: 'Browser Family',
  component: 'Component',
  browser: 'Browser',
  osWithVersion: 'OS Version',
  userAgentType: 'Browser Family',
  deviceType: 'Device Type',
};

export const apiToInternalEvent = (data) => {
  const { _source } = data;
  const {
    raw_event_data, features, risk_score_data, ueba_signal,
  } = _source.predictionResult;

  const heuristics = risk_score_data.heuristic_agg_result;

  const obj = {
    raw: _source,
    userId: features.userId,
    eventId: features.eventId,
    id: features.eventId,
    timestamp: features.timestamp,
    timezone: features.geoData ? features.geoData.timeZone : 'GMT',
    risk: Math.round(risk_score_data.risk_score),
    risk_score_data,
    transactionId: raw_event_data.transactionId,
    heuristics: heuristics ? heuristics.raw_results : [],
    ueba_signal,
    geo_data: features.geoData,
    dayparting: features.dayparting,
    weekday: features.weekday,
    ...features.browserData,
  };

  return obj;
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

export const updateEvent = (param) => {
  const queryParam = {
    contextId: `UI - Added Labels for this event ${uuidv4()}`,
    indexingRequired: true,
    indexInSync: true,
    ...param,
  };

  return generateAutoAccessJas().post(`/entity/persist${entityPath}`, queryParam);
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
    // 'predictionResult.features.userId',
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
    // postData(`/autoaccess/jas/entity/search${entityPath}`, param)
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
      const reason = [..._.get(data, 'aggregations.ueba_reason.buckets', []), ..._.get(data, 'aggregations.clustering_reason.buckets', [])];
      const keys = _.uniq(reason.map((reason) => reason.key))
        .sort((a, b) => (causeMap[a] || a).localeCompare(causeMap[b] || b)).filter((key) => key !== 'failed' && key !== 'unknown');

      resolve(keys);
    })
    .catch((e) => {
      console.log('error:', e);
      reject(e);
    });
});
