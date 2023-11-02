/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { apiToInternalEvent } from './ActivityAPI';

describe('Activity API', () => {
  const apiData = {
    _source: {
      predictionResult: {
        botD: {
          isBot: true,
        },
        features: {
          eventId: '840abfd7-7978-4ead-a75f-5418b9a31ec5',
          userId: 'magdalenamatthews',
          timestamp: '2023-04-27T18:35:34.605693',
          geoData: {
            city: 'city_unknown_united_states',
            country: 'united_states',
            lat: 37.751,
            longitude: -97.822,
            timeZone: 'America/Chicago',
            lat_lon: '37.751, -97.822',
          },
          browserData: {
            os: 'other',
            osVersion: 'other_unexpected_os',
            userAgentType: 'apache-httpclient',
            device: 'other',
            deviceType: 'none',
            uaFamily: 'apache-httpclient',
            uaStringRaw: 'Apache-HttpClient/4.5.13 (Java/11.0.15)',
          },
        },
        raw_event_data: {
          transactionId: '1',
        },
        risk_score_data: {
          is_risky_event: true,
          risk_score_threshold: 50,
          risk_score: 100,
          heuristic_agg_result: {
            block_rule_result: {
              risk_score: 100,
              ip_address: '168.102.145.26',
              is_blocked: true,
              is_allowed: false,
              block_list: '[181.58.0.0/16,181.142.65.0/24,168.102.145.26]',
              allow_list: '[36.44.21.0/24,49.0.0.0/8,84.176.60.130]',
            },
          },
        },
      },
    },
  };
  it('can convert the api data to usable data', () => {
    const expectedOptions = {
      clusteringReasons: [],
      dayparting: undefined,
      device: 'other',
      deviceType: 'none',
      eventId: '840abfd7-7978-4ead-a75f-5418b9a31ec5',
      geoData: {
        city: 'city_unknown_united_states',
        country: 'united_states',
        lat: 37.751,
        lat_lon: '37.751, -97.822',
        longitude: -97.822,
        timeZone: 'America/Chicago',
      },
      heuristicReasons: [
        'is_ip_blocked',
        'is_advanced_bot_detection',
      ],
      heuristics: undefined,
      id: '840abfd7-7978-4ead-a75f-5418b9a31ec5',
      ipAddress: undefined,
      os: 'other',
      osVersion: 'other_unexpected_os',
      raw: {
        predictionResult: {
          botD: {
            isBot: true,
          },
          features: {
            browserData: {
              device: 'other',
              deviceType: 'none',
              os: 'other',
              osVersion: 'other_unexpected_os',
              uaFamily: 'apache-httpclient',
              uaStringRaw: 'Apache-HttpClient/4.5.13 (Java/11.0.15)',
              userAgentType: 'apache-httpclient',
            },
            eventId: '840abfd7-7978-4ead-a75f-5418b9a31ec5',
            geoData: {
              city: 'city_unknown_united_states',
              country: 'united_states',
              lat: 37.751,
              lat_lon: '37.751, -97.822',
              longitude: -97.822,
              timeZone: 'America/Chicago',
            },
            timestamp: '2023-04-27T18:35:34.605693',
            userId: 'magdalenamatthews',
          },
          raw_event_data: {
            transactionId: '1',
          },
          risk_score_data: {
            heuristic_agg_result: {
              block_rule_result: {
                allow_list: '[36.44.21.0/24,49.0.0.0/8,84.176.60.130]',
                block_list: '[181.58.0.0/16,181.142.65.0/24,168.102.145.26]',
                ip_address: '168.102.145.26',
                is_allowed: false,
                is_blocked: true,
                risk_score: 100,
              },
            },
            is_risky_event: true,
            risk_score: 100,
            risk_score_threshold: 50,
          },
        },
      },
      risk: 100,
      riskScoreData: {
        heuristic_agg_result: {
          block_rule_result: {
            allow_list: '[36.44.21.0/24,49.0.0.0/8,84.176.60.130]',
            block_list: '[181.58.0.0/16,181.142.65.0/24,168.102.145.26]',
            ip_address: '168.102.145.26',
            is_allowed: false,
            is_blocked: true,
            risk_score: 100,
          },
        },
        is_risky_event: true,
        risk_score: 100,
        risk_score_threshold: 50,
      },
      timestamp: '2023-04-27T18:35:34.605693',
      timezone: 'America/Chicago',
      transactionId: '1',
      uebaReasons: [],
      userAgentType: 'apache-httpclient',
      userId: 'magdalenamatthews',
      weekday: undefined,
    };

    expect(apiToInternalEvent(apiData)).toEqual(expectedOptions);
  });
});
